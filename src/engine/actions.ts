import type { GameSave } from '../domain/game'
import type { InteractionDefinition, ItemDefinition, PassageDefinition, WorldDefinition } from '../domain/content'
import { evaluateRequirement } from './requirements'
import { isPuzzleSolved } from './puzzles'

export type GameAction =
  | { type: 'SHOW_HINT'; questId: string; level: number }
  | { type: 'PUZZLE_INPUT'; puzzleId: string; controlId: string; value: number }
  | { type: 'PUZZLE_RESET'; puzzleId: string }
  | { type: 'MOVE'; passageId: string; toAreaId: string }
  | { type: 'INSPECT'; areaId: string }
  | { type: 'TAKE_ITEM'; interactionId: string }
  | { type: 'OPEN_CHEST'; interactionId: string }
  | { type: 'COMPLETE_INTERACTION'; interactionId: string }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'USE_TOOL'; itemId: string }
  | { type: 'EQUIP_WEAPON'; itemId: string }
  | { type: 'START_COMBAT'; encounterId: string }
  | { type: 'ATTACK' }
  | { type: 'DEFEND' }
  | { type: 'FLEE' }
  | { type: 'RESPAWN' }
  | { type: 'REST' }
  | { type: 'PLACE_SEAL'; itemId: string }
  | { type: 'SPEAK_PROMISE' }

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
  if (interaction.id === 'tessa_kartenstift' && (save.player.inventory.kartenstift ?? 0) > 0) return true
  if (interaction.id === 'morgenklinge_ziehen' && ((save.player.inventory.morgenklinge ?? 0) > 0 || save.flags.includes('morgenklinge_erweckt'))) return true
  if (interaction.chestId) return save.openedChestIds.includes(interaction.chestId)
  return save.flags.includes(`interaktion:${interaction.id}`)
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
    const fullyRested = save.player.life === save.player.maxLife && (save.player.inventory.apfelbrot ?? 0) >= 3 && save.lastSanctuaryId === area.id
    actions.push({
      id: `rest:${area.id}`,
      kind: 'interaction',
      label: fullyRested ? 'Rastplatz prüfen' : 'Raste und fülle Vorräte auf',
      description: fullyRested ? 'Du bist ausgeruht und hast genug Apfelbrot.' : 'Heilt vollständig und ergänzt Apfelbrot auf drei Stück.',
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

  const adjacentAreaIds = world.passages
    .map((passage) => otherEnd(passage, area.id))
    .filter((id): id is string => id !== null)
  const bossNearby = world.encounters.some((encounter) => {
    const enemy = world.enemies.find((entry) => entry.id === encounter.enemyId)
    return (encounter.areaId === area.id || adjacentAreaIds.includes(encounter.areaId)) &&
      enemy?.kind === 'boss' && !save.defeatedEncounterIds.includes(encounter.id)
  })
  if (bossNearby && (save.player.inventory.morgenklinge ?? 0) > 0 && save.player.equippedWeaponId !== 'morgenklinge') {
    actions.push({
      id: 'equip:morgenklinge',
      kind: 'interaction',
      label: 'Rüste die Morgenklinge aus',
      description: 'Nur ihr Licht kann den schwarzen Schattenpanzer eines Wächters durchdringen.',
      icon: '⚔',
      disabled: false,
      gameAction: { type: 'EQUIP_WEAPON', itemId: 'morgenklinge' }
    })
  }

  for (const encounter of world.encounters.filter((entry) => entry.areaId === area.id)) {
    if (save.defeatedEncounterIds.includes(encounter.id)) continue
    const enemy = world.enemies.find((entry) => entry.id === encounter.enemyId)
    const missingSeals = Boolean(enemy?.phaseSealItemIds && Object.values(enemy.phaseSealItemIds).some((id) => (save.player.inventory[id] ?? 0) < 1))
    const weapon = world.items.find((item) => item.id === save.player.equippedWeaponId && item.weapon)
    const missingWeapon = !weapon || (save.player.inventory[weapon.id] ?? 0) < 1
    actions.push({
      id: `combat:${encounter.id}`,
      kind: 'combat',
      label: encounter.label,
      description: encounter.description,
      icon: '⚔',
      disabled: missingSeals || missingWeapon,
      blockedReason: missingWeapon ? 'Rüste zuerst im Inventar eine Waffe aus.' : missingSeals ? 'Für die Verbannung brauchst du alle drei Wächtersiegel.' : undefined,
      gameAction: { type: 'START_COMBAT', encounterId: encounter.id }
    })
  }

  for (const passage of world.passages.filter((entry) => otherEnd(entry, area.id) !== null)) {
    const destinationId = otherEnd(passage, area.id)
    if (!destinationId) continue
    const requirement = evaluateRequirement(passage.requirement, save)
    const manuallyUnlocked = save.unlockedPassageIds.includes(passage.id)
    const destination = world.areas.find((entry) => entry.id === destinationId)
    actions.push({
      id: `move:${passage.id}`,
      kind: 'move',
      label: passage.fromAreaId === area.id ? passage.labelFrom : passage.labelTo,
      description: passage.shortcut ? `Abkürzung nach ${destination?.name ?? destinationId}` : destination?.regionName ?? 'Weiterreisen',
      icon: passage.shortcut ? '↯' : '➜',
      disabled: !requirement.met && !manuallyUnlocked,
      blockedReason: requirement.met || manuallyUnlocked ? undefined : passage.blockedText ?? 'Dieser Weg ist noch versperrt.',
      gameAction: { type: 'MOVE', passageId: passage.id, toAreaId: destinationId }
    })
  }

  return actions
}

export function getInventoryActions(save: GameSave, item: ItemDefinition): InventoryAction[] {
  const owned = (save.player.inventory[item.id] ?? 0) > 0
  if (!owned) return []
  if (['glasauge', 'kartenstift', 'muschelhorn'].includes(item.id)) {
    const wrongPlace = item.id === 'muschelhorn' && !['muschelhafen', 'perlenbecken'].includes(save.currentAreaId)
    return [{ id: `tool:${item.id}`, label: 'Benutzen', disabled: Boolean(save.activeCombat) || wrongPlace,
      reason: save.activeCombat ? 'Benutze das Werkzeug nach dem Kampf.' : wrongPlace ? 'Rufe Marea im Muschelhafen oder Perlenbecken.' : undefined,
      gameAction: { type: 'USE_TOOL', itemId: item.id } }]
  }

  if (item.kind === 'weapon' && item.weapon) {
    const inCombat = save.activeCombat !== null
    const equipped = save.player.equippedWeaponId === item.id
    return [{
      id: `equip:${item.id}`,
      label: equipped ? 'Ausgerüstet' : 'Ausrüsten',
      disabled: inCombat || equipped,
      reason: inCombat ? 'Während eines Kampfes kannst du die Waffe nicht wechseln.' : equipped ? 'Diese Waffe ist bereits ausgerüstet.' : undefined,
      gameAction: { type: 'EQUIP_WEAPON', itemId: item.id }
    }]
  }

  if (item.kind === 'healing' && item.healing) {
    const fullLife = save.player.life >= save.player.maxLife
    const effectCanBePrepared = save.activeCombat !== null && (Boolean(item.healing.combatEffect) || (item.id === 'quellwasser' && save.activeCombat.effects.some((effect) => effect.id === 'grauschleier')))
    const combatPaused = save.player.life === 0 || Boolean(save.activeCombat?.pendingSealItemId || save.activeCombat?.awaitingFinalPromise)
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
