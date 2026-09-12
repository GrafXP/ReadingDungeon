import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { activeWorld } from '../content/world'
import { createDebugCombatSave, DebugScreen } from './DebugScreen'

function renderDebug(route = '/debug') {
  return render(<MemoryRouter initialEntries={[route]}><DebugScreen /></MemoryRouter>)
}

describe('DebugScreen', () => {
  it('can prepare every encounter for the isolated combat simulator', () => {
    for (const encounter of activeWorld.encounters) {
      expect(createDebugCombatSave(encounter).activeCombat?.encounterId, encounter.id).toBe(encounter.id)
    }
  })

  it('shows the complete catalog summary and can filter enemies by internal id', async () => {
    const user = userEvent.setup()
    renderDebug()

    expect(screen.getByRole('heading', { name: 'Inhalts-Debug' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Orte und Regionen: ${activeWorld.areas.length + activeWorld.regions.length}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Rätsel: ${activeWorld.puzzles?.length ?? 0}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Gegner: ${activeWorld.enemies.length}` })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: `Gegner (${activeWorld.enemies.length})` }))
    await user.type(screen.getByRole('searchbox', { name: 'In Gegner suchen' }), 'enemy_sm_schattenzipfel')

    expect(screen.getByText(`1 von ${activeWorld.enemies.length} Einträgen sichtbar`)).toBeInTheDocument()
    expect(screen.getByText('Schattenzipfel')).toBeInTheDocument()
    expect(screen.queryByText('Laternenknabberer')).not.toBeInTheDocument()
  })

  it('opens a puzzle in an isolated interactive tester and exposes its solution', async () => {
    const user = userEvent.setup()
    renderDebug('/debug?bereich=raetsel')

    await user.type(screen.getByRole('searchbox', { name: 'In Rätsel suchen' }), 'puz_sm_schattenkarte')
    await user.click(screen.getByText('Alvas Schattenkarte'))
    await user.click(screen.getByRole('button', { name: 'Im Rätseltester öffnen' }))

    expect(screen.getAllByRole('heading', { name: 'Alvas Schattenkarte', level: 2 })).not.toHaveLength(0)
    expect(screen.getByText(/Nur dieser Testzustand wird verändert/)).toBeInTheDocument()
    expect(screen.getByLabelText('Hufspur')).toBeInTheDocument()

    const solution = screen.getAllByText('Debug-Lösung anzeigen')[0]
    await user.click(solution)
    expect(screen.getAllByText(/Hufspur → Blatt/)).not.toHaveLength(0)
  })

  it('starts a selected encounter in the in-memory combat simulator', async () => {
    const user = userEvent.setup()
    renderDebug('/debug?bereich=kaempfe')

    const encounter = activeWorld.encounters[0]
    await user.type(screen.getByRole('searchbox', { name: 'In Kämpfe suchen' }), encounter.id)
    await user.click(screen.getByText(encounter.label))
    await user.click(screen.getByRole('button', { name: 'Im Kampfsimulator öffnen' }))

    expect(screen.getByText(/Der Tester gibt dir 40 LP/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Angreifen/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kampf neu starten' })).toBeInTheDocument()
  })
})
