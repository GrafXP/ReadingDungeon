import type { PuzzleDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'
import type { GameAction } from '../engine/actions'
import { getPuzzleState, isPuzzleSolved } from '../engine/puzzles'

export function PuzzlePanel({ game, puzzle, onAction }: { game: GameSave; puzzle: PuzzleDefinition; onAction: (action: GameAction) => void }) {
  const state = getPuzzleState(game, puzzle)
  const solved = isPuzzleSolved(game, puzzle)
  return <section className="puzzle-panel" aria-labelledby={`puzzle-${puzzle.id}`}>
    <h2 id={`puzzle-${puzzle.id}`}>{puzzle.title}</h2>
    <details><summary>Hinweis ansehen</summary><p>{puzzle.hint}</p></details>
    <div className="puzzle-controls">
      {puzzle.controls.map((control) => {
        const controlId = `puzzle-${puzzle.id}-${control.id}`
        return <div className="puzzle-control" key={control.id}>
          <label htmlFor={controlId}>{control.label}</label>
          <select id={controlId} value={Number(state.values[control.id])} onChange={(event) => onAction({ type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId: control.id, value: Number(event.target.value) })}>
            {control.options.map((option, index) => <option value={index} key={option}>{option}</option>)}
          </select>
        </div>
      })}
    </div>
    {puzzle.sequence && <>
      <p>Folge: {Number(state.values.sequence)} von {puzzle.sequence.solution.length} Zeichen</p>
      <div className="puzzle-controls">{puzzle.sequence.options.map((option, index) => <button key={option} disabled={state.values.sequence === puzzle.sequence!.solution.length} onClick={() => onAction({ type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId: 'sequence', value: index })}>{option}</button>)}</div>
    </>}
    {puzzle.id === 'schleuse' && <p>Wasserweg: {state.values.tor0 !== 1 ? 'Kein Zulauf.' : state.values.tor2 === 1 ? 'Das Wasser fliesst in den Ablauf.' : state.values.tor1 === 1 ? 'Das Wasser fliesst zur Quelle.' : 'Das Wasser staut sich vor dem Quelltor.'}</p>}
    <p>{solved ? 'Richtige Stellung – schliesse das Rätsel mit der Aktion darunter ab.' : 'Probiere in Ruhe. Falsche Versuche kosten nichts.'}</p>
    <button onClick={() => onAction({ type: 'PUZZLE_RESET', puzzleId: puzzle.id })}>Rätsel zurücksetzen</button>
  </section>
}
