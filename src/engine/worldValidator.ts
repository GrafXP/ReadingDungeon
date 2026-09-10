import type {
  DamageType,
  InteractionEffect,
  Requirement,
  WorldDefinition
} from '../domain/content'
import { getPuzzleKind } from './puzzles'
import { requirementItemIds } from './requirements'

export interface ValidationReport {
  valid: boolean
  errors: string[]
  contentGaps: string[]
  missingContentIds: Record<string, string[]>
  reachableAreaIds: string[]
  completionReachable: boolean
  freelyReachableAreaIds: string[]
}

export interface WorldValidationOptions {
  /** Allows the Phase 1 Kantara scaffold to be loaded before its later content exists. */
  allowIncomplete?: boolean
}

const DAMAGE_TYPES: DamageType[] = ['physical', 'fire', 'ice', 'lightning', 'light', 'shadow']

function duplicateIds(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}

interface SimulatedState {
  items: Set<string>
  flags: Set<string>
  clues: Set<string>
  equippedWeaponId: string | null
  equippedArmorId: string | null
  equippedTalismanId: string | null
}

function requirementMet(requirement: Requirement | undefined, state: SimulatedState): boolean {
  if (!requirement) return true
  if (requirement.kind === 'item') return state.items.has(requirement.itemId)
  if (requirement.kind === 'equipped') {
    const equipped = requirement.slot === 'weapon'
      ? state.equippedWeaponId
      : requirement.slot === 'body'
        ? state.equippedArmorId
        : state.equippedTalismanId
    return equipped === requirement.itemId && state.items.has(requirement.itemId)
  }
  if (requirement.kind === 'flag') return state.flags.has(requirement.flag)
  if (requirement.kind === 'clue') return state.clues.has(requirement.clueId)
  if (requirement.kind === 'all') return requirement.requirements.every((entry) => requirementMet(entry, state))
  return requirement.requirements.some((entry) => requirementMet(entry, state))
}

function validateRequirement(requirement: Requirement | undefined, itemIds: Set<string>, owner: string, errors: string[]) {
  if (!requirement) return
  if ((requirement.kind === 'item' || requirement.kind === 'equipped') && !itemIds.has(requirement.itemId)) {
    errors.push(`${owner} verlangt den unbekannten Gegenstand ${requirement.itemId}.`)
  }
  if (requirement.kind === 'all' || requirement.kind === 'any') {
    if (requirement.requirements.length === 0) errors.push(`${owner} enthält eine leere ${requirement.kind}-Anforderung.`)
    requirement.requirements.forEach((entry) => validateRequirement(entry, itemIds, owner, errors))
  }
}

function validateEffects(
  effects: InteractionEffect[],
  owner: string,
  itemIds: Set<string>,
  passageIds: Set<string>,
  errors: string[]
) {
  for (const effect of effects) {
    if ((effect.kind === 'addItem' || effect.kind === 'removeItem' || effect.kind === 'equipItem') && !itemIds.has(effect.itemId)) {
      errors.push(`${owner} verwendet den unbekannten Gegenstand ${effect.itemId}.`)
    }
    if ((effect.kind === 'addItem' || effect.kind === 'removeItem') && (!Number.isInteger(effect.quantity) || effect.quantity < 1)) {
      errors.push(`${owner} hat eine ungültige Gegenstandsmenge.`)
    }
    if (effect.kind === 'unlockPassage' && !passageIds.has(effect.passageId)) {
      errors.push(`${owner} öffnet die unbekannte Passage ${effect.passageId}.`)
    }
  }
}

function graphReachability(world: WorldDefinition, passages = world.passages): Set<string> {
  return graphReachabilityFrom(world.start.areaId, passages)
}

function graphReachabilityFrom(startAreaId: string, passages: WorldDefinition['passages']): Set<string> {
  const reachable = new Set([startAreaId])
  let changed = true
  while (changed) {
    changed = false
    for (const passage of passages) {
      if (reachable.has(passage.fromAreaId) && !reachable.has(passage.toAreaId)) {
        reachable.add(passage.toAreaId)
        changed = true
      }
      if (reachable.has(passage.toAreaId) && !reachable.has(passage.fromAreaId)) {
        reachable.add(passage.fromAreaId)
        changed = true
      }
    }
  }
  return reachable
}

function simulateProgression(world: WorldDefinition) {
  const reachable = new Set([world.start.areaId])
  const state: SimulatedState = {
    items: new Set(Object.entries(world.start.inventory).filter(([, count]) => count > 0).map(([id]) => id)),
    flags: new Set<string>(),
    clues: new Set<string>(),
    equippedWeaponId: world.start.equippedWeaponId,
    equippedArmorId: world.start.equippedArmorId,
    equippedTalismanId: world.start.equippedTalismanId
  }
  const completedInteractions = new Set<string>()
  const defeatedEncounters = new Set<string>()
  let changed = true

  while (changed) {
    changed = false
    for (const areaId of [...reachable]) state.flags.add(`area_untersucht:${areaId}`)

    for (const interaction of world.interactions) {
      if (completedInteractions.has(interaction.id) || !reachable.has(interaction.areaId)) continue
      if (!requirementMet(interaction.requirement, state) || !requirementMet(interaction.visibilityRequirement, state)) continue
      completedInteractions.add(interaction.id)
      for (const effect of interaction.effects) {
        if (effect.kind === 'discoverClue' && !state.clues.has(effect.clueId)) {
          state.clues.add(effect.clueId)
          changed = true
        }
        if (effect.kind === 'addItem' && !state.items.has(effect.itemId)) {
          state.items.add(effect.itemId)
          changed = true
        }
        if (effect.kind === 'removeItem' && state.items.delete(effect.itemId)) changed = true
        if (effect.kind === 'equipItem' && state.items.has(effect.itemId)) {
          const item = world.items.find((entry) => entry.id === effect.itemId)
          if (item?.kind === 'weapon') state.equippedWeaponId = item.id
          if (item?.armor?.slot === 'body') state.equippedArmorId = item.id
          if (item?.armor?.slot === 'talisman') state.equippedTalismanId = item.id
        }
        if (effect.kind === 'setFlag' && !state.flags.has(effect.flag)) {
          state.flags.add(effect.flag)
          changed = true
        }
      }
    }

    for (const encounter of world.encounters) {
      if (defeatedEncounters.has(encounter.id) || !reachable.has(encounter.areaId)) continue
      if (encounter.enemyIds.some((id) => !world.enemies.some((enemy) => enemy.id === id))) continue
      // The simulator may equip owned required gear while preparing at a safe route.
      const requiredItems = requirementItemIds(encounter.requiredGear)
      if (requiredItems.some((id) => !state.items.has(id))) continue
      for (const itemId of requiredItems) {
        const item = world.items.find((entry) => entry.id === itemId)
        if (item?.kind === 'weapon') state.equippedWeaponId = itemId
        if (item?.armor?.slot === 'body') state.equippedArmorId = itemId
        if (item?.armor?.slot === 'talisman') state.equippedTalismanId = itemId
      }
      if (!requirementMet(encounter.requiredGear, state)) continue
      defeatedEncounters.add(encounter.id)
      changed = true
      for (const effect of encounter.rewardEffects) {
        if (effect.kind === 'addItem') state.items.add(effect.itemId)
        if (effect.kind === 'removeItem') state.items.delete(effect.itemId)
        if (effect.kind === 'setFlag') state.flags.add(effect.flag)
        if (effect.kind === 'discoverClue') state.clues.add(effect.clueId)
        if (effect.kind === 'equipItem' && state.items.has(effect.itemId)) {
          const item = world.items.find((entry) => entry.id === effect.itemId)
          if (item?.kind === 'weapon') state.equippedWeaponId = item.id
          if (item?.armor?.slot === 'body') state.equippedArmorId = item.id
          if (item?.armor?.slot === 'talisman') state.equippedTalismanId = item.id
        }
      }
    }

    for (const passage of world.passages) {
      if (!requirementMet(passage.requirement, state)) continue
      if (passage.guardEncounterId && !defeatedEncounters.has(passage.guardEncounterId)) continue
      if (reachable.has(passage.fromAreaId) && !reachable.has(passage.toAreaId)) {
        reachable.add(passage.toAreaId)
        changed = true
      }
      if (reachable.has(passage.toAreaId) && !reachable.has(passage.fromAreaId)) {
        reachable.add(passage.fromAreaId)
        changed = true
      }
    }
  }
  return { reachable, state }
}

function validDamageTypes(values: DamageType[] | undefined): boolean {
  return !values || (duplicateIds(values).length === 0 && values.every((value) => DAMAGE_TYPES.includes(value)))
}

export function validateWorld(world: WorldDefinition, options: WorldValidationOptions = {}): ValidationReport {
  const errors: string[] = []
  const contentGaps: string[] = []
  const missingContentIds: Record<string, string[]> = {}
  const areaIds = new Set(world.areas.map((entry) => entry.id))
  const itemIds = new Set(world.items.map((entry) => entry.id))
  const passageIds = new Set(world.passages.map((entry) => entry.id))
  const enemyIds = new Set(world.enemies.map((entry) => entry.id))
  const encounterIds = new Set(world.encounters.map((entry) => entry.id))
  const regionIds = new Set(world.regions.map((entry) => entry.id))
  const statusIds = new Set((world.statusEffects ?? []).map((entry) => entry.id))

  if (world.contentInventory) {
    const inventories = [
      ['areas', 'Orte', world.areas.map((entry) => entry.id), world.contentInventory.areas],
      ['passages', 'Verbindungen', world.passages.map((entry) => entry.id), world.contentInventory.passages],
      ['items', 'Gegenstände', world.items.map((entry) => entry.id), world.contentInventory.items],
      ['interactions', 'Interaktionen', world.interactions.map((entry) => entry.id), world.contentInventory.interactions],
      ['puzzles', 'Rätsel', (world.puzzles ?? []).map((entry) => entry.id), world.contentInventory.puzzles],
      ['enemies', 'Gegnertypen', world.enemies.map((entry) => entry.id), world.contentInventory.enemies],
      ['encounters', 'Begegnungen', world.encounters.map((entry) => entry.id), world.contentInventory.encounters]
    ] as const
    for (const [key, label, actual, expected] of inventories) {
      const actualIds = new Set(actual)
      const expectedIds = new Set(expected)
      const missing = expected.filter((id) => !actualIds.has(id))
      const unexpected = actual.filter((id) => !expectedIds.has(id))
      missingContentIds[key] = [...missing]
      if (missing.length > 0) contentGaps.push(`${label}: ${missing.length} von ${expected.length} fehlen.`)
      if (unexpected.length > 0) errors.push(`${label}: nicht im Phase-0-Inventar: ${unexpected.join(', ')}.`)
    }
    if (!options.allowIncomplete) errors.push(...contentGaps)
  }

  if (!world.campaignId.trim()) errors.push('Die Kampagnen-ID fehlt.')
  for (const [kind, ids] of [
    ['Regions', world.regions.map((entry) => entry.id)],
    ['Orts', world.areas.map((entry) => entry.id)],
    ['Passagen', world.passages.map((entry) => entry.id)],
    ['Gegenstands', world.items.map((entry) => entry.id)],
    ['Interaktions', world.interactions.map((entry) => entry.id)],
    ['Gegner', world.enemies.map((entry) => entry.id)],
    ['Begegnungs', world.encounters.map((entry) => entry.id)]
  ] as const) {
    for (const duplicate of duplicateIds(ids)) errors.push(`Doppelte ${kind}-ID: ${duplicate}.`)
  }

  if (!areaIds.has(world.start.areaId)) errors.push(`Startort ${world.start.areaId} fehlt.`)
  if (!world.areas.find((area) => area.id === world.start.areaId)?.safe) errors.push('Der Startort muss ein Rastplatz sein.')
  if (!Number.isInteger(world.start.maxLife) || world.start.maxLife < 1) errors.push('Die Start-Lebenspunkte sind ungültig.')
  for (const [id, count] of Object.entries(world.start.inventory)) {
    if (!itemIds.has(id)) errors.push(`Startinventar verwendet den unbekannten Gegenstand ${id}.`)
    if (!Number.isSafeInteger(count) || count < 1) errors.push(`Startinventar hat eine ungültige Menge für ${id}.`)
  }
  for (const [slot, id] of [
    ['Waffe', world.start.equippedWeaponId],
    ['Rüstung', world.start.equippedArmorId],
    ['Talisman', world.start.equippedTalismanId]
  ] as const) {
    if (id !== null && !itemIds.has(id)) errors.push(`Start-${slot} ${id} fehlt.`)
  }
  if (world.start.equippedWeaponId && !world.items.find((item) => item.id === world.start.equippedWeaponId)?.weapon) errors.push('Die Startwaffe ist keine Waffe.')
  if (world.start.equippedArmorId && world.items.find((item) => item.id === world.start.equippedArmorId)?.armor?.slot !== 'body') errors.push('Die Startrüstung gehört nicht auf den Körperplatz.')
  if (world.start.equippedTalismanId && world.items.find((item) => item.id === world.start.equippedTalismanId)?.armor?.slot !== 'talisman') errors.push('Der Starttalisman gehört nicht auf den Talismanplatz.')
  for (const restock of world.start.sanctuaryRestocks ?? []) {
    if (!itemIds.has(restock.itemId) || !Number.isSafeInteger(restock.quantity) || restock.quantity < 1) errors.push(`Ungültiger Rastvorrat ${restock.itemId}.`)
  }
  validateRequirement(world.completionRequirement, itemIds, 'Kampagnenziel', errors)
  validateRequirement(world.mapRevealRequirement, itemIds, 'Kartenfreigabe', errors)

  for (const duplicate of duplicateIds((world.puzzles ?? []).map((entry) => entry.id))) errors.push(`Doppelte Rätsel-ID: ${duplicate}.`)
  for (const puzzle of world.puzzles ?? []) {
    if (puzzle.interactionId && !world.interactions.some((entry) => entry.id === puzzle.interactionId && entry.areaId === puzzle.areaId)) errors.push(`Rätsel ${puzzle.id} hat keine passende Abschlussinteraktion.`)
    if (!puzzle.interactionId && !puzzle.completion) errors.push(`Rätsel ${puzzle.id} hat keinen Abschluss.`)
    if (puzzle.interactionId && puzzle.completion) errors.push(`Rätsel ${puzzle.id} hat zwei verschiedene Abschlüsse.`)
    if (puzzle.completion) validateEffects(puzzle.completion.effects, `Rätsel ${puzzle.id}`, itemIds, passageIds, errors)
    const kind = getPuzzleKind(puzzle)
    if ((kind === 'controls' || kind === 'sequence') && !puzzle.controls.length && !puzzle.sequence?.solution.length) errors.push(`Rätsel ${puzzle.id} hat keine Bedienelemente.`)
    if (duplicateIds(puzzle.controls.map((control) => control.id)).length || puzzle.controls.some((control) => control.id === 'sequence')) errors.push(`Rätsel ${puzzle.id} hat doppelte oder reservierte Bedienelemente.`)
    for (const control of puzzle.controls) {
      if ([control.initial, control.solution].some((value) => !Number.isSafeInteger(value) || value < 0 || value >= control.options.length)) errors.push(`Rätsel ${puzzle.id} hat ungültige Stellungen.`)
    }
    if (puzzle.sequence && (!puzzle.sequence.solution.length || puzzle.sequence.solution.some((value) => !Number.isSafeInteger(value) || value < 0 || value >= puzzle.sequence!.options.length))) errors.push(`Rätsel ${puzzle.id} hat eine ungültige Folge.`)
    if (kind === 'pairing') {
      const pairing = puzzle.pairing
      const leftIds = pairing?.left.map((item) => item.id) ?? []
      const rightIds = pairing?.right.map((item) => item.id) ?? []
      const solutionEntries = Object.entries(pairing?.solution ?? {})
      if (!pairing || !leftIds.length || leftIds.length !== rightIds.length || duplicateIds(leftIds).length || duplicateIds(rightIds).length || solutionEntries.length !== leftIds.length || solutionEntries.some(([left, right]) => !leftIds.includes(left) || !rightIds.includes(right)) || duplicateIds(solutionEntries.map(([, right]) => right)).length) errors.push(`Rätsel ${puzzle.id} hat ungültige Paare.`)
    }
    if (kind === 'ordering') {
      const ordering = puzzle.ordering
      const ids = ordering?.items.map((item) => item.id) ?? []
      if (!ordering || ids.length < 2 || duplicateIds(ids).length || ordering.solution.length !== ids.length || new Set(ordering.solution).size !== ordering.solution.length || ordering.solution.some((id) => !ids.includes(id))) errors.push(`Rätsel ${puzzle.id} hat eine ungültige Reihenfolge.`)
    }
    if (kind === 'grid') {
      const grid = puzzle.grid
      const cellCount = grid ? grid.width * grid.height : 0
      const validCell = (cell: number) => Number.isSafeInteger(cell) && cell >= 0 && cell < cellCount && !grid?.blocked?.includes(cell)
      const adjacent = (first: number, second: number) => Boolean(grid && Math.abs(Math.floor(first / grid.width) - Math.floor(second / grid.width)) + Math.abs((first % grid.width) - (second % grid.width)) === 1)
      if (!grid || grid.width < 1 || grid.width > 4 || grid.height < 1 || grid.height > 4 || !grid.solution.length || grid.solution[0] !== grid.start || grid.solution.at(-1) !== grid.goal || !grid.solution.every(validCell) || grid.solution.some((cell, index) => index > 0 && !adjacent(grid.solution[index - 1], cell))) errors.push(`Rätsel ${puzzle.id} hat ein ungültiges Wegfeld.`)
    }
    if (kind === 'reading') {
      const reading = puzzle.reading
      if (!reading || !reading.sourceText.trim() || !reading.prompts.length || duplicateIds(reading.prompts.map((prompt) => prompt.id)).length || reading.prompts.some((prompt) => !Number.isSafeInteger(prompt.solution) || prompt.solution < 0 || prompt.solution >= prompt.options.length)) errors.push(`Rätsel ${puzzle.id} hat einen ungültigen Lesetext.`)
    }
    if (kind === 'weighing') {
      const weighing = puzzle.weighing
      const ids = weighing?.items.map((item) => item.id) ?? []
      const solution = Object.entries(weighing?.solution ?? {})
      const leftWeight = weighing?.items.filter((item) => weighing.solution[item.id] === 'left').reduce((sum, item) => sum + item.weight, 0)
      const rightWeight = weighing?.items.filter((item) => weighing.solution[item.id] === 'right').reduce((sum, item) => sum + item.weight, 0)
      if (!weighing || ids.length < 2 || duplicateIds(ids).length || weighing.items.some((item) => !Number.isInteger(item.weight) || item.weight < 1) || solution.length !== ids.length || solution.some(([id, side]) => !ids.includes(id) || !['left', 'right', 'off'].includes(side)) || leftWeight !== rightWeight) errors.push(`Rätsel ${puzzle.id} hat eine ungültige Waage.`)
    }
    if (puzzle.hints && (puzzle.hints.length !== 3 || puzzle.hints.some((hint) => !hint.trim()))) errors.push(`Rätsel ${puzzle.id} braucht drei vollständige Hinweise.`)
  }

  for (const area of world.areas) {
    if (!regionIds.has(area.regionId)) errors.push(`Ort ${area.id} verwendet die unbekannte Region ${area.regionId}.`)
    const region = world.regions.find((entry) => entry.id === area.regionId)
    if (region && region.name !== area.regionName) errors.push(`Ort ${area.id} hat nicht den Namen seiner Region ${region.name}.`)
    validateRequirement(area.sanctuaryRequirement, itemIds, `Rastplatz ${area.id}`, errors)
    for (const variant of area.variants ?? []) validateRequirement(variant.requirement, itemIds, `Ortstext ${area.id}`, errors)
    if (area.sanctuaryRequirement && !area.safe) errors.push(`Ort ${area.id} hat eine Rastplatz-Anforderung, ist aber nicht als sicher markiert.`)
  }
  for (const duplicate of duplicateIds((world.storyBeats ?? []).map((beat) => beat.id))) errors.push(`Doppelte Erzähl-ID: ${duplicate}.`)
  for (const beat of world.storyBeats ?? []) validateRequirement(beat.requirement, itemIds, `Erzählung ${beat.id}`, errors)
  for (const duplicate of duplicateIds((world.ruleCards ?? []).map((card) => card.id))) errors.push(`Doppelte Regelkarten-ID: ${duplicate}.`)
  for (const card of world.ruleCards ?? []) validateRequirement(card.requirement, itemIds, `Regelkarte ${card.id}`, errors)

  for (const passage of world.passages) {
    if (!areaIds.has(passage.fromAreaId)) errors.push(`${passage.id} beginnt an einem unbekannten Ort: ${passage.fromAreaId}.`)
    if (!areaIds.has(passage.toAreaId)) errors.push(`${passage.id} endet an einem unbekannten Ort: ${passage.toAreaId}.`)
    if (passage.fromAreaId === passage.toAreaId) errors.push(`${passage.id} verbindet einen Ort mit sich selbst.`)
    validateRequirement(passage.requirement, itemIds, `Passage ${passage.id}`, errors)
    if (passage.guardEncounterId) {
      const guard = world.encounters.find((entry) => entry.id === passage.guardEncounterId)
      if (!guard) errors.push(`${passage.id} verwendet den unbekannten Wegwächter ${passage.guardEncounterId}.`)
      else if (![passage.fromAreaId, passage.toAreaId].includes(guard.areaId)) errors.push(`${passage.id}: Wegwächter ${guard.id} steht nicht an dieser Verbindung.`)
      if (!passage.blockedText) errors.push(`${passage.id}: Ein Wegwächter braucht einen sichtbaren Sperrtext.`)
      if (guard) {
        const escapeGraph = graphReachabilityFrom(guard.areaId, world.passages.filter((entry) => entry.id !== passage.id))
        if (!escapeGraph.has(world.start.areaId)) errors.push(`${passage.id}: Wegwächter ${guard.id} sperrt den einzigen Rückweg zum Startgebiet.`)
        if (!world.areas.some((area) => area.safe && escapeGraph.has(area.id))) errors.push(`${passage.id}: Wegwächter ${guard.id} sperrt den letzten Weg zu einem Rastplatz.`)
      }
    }
  }

  const chestIds = world.interactions.flatMap((entry) => entry.chestId ? [entry.chestId] : [])
  for (const duplicate of duplicateIds(chestIds)) errors.push(`Doppelte Truhen-ID: ${duplicate}.`)
  for (const interaction of world.interactions) {
    if (!areaIds.has(interaction.areaId)) errors.push(`${interaction.id} liegt an einem unbekannten Ort: ${interaction.areaId}.`)
    if (interaction.actionType === 'OPEN_CHEST' && !interaction.chestId) errors.push(`${interaction.id} ist eine Truhe ohne Truhen-ID.`)
    validateRequirement(interaction.requirement, itemIds, `Interaktion ${interaction.id}`, errors)
    validateRequirement(interaction.visibilityRequirement, itemIds, `Sichtbarkeit ${interaction.id}`, errors)
    validateRequirement(interaction.completedWhen, itemIds, `Abschluss ${interaction.id}`, errors)
    const requiredItems = new Set(requirementItemIds(interaction.requirement))
    validateEffects(interaction.effects, `Interaktion ${interaction.id}`, itemIds, passageIds, errors)
    for (const effect of interaction.effects) {
      if (effect.kind === 'addItem' && requiredItems.has(effect.itemId)) errors.push(`${interaction.id} sperrt ${effect.itemId} hinter demselben Gegenstand ein.`)
    }
  }

  for (const enemy of world.enemies) {
    if (!Number.isInteger(enemy.maxLife) || enemy.maxLife < 1) errors.push(`Gegner ${enemy.id} hat ungültige Lebenspunkte.`)
    if (!Number.isInteger(enemy.defense) || enemy.defense < 0) errors.push(`Gegner ${enemy.id} hat ungültige Verteidigung.`)
    if (![enemy.weakTo, enemy.resistantTo, enemy.immuneTo].every(validDamageTypes)) errors.push(`Gegner ${enemy.id} hat ungültige Schadensarten.`)
    const relationships = [...(enemy.weakTo ?? []), ...(enemy.resistantTo ?? []), ...(enemy.immuneTo ?? [])]
    if (duplicateIds(relationships).length) errors.push(`Gegner ${enemy.id} führt eine Schadensart mehrfach als Schwäche, Widerstand oder Immunität.`)
    const availableDamageTypes = new Set(world.items.flatMap((item) => {
      if (!item.weapon) return []
      const elemental = item.weapon.elemental
      return [item.weapon.damageType, ...(elemental ? 'type' in elemental ? [elemental.type] : elemental.choices : [])]
    }))
    if (!options.allowIncomplete) {
      for (const weakness of enemy.weakTo ?? []) if (!availableDamageTypes.has(weakness)) errors.push(`Gegner ${enemy.id} ist nur gegen die nicht verfügbare Schadensart ${weakness} schwach.`)
    }
    if (enemy.kind === 'boss' && enemy.phaseTwoAtLife !== undefined && (!Number.isInteger(enemy.phaseTwoAtLife) || enemy.phaseTwoAtLife < 1 || enemy.phaseTwoAtLife >= enemy.maxLife)) errors.push(`Boss ${enemy.id} hat eine ungültige Phasengrenze.`)
    if (enemy.phaseSealItemIds) {
      for (const [phase, sealItemId] of Object.entries(enemy.phaseSealItemIds)) {
        if (!itemIds.has(sealItemId)) errors.push(`Boss ${enemy.id} verlangt in Phase ${phase} das unbekannte Siegel ${sealItemId}.`)
      }
    }
    const phases = Object.entries(enemy.movesByPhase)
    if (phases.length === 0 || phases.some(([, moves]) => moves.length === 0)) errors.push(`Gegner ${enemy.id} hat eine leere Kampfphase.`)
    for (const [phase, moves] of phases) {
      for (const duplicate of duplicateIds(moves.map((move) => move.id))) errors.push(`Gegner ${enemy.id} hat in Phase ${phase} die doppelte Bewegung ${duplicate}.`)
      for (const move of moves) {
        if (!Number.isInteger(move.damage) || move.damage < 0) errors.push(`Bewegung ${enemy.id}/${move.id} hat ungültigen Schaden.`)
        if (move.damageType && !DAMAGE_TYPES.includes(move.damageType)) errors.push(`Bewegung ${enemy.id}/${move.id} hat eine unbekannte Schadensart.`)
        if (move.kind === 'heal' && (!Number.isSafeInteger(move.healAmount) || move.healAmount! < 1)) errors.push(`Heilbewegung ${enemy.id}/${move.id} hat keine gültige Heilmenge.`)
        if (move.kind !== 'heal' && move.healAmount !== undefined) errors.push(`Bewegung ${enemy.id}/${move.id} heilt, ohne eine Heilbewegung zu sein.`)
        if (move.inflictedEffect && !statusIds.has(move.inflictedEffect.id)) errors.push(`Bewegung ${enemy.id}/${move.id} verwendet den unbekannten Zustand ${move.inflictedEffect.id}.`)
      }
    }
  }

  for (const encounter of world.encounters) {
    if (!areaIds.has(encounter.areaId)) errors.push(`${encounter.id} liegt an einem unbekannten Ort: ${encounter.areaId}.`)
    if (!areaIds.has(encounter.fleeAreaId)) errors.push(`${encounter.id} flieht an einen unbekannten Ort: ${encounter.fleeAreaId}.`)
    if (encounter.enemyIds.length < 1 || encounter.enemyIds.length > 2) errors.push(`${encounter.id} braucht eine Liste mit einem oder zwei Gegnern.`)
    for (const id of encounter.enemyIds) if (!enemyIds.has(id)) errors.push(`${encounter.id} verwendet den unbekannten Gegner ${id}.`)
    if (duplicateIds(encounter.enemyIds).length) errors.push(`${encounter.id} führt denselben Kämpfer doppelt.`)
    validateRequirement(encounter.requiredGear, itemIds, `Ausrüstungstor ${encounter.id}`, errors)
    if (encounter.requiredGear && !encounter.gearWarning) errors.push(`${encounter.id} braucht für sein Ausrüstungstor einen Warntext.`)
    validateEffects(encounter.rewardEffects, `Begegnung ${encounter.id}`, itemIds, passageIds, errors)
  }

  for (const item of world.items) {
    if (item.kind === 'weapon') {
      if (!item.weapon) errors.push(`Waffe ${item.id} hat keine Schadenswerte.`)
      else {
        if (!Number.isInteger(item.weapon.minDamage) || !Number.isInteger(item.weapon.maxDamage) || item.weapon.minDamage < 1 || item.weapon.maxDamage < item.weapon.minDamage) errors.push(`Waffe ${item.id} hat einen ungültigen Schadensbereich.`)
        if (!DAMAGE_TYPES.includes(item.weapon.damageType)) errors.push(`Waffe ${item.id} hat eine unbekannte Schadensart.`)
        if (item.weapon.elemental && 'type' in item.weapon.elemental && !DAMAGE_TYPES.includes(item.weapon.elemental.type)) errors.push(`Waffe ${item.id} hat ein unbekanntes Element.`)
        if (item.weapon.elemental && 'choices' in item.weapon.elemental && (!validDamageTypes(item.weapon.elemental.choices) || item.weapon.elemental.choices.includes('physical'))) errors.push(`Waffe ${item.id} hat ungültige Elementmodi.`)
        if (item.weapon.skill) {
          const skill = item.weapon.skill
          const skillEffect = skill.effect
          if (!Number.isSafeInteger(skill.cooldown) || skill.cooldown < 1) errors.push(`Waffenkunst ${skill.id} hat eine ungültige Abklingzeit.`)
          if (skillEffect.kind === 'burst' && (!DAMAGE_TYPES.includes(skillEffect.damageType) || !Number.isSafeInteger(skillEffect.bonusDamage) || skillEffect.bonusDamage < 1)) errors.push(`Waffenkunst ${skill.id} hat ungültigen Zusatzschaden.`)
          if (skillEffect.kind === 'inflict' || skillEffect.kind === 'ward') {
            const status = world.statusEffects?.find((entry) => entry.id === skillEffect.effectId)
            if (!status) errors.push(`Waffenkunst ${skill.id} verwendet den unbekannten Zustand ${skillEffect.effectId}.`)
            else if ((skillEffect.kind === 'inflict' && status.target !== 'enemy') || (skillEffect.kind === 'ward' && status.target !== 'player')) errors.push(`Waffenkunst ${skill.id} verwendet ${status.id} für das falsche Ziel.`)
          }
        }
      }
    }
    if (item.kind === 'armor' && (!item.armor || !Number.isInteger(item.armor.defense) || item.armor.defense < 0 || !validDamageTypes(item.armor.protectsFrom) || !validDamageTypes(item.armor.immuneTo))) errors.push(`Rüstung ${item.id} hat keine gültigen Schutzwerte.`)
    if (item.kind === 'healing' && (!item.healing || !Number.isInteger(item.healing.lifeRestored) || item.healing.lifeRestored < 1)) errors.push(`Heilgegenstand ${item.id} hat keine gültige Heilwirkung.`)
    if (item.healing) {
      for (const effectId of item.healing.clearsEffectIds ?? []) if (!statusIds.has(effectId)) errors.push(`Heilgegenstand ${item.id} entfernt den unbekannten Zustand ${effectId}.`)
      if (item.healing.combatEffect && !statusIds.has(item.healing.combatEffect.id)) errors.push(`Heilgegenstand ${item.id} verwendet den unbekannten Zustand ${item.healing.combatEffect.id}.`)
    }
  }

  for (const status of world.statusEffects ?? []) {
    if (status.maximumDuration !== undefined && (!Number.isSafeInteger(status.maximumDuration) || status.maximumDuration < 1)) errors.push(`Zustand ${status.id} hat eine ungültige Höchstdauer.`)
    if (!validDamageTypes(status.modifiers?.protectsFrom)) errors.push(`Zustand ${status.id} schützt vor unbekannten Schadensarten.`)
    if (!validDamageTypes(status.modifiers?.addWeakness)) errors.push(`Zustand ${status.id} ergänzt unbekannte Schwächen.`)
    if (status.modifiers?.damageMultiplier !== undefined && (!Number.isFinite(status.modifiers.damageMultiplier) || status.modifiers.damageMultiplier < 0 || status.modifiers.damageMultiplier > 1)) errors.push(`Zustand ${status.id} hat einen ungültigen Schadensfaktor.`)
    if (status.perTurn && (!Number.isSafeInteger(status.perTurn.damage) || status.perTurn.damage < 1 || !DAMAGE_TYPES.includes(status.perTurn.damageType))) errors.push(`Zustand ${status.id} hat ungültigen Rundenschaden.`)
    for (const itemId of status.clearedByItemIds ?? []) if (!world.items.find((item) => item.id === itemId)?.healing) errors.push(`Zustand ${status.id} nennt das unbekannte Gegenmittel ${itemId}.`)
  }
  for (const duplicate of duplicateIds((world.statusEffects ?? []).map((status) => status.id))) errors.push(`Doppelter Zustand: ${duplicate}.`)

  const connected = graphReachability(world)
  for (const area of world.areas) if (!connected.has(area.id)) errors.push(`Ort ${area.id} ist nicht mit dem Startgraphen verbunden.`)

  const simulated = simulateProgression(world)
  const freelyReachable = graphReachability(world, world.passages.filter((entry) => !entry.requirement && !entry.guardEncounterId))
  const completionReachable = requirementMet(world.completionRequirement, simulated.state)
  if (!completionReachable && !options.allowIncomplete) errors.push('Das Kampagnenziel ist mit den Inhaltsdaten nicht lösbar.')

  return {
    valid: errors.length === 0,
    errors,
    contentGaps,
    missingContentIds,
    reachableAreaIds: [...simulated.reachable],
    completionReachable,
    freelyReachableAreaIds: [...freelyReachable]
  }
}

export function assertWorldValid(world: WorldDefinition, options: WorldValidationOptions = {}): void {
  const report = validateWorld(world, options)
  if (!report.valid) throw new Error(`Ungültige Weltdaten:\n${report.errors.join('\n')}`)
}
