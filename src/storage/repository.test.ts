import { afterEach, describe, expect, it } from 'vitest'
import { createNewGame } from '../domain/game'
import { DEFAULT_SETTINGS } from '../domain/settings'
import { GameRepository } from './repository'

const repositories: GameRepository[] = []

function repository() {
  const value = new GameRepository(`textdungeon-test-${crypto.randomUUID()}`)
  repositories.push(value)
  return value
}

afterEach(async () => {
  await Promise.all(repositories.splice(0).map((value) => value.close()))
})

describe('GameRepository', () => {
  it('trennt Abenteuer und Einstellungen', async () => {
    const repo = repository()
    const save = createNewGame('Nia')
    await repo.saveAdventure(save)
    await repo.saveSettings({ ...DEFAULT_SETTINGS, highContrast: true })

    const adventure = await repo.loadAdventure()
    const settings = await repo.loadSettings()

    expect(adventure.status).toBe('ready')
    expect(adventure.status === 'ready' && adventure.value.playerName).toBe('Nia')
    expect(settings.status === 'ready' && settings.value.highContrast).toBe(true)
  })

  it('ordnet schnelle Schreibvorgänge und behält den neuesten Zustand', async () => {
    const repo = repository()
    const first = createNewGame('Erster')
    const second = { ...first, playerName: 'Zweiter', turn: 1 }

    await Promise.all([repo.saveAdventure(first), repo.saveAdventure(second)])
    const loaded = await repo.loadAdventure()

    expect(loaded.status === 'ready' && loaded.value.playerName).toBe('Zweiter')
    expect(loaded.status === 'ready' && loaded.value.turn).toBe(1)
  })

  it('löscht nur das Abenteuer', async () => {
    const repo = repository()
    await repo.saveAdventure(createNewGame('Ari'))
    await repo.saveSettings({ ...DEFAULT_SETTINGS, reducedMotion: true })

    await repo.deleteAdventure()

    expect((await repo.loadAdventure()).status).toBe('empty')
    const settings = await repo.loadSettings()
    expect(settings.status === 'ready' && settings.value.reducedMotion).toBe(true)
  })
})
