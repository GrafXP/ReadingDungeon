import type { PuzzleDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'
import type { GameAction } from '../engine/actions'
import { getPuzzleKind, getPuzzleState, isPuzzleSolved } from '../engine/puzzles'

interface PuzzlePanelProps {
  game: GameSave
  puzzle: PuzzleDefinition
  onAction(action: GameAction): void
}

export function PuzzlePanel({ game, puzzle, onAction }: PuzzlePanelProps) {
  const state = getPuzzleState(game, puzzle)
  const solved = isPuzzleSolved(game, puzzle)
  const kind = getPuzzleKind(puzzle)
  const send = (controlId: string, value: string | number | boolean) => onAction({ type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId, value })
  const order = typeof state.values.order === 'string' ? state.values.order.split('|') : []
  const path = typeof state.values.path === 'string' ? state.values.path.split(',').map(Number) : []
  const hints = puzzle.hints ?? []
  const instructions = {
    controls: 'Wähle für jeden Regler die passende Stellung.',
    sequence: 'Drücke die Zeichen in der gesuchten Reihenfolge. Bei einem falschen Zeichen beginnt die Folge von vorn.',
    pairing: 'Wähle zu jedem Eintrag ein passendes Gegenstück. Jedes Gegenstück gehört zu genau einem Paar.',
    ordering: 'Bringe die Einträge mit den Pfeilen in die gesuchte Reihenfolge. Lies von oben nach unten.',
    grid: 'S ist der Start, Z das Ziel. Wähle jeweils das nächste freie Nachbarfeld, waagrecht oder senkrecht. × ist gesperrt. Tippe den letzten Wegschritt an, um einen Schritt zurückzugehen.',
    reading: 'Lies den Text und wähle für jede Frage eine Antwort.',
    weighing: 'Verteile die Gegenstände auf beide Seiten. Die Zahl am Gegenstand gibt sein Gewicht an. Auf der Ablage zählt er für keine Seite.'
  }

  return <section className={`puzzle-panel puzzle-panel--${kind}`} aria-labelledby={`puzzle-${puzzle.id}`}>
    <h2 id={`puzzle-${puzzle.id}`}>{puzzle.title}</h2>
    <p>{puzzle.hint}</p>
    <p>{instructions[kind]}</p>
    <div className="puzzle-hints">
      {hints.map((hint, index) => <details key={hint}><summary>Hinweis {hints.length > 1 ? index + 1 : ''} ansehen</summary><p>{hint}</p></details>)}
    </div>

    {(kind === 'controls' || kind === 'sequence') && <>
      <div className="puzzle-controls">
        {puzzle.controls.map((control) => {
          const controlId = `puzzle-${puzzle.id}-${control.id}`
          return <div className="puzzle-control" key={control.id}>
            <label htmlFor={controlId}>{control.label}</label>
            <select id={controlId} value={Number(state.values[control.id])} onChange={(event) => send(control.id, Number(event.target.value))}>
              {control.options.map((option, index) => <option value={index} key={option}>{option}</option>)}
            </select>
          </div>
        })}
      </div>
      {puzzle.sequence && <>
        <p>Folge: {Number(state.values.sequence)} von {puzzle.sequence.solution.length} Zeichen</p>
        <div className="puzzle-controls">{puzzle.sequence.options.map((option, index) => <button key={option} disabled={state.values.sequence === puzzle.sequence!.solution.length} onClick={() => send('sequence', index)}>{option}</button>)}</div>
      </>}
    </>}

    {kind === 'pairing' && puzzle.pairing && <div className="puzzle-controls puzzle-pairs">
      {puzzle.pairing.left.map((left) => <div className="puzzle-control" key={left.id}>
        <label htmlFor={`puzzle-${puzzle.id}-${left.id}`}>{left.label}</label>
        <select id={`puzzle-${puzzle.id}-${left.id}`} value={String(state.values[left.id])} onChange={(event) => send(left.id, event.target.value)}>
          <option value="">Noch nicht zugeordnet</option>
          {puzzle.pairing!.right.map((right) => <option value={right.id} key={right.id}>{right.label}</option>)}
        </select>
      </div>)}
    </div>}

    {kind === 'ordering' && puzzle.ordering && <ol className="puzzle-ordering">
      {order.map((itemId, index) => {
        const item = puzzle.ordering!.items.find((entry) => entry.id === itemId)
        return <li key={itemId}>
          <span>{item?.label ?? itemId}</span>
          <span className="puzzle-order-buttons">
            <button aria-label={`${item?.label ?? itemId} nach oben`} disabled={index === 0} onClick={() => send(itemId, 'up')}>↑</button>
            <button aria-label={`${item?.label ?? itemId} nach unten`} disabled={index === order.length - 1} onClick={() => send(itemId, 'down')}>↓</button>
          </span>
        </li>
      })}
    </ol>}

    {kind === 'grid' && puzzle.grid && <div
      className="puzzle-grid"
      style={{ gridTemplateColumns: `repeat(${puzzle.grid.width}, minmax(2.75rem, 1fr))` }}
      aria-label="Wegfeld"
    >
      {Array.from({ length: puzzle.grid.width * puzzle.grid.height }, (_, cell) => {
        const blocked = puzzle.grid!.blocked?.includes(cell) ?? false
        const step = path.indexOf(cell)
        const label = cell === puzzle.grid!.start ? 'Start' : cell === puzzle.grid!.goal ? 'Ziel' : blocked ? 'Gesperrt' : `Feld ${cell + 1}`
        return <button
          key={cell}
          aria-label={`${label}${step >= 0 ? `, Wegschritt ${step + 1}` : ''}`}
          aria-pressed={step >= 0}
          disabled={blocked || cell === puzzle.grid!.start}
          onClick={() => send('grid', cell)}
        >{blocked ? '×' : cell === puzzle.grid!.start ? 'S' : cell === puzzle.grid!.goal ? 'Z' : step >= 0 ? step + 1 : '·'}</button>
      })}
    </div>}

    {kind === 'reading' && puzzle.reading && <>
      <article className="puzzle-source" aria-labelledby={`source-${puzzle.id}`}>
        <h3 id={`source-${puzzle.id}`}>{puzzle.reading.sourceTitle}</h3>
        <p>{puzzle.reading.sourceText}</p>
      </article>
      <div className="puzzle-controls">
        {puzzle.reading.prompts.map((prompt) => <div className="puzzle-control" key={prompt.id}>
          <label htmlFor={`puzzle-${puzzle.id}-${prompt.id}`}>{prompt.label}</label>
          <select id={`puzzle-${puzzle.id}-${prompt.id}`} value={String(state.values[prompt.id])} onChange={(event) => send(prompt.id, event.target.value === '' ? '' : Number(event.target.value))}>
            <option value="">Wort wählen</option>
            {prompt.options.map((option, index) => <option key={option} value={index}>{option}</option>)}
          </select>
        </div>)}
      </div>
    </>}

    {kind === 'weighing' && puzzle.weighing && <>
      <div className="puzzle-controls">
        {puzzle.weighing.items.map((item) => <div className="puzzle-control" key={item.id}>
          <label htmlFor={`puzzle-${puzzle.id}-${item.id}`}>{item.label}</label>
          <span>Gewicht: {item.weight}</span>
          <select id={`puzzle-${puzzle.id}-${item.id}`} value={String(state.values[item.id])} onChange={(event) => send(item.id, event.target.value)}>
            <option value="off">Ablage</option>
            <option value="left">{puzzle.weighing!.leftLabel}</option>
            <option value="right">{puzzle.weighing!.rightLabel}</option>
          </select>
        </div>)}
      </div>
      <p className="puzzle-weight" aria-live="polite">
        {puzzle.weighing.leftLabel}: {puzzle.weighing.items.filter((item) => state.values[item.id] === 'left').reduce((sum, item) => sum + item.weight, 0)} · {puzzle.weighing.rightLabel}: {puzzle.weighing.items.filter((item) => state.values[item.id] === 'right').reduce((sum, item) => sum + item.weight, 0)}
      </p>
    </>}

    {puzzle.id === 'schleuse' && <p>Wasserweg: {state.values.tor0 !== 1 ? 'Kein Zulauf.' : state.values.tor2 === 1 ? 'Das Wasser fliesst in den Ablauf.' : state.values.tor1 === 1 ? 'Das Wasser fliesst zur Quelle.' : 'Das Wasser staut sich vor dem Quelltor.'}</p>}
    <p>{solved ? 'Richtige Lösung – schliesse das Rätsel mit der Aktion darunter ab.' : 'Probiere in Ruhe. Falsche Versuche kosten nichts.'}</p>
    <button onClick={() => onAction({ type: 'PUZZLE_RESET', puzzleId: puzzle.id })}>Rätsel zurücksetzen</button>
  </section>
}
