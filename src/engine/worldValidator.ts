import type { InteractionEffect, Requirement, WorldDefinition } from '../domain/content'
import { requirementItemIds } from './requirements'

export interface ValidationReport {
  valid: boolean
  errors: string[]
  reachableAreaIds: string[]
  sliceGoalReachable: boolean
  freelyReachableAreaIds: string[]
}

function duplicateIds(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}

function requirementMet(requirement: Requirement | undefined, items: Set<string>, flags: Set<string>): boolean {
  if (!requirement) return true
  if (requirement.kind === 'item') return items.has(requirement.itemId)
  if (requirement.kind === 'flag') return flags.has(requirement.flag)
  if (requirement.kind === 'clue') return flags.has(`clue:${requirement.clueId}`)
  if (requirement.kind === 'all') return requirement.requirements.every((entry) => requirementMet(entry, items, flags))
  return requirement.requirements.some((entry) => requirementMet(entry, items, flags))
}

function validateRequirement(requirement: Requirement | undefined, itemIds: Set<string>, owner: string, errors: string[]) {
  if (!requirement) return
  if (requirement.kind === 'item' && !itemIds.has(requirement.itemId)) {
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
    if ((effect.kind === 'addItem' || effect.kind === 'removeItem') && !itemIds.has(effect.itemId)) {
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

function graphReachability(world: WorldDefinition): Set<string> {
  const reachable = new Set([world.startAreaId])
  let changed = true
  while (changed) {
    changed = false
    for (const passage of world.passages) {
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

function freeGraphReachability(world: WorldDefinition): Set<string> {
  const reachable = new Set([world.startAreaId])
  let changed = true
  while (changed) {
    changed = false
    for (const passage of world.passages.filter((entry) => !entry.requirement)) {
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
  const reachable = new Set([world.startAreaId])
  const items = new Set(['reiseschwert', 'laterne', 'apfelbrot'])
  const flags = new Set<string>()
  const completedInteractions = new Set<string>()
  const defeatedEncounters = new Set<string>()
  let changed = true

  while (changed) {
    changed = false
    for (const areaId of [...reachable]) flags.add(`area_untersucht:${areaId}`)

    for (const interaction of world.interactions) {
      if (completedInteractions.has(interaction.id) || !reachable.has(interaction.areaId)) continue
      if (!requirementMet(interaction.requirement, items, flags)) continue
      if (!requirementMet(interaction.visibilityRequirement, items, flags)) continue
      completedInteractions.add(interaction.id)
      for (const effect of interaction.effects) {
        if (effect.kind === 'discoverClue' && !flags.has(`clue:${effect.clueId}`)) {
          flags.add(`clue:${effect.clueId}`)
          changed = true
        }
        if (effect.kind === 'addItem' && !items.has(effect.itemId)) {
          items.add(effect.itemId)
          changed = true
        }
        if (effect.kind === 'removeItem' && items.delete(effect.itemId)) changed = true
        if (effect.kind === 'setFlag' && !flags.has(effect.flag)) {
          flags.add(effect.flag)
          changed = true
        }
      }
    }


    for (const encounter of world.encounters) {
      if (defeatedEncounters.has(encounter.id) || !reachable.has(encounter.areaId)) continue
      const enemy = world.enemies.find((entry) => entry.id === encounter.enemyId)
      if (!enemy || (enemy.kind === 'boss' && !items.has('morgenklinge'))) continue
      defeatedEncounters.add(encounter.id)
      for (const effect of encounter.rewardEffects) {
        if (effect.kind === 'addItem' && !items.has(effect.itemId)) {
          items.add(effect.itemId)
          changed = true
        }
        if (effect.kind === 'removeItem' && items.delete(effect.itemId)) changed = true
        if (effect.kind === 'setFlag' && !flags.has(effect.flag)) {
          flags.add(effect.flag)
          changed = true
        }
      }
    }

    for (const passage of world.passages) {
      if (!requirementMet(passage.requirement, items, flags)) continue
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
  return { reachable, flags }
}

export function validateWorld(world: WorldDefinition): ValidationReport {
  const errors: string[] = []
  const areaIds = new Set(world.areas.map((entry) => entry.id))
  const itemIds = new Set(world.items.map((entry) => entry.id))
  const passageIds = new Set(world.passages.map((entry) => entry.id))
  const enemyIds = new Set(world.enemies.map((entry) => entry.id))

  for (const [kind, ids] of [
    ['Orts', world.areas.map((entry) => entry.id)],
    ['Passagen', world.passages.map((entry) => entry.id)],
    ['Gegenstands', world.items.map((entry) => entry.id)],
    ['Interaktions', world.interactions.map((entry) => entry.id)],
    ['Gegner', world.enemies.map((entry) => entry.id)],
    ['Begegnungs', world.encounters.map((entry) => entry.id)]
  ] as const) {
    for (const duplicate of duplicateIds(ids)) errors.push(`Doppelte ${kind}-ID: ${duplicate}.`)
  }

  if (!areaIds.has(world.startAreaId)) errors.push(`Startort ${world.startAreaId} fehlt.`)
  for (const duplicate of duplicateIds((world.puzzles ?? []).map((entry) => entry.id))) errors.push(`Doppelte Rätsel-ID: ${duplicate}.`)
  for (const puzzle of world.puzzles ?? []) {
    if (!world.interactions.some((entry) => entry.id === puzzle.interactionId && entry.areaId === puzzle.areaId)) errors.push(`Rätsel ${puzzle.id} hat keine passende Abschlussinteraktion.`)
    if (!puzzle.controls.length && !puzzle.sequence?.solution.length) errors.push(`Rätsel ${puzzle.id} hat keine Bedienelemente.`)
    if (duplicateIds(puzzle.controls.map((control) => control.id)).length || puzzle.controls.some((control) => control.id === 'sequence')) errors.push(`Rätsel ${puzzle.id} hat doppelte oder reservierte Bedienelemente.`)
    for (const control of puzzle.controls) {
      if ([control.initial, control.solution].some((value) => !Number.isSafeInteger(value) || value < 0 || value >= control.options.length)) errors.push(`Rätsel ${puzzle.id} hat ungültige Stellungen.`)
    }
    if (puzzle.sequence && (!puzzle.sequence.solution.length || puzzle.sequence.solution.some((value) => !Number.isSafeInteger(value) || value < 0 || value >= puzzle.sequence!.options.length))) errors.push(`Rätsel ${puzzle.id} hat eine ungültige Folge.`)
    if (puzzle.maxOpenControls && [true, false].some((solution) => puzzle.controls.filter((control) => (solution ? control.solution : control.initial) === 1).length > puzzle.maxOpenControls!)) errors.push(`Rätsel ${puzzle.id} überschreitet seine Torgrenze.`)
  }
  for (const area of world.areas) {
    validateRequirement(area.sanctuaryRequirement, itemIds, `Rastplatz ${area.id}`, errors)
    for (const variant of area.variants ?? []) validateRequirement(variant.requirement, itemIds, `Ortstext ${area.id}`, errors)
    if (area.sanctuaryRequirement && !area.safe) errors.push(`Ort ${area.id} hat eine Rastplatz-Anforderung, ist aber nicht als sicher markiert.`)
  }
  for (const duplicate of duplicateIds((world.storyBeats ?? []).map((beat) => beat.id))) errors.push(`Doppelte Erzähl-ID: ${duplicate}.`)
  for (const beat of world.storyBeats ?? []) validateRequirement(beat.requirement, itemIds, `Erzählung ${beat.id}`, errors)
  for (const passage of world.passages) {
    if (!areaIds.has(passage.fromAreaId)) errors.push(`${passage.id} beginnt an einem unbekannten Ort: ${passage.fromAreaId}.`)
    if (!areaIds.has(passage.toAreaId)) errors.push(`${passage.id} endet an einem unbekannten Ort: ${passage.toAreaId}.`)
    if (passage.fromAreaId === passage.toAreaId) errors.push(`${passage.id} verbindet einen Ort mit sich selbst.`)
    validateRequirement(passage.requirement, itemIds, `Passage ${passage.id}`, errors)
  }

  const chestIds = world.interactions.flatMap((entry) => entry.chestId ? [entry.chestId] : [])
  for (const duplicate of duplicateIds(chestIds)) errors.push(`Doppelte Truhen-ID: ${duplicate}.`)

  for (const interaction of world.interactions) {
    if (!areaIds.has(interaction.areaId)) errors.push(`${interaction.id} liegt an einem unbekannten Ort: ${interaction.areaId}.`)
    if (interaction.actionType === 'OPEN_CHEST' && !interaction.chestId) errors.push(`${interaction.id} ist eine Truhe ohne Truhen-ID.`)
    validateRequirement(interaction.requirement, itemIds, `Interaktion ${interaction.id}`, errors)
    validateRequirement(interaction.visibilityRequirement, itemIds, `Sichtbarkeit ${interaction.id}`, errors)
    const requiredItems = new Set(requirementItemIds(interaction.requirement))
    validateEffects(interaction.effects, `Interaktion ${interaction.id}`, itemIds, passageIds, errors)
    for (const effect of interaction.effects) {
      if (effect.kind === 'addItem' && requiredItems.has(effect.itemId)) errors.push(`${interaction.id} sperrt ${effect.itemId} hinter demselben Gegenstand ein.`)
    }
  }

  for (const enemy of world.enemies) {
    if (!Number.isInteger(enemy.maxLife) || enemy.maxLife < 1) errors.push(`Gegner ${enemy.id} hat ungültige Lebenspunkte.`)
    if (!Number.isInteger(enemy.defense) || enemy.defense < 0) errors.push(`Gegner ${enemy.id} hat ungültige Verteidigung.`)
    if (enemy.kind === 'boss' && enemy.phaseTwoAtLife !== undefined &&
      (!Number.isInteger(enemy.phaseTwoAtLife) || enemy.phaseTwoAtLife < 1 || enemy.phaseTwoAtLife >= enemy.maxLife)) {
      errors.push(`Boss ${enemy.id} hat eine ungültige Phasengrenze.`)
    }
    if (enemy.phaseThresholds) {
      const phases = Object.keys(enemy.movesByPhase).map(Number).sort((a, b) => a - b)
      for (const [phaseText, threshold] of Object.entries(enemy.phaseThresholds)) {
        const phase = Number(phaseText)
        if (!Number.isInteger(phase) || phase < 2 || !Number.isInteger(threshold) || threshold < 1 || threshold >= enemy.maxLife || !phases.includes(phase)) {
          errors.push(`Boss ${enemy.id} hat eine ungültige Grenze für Phase ${phaseText}.`)
        }
      }
    }
    if (enemy.phaseSealItemIds) {
      for (const [phase, sealItemId] of Object.entries(enemy.phaseSealItemIds)) {
        if (!itemIds.has(sealItemId)) errors.push(`Boss ${enemy.id} verlangt in Phase ${phase} das unbekannte Siegel ${sealItemId}.`)
      }
    }
    const phases = Object.entries(enemy.movesByPhase)
    if (phases.length === 0 || phases.some(([, moves]) => moves.length === 0)) errors.push(`Gegner ${enemy.id} hat eine leere Kampfphase.`)
    for (const [phase, moves] of phases) {
      for (const duplicate of duplicateIds(moves.map((move) => move.id))) {
        errors.push(`Gegner ${enemy.id} hat in Phase ${phase} die doppelte Bewegung ${duplicate}.`)
      }
      for (const move of moves) {
        if (!Number.isInteger(move.damage) || move.damage < 0) errors.push(`Bewegung ${enemy.id}/${move.id} hat ungültigen Schaden.`)
      }
    }
  }

  for (const encounter of world.encounters) {
    if (!areaIds.has(encounter.areaId)) errors.push(`${encounter.id} liegt an einem unbekannten Ort: ${encounter.areaId}.`)
    if (!areaIds.has(encounter.fleeAreaId)) errors.push(`${encounter.id} flieht an einen unbekannten Ort: ${encounter.fleeAreaId}.`)
    if (!enemyIds.has(encounter.enemyId)) errors.push(`${encounter.id} verwendet den unbekannten Gegner ${encounter.enemyId}.`)
    validateEffects(encounter.rewardEffects, `Begegnung ${encounter.id}`, itemIds, passageIds, errors)
  }

  for (const item of world.items) {
    if (item.kind === 'weapon') {
      if (!item.weapon) {
        errors.push(`Waffe ${item.id} hat keine Schadenswerte.`)
      } else if (!Number.isInteger(item.weapon.minDamage) || !Number.isInteger(item.weapon.maxDamage) || item.weapon.minDamage < 1 || item.weapon.maxDamage < item.weapon.minDamage) {
        errors.push(`Waffe ${item.id} hat einen ungültigen Schadensbereich.`)
      }
    }
    if (item.kind === 'healing') {
      if (!item.healing || !Number.isInteger(item.healing.lifeRestored) || item.healing.lifeRestored < 1) {
        errors.push(`Heilgegenstand ${item.id} hat keine gültige Heilwirkung.`)
      }
    }
  }

  const connected = graphReachability(world)
  for (const area of world.areas) {
    if (!connected.has(area.id)) errors.push(`Ort ${area.id} ist nicht mit dem Startgraphen verbunden.`)
  }

  const simulated = simulateProgression(world)
  const freelyReachable = freeGraphReachability(world)
  const sliceGoalReachable = simulated.flags.has(world.sliceGoalFlag)
  if (!sliceGoalReachable) errors.push(`Das Ziel ${world.sliceGoalFlag} ist mit den Inhaltsdaten nicht lösbar.`)

  return {
    valid: errors.length === 0,
    errors,
    reachableAreaIds: [...simulated.reachable],
    sliceGoalReachable,
    freelyReachableAreaIds: [...freelyReachable]
  }
}

export function assertWorldValid(world: WorldDefinition): void {
  const report = validateWorld(world)
  if (!report.valid) throw new Error(`Ungültige Weltdaten:\n${report.errors.join('\n')}`)
}
