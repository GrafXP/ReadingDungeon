import { useRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { phase2World } from '../content/world'
import { createNewGame } from '../domain/game'
import type { GameAction } from '../engine/actions'
import { reduceGame } from '../engine/reducer'
import { InventoryDialog } from './InventoryDialog'

function InventoryHarness({ onAction = () => undefined }: { onAction?: (action: GameAction) => void }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const game = createNewGame('Mira')

  return (
    <>
      <button ref={buttonRef} onClick={() => setOpen(true)}>Inventar öffnen</button>
      {open && (
        <InventoryDialog
          game={game}
          world={phase2World}
          returnFocusRef={buttonRef}
          onAction={onAction}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

describe('Inventardialog', () => {
  it('erklärt vor dem Heilen den Kampfzug und den angekündigten schweren Angriff', async () => {
    const user = userEvent.setup()
    const initial = createNewGame('Mira')
    initial.currentAreaId = 'perlenbecken'
    initial.visitedAreaIds.push('perlenbecken')
    const game = reduceGame(initial, { type: 'START_COMBAT', encounterId: 'boss_marea' }, phase2World)
    render(<InventoryDialog game={game} world={phase2World} returnFocusRef={{ current: null }} onAction={vi.fn()} onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Apfelbrot/ }))
    expect(screen.getByText(/Benutzen kostet einen Kampfzug/)).toHaveTextContent('Wellenrolle')
    expect(screen.getByText(/Verteidige dich zuerst/)).toBeInTheDocument()
    expect(game.activeCombat?.round).toBe(1)
  })
  it('zeigt Gegenstandsdetails und die unterschiedlichen Waffenwerte', async () => {
    const user = userEvent.setup()
    const game = createNewGame('Mira')
    game.player.inventory.hafenspeer = 1
    const returnRef = { current: document.createElement('button') }

    render(<InventoryDialog game={game} world={phase2World} returnFocusRef={returnRef} onAction={vi.fn()} onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Hafenspeer/ }))

    expect(screen.getByRole('heading', { name: 'Hafenspeer' })).toBeInTheDocument()
    expect(screen.getByText('3–5')).toBeInTheDocument()
    expect(screen.getByText('Bonus gegen Wassergegner')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ausrüsten' })).toBeEnabled()
  })

  it('erklärt, warum Heilung bei vollem Leben nichts verbraucht', async () => {
    const user = userEvent.setup()
    const game = createNewGame('Mira')
    const returnRef = { current: document.createElement('button') }

    render(<InventoryDialog game={game} world={phase2World} returnFocusRef={returnRef} onAction={vi.fn()} onClose={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Apfelbrot/ }))

    expect(screen.getByText('+5 Leben')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Benutzen' })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('Deine Lebenspunkte sind bereits voll.')).toBeInTheDocument()
  })

  it('schliesst mit Escape und stellt den Fokus wieder her', async () => {
    const user = userEvent.setup()
    render(<InventoryHarness />)
    const opener = screen.getByRole('button', { name: 'Inventar öffnen' })
    await user.click(opener)

    expect(screen.getByRole('button', { name: 'Inventar schliessen' })).toHaveFocus()
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})
