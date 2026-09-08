import type { PuzzleDefinition } from '../domain/content'
import type { GameSave, PuzzleState } from '../domain/game'

export function getPuzzleState(save: GameSave, puzzle: PuzzleDefinition): PuzzleState {
  return save.puzzleStates[puzzle.id] ?? {
    kind: 'controls', values: { ...Object.fromEntries(puzzle.controls.map((control) => [control.id, control.initial])), sequence: 0 }
  }
}

export function isPuzzleSolved(save: GameSave, puzzle: PuzzleDefinition): boolean {
  const state = getPuzzleState(save, puzzle)
  return puzzle.controls.every((control) => state.values[control.id] === control.solution) &&
    (!puzzle.sequence || state.values.sequence === puzzle.sequence.solution.length)
}
