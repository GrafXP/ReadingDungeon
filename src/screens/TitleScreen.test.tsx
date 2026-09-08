import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppStateProvider } from '../app/AppState'
import { TitleScreen } from './TitleScreen'
import { gameRepository } from '../storage/repository'
import { createNewGame } from '../domain/game'

describe('Startansicht', () => {
  it('zeigt nach einem fehlgeschlagenen Neustart den ungespeicherten neuen Lauf statt einer erneuten Löschfrage', async () => {
    await gameRepository.saveAdventure(createNewGame('Alt'))
    const user = userEvent.setup()
    render(<MemoryRouter><AppStateProvider><TitleScreen /></AppStateProvider></MemoryRouter>)
    await user.click(await screen.findByRole('button', { name: 'Neues Abenteuer' }))
    await user.click(screen.getByRole('button', { name: 'Spielstand löschen' }))
    await user.type(await screen.findByLabelText('Wie heisst du?'), 'Neu')
    vi.spyOn(gameRepository, 'saveAdventure').mockRejectedValueOnce(new Error('Speicher voll'))
    await user.click(screen.getByRole('button', { name: 'Abenteuer starten' }))
    expect(await screen.findByRole('link', { name: /Abenteuer fortsetzen/ })).toHaveTextContent('Neu')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
  it('startet ein neues Abenteuer mit dem eingegebenen Namen', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AppStateProvider>
          <TitleScreen />
        </AppStateProvider>
      </MemoryRouter>
    )

    const name = await screen.findByLabelText('Wie heisst du?')
    await user.type(name, 'Mira')
    await user.click(screen.getByRole('button', { name: 'Abenteuer starten' }))

    await waitFor(() => expect(screen.getByRole('link', { name: /Abenteuer fortsetzen/ })).toBeInTheDocument())
    expect(screen.getByText(/Mira · Sonnenwacht/)).toBeInTheDocument()
  })
})
