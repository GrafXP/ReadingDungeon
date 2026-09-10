import type { GameSave } from '../domain/game'
import type { InteractionDefinition, ItemDefinition, PassageDefinition, WorldDefinition } from '../domain/content'
import { evaluateRequirement } from './requirements'
import { isPuzzleSolved } from './puzzles'
import { DAMAGE_TYPE_LABELS } from './damage'

export type GameAction =
  | { type: 'SHOW_HINT'; questId: string; level: number }
  | { type: 'PUZZLE_INPUT'; puzzleId: string; controlId: string; value: string | number | boolean }
  | { type: 'PUZZLE_RESET'; puzzleId: string }
  | { type: 'MOVE'; passageId: string; toAreaId: string }
  | { type: 'INSPECT'; areaId: string }
  | { type: 'TAKE_ITEM'; interactionId: string }
  | { type: 'OPEN_CHEST'; interactionId: string }
  | { type: 'COMPLETE_INTERACTION'; interactionId: string }
  | { type: 'COMPLETE_PUZZLE'; puzzleId: string }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'USE_TOOL'; itemId: string }
  | { type: 'EQUIP_WEAPON'; itemId: string }
  | { type: 'EQUIP_ARMOR'; itemId: string }
  | { type: 'EQUIP_TALISMAN'; itemId: string }
  | { type: 'SET_WEAPON_MODE'; itemId: string; damageType: import('../domain/content').DamageType }
  | { type: 'START_COMBAT'; encounterId: string }
  | { type: 'ATTACK' }
  | { type: 'DEFEND' }
  | { type: 'USE_SKILL' }
  | { type: 'STUDY_ENEMY'; enemyId: string }
  | { type: 'SET_TARGET'; targetIndex: number }
  | { type: 'FLEE' }
  | { type: 'RESPAWN' }
  | { type: 'REST' }
  | { type: 'PLACE_SEAL'; itemId: string }
  | { type: 'COMPLETE_FINAL_ACTION' }

export interface AvailableAction {
  id: string
  kind: 'inspect' | 'interaction' | 'move' | 'combat'
  label: string
  description: string
  icon: string
  disabled: boolean
  blockedReason?: string
  gameAction: GameAction
}

export interface InventoryAction {
  id: string
  label: string
  disabled: boolean
  reason?: string
  gameAction: GameAction
}

export function otherEnd(passage: PassageDefinition, areaId: string): string | null {
  if (passage.fromAreaId === areaId) return passage.toAreaId
  if (passage.toAreaId === areaId) return passage.fromAreaId
  return null
}

export function isInteractionComplete(interaction: InteractionDefinition, save: GameSave): boolean {
  if (interaction.completedWhen && evaluateRequirement(interaction.completedWhen, save).met) return true
  if (interaction.chestId) return save.openedChestIds.includes(interaction.chestId)
  return save.flags.includes(`interaktion:${interaction.id}`)
}

export function isPuzzleComplete(save: GameSave, puzzle: NonNullable<WorldDefinition['puzzles']>[number], world: WorldDefinition): boolean {
  if (puzzle.interactionId) {
    const interaction = world.interactions.find((entry) => entry.id === puzzle.interactionId)
    return Boolean(interaction && isInteractionComplete(interaction, save))
  }
  return save.flags.includes(`raetsel_abgeschlossen:${puzzle.id}`)
}

function interactionIcon(interaction: InteractionDefinition): string {
  if (interaction.actionType === 'OPEN_CHEST') return '▣'
  if (interaction.actionType === 'TAKE_ITEM') return '✦'
  return '◆'
}

export function getAvailableActions(save: GameSave, world: WorldDefinition): AvailableAction[] {
  if (save.activeCombat || save.player.life === 0) return []
  const area = world.areas.find((entry) => entry.id === save.currentAreaId)
  if (!area) return []

  const inspected = save.flags.includes(`area_untersucht:${area.id}`)
  const actions: AvailableAction[] = [
    {
      id: `inspect:${area.id}`,
      kind: 'inspect',
      label: inspected ? 'Untersuche den Ort erneut' : 'Untersuche den Ort',
      description: inspected ? 'Sieh noch einmal genau hin.' : 'Suche nach Spuren und nützlichen Einzelheiten.',
      icon: '⌖',
      disabled: false,
      gameAction: { type: 'INSPECT', areaId: area.id }
    }
  ]

  // A new location should be read and inspected before the player can act or
  // leave. The inspection flag is permanent, so revisits stay quick.
  if (!inspected) return actions

  if (area.safe && evaluateRequirement(area.sanctuaryRequirement, save).met) {
    const restocks = world.start.sanctuaryRestocks ?? []
    const fullyStocked = restocks.every((restock) => (save.player.inventory[restock.itemId] ?? 0) >= restock.quantity)
    const fullyRested = save.player.life === save.player.maxLife && fullyStocked && save.lastSanctuaryId === area.id
    const restockText = restocks.length > 0
      ? restocks.map((restock) => `${world.items.find((item) => item.id === restock.itemId)?.name ?? restock.itemId} auf ${restock.quantity}`).join(', ')
      : 'deine Reisevorbereitung'
    actions.push({
      id: `rest:${area.id}`,
      kind: 'interaction',
      label: fullyRested ? 'Rastplatz prüfen' : 'Raste und fülle Vorräte auf',
      description: fullyRested ? 'Du bist ausgeruht und vollständig vorbereitet.' : `Heilt vollständig und ergänzt ${restockText}.`,
      icon: '⌂',
      disabled: fullyRested,
      blockedReason: fullyRested ? 'Du bist bereits vollständig vorbereitet.' : undefined,
      gameAction: { type: 'REST' }
    })
  }

  for (const interaction of world.interactions.filter((entry) => entry.areaId === area.id)) {
    if (!evaluateRequirement(interaction.visibilityRequirement, save).met) continue
    if (isInteractionComplete(interaction, save)) continue
    const requirement = evaluateRequirement(interaction.requirement, save)
    const puzzle = world.puzzles?.find((entry) => entry.interactionId === interaction.id)
    const puzzleSolved = !puzzle || isPuzzleSolved(save, puzzle)
    actions.push({
      id: `interaction:${interaction.id}`,
      kind: 'interaction',
      label: interaction.label,
      description: interaction.description,
      icon: interactionIcon(interaction),
      disabled: !requirement.met || !puzzleSolved,
      blockedReason: !requirement.met ? interaction.blockedText ?? 'Dafür fehlt dir noch etwas.' : !puzzleSolved ? 'Löse zuerst das Rätsel mit den Bedienelementen oben.' : undefined,
      gameAction: { type: interaction.actionType, interactionId: interaction.id }
    })
  }

  for (const puzzle of world.puzzles?.filter((entry) => entry.areaId === area.id && entry.completion && !isPuzzleComplete(save, entry, world)) ?? []) {
    const solved = isPuzzleSolved(save, puzzle)
    actions.push({
      id: `puzzle-complete:${puzzle.id}`,
      kind: 'interaction',
      label: puzzle.completion!.label,
      description: puzzle.completion!.description,
      icon: '◆',
      disabled: !solved,
      blockedReason: solved ? undefined : 'Löse zuerst das Rätsel oben.',
      gameAction: { type: 'COMPLETE_PUZZLE', puzzleId: puzzle.id }
    })
  }

  for (const encounter of world.encounters.filter((entry) => entry.areaId === area.id)) {
    if (save.defeatedEncounterIds.includes(encounter.id)) continue
    const enemies = encounter.enemyIds.map((id) => world.enemies.find((entry) => entry.id === id)).filter((enemy): enemy is NonNullable<typeof enemy> => Boolean(enemy))
    const missingSeals = enemies.some((enemy) => Boolean(enemy.phaseSealItemIds && Object.values(enemy.phaseSealItemIds).some((id) => (save.player.inventory[id] ?? 0) < 1)))
    const weapon = world.items.find((item) => item.id === save.player.equippedWeaponId && item.weapon)
    const missingWeapon = !weapon || (save.player.inventory[weapon.id] ?? 0) < 1
    const gearReady = evaluateRequirement(encounter.requiredGear, save).met
    actions.push({
      id: `combat:${encounter.id}`,
      kind: 'combat',
      label: encounter.label,
      description: encounter.description,
      icon: '⚔',
      disabled: missingSeals || missingWeapon || !gearReady,
      blockedReason: missingWeapon ? 'Rüste zuerst im Inventar eine Waffe aus.' : missingSeals ? 'Für diese Begegnung fehlen wichtige Gegenstände.' : !gearReady ? encounter.gearWarning ?? 'Rüste zuerst den passenden Schutz aus.' : undefined,
      gameAction: { type: 'START_COMBAT', encounterId: encounter.id }
    })
  }

  for (const passage of world.passages.filter((entry) => otherEnd(entry, area.id) !== null)) {
    const destinationId = otherEnd(passage, area.id)
    if (!destinationId) continue
    const requirement = evaluateRequirement(passage.requirement, save)
    const manuallyUnlocked = save.unlockedPassageIds.includes(passage.id)
    const guardDefeated = !passage.guardEncounterId || save.defeatedEncounterIds.includes(passage.guardEncounterId)
    const destination = world.areas.find((entry) => entry.id === destinationId)
    actions.push({
      id: `move:${passage.id}`,
      kind: 'move',
      label: passage.fromAreaId === area.id ? passage.labelFrom : passage.labelTo,
      description: passage.shortcut ? `Abkürzung nach ${destination?.name ?? destinationId}` : destination?.regionName ?? 'Weiterreisen',
      icon: passage.shortcut ? '↯' : '➜',
      disabled: (!requirement.met && !manuallyUnlocked) || !guardDefeated,
      blockedReason: (requirement.met || manuallyUnlocked) && guardDefeated ? undefined : passage.blockedText ?? 'Dieser Weg ist noch versperrt.',
      gameAction: { type: 'MOVE', passageId: passage.id, toAreaId: destinationId }
    })
  }

  return actions
}

export function getInventoryActions(save: GameSave, item: ItemDefinition): InventoryAction[] {
  const owned = (save.player.inventory[item.id] ?? 0) > 0
  if (!owned) return []
  if (item.kind === 'weapon' && item.weapon) {
    const inCombat = save.activeCombat !== null
    const equipped = save.player.equippedWeaponId === item.id
    const actions: InventoryAction[] = [{
      id: `equip:${item.id}`,
      label: equipped ? 'Ausgerüstet' : 'Ausrüsten',
      disabled: inCombat || equipped,
      reason: inCombat ? 'Während eines Kampfes kannst du die Waffe nicht wechseln.' : equipped ? 'Diese Waffe ist bereits ausgerüstet.' : undefined,
      gameAction: { type: 'EQUIP_WEAPON', itemId: item.id }
    }]
    if (item.weapon.elemental && 'choices' in item.weapon.elemental) {
      const atRest = !save.activeCombat && save.currentAreaId === save.lastSanctuaryId
      const currentMode = save.player.weaponElementModes[item.id] ?? item.weapon.elemental.choices[0]
      for (const damageType of item.weapon.elemental.choices) {
        actions.push({
          id: `mode:${item.id}:${damageType}`,
          label: currentMode === damageType ? `Modus ${DAMAGE_TYPE_LABELS[damageType]}: aktiv` : `Auf ${DAMAGE_TYPE_LABELS[damageType]} stellen`,
          disabled: !atRest || currentMode === damageType,
          reason: !atRest ? 'Den Waffenmodus kannst du nur an einem Rastplatz ändern.' : currentMode === damageType ? 'Dieser Modus ist bereits aktiv.' : undefined,
          gameAction: { type: 'SET_WEAPON_MODE', itemId: item.id, damageType }
        })
      }
    }
    return actions
  }

  if (item.kind === 'armor' && item.armor) {
    const inCombat = save.activeCombat !== null
    const slot = item.armor.slot
    const equipped = slot === 'body' ? save.player.equippedArmorId === item.id : save.player.equippedTalismanId === item.id
    return [{
      id: `equip:${item.id}`,
      label: equipped ? 'Ausgerüstet' : slot === 'body' ? 'Als Rüstung ausrüsten' : 'Als Talisman ausrüsten',
      disabled: inCombat || equipped,
      reason: inCombat ? 'Während eines Kampfes kannst du die Ausrüstung nicht wechseln.' : equipped ? 'Dieser Gegenstand ist bereits ausgerüstet.' : undefined,
      gameAction: { type: slot === 'body' ? 'EQUIP_ARMOR' : 'EQUIP_TALISMAN', itemId: item.id }
    }]
  }

  if (item.kind === 'healing' && item.healing) {
    const fullLife = save.player.life >= save.player.maxLife
    const clearIds = item.healing.clearsEffectIds ?? []
    const effectCanBePrepared = save.activeCombat !== null && (Boolean(item.healing.combatEffect) || save.activeCombat.playerEffects.some((effect) => clearIds.includes(effect.id)))
    const combatPaused = save.player.life === 0 || Boolean(save.activeCombat?.pendingSealItemId || save.activeCombat?.awaitingFinalAction)
    return [{
      id: `use:${item.id}`,
      label: 'Benutzen',
      disabled: combatPaused || (fullLife && !effectCanBePrepared),
      reason: combatPaused ? 'Schliesse zuerst die angezeigte Kampfaktion ab.' : fullLife && !effectCanBePrepared ? 'Deine Lebenspunkte sind bereits voll.' : undefined,
      gameAction: { type: 'USE_ITEM', itemId: item.id }
    }]
  }

  return []
}
