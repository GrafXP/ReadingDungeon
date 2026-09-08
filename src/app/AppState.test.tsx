import { StrictMode, type PropsWithChildren } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppStateProvider, useAppState } from './AppState'
import { gameRepository } from '../storage/repository'
import { createNewGame } from '../domain/game'
import { DEFAULT_SETTINGS } from '../domain/settings'

function deferred() {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function Wrapper({ children }: PropsWithChildren) { return <StrictMode><AppStateProvider>{children}</AppStateProvider></StrictMode> }
async function setup() {
  const hook = renderHook(useAppState, { wrapper: Wrapper })
  await waitFor(() => expect(hook.result.current.adventureStatus).toBe('ready'))
  return hook
}
beforeEach(() => {
  vi.spyOn(gameRepository, 'loadAdventure').mockResolvedValue({ status: 'ready', value: createNewGame('Alt'), updatedAt: '' })
  vi.spyOn(gameRepository, 'loadSettings').mockResolvedValue({ status: 'ready', value: DEFAULT_SETTINGS, updatedAt: '' })
  vi.spyOn(gameRepository, 'saveAdventure').mockResolvedValue()
  vi.spyOn(gameRepository, 'saveSettings').mockResolvedValue()
  vi.spyOn(gameRepository, 'deleteAdventure').mockResolvedValue()
})

describe('Speicherkoordination', () => {
  it('meldet erst den neuesten Schreibvorgang als gespeichert', async () => {
    const { result } = await setup()
    const first = deferred(), second = deferred()
    vi.mocked(gameRepository.saveAdventure).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    act(() => {
      result.current.updateAdventure((save) => ({ ...save, turn: save.turn + 1 }))
      result.current.updateAdventure((save) => ({ ...save, turn: save.turn + 1 }))
    })
    expect(result.current.game?.turn).toBe(2)
    await act(async () => first.resolve())
    expect(result.current.saveStatus).toBe('saving')
    await act(async () => second.resolve())
    expect(result.current.saveStatus).toBe('saved')
  })

  it('ignoriert einen alten Schreibfehler, wenn eine neuere Speicherung läuft', async () => {
    const { result } = await setup()
    const first = deferred(), second = deferred()
    vi.mocked(gameRepository.saveAdventure).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    act(() => {
      result.current.updateAdventure((save) => ({ ...save, turn: 1 }))
      result.current.updateAdventure((save) => ({ ...save, turn: 2 }))
    })
    await act(async () => first.reject(new Error('old error')))
    expect(result.current.saveError).toBeNull()
    expect(result.current.saveStatus).toBe('saving')
    await act(async () => second.reject(new Error('latest error')))
    expect(result.current.saveError).toBe('latest error')
  })

  it.each(['import', 'reset'] as const)('blockiert Aktionen während %s und verhindert das Zurückschreiben des alten Spiels', async (operation) => {
    const { result } = await setup()
    const pending = deferred()
    if (operation === 'import') vi.mocked(gameRepository.saveAdventure).mockReturnValueOnce(pending.promise)
    else vi.mocked(gameRepository.deleteAdventure).mockReturnValueOnce(pending.promise)
    let completion!: Promise<boolean>
    act(() => { completion = operation === 'import' ? result.current.importAdventure(createNewGame('Neu')) : result.current.resetAdventure() })
    act(() => result.current.updateAdventure((save) => ({ ...save, turn: 99 })))
    expect(gameRepository.saveAdventure).toHaveBeenCalledTimes(operation === 'import' ? 1 : 0)
    await act(async () => { pending.resolve(); await completion })
    expect(result.current.game?.playerName ?? null).toBe(operation === 'import' ? 'Neu' : null)
  })

  it('behält bei fehlgeschlagenem Import das alte Spiel und entsperrt Aktionen', async () => {
    const { result } = await setup()
    vi.mocked(gameRepository.saveAdventure).mockRejectedValueOnce(new Error('voll'))
    await act(async () => { expect(await result.current.importAdventure(createNewGame('Neu'))).toBe(false) })
    expect(result.current.game?.playerName).toBe('Alt')
    act(() => result.current.updateAdventure((save) => ({ ...save, turn: 1 })))
    await waitFor(() => expect(result.current.saveStatus).toBe('saved'))
    expect(result.current.game?.turn).toBe(1)
  })

  it('schreibt Einstellungen in StrictMode genau einmal pro Änderung', async () => {
    const { result } = await setup()
    act(() => {
      result.current.updateSettings({ highContrast: true })
      result.current.updateSettings({ textSize: 'gross' })
    })
    expect(gameRepository.saveSettings).toHaveBeenCalledTimes(2)
    expect(vi.mocked(gameRepository.saveSettings).mock.calls[1][0]).toMatchObject({ highContrast: true, textSize: 'gross' })
  })
})
