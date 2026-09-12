import type { PuzzleDefinition } from '../domain/content'
import type { GameSave, PuzzleState } from '../domain/game'

export type PuzzleInputValue = string | number | boolean

export interface PuzzleUpdate {
  state: PuzzleState
  text: string
}

export function getPuzzleKind(puzzle: PuzzleDefinition): NonNullable<PuzzleDefinition['kind']> {
  return puzzle.kind ?? 'controls'
}

export function createPuzzleState(puzzle: PuzzleDefinition): PuzzleState {
  const kind = getPuzzleKind(puzzle)
  if (kind === 'pairing') {
    return { kind, values: Object.fromEntries((puzzle.pairing?.left ?? []).map((item) => [item.id, ''])) }
  }
  if (kind === 'ordering') {
    const order = (puzzle.ordering?.items ?? []).map((item) => item.id)
    if (order.join('|') === puzzle.ordering?.solution.join('|')) order.reverse()
    return { kind, values: { order: order.join('|') } }
  }
  if (kind === 'grid') return { kind, values: { path: String(puzzle.grid?.start ?? 0) } }
  if (kind === 'reading') {
    return { kind, values: Object.fromEntries((puzzle.reading?.prompts ?? []).map((prompt) => [prompt.id, ''])) }
  }
  if (kind === 'weighing') {
    return { kind, values: Object.fromEntries((puzzle.weighing?.items ?? []).map((item) => [item.id, 'off'])) }
  }
  return {
    kind,
    values: {
      ...Object.fromEntries(puzzle.controls.map((control) => [control.id, control.initial])),
      sequence: 0
    }
  }
}

export function getPuzzleState(save: GameSave, puzzle: PuzzleDefinition): PuzzleState {
  return save.puzzleStates[puzzle.id] ?? createPuzzleState(puzzle)
}

function orderedIds(state: PuzzleState): string[] {
  return typeof state.values.order === 'string' && state.values.order ? state.values.order.split('|') : []
}

function gridPath(state: PuzzleState): number[] {
  if (typeof state.values.path !== 'string') return []
  return state.values.path.split(',').map(Number).filter(Number.isSafeInteger)
}

export function isPuzzleSolved(save: GameSave, puzzle: PuzzleDefinition): boolean {
  return isPuzzleStateSolved(getPuzzleState(save, puzzle), puzzle)
}

export function isPuzzleStateSolved(state: PuzzleState, puzzle: PuzzleDefinition): boolean {
  const kind = getPuzzleKind(puzzle)
  if (kind === 'pairing') {
    const pairing = puzzle.pairing
    return Boolean(pairing && Object.entries(pairing.solution).every(([leftId, rightId]) => state.values[leftId] === rightId))
  }
  if (kind === 'ordering') return orderedIds(state).join('|') === (puzzle.ordering?.solution ?? []).join('|')
  if (kind === 'grid') return gridPath(state).join(',') === (puzzle.grid?.solution ?? []).join(',')
  if (kind === 'reading') {
    const reading = puzzle.reading
    return Boolean(reading && reading.prompts.every((prompt) => state.values[prompt.id] === prompt.solution))
  }
  if (kind === 'weighing') {
    const weighing = puzzle.weighing
    if (!weighing) return false
    const target = weighing.items.filter((item) => weighing.solution[item.id] === 'left').reduce((sum, item) => sum + item.weight, 0)
    return weighing.items.every((item) => weighing.solution[item.id] === 'off'
      ? state.values[item.id] === 'off'
      : state.values[item.id] === 'left' || state.values[item.id] === 'right') &&
      ['left', 'right'].every((side) => weighing.items.filter((item) => state.values[item.id] === side).reduce((sum, item) => sum + item.weight, 0) === target)
  }
  return puzzle.controls.every((control) => state.values[control.id] === control.solution) &&
    (!puzzle.sequence || state.values.sequence === puzzle.sequence.solution.length)
}

function adjacentGridCells(first: number, second: number, width: number): boolean {
  const rowDifference = Math.abs(Math.floor(first / width) - Math.floor(second / width))
  const columnDifference = Math.abs((first % width) - (second % width))
  return rowDifference + columnDifference === 1
}

export function updatePuzzleState(
  state: PuzzleState,
  puzzle: PuzzleDefinition,
  controlId: string,
  value: PuzzleInputValue
): PuzzleUpdate | null {
  const kind = getPuzzleKind(puzzle)
  const values = { ...state.values }
  if (kind === 'pairing') {
    const pairing = puzzle.pairing
    if (!pairing || !pairing.left.some((item) => item.id === controlId) || typeof value !== 'string' || (value && !pairing.right.some((item) => item.id === value))) return null
    for (const left of pairing.left) if (left.id !== controlId && values[left.id] === value) values[left.id] = ''
    if (values[controlId] === value) return null
    values[controlId] = value
    const label = pairing.right.find((item) => item.id === value)?.label ?? 'noch kein Paar'
    return { state: { kind, values }, text: `${pairing.left.find((item) => item.id === controlId)!.label}: ${label}.` }
  }
  if (kind === 'ordering') {
    const ordering = puzzle.ordering
    if (!ordering || !ordering.items.some((item) => item.id === controlId) || (value !== 'up' && value !== 'down')) return null
    const order = orderedIds(state)
    const index = order.indexOf(controlId)
    const destination = value === 'up' ? index - 1 : index + 1
    if (index < 0 || destination < 0 || destination >= order.length) return null
    ;[order[index], order[destination]] = [order[destination], order[index]]
    return { state: { kind, values: { order: order.join('|') } }, text: `${ordering.items.find((item) => item.id === controlId)!.label} wurde verschoben.` }
  }
  if (kind === 'grid') {
    const grid = puzzle.grid
    if (!grid || controlId !== 'grid' || typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value >= grid.width * grid.height || grid.blocked?.includes(value)) return null
    const path = gridPath(state)
    if (path.at(-1) === value && path.length > 1) {
      path.pop()
      return { state: { kind, values: { path: path.join(',') } }, text: 'Du gehst ein Feld zurück.' }
    }
    if (path.includes(value) || !adjacentGridCells(path.at(-1) ?? grid.start, value, grid.width)) return null
    path.push(value)
    return { state: { kind, values: { path: path.join(',') } }, text: value === grid.goal ? 'Du erreichst das Zielfeld.' : 'Der Weg wächst um ein Feld.' }
  }
  if (kind === 'reading') {
    const prompt = puzzle.reading?.prompts.find((entry) => entry.id === controlId)
    if (!prompt || (value !== '' && (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value >= prompt.options.length)) || values[controlId] === value) return null
    values[controlId] = value
    return { state: { kind, values }, text: `${prompt.label}: ${value === '' ? 'noch keine Antwort' : prompt.options[Number(value)]}.` }
  }
  if (kind === 'weighing') {
    const item = puzzle.weighing?.items.find((entry) => entry.id === controlId)
    if (!item || (value !== 'left' && value !== 'right' && value !== 'off') || values[controlId] === value) return null
    values[controlId] = value
    const side = value === 'left' ? puzzle.weighing!.leftLabel : value === 'right' ? puzzle.weighing!.rightLabel : 'Ablage'
    return { state: { kind, values }, text: `${item.label}: ${side}.` }
  }

  if (controlId === 'sequence' && puzzle.sequence) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value >= puzzle.sequence.options.length) return null
    const progress = Number(values.sequence)
    if (progress === puzzle.sequence.solution.length) return null
    const correct = puzzle.sequence.solution[progress] === value
    values.sequence = correct ? progress + 1 : 0
    return {
      state: { kind, values },
      text: correct
        ? `${puzzle.sequence.options[value]} stimmt. ${progress + 1} von ${puzzle.sequence.solution.length} Zeichen.`
        : 'Das passt noch nicht. Die Folge beginnt von vorn; du verlierst nichts.'
    }
  }
  const control = puzzle.controls.find((entry) => entry.id === controlId)
  if (!control || typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value >= control.options.length || values[control.id] === value) return null
  values[control.id] = value
  if (puzzle.maxOpenControls && puzzle.controls.filter((entry) => values[entry.id] === 1).length > puzzle.maxOpenControls) return null
  return { state: { kind, values }, text: `${control.label}: ${control.options[value]}.` }
}

export function isPuzzleStateValid(state: PuzzleState, puzzle: PuzzleDefinition): boolean {
  if (state.kind !== getPuzzleKind(puzzle)) return false
  const initial = createPuzzleState(puzzle)
  if (Object.keys(state.values).sort().join('|') !== Object.keys(initial.values).sort().join('|')) return false
  const kind = getPuzzleKind(puzzle)
  if (kind === 'pairing') return Object.values(state.values).every((value) => typeof value === 'string' && (!value || puzzle.pairing?.right.some((item) => item.id === value)))
  if (kind === 'ordering') {
    const ids = orderedIds(state)
    const expected = puzzle.ordering?.items.map((item) => item.id) ?? []
    return ids.length === expected.length && new Set(ids).size === ids.length && expected.every((id) => ids.includes(id))
  }
  if (kind === 'grid') {
    const path = gridPath(state)
    const grid = puzzle.grid
    return Boolean(grid && path[0] === grid.start && path.every((cell, index) => cell >= 0 && cell < grid.width * grid.height && !grid.blocked?.includes(cell) && (index === 0 || adjacentGridCells(path[index - 1], cell, grid.width))))
  }
  if (kind === 'reading') return Boolean(puzzle.reading && puzzle.reading.prompts.every((prompt) => state.values[prompt.id] === '' || (typeof state.values[prompt.id] === 'number' && Number.isInteger(state.values[prompt.id]) && Number(state.values[prompt.id]) >= 0 && Number(state.values[prompt.id]) < prompt.options.length)))
  if (kind === 'weighing') return Object.values(state.values).every((value) => value === 'left' || value === 'right' || value === 'off')
  return puzzle.controls.every((control) => typeof state.values[control.id] === 'number' && Number.isInteger(state.values[control.id]) && Number(state.values[control.id]) >= 0 && Number(state.values[control.id]) < control.options.length) &&
    typeof state.values.sequence === 'number' && Number.isInteger(state.values.sequence) && Number(state.values.sequence) >= 0 && Number(state.values.sequence) <= (puzzle.sequence?.solution.length ?? 0)
}
