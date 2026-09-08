import { describe, expect, it } from 'vitest'
import { campaignWorld as world } from '../content/world/campaignWorld'
import { createNewGame } from '../domain/game'
import { createSaveExport, parseSaveImport } from '../storage/validation'
import { reduceGame } from './reducer'
import { getPuzzleState, isPuzzleSolved } from './puzzles'

describe('gespeicherte Rätsel', () => {
  it.each(world.puzzles!)('kann $id nicht mit blossem Untersuchen abschliessen', (puzzle) => {
    const fresh = createNewGame('Ria')
    const save = { ...fresh, currentAreaId: puzzle.areaId, visitedAreaIds: [...new Set([...fresh.visitedAreaIds, puzzle.areaId])] }
    const inspected = reduceGame(save, { type: 'INSPECT', areaId: puzzle.areaId }, world)
    expect(isPuzzleSolved(inspected, puzzle)).toBe(false)
    expect(reduceGame(inspected, { type: 'COMPLETE_INTERACTION', interactionId: puzzle.interactionId }, world)).toBe(inspected)
  })
  it('setzt nur die falsche Folge zurück und erhält Inventar, Leben und Teilfortschritt beim Laden', () => {
    const puzzle = world.puzzles![0]
    let save = { ...createNewGame('Ria'), currentAreaId: puzzle.areaId, visitedAreaIds: ['sonnenwacht', puzzle.areaId] }
    const before = save.player
    save = reduceGame(save, { type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId: 'sequence', value: 2 }, world)
    save = parseSaveImport(createSaveExport(save))
    expect(getPuzzleState(save, puzzle).values.sequence).toBe(1)
    save = reduceGame(save, { type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId: 'sequence', value: 1 }, world)
    expect(getPuzzleState(save, puzzle).values.sequence).toBe(0)
    expect(save.player).toEqual(before)
  })
  it('verhindert drei offene Tore, erlaubt Reset und verwirft ortsfremde oder ungültige Eingaben', () => {
    const puzzle = world.puzzles!.find((entry) => entry.id === 'schleuse')!
    const fresh = createNewGame('Ria')
    const save = { ...fresh, currentAreaId: puzzle.areaId, visitedAreaIds: ['sonnenwacht', puzzle.areaId] }
    const blocked = reduceGame(save, { type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId: 'tor1', value: 1 }, world)
    expect(getPuzzleState(blocked, puzzle).values).toMatchObject({ tor0: 1, tor1: 0, tor2: 1 })
    const closed = reduceGame(blocked, { type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId: 'tor2', value: 0 }, world)
    expect(getPuzzleState(closed, puzzle).values.tor2).toBe(0)
    const reset = reduceGame(closed, { type: 'PUZZLE_RESET', puzzleId: puzzle.id }, world)
    expect(getPuzzleState(reset, puzzle).values.tor2).toBe(1)
    expect(reduceGame(reset, { type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId: 'tor2', value: 99 }, world)).toBe(reset)
    expect(reduceGame(fresh, { type: 'PUZZLE_RESET', puzzleId: puzzle.id }, world)).toBe(fresh)
  })
})
