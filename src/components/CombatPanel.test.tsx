import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { phase2World } from '../content/world'
import { createNewGame } from '../domain/game'
import { reduceGame } from '../engine/reducer'
import { CombatPanel } from './CombatPanel'

function bossGame() {
  const start = createNewGame('Mira')
  const atBoss = { ...start, currentAreaId: 'perlenbecken', visitedAreaIds: ['sonnenwacht', 'perlenbecken'] }
  return reduceGame(atBoss, { type: 'START_COMBAT', encounterId: 'boss_marea' }, phase2World)
}

describe('Kampfanzeige', () => {
  it('zeigt Lebenswerte, Phase, angekündigten Zug und den frühen Rückzug ohne Farbe', () => {
    render(<CombatPanel game={bossGame()} world={phase2World} onAction={vi.fn()} onOpenInventory={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Marea, Wächterin der Gezeiten' })).toBeInTheDocument()
    expect(screen.getByText('Boss · Phase 1')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: /Marea.*24 von 24/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wellenrolle' })).toBeInTheDocument()
    expect(screen.getByText(/Rückweg bleibt garantiert offen/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Zieh dich zurück/ })).toHaveAttribute('aria-disabled', 'false')
  })

  it('sendet klare Kampfaktionen', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    const onOpenInventory = vi.fn()
    render(<CombatPanel game={bossGame()} world={phase2World} onAction={onAction} onOpenInventory={onOpenInventory} />)

    await user.click(screen.getByRole('button', { name: /Angreifen/ }))
    await user.click(screen.getByRole('button', { name: /Verteidigen/ }))
    await user.click(screen.getByRole('button', { name: /Gegenstand/ }))

    expect(onAction).toHaveBeenNthCalledWith(1, { type: 'ATTACK' })
    expect(onAction).toHaveBeenNthCalledWith(2, { type: 'DEFEND' })
    expect(onOpenInventory).toHaveBeenCalledOnce()
  })

  it('beschreibt Niederlage als Rettung', () => {
    const game = bossGame()
    const defeated = { ...game, player: { ...game.player, life: 0 } }
    render(<CombatPanel game={defeated} world={phase2World} onAction={vi.fn()} onOpenInventory={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Kuno holt Hilfe' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zum letzten sicheren Ort' })).toBeInTheDocument()
    expect(screen.getByText(/nichts aus deinem Inventar/)).toBeInTheDocument()
  })
})
