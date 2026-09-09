import type { WorldDefinition } from '../domain/content'
import { JOURNAL_LIMIT, type GameEvent, type GameSave } from '../domain/game'
import { evaluateRequirement } from './requirements'
import { isInteractionComplete, otherEnd, type GameAction } from './actions'
import { attack, completeFinalCombatAction, defend, flee, placeSeal, respawn, startCombat, useCombatItem, type CombatTransition } from './combat'
import { applyEffect } from './effects'
import { getPuzzleState, isPuzzleSolved } from './puzzles'
import { getAreaInspectText } from './selectors'
import { getHintLevel, getHintTexts, hintId } from './hints'

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function withEvent(save: GameSave, text: string, actionKey: string): GameSave {
  const turn = save.turn + 1
  const event: GameEvent = { id: `${save.runId}:${turn}:${actionKey}`, text, turn }
  return {
    ...save,
    turn,
    recentEvents: [...save.recentEvents, event].slice(-8),
    journal: [...save.journal, event].slice(-JOURNAL_LIMIT)
  }
}

function finishCombatTransition(save: GameSave, transition: CombatTransition | null): GameSave {
  return transition ? withEvent(transition.save, transition.text, transition.key) : save
}

export function reduceGame(save: GameSave, action: GameAction, world: WorldDefinition): GameSave {
  if (save.campaignId !== world.campaignId) return save
  const next = transitionGame(save, action, world)
  if (next === save || next.activeCombat) return next
  const beats = world.storyBeats?.filter((beat) => !next.deliveredDialogueIds.includes(beat.id) && evaluateRequirement(beat.requirement, next).met) ?? []
  const event = next.recentEvents.at(-1)
  if (!beats.length || !event) return next
  const narrated = { ...event, text: [event.text, ...beats.map((beat) => beat.text)].join('\n\n') }
  return {
    ...next,
    deliveredDialogueIds: unique([...next.deliveredDialogueIds, ...beats.map((beat) => beat.id)]),
    recentEvents: [...next.recentEvents.slice(0, -1), narrated],
    journal: [...next.journal.slice(0, -1), narrated]
  }
}

function transitionGame(save: GameSave, action: GameAction, world: WorldDefinition): GameSave {
  // Reading help never advances the enemy, even during a fight or rescue pause.
  if (action.type === 'SHOW_HINT') {
    const quest = world.journal?.getQuestViews?.(save).find((entry) => entry.id === action.questId && !entry.done)
    if (!quest || !Number.isInteger(action.level) || action.level < 1 || action.level > 3 || action.level !== getHintLevel(save, quest) + 1) return save
    const id = hintId(quest, action.level)
    return withEvent({
      ...save,
      deliveredDialogueIds: unique([...save.deliveredDialogueIds, id]),
      discoveredClueIds: action.level === 3 ? unique([...save.discoveredClueIds, ...(quest.hintAreaIds ?? []).filter((areaId) => world.areas.some((area) => area.id === areaId)).map((areaId) => `hinweis_ort:${areaId}`)]) : save.discoveredClueIds
    }, `Hinweis ${action.level} zu «${quest.title}»: ${getHintTexts(quest, world.journal?.hintSteps)[action.level - 1]}`, id)
  }
  if (save.player.life === 0) {
    return action.type === 'RESPAWN' ? finishCombatTransition(save, respawn(save, world)) : save
  }

  if (save.activeCombat) {
    if (action.type === 'PLACE_SEAL') return finishCombatTransition(save, placeSeal(save, action.itemId, world))
    if (action.type === 'COMPLETE_FINAL_ACTION') return finishCombatTransition(save, completeFinalCombatAction(save, world))
    if (action.type === 'ATTACK') return finishCombatTransition(save, attack(save, world))
    if (action.type === 'DEFEND') return finishCombatTransition(save, defend(save, world))
    if (action.type === 'FLEE') return finishCombatTransition(save, flee(save, world))
    if (action.type === 'USE_ITEM') return finishCombatTransition(save, useCombatItem(save, action.itemId, world))
    return save
  }

  if (action.type === 'START_COMBAT') {
    return finishCombatTransition(save, startCombat(save, action.encounterId, world))
  }
  if (action.type === 'PUZZLE_INPUT' || action.type === 'PUZZLE_RESET') {
    const puzzle = world.puzzles?.find((entry) => entry.id === action.puzzleId && entry.areaId === save.currentAreaId)
    const interaction = puzzle && world.interactions.find((entry) => entry.id === puzzle.interactionId)
    if (!puzzle || !interaction || isInteractionComplete(interaction, save)) return save
    let text = 'Die Ausgangsstellung ist wiederhergestellt. Deine Gegenstände bleiben bei dir.'
    let next: GameSave = { ...save, puzzleStates: { ...save.puzzleStates } }
    if (action.type === 'PUZZLE_RESET') {
      delete next.puzzleStates[puzzle.id]
    } else {
      if (!Number.isSafeInteger(action.value) || action.value < 0) return save
      const state = getPuzzleState(save, puzzle)
      const values = { ...state.values }
      if (action.controlId === 'sequence' && puzzle.sequence) {
        if (action.value >= puzzle.sequence.options.length) return save
        const progress = Number(values.sequence)
        if (progress === puzzle.sequence.solution.length) return save
        const correct = puzzle.sequence.solution[progress] === action.value
        values.sequence = correct ? progress + 1 : 0
        text = correct ? `${puzzle.sequence.options[action.value]} stimmt. ${progress + 1} von ${puzzle.sequence.solution.length} Zeichen.` : 'Das passt noch nicht. Die Folge beginnt von vorn; du verlierst nichts.'
      } else {
        const control = puzzle.controls.find((entry) => entry.id === action.controlId)
        if (!control || action.value >= control.options.length || values[control.id] === action.value) return save
        values[control.id] = action.value
        if (puzzle.maxOpenControls && puzzle.controls.filter((entry) => values[entry.id] === 1).length > puzzle.maxOpenControls) {
          return withEvent(save, 'Die Sicherung hält: Schliesse zuerst ein anderes Tor. Höchstens zwei Tore können offen sein.', `puzzle:${puzzle.id}:limit`)
        }
        text = `${control.label}: ${control.options[action.value]}.`
      }
      next.puzzleStates[puzzle.id] = { kind: 'controls', values }
    }
    if (isPuzzleSolved(next, puzzle)) text += ' Das Rätsel ist gelöst. Du kannst es jetzt abschliessen, sobald alle benötigten Teile da sind.'
    return withEvent(next, text, `puzzle:${puzzle.id}`)
  }
  if (action.type === 'ATTACK' || action.type === 'DEFEND' || action.type === 'FLEE' || action.type === 'RESPAWN' || action.type === 'PLACE_SEAL' || action.type === 'COMPLETE_FINAL_ACTION') return save

  if (action.type === 'REST') {
    const area = world.areas.find((entry) => entry.id === save.currentAreaId)
    if (!area?.safe || !evaluateRequirement(area.sanctuaryRequirement, save).met) return save
    const restocks = world.start.sanctuaryRestocks ?? []
    const fullyStocked = restocks.every((restock) => (save.player.inventory[restock.itemId] ?? 0) >= restock.quantity)
    if (save.player.life === save.player.maxLife && fullyStocked && save.lastSanctuaryId === area.id) return save
    const inventory = { ...save.player.inventory }
    for (const restock of restocks) inventory[restock.itemId] = Math.max(restock.quantity, inventory[restock.itemId] ?? 0)
    return withEvent({
      ...save,
      lastSanctuaryId: area.id,
      player: {
        ...save.player,
        life: save.player.maxLife,
        inventory
      }
    }, `Du rastest in ${area.name}. Deine Lebenspunkte und Vorräte sind wieder bereit.`, `rest:${area.id}`)
  }

  if (action.type === 'MOVE') {
    const passage = world.passages.find((entry) => entry.id === action.passageId)
    if (!passage || otherEnd(passage, save.currentAreaId) !== action.toAreaId) return save
    const requirement = evaluateRequirement(passage.requirement, save)
    const guardDefeated = !passage.guardEncounterId || save.defeatedEncounterIds.includes(passage.guardEncounterId)
    if ((!requirement.met && !save.unlockedPassageIds.includes(passage.id)) || !guardDefeated) return save
    const destination = world.areas.find((entry) => entry.id === action.toAreaId)
    if (!destination) return save

    const moved: GameSave = {
      ...save,
      currentAreaId: destination.id,
      previousAreaId: save.currentAreaId,
      visitedAreaIds: unique([...save.visitedAreaIds, destination.id]),
      deliveredDialogueIds: unique([...save.deliveredDialogueIds, `area_intro:${save.currentAreaId}`]),
      lastSanctuaryId: destination.safe && evaluateRequirement(destination.sanctuaryRequirement, save).met ? destination.id : save.lastSanctuaryId
    }
    if (!save.visitedAreaIds.includes(destination.id) && destination.firstVisitRestocks?.length) {
      const inventory = { ...moved.player.inventory }
      for (const restock of destination.firstVisitRestocks) inventory[restock.itemId] = Math.max(restock.quantity, inventory[restock.itemId] ?? 0)
      moved.player = { ...moved.player, life: moved.player.maxLife, inventory }
    }
    return withEvent(moved, `Du erreichst ${destination.name}.`, `move:${passage.id}`)
  }

  if (action.type === 'INSPECT') {
    if (action.areaId !== save.currentAreaId) return save
    const area = world.areas.find((entry) => entry.id === action.areaId)
    if (!area) return save
    const inspected: GameSave = {
      ...save,
      flags: unique([...save.flags, `area_untersucht:${area.id}`]),
      discoveredClueIds: unique([...save.discoveredClueIds, `ort:${area.id}`])
    }
    return withEvent(inspected, getAreaInspectText(save, area), `inspect:${area.id}`)
  }

  if (action.type === 'USE_ITEM') {
    const item = world.items.find((entry) => entry.id === action.itemId)
    const quantity = save.player.inventory[action.itemId] ?? 0
    if (!item?.healing || item.kind !== 'healing' || quantity < 1 || save.player.life >= save.player.maxLife) return save

    const restored = Math.min(item.healing.lifeRestored, save.player.maxLife - save.player.life)
    const inventory = { ...save.player.inventory }
    if (quantity === 1) delete inventory[action.itemId]
    else inventory[action.itemId] = quantity - 1
    const healed: GameSave = {
      ...save,
      player: { ...save.player, life: save.player.life + restored, inventory }
    }
    return withEvent(healed, `Du benutzt ${item.name} und erhältst ${restored} Lebenspunkte zurück.`, `use:${item.id}`)
  }

  if (action.type === 'USE_TOOL') return save

  if (action.type === 'EQUIP_WEAPON') {
    const item = world.items.find((entry) => entry.id === action.itemId)
    if (!item?.weapon || item.kind !== 'weapon' || (save.player.inventory[action.itemId] ?? 0) < 1 || save.player.equippedWeaponId === item.id) return save
    const equipped: GameSave = {
      ...save,
      player: { ...save.player, equippedWeaponId: item.id }
    }
    return withEvent(equipped, `Du rüstest ${item.name} aus.`, `equip:${item.id}`)
  }

  const interaction = world.interactions.find((entry) => entry.id === action.interactionId)
  if (!interaction || interaction.areaId !== save.currentAreaId) return save
  if (interaction.actionType !== action.type || isInteractionComplete(interaction, save)) return save
  if (!evaluateRequirement(interaction.visibilityRequirement, save).met) return save
  if (!evaluateRequirement(interaction.requirement, save).met) return save
  const puzzle = world.puzzles?.find((entry) => entry.interactionId === interaction.id)
  if (puzzle && !isPuzzleSolved(save, puzzle)) return save

  let next = save
  for (const effect of interaction.effects) next = applyEffect(next, effect, world)
  if (interaction.chestId) {
    next = { ...next, openedChestIds: unique([...next.openedChestIds, interaction.chestId]) }
  } else {
    next = { ...next, flags: unique([...next.flags, `interaktion:${interaction.id}`]) }
  }
  return withEvent(next, interaction.resultText, `interaction:${interaction.id}`)
}
