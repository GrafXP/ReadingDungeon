import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { talora2World } from '../content/world'
import type { PuzzleDefinition } from '../domain/content'
import { createNewGame } from '../domain/game'
import { PuzzlePanel } from './PuzzlePanel'

const base = { areaId: 'sm_kartenstube', interactionId: 'int_sm_schattenkarte_abschliessen', title: 'Übung', hint: 'Lies.', controls: [] as PuzzleDefinition['controls'] }

function renderPuzzle(puzzle: PuzzleDefinition, onAction = vi.fn()) {
  render(<PuzzlePanel game={createNewGame('Mira', talora2World)} puzzle={puzzle} onAction={onAction} />)
  return onAction
}

describe('generische Rätselbedienung', () => {
  it('zeigt die Aufgabenstellung auch bei zusätzlichen, geschlossenen Hinweisen', () => {
    const puzzle = talora2World.puzzles!.find((entry) => entry.kind === 'ordering')!
    renderPuzzle(puzzle)
    expect(screen.getByText(puzzle.hint)).toBeVisible()
    expect(screen.getByText(/Bringe die Einträge mit den Pfeilen/)).toBeVisible()
    expect(screen.queryByText(/Richtige Lösung/)).not.toBeInTheDocument()
    expect(document.querySelectorAll('details[open]')).toHaveLength(0)
  })

  it('ordnet Paare mit beschrifteten Auswahlfeldern zu', async () => {
    const user = userEvent.setup()
    const puzzle: PuzzleDefinition = { ...base, id: 'pair', kind: 'pairing', pairing: { left: [{ id: 'paket', label: 'Paket' }], right: [{ id: 'tor', label: 'Wassertor' }], solution: { paket: 'tor' } } }
    const onAction = renderPuzzle(puzzle)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Paket' }), 'tor')
    expect(onAction).toHaveBeenCalledWith({ type: 'PUZZLE_INPUT', puzzleId: 'pair', controlId: 'paket', value: 'tor' })
  })

  it('sortiert Einträge mit klar benannten Tasten', async () => {
    const user = userEvent.setup()
    const puzzle: PuzzleDefinition = { ...base, id: 'order', kind: 'ordering', ordering: { items: [{ id: 'b', label: 'Senden' }, { id: 'a', label: 'Prüfen' }], solution: ['a', 'b'] } }
    const onAction = renderPuzzle(puzzle)
    await user.click(screen.getByRole('button', { name: 'Prüfen nach oben' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'PUZZLE_INPUT', puzzleId: 'order', controlId: 'a', value: 'up' })
  })

  it('stellt Wegfelder ohne Ziehgeste als Tasten bereit', async () => {
    const user = userEvent.setup()
    const puzzle: PuzzleDefinition = { ...base, id: 'grid', kind: 'grid', grid: { width: 2, height: 1, start: 0, goal: 1, solution: [0, 1] } }
    const onAction = renderPuzzle(puzzle)
    await user.click(screen.getByRole('button', { name: 'Ziel' }))
    expect(onAction).toHaveBeenCalledWith({ type: 'PUZZLE_INPUT', puzzleId: 'grid', controlId: 'grid', value: 1 })
  })

  it('zeigt die dauerhafte Textquelle vor den Leselücken', async () => {
    const user = userEvent.setup()
    const puzzle: PuzzleDefinition = { ...base, id: 'read', kind: 'reading', reading: { sourceTitle: 'Bericht', sourceText: 'Erst prüfen, dann senden.', prompts: [{ id: 'erst', label: 'Erster Schritt', options: ['Senden', 'Prüfen'], solution: 1 }] } }
    const onAction = renderPuzzle(puzzle)
    expect(screen.getByRole('heading', { name: 'Bericht' })).toBeInTheDocument()
    expect(screen.getByText('Erst prüfen, dann senden.')).toBeInTheDocument()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Erster Schritt' }), '1')
    expect(onAction).toHaveBeenCalledWith({ type: 'PUZZLE_INPUT', puzzleId: 'read', controlId: 'erst', value: 1 })
  })

  it('bedient Waagschalen mit Auswahlfeldern und ausgeschriebenen Seiten', async () => {
    const user = userEvent.setup()
    const puzzle: PuzzleDefinition = { ...base, id: 'weight', kind: 'weighing', weighing: { leftLabel: 'Linke Schale', rightLabel: 'Rechte Schale', items: [{ id: 'kiste', label: 'Kiste', weight: 2 }, { id: 'korb', label: 'Korb', weight: 1 }], solution: { kiste: 'left', korb: 'right' } } }
    const onAction = renderPuzzle(puzzle)
    await user.selectOptions(screen.getByRole('combobox', { name: 'Kiste' }), 'left')
    expect(onAction).toHaveBeenCalledWith({ type: 'PUZZLE_INPUT', puzzleId: 'weight', controlId: 'kiste', value: 'left' })
  })
})
