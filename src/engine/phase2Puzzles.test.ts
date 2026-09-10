import { describe, expect, it } from 'vitest'
import type { PuzzleDefinition } from '../domain/content'
import { createPuzzleState, isPuzzleStateSolved, updatePuzzleState } from './puzzles'

const base = { areaId: 'ort', interactionId: 'aktion', title: 'Test', hint: 'Lies.', controls: [] as PuzzleDefinition['controls'] }

const puzzles: PuzzleDefinition[] = [
  { ...base, id: 'pairs', kind: 'pairing', pairing: { left: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }], right: [{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }], solution: { a: 'y', b: 'x' } } },
  { ...base, id: 'order', kind: 'ordering', ordering: { items: [{ id: 'b', label: 'B' }, { id: 'a', label: 'A' }], solution: ['a', 'b'] } },
  { ...base, id: 'grid', kind: 'grid', grid: { width: 3, height: 2, start: 0, goal: 5, blocked: [4], solution: [0, 1, 2, 5] } },
  { ...base, id: 'read', kind: 'reading', reading: { sourceTitle: 'Bericht', sourceText: 'Erst prüfen, dann senden.', prompts: [{ id: 'first', label: 'Erst', options: ['senden', 'prüfen'], solution: 1 }] } },
  { ...base, id: 'weigh', kind: 'weighing', weighing: { leftLabel: 'Links', rightLabel: 'Rechts', items: [{ id: 'gross', label: 'Gross', weight: 2 }, { id: 'klein1', label: 'Klein 1', weight: 1 }, { id: 'klein2', label: 'Klein 2', weight: 1 }], solution: { gross: 'left', klein1: 'right', klein2: 'right' } } }
]

function apply(puzzle: PuzzleDefinition, inputs: Array<[string, string | number | boolean]>) {
  let state = createPuzzleState(puzzle)
  for (const [controlId, value] of inputs) state = updatePuzzleState(state, puzzle, controlId, value)!.state
  return state
}

describe('fünf generische Leserätselarten', () => {
  it.each([
    ['pairing', puzzles[0], [['a', 'y'], ['b', 'x']]],
    ['ordering', puzzles[1], [['a', 'up']]],
    ['grid', puzzles[2], [['grid', 1], ['grid', 2], ['grid', 5]]],
    ['reading', puzzles[3], [['first', 1]]],
    ['weighing', puzzles[4], [['gross', 'left'], ['klein1', 'right'], ['klein2', 'right']]]
  ] as Array<[string, PuzzleDefinition, Array<[string, string | number | boolean]>]>)('löst %s nur mit der vollständigen Eingabe', (_kind, puzzle, inputs) => {
    expect(isPuzzleStateSolved(createPuzzleState(puzzle), puzzle)).toBe(false)
    expect(isPuzzleStateSolved(apply(puzzle, inputs), puzzle)).toBe(true)
  })

  it('verhindert Sprünge, Sperrfelder und doppelte Paarziele', () => {
    const grid = puzzles[2]
    expect(updatePuzzleState(createPuzzleState(grid), grid, 'grid', 5)).toBeNull()
    expect(updatePuzzleState(createPuzzleState(grid), grid, 'grid', 4)).toBeNull()
    const paired = apply(puzzles[0], [['a', 'x'], ['b', 'x']])
    expect(paired.values).toEqual({ a: '', b: 'x' })
  })
})
