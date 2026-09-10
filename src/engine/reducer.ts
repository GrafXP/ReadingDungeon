import type { WorldDefinition } from '../domain/content'
import { JOURNAL_LIMIT, type GameEvent, type GameSave } from '../domain/game'
import { evaluateRequirement } from './requirements'
import { isInteractionComplete, isPuzzleComplete, otherEnd, type GameAction } from './actions'
import { attack, completeFinalCombatAction, defend, flee, placeSeal, respawn, startCombat, useCombatItem, useWeaponSkill, type CombatTransition } from './combat'
import { applyEffect } from './effects'
import { getPuzzleState, isPuzzleSolved, updatePuzzleState } from './puzzles'
import { getAreaInspectText } from './selectors'
import { getHintLevel, getHintTexts, hintId } from './hints'
import { DAMAGE_TYPE_LABELS } from './damage'

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
    if (action.type === 'STUDY_ENEMY') {
      if (!save.activeCombat.combatants.some((combatant) => combatant.enemyId === action.enemyId) || save.studiedEnemyIds.includes(action.enemyId)) return save
      const enemy = world.enemies.find((entry) => entry.id === action.enemyId)
      if (!enemy) return save
      return withEvent({ ...save, studiedEnemyIds: unique([...save.studiedEnemyIds, enemy.id]) }, `Du beobachtest ${enemy.name}: Schwächen, Widerstände und Bewegungen stehen jetzt im Register.`, `study:${enemy.id}`)
    }
    if (action.type === 'SET_TARGET') {
      if (!Number.isSafeInteger(action.targetIndex) || action.targetIndex < 0 || action.targetIndex >= save.activeCombat.combatants.length || action.targetIndex === save.activeCombat.targetIndex || save.activeCombat.combatants[action.targetIndex].life === 0) return save
      const enemy = world.enemies.find((entry) => entry.id === save.activeCombat!.combatants[action.targetIndex].enemyId)
      return withEvent({ ...save, activeCombat: { ...save.activeCombat, targetIndex: action.targetIndex } }, `Du zielst jetzt auf ${enemy?.name ?? 'den anderen Gegner'}.`, `target:${action.targetIndex}`)
    }
    if (action.type === 'PLACE_SEAL') return finishCombatTransition(save, placeSeal(save, action.itemId, world))
    if (action.type === 'COMPLETE_FINAL_ACTION') return finishCombatTransition(save, completeFinalCombatAction(save, world))
    if (action.type === 'ATTACK') return finishCombatTransition(save, attack(save, world))
    if (action.type === 'DEFEND') return finishCombatTransition(save, defend(save, world))
    if (action.type === 'USE_SKILL') return finishCombatTransition(save, useWeaponSkill(save, world))
    if (action.type === 'FLEE') return finishCombatTransition(save, flee(save, world))
    if (action.type === 'USE_ITEM') return finishCombatTransition(save, useCombatItem(save, action.itemId, world))
    return save
  }

  if (action.type === 'START_COMBAT') {
    return finishCombatTransition(save, startCombat(save, action.encounterId, world))
  }
  if (action.type === 'PUZZLE_INPUT' || action.type === 'PUZZLE_RESET') {
    const puzzle = world.puzzles?.find((entry) => entry.id === action.puzzleId && entry.areaId === save.currentAreaId)
    if (!puzzle || isPuzzleComplete(save, puzzle, world)) return save
    let text = 'Die Ausgangsstellung ist wiederhergestellt. Deine Gegenstände bleiben bei dir.'
    let next: GameSave = { ...save, puzzleStates: { ...save.puzzleStates } }
    if (action.type === 'PUZZLE_RESET') {
      delete next.puzzleStates[puzzle.id]
    } else {
      const state = getPuzzleState(save, puzzle)
      const update = updatePuzzleState(state, puzzle, action.controlId, action.value)
      if (!update) return save
      text = update.text
      next.puzzleStates[puzzle.id] = update.state
    }
    if (isPuzzleSolved(next, puzzle)) text += ' Das Rätsel ist gelöst. Du kannst es jetzt abschliessen, sobald alle benötigten Teile da sind.'
    return withEvent(next, text, `puzzle:${puzzle.id}`)
  }
  if (action.type === 'COMPLETE_PUZZLE') {
    const puzzle = world.puzzles?.find((entry) => entry.id === action.puzzleId && entry.areaId === save.currentAreaId)
    if (!puzzle?.completion || isPuzzleComplete(save, puzzle, world) || !isPuzzleSolved(save, puzzle)) return save
    let completed = save
    for (const effect of puzzle.completion.effects) completed = applyEffect(completed, effect, world)
    completed = { ...completed, flags: unique([...completed.flags, `raetsel_abgeschlossen:${puzzle.id}`]) }
    return withEvent(completed, puzzle.completion.resultText, `puzzle-complete:${puzzle.id}`)
  }
  if (action.type === 'ATTACK' || action.type === 'DEFEND' || action.type === 'USE_SKILL' || action.type === 'STUDY_ENEMY' || action.type === 'SET_TARGET' || action.type === 'FLEE' || action.type === 'RESPAWN' || action.type === 'PLACE_SEAL' || action.type === 'COMPLETE_FINAL_ACTION') return save

  if (action.type === 'REST') {
    const area = world.areas.find((entry) => entry.id === save.currentAreaId)
    if (!area?.safe || !evaluateRequirement(area.sanctuaryRequirement, save).met) return save
    const restocks = world.start.sanctuaryRestocks ?? []
    const fullyStocked = restocks.every((restock) => (save.player.inventory[restock.itemId] ?? 0) >= restock.quantity)
    const resetFlags = new Set(world.interactions
      .filter((interaction) => interaction.restockAfterRest)
      .map((interaction) => `interaktion:${interaction.id}`))
    const sourcesNeedRestock = save.flags.some((flag) => resetFlags.has(flag))
    if (save.player.life === save.player.maxLife && fullyStocked && !sourcesNeedRestock && save.lastSanctuaryId === area.id) return save
    const inventory = { ...save.player.inventory }
    for (const restock of restocks) inventory[restock.itemId] = Math.max(restock.quantity, inventory[restock.itemId] ?? 0)
    return withEvent({
      ...save,
      lastSanctuaryId: area.id,
      player: {
        ...save.player,
        life: save.player.maxLife,
        inventory
      },
      flags: save.flags.filter((flag) => !resetFlags.has(flag))
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

  if (action.type === 'EQUIP_ARMOR' || action.type === 'EQUIP_TALISMAN') {
    const item = world.items.find((entry) => entry.id === action.itemId)
    const expectedSlot = action.type === 'EQUIP_ARMOR' ? 'body' : 'talisman'
    const equippedId = expectedSlot === 'body' ? save.player.equippedArmorId : save.player.equippedTalismanId
    if (item?.kind !== 'armor' || item.armor?.slot !== expectedSlot || (save.player.inventory[item.id] ?? 0) < 1 || equippedId === item.id) return save
    const player = expectedSlot === 'body'
      ? { ...save.player, equippedArmorId: item.id }
      : { ...save.player, equippedTalismanId: item.id }
    return withEvent({ ...save, player }, `Du rüstest ${item.name} als ${expectedSlot === 'body' ? 'Rüstung' : 'Talisman'} aus.`, `equip:${item.id}`)
  }

  if (action.type === 'SET_WEAPON_MODE') {
    const area = world.areas.find((entry) => entry.id === save.currentAreaId)
    const item = world.items.find((entry) => entry.id === action.itemId)
    const elemental = item?.weapon?.elemental
    if (!area?.safe || !evaluateRequirement(area.sanctuaryRequirement, save).met || !item?.weapon || !elemental || !('choices' in elemental) || !elemental.choices.includes(action.damageType) || (save.player.inventory[item.id] ?? 0) < 1 || (save.player.weaponElementModes[item.id] ?? elemental.choices[0]) === action.damageType) return save
    return withEvent({
      ...save,
      player: { ...save.player, weaponElementModes: { ...save.player.weaponElementModes, [item.id]: action.damageType } }
    }, `Du stellst ${item.name} am Rastplatz auf ${DAMAGE_TYPE_LABELS[action.damageType]}.`, `mode:${item.id}:${action.damageType}`)
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
