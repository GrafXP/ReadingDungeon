import { describe, expect, it } from 'vitest'
import { talora2World as world } from '../content/world/talora2World'
import type { PuzzleDefinition } from '../domain/content'
import { createNewGame, type GameSave } from '../domain/game'
import { createSaveExport, parseSaveImport } from '../storage/validation'
import { getAvailableActions, isPuzzleComplete, otherEnd, type GameAction } from './actions'
import { getCombatView } from './combat'
import { getEncounterEnemies } from './bestiary'
import { createPuzzleState, getPuzzleState, isPuzzleSolved, isPuzzleStateSolved } from './puzzles'
import { reduceGame } from './reducer'
import { evaluateRequirement, requirementItemIds } from './requirements'
import { getAreaDescription, getAreaInspectText } from './selectors'
import { validateWorld } from './worldValidator'

function solve(save: GameSave, puzzle: PuzzleDefinition): GameSave {
  const input = (controlId: string, value: string | number) => {
    const next = reduceGame(save, { type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId, value }, world)
    expect(next, `${puzzle.id}: ${controlId}=${value}`).not.toBe(save)
    save = next
  }
  if (puzzle.pairing) for (const [id, value] of Object.entries(puzzle.pairing.solution)) input(id, value)
  if (puzzle.ordering) {
    for (const [target, id] of puzzle.ordering.solution.entries()) {
      while (String(getPuzzleState(save, puzzle).values.order).split('|').indexOf(id) > target) input(id, 'up')
    }
  }
  if (puzzle.grid) for (const cell of puzzle.grid.solution.slice(1)) input('grid', cell)
  if (puzzle.reading) for (const prompt of puzzle.reading.prompts) input(prompt.id, prompt.solution)
  if (puzzle.weighing) for (const [id, side] of Object.entries(puzzle.weighing.solution)) if (side !== 'off') input(id, side)
  for (const control of puzzle.controls) if (control.initial !== control.solution) input(control.id, control.solution)
  if (puzzle.sequence) for (const value of puzzle.sequence.solution) input('sequence', value)
  return save
}

describe('Talora-II-Inhaltsprüfung', () => {
  it.each(world.puzzles!)('$title startet ungelöst, lässt sich bedienen, speichern und genau einmal abschliessen', (puzzle) => {
    const fresh = createNewGame('Mira', world)
    let save = { ...fresh, currentAreaId: puzzle.areaId, visitedAreaIds: [...new Set([...fresh.visitedAreaIds, puzzle.areaId])], flags: ['schattenzipfel_beruhigt', 'raugrim_faeden_getrennt'] }
    save = reduceGame(save, { type: 'INSPECT', areaId: puzzle.areaId }, world)
    const complete: GameAction = { type: 'COMPLETE_INTERACTION', interactionId: puzzle.interactionId! }
    expect(isPuzzleSolved(save, puzzle)).toBe(false)
    expect(reduceGame(save, complete, world)).toBe(save)
    save = solve(save, puzzle)
    expect(isPuzzleSolved(save, puzzle)).toBe(true)
    save = parseSaveImport(createSaveExport(save, world), world)
    expect(isPuzzleSolved(save, puzzle)).toBe(true)
    const reset = reduceGame(save, { type: 'PUZZLE_RESET', puzzleId: puzzle.id }, world)
    expect(isPuzzleSolved(reset, puzzle)).toBe(false)
    expect(reset.player).toEqual(save.player)
    save = reduceGame(save, complete, world)
    expect(isPuzzleComplete(save, puzzle, world)).toBe(true)
    expect(reduceGame(save, complete, world)).toBe(save)
  })

  it.each(world.puzzles!.filter((entry) => entry.weighing))('$title akzeptiert auch die vertauschten Seiten, aber keine leere Waage', (puzzle) => {
    const state = createPuzzleState(puzzle)
    expect(isPuzzleStateSolved(state, puzzle)).toBe(false)
    for (const [id, side] of Object.entries(puzzle.weighing!.solution)) state.values[id] = side === 'left' ? 'right' : side === 'right' ? 'left' : 'off'
    expect(isPuzzleStateSolved(state, puzzle)).toBe(true)
  })

  it('verhindert versehentlich gelöste Regler in zukünftigen Inhalten', () => {
    const broken = structuredClone(world.puzzles!.find((entry) => entry.kind === 'controls')!)
    broken.controls.forEach((control) => { control.initial = control.solution })
    expect(validateWorld({ ...world, puzzles: [broken] }).errors).toContain(`Rätsel ${broken.id} ist bereits in der Startstellung gelöst.`)
  })

  it.each([['int_lm_laternenstab', 'int_lm_schattenumhang'], ['int_lm_schattenumhang', 'int_lm_laternenstab']])('verbraucht die zwei Moorfasern für beide Baupläne in Reihenfolge %s, %s', (first, second) => {
    let save = createNewGame('Mira', world)
    save = { ...save, currentAreaId: 'lm_laternenhaus', player: { ...save.player, inventory: { ...save.player.inventory, item_mat_moorfaser: 2, item_mat_laternenstein: 1, item_mat_dunkelglas: 1, item_mat_schwemmholz: 1 } } }
    save = reduceGame(save, { type: 'COMPLETE_INTERACTION', interactionId: first }, world)
    expect(save.player.inventory.item_mat_moorfaser).toBe(1)
    save = reduceGame(save, { type: 'COMPLETE_INTERACTION', interactionId: second }, world)
    expect(save.player.inventory.item_mat_moorfaser ?? 0).toBe(0)
    expect(save.player.inventory.item_weapon_laternenstab).toBe(1)
    expect(save.player.inventory.item_armor_schattenumhang).toBe(1)
  })

  it('hat für jeden Ort einen eigenen Untersuchungstext und aktualisiert reparierte Orte', () => {
    for (const area of world.areas) {
      expect(area.inspectText, area.id).toBeTruthy()
      expect(area.inspectText, area.id).not.toBe(area.firstDescription)
    }
    const area = world.areas.find((entry) => entry.id === 'ww_wurzelbruecke')!
    const save = { ...createNewGame('Mira', world), flags: ['wurzelbruecke_repariert'] }
    expect(getAreaDescription(save, area)).toContain('sicher')
    expect(getAreaInspectText(save, area)).not.toContain('morsch')
  })

  it('macht alle Gegenstände erhältlich und erklärt jede Wegsperre ohne interne Kennungen', () => {
    const obtainable = new Set(Object.keys(world.start.inventory))
    for (const effect of [...world.interactions.flatMap((entry) => entry.effects), ...world.encounters.flatMap((entry) => entry.rewardEffects)]) if (effect.kind === 'addItem') obtainable.add(effect.itemId)
    expect(world.items.filter((item) => !obtainable.has(item.id)).map((item) => item.id)).toEqual([])
    for (const passage of world.passages.filter((entry) => entry.requirement || entry.guardEncounterId)) {
      expect(passage.blockedText, passage.id).toBeTruthy()
      expect(passage.blockedText, passage.id).not.toMatch(/später in der Geschichte|item_|area_untersucht|int_|enc_/)
    }
  })

  it('bereist alle 78 Orte und beendet die Kampagne mit echten Aktionen und gesammelten Vorräten', () => {
    let save = createNewGame('Mira', world)
    const act = (action: GameAction) => { save = reduceGame(save, action, world) }
    const routes = () => {
      const found = new Map<string, GameAction[]>([[save.currentAreaId, []]])
      for (const [areaId, route] of found) {
        for (const passage of world.passages) {
          const toAreaId = otherEnd(passage, areaId)
          if (!toAreaId || found.has(toAreaId) || !evaluateRequirement(passage.requirement, save).met || (passage.guardEncounterId && !save.defeatedEncounterIds.includes(passage.guardEncounterId))) continue
          found.set(toAreaId, [...route, { type: 'MOVE', passageId: passage.id, toAreaId }])
        }
      }
      return found
    }
    const go = (areaId: string) => {
      const path = routes().get(areaId)
      expect(path, `Weg nach ${areaId}`).toBeDefined()
      path!.forEach(act)
      expect(save.currentAreaId).toBe(areaId)
      act({ type: 'INSPECT', areaId })
    }
    const equip = (itemId: string) => {
      const item = world.items.find((entry) => entry.id === itemId)!
      if (!(save.player.inventory[itemId] > 0)) return
      act({ type: item.weapon ? 'EQUIP_WEAPON' : item.armor?.slot === 'body' ? 'EQUIP_ARMOR' : 'EQUIP_TALISMAN', itemId })
    }
    for (let pass = 0; pass < 100; pass += 1) {
      equip('item_armor_waermewams')
      const before = JSON.stringify([save.flags, save.player.inventory, save.defeatedEncounterIds, save.visitedAreaIds])
      for (const areaId of routes().keys()) {
        go(areaId)
        for (const puzzle of world.puzzles!.filter((entry) => entry.areaId === areaId && !isPuzzleComplete(save, entry, world) && !isPuzzleSolved(save, entry))) save = solve(save, puzzle)
        for (const action of getAvailableActions(save, world).filter((entry) => entry.kind === 'interaction' && !entry.disabled)) {
          const interaction = world.interactions.find((entry) => 'interactionId' in action.gameAction && entry.id === action.gameAction.interactionId)
          if (interaction?.restockAfterRest && interaction.effects.filter((effect) => effect.kind === 'addItem').every((effect) => effect.kind === 'addItem' && (save.player.inventory[effect.itemId] ?? 0) >= 4)) continue
          act(action.gameAction)
        }
      }
      for (const encounter of world.encounters) {
        equip('item_armor_waermewams')
        if (save.defeatedEncounterIds.includes(encounter.id) || !routes().has(encounter.areaId)) continue
        const required = requirementItemIds(encounter.requiredGear)
        if (required.some((id) => !(save.player.inventory[id] > 0))) continue
        const sanctuary = world.areas.find((area) => area.safe && routes().has(area.id))!
        go(sanctuary.id)
        act({ type: 'REST' })
        const enemy = world.enemies.find((entry) => entry.id === encounter.enemyIds[0])!
        for (const item of world.items.filter((item) => item.weapon?.elemental && 'choices' in item.weapon.elemental && save.player.inventory[item.id] > 0)) {
          const elemental = item.weapon!.elemental!
          if ('choices' in elemental) act({ type: 'SET_WEAPON_MODE', itemId: item.id, damageType: elemental.choices.find((type) => enemy.weakTo?.includes(type)) ?? elemental.choices[0] })
        }
        // Travel before changing required clothes, so a cold passage remains traversable.
        go(encounter.areaId)
        equip('item_weapon_alvas_klinge')
        equip('item_armor_rindenpanzer')
        if (encounter.areaId.startsWith('fi_')) equip('item_armor_feuermantel')
        if (encounter.areaId.startsWith('fs_')) equip('item_armor_waermewams')
        if (/^(lm|rn)_/.test(encounter.areaId)) equip('item_armor_schattenumhang')
        equip('item_talisman_waechterzeichen')
        if (encounter.areaId.startsWith('dh_')) equip('item_talisman_erdungsring')
        required.forEach(equip)
        act({ type: 'START_COMBAT', encounterId: encounter.id })
        expect(save.activeCombat, encounter.id).not.toBeNull()
        act({ type: 'STUDY_ENEMY', enemyId: enemy.id })
        for (let turn = 0; save.activeCombat && save.player.life > 0 && turn < 100; turn += 1) {
          const view = getCombatView(save, world)!
          const skill = world.items.find((item) => item.id === save.player.equippedWeaponId)?.weapon?.skill
          const ready = skill && save.activeCombat.skillCooldown === 0
          if (view.move.kind === 'heavy') act({ type: 'DEFEND' })
          else if (view.move.kind === 'charge' && skill?.effect.kind === 'interrupt') act({ type: ready ? 'USE_SKILL' : 'DEFEND' })
          else if (save.player.life <= 8 && save.player.inventory.item_consume_apfelbrot > 0) act({ type: 'USE_ITEM', itemId: 'item_consume_apfelbrot' })
          else if (view.combatant.stance === 'guarded') act({ type: 'DEFEND' })
          else if (view.enemy.airborne && view.combatant.stance !== 'vulnerable' && !view.combatant.effects.some((effect) => effect.id === 'verwurzelt')) act({ type: ready && skill?.effect.kind === 'inflict' && skill.effect.effectId === 'verwurzelt' ? 'USE_SKILL' : 'DEFEND' })
          else act({ type: ready && skill?.effect.kind !== 'interrupt' ? 'USE_SKILL' : 'ATTACK' })
        }
        expect(save.defeatedEncounterIds, `${encounter.id}: Leben ${save.player.life}`).toContain(encounter.id)
      }
      if (evaluateRequirement(world.completionRequirement, save).met && save.visitedAreaIds.length === world.areas.length) break
      expect(JSON.stringify([save.flags, save.player.inventory, save.defeatedEncounterIds, save.visitedAreaIds]), `Kein Fortschritt in Durchlauf ${pass}; fehlende Orte: ${world.areas.filter((area) => !save.visitedAreaIds.includes(area.id)).map((area) => area.id)}; fehlende Kämpfe: ${world.encounters.filter((entry) => !save.defeatedEncounterIds.includes(entry.id)).map((entry) => entry.id)}`).not.toBe(before)
    }
    expect(evaluateRequirement(world.completionRequirement, save).met).toBe(true)
    expect(save.visitedAreaIds).toHaveLength(78)
    expect(save.defeatedEncounterIds).toHaveLength(48)
    expect(world.puzzles!.every((puzzle) => isPuzzleComplete(save, puzzle, world))).toBe(true)
    expect(save.studiedEnemyIds.toSorted()).toEqual(getEncounterEnemies(world).map((enemy) => enemy.id).toSorted())
    expect(parseSaveImport(createSaveExport(save, world), world).flags).toContain('talora2_abgeschlossen')
  }, 30_000)
})
