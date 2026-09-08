import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { GameSave } from '../domain/game'
import type { AppSettings } from '../domain/settings'
import {
  migrateAndValidateGameSave,
  settingsOrDefaults,
  validateSettings
} from './validation'

const DATABASE_VERSION = 1
const ADVENTURE_KEY = 'current'
const SETTINGS_KEY = 'settings'

interface StoredValue {
  key: string
  value: unknown
  updatedAt: string
}

interface ReadingDungeonDatabase extends DBSchema {
  adventures: {
    key: string
    value: StoredValue
  }
  settings: {
    key: string
    value: StoredValue
  }
}

export type LoadResult<T> =
  | { status: 'empty' }
  | { status: 'ready'; value: T; updatedAt: string }
  | { status: 'invalid'; error: Error }
  | { status: 'error'; error: Error }

function asError(value: unknown, fallback: string): Error {
  return value instanceof Error ? value : new Error(fallback)
}

export class GameRepository {
  private readonly dbPromise: Promise<IDBPDatabase<ReadingDungeonDatabase>>
  private writeQueue: Promise<unknown> = Promise.resolve()

  constructor(databaseName = 'readingdungeon') {
    this.dbPromise = openDB<ReadingDungeonDatabase>(databaseName, DATABASE_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains('adventures')) {
          database.createObjectStore('adventures', { keyPath: 'key' })
        }
        if (!database.objectStoreNames.contains('settings')) {
          database.createObjectStore('settings', { keyPath: 'key' })
        }
      }
    })
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.writeQueue.then(operation)
    this.writeQueue = result.catch(() => undefined)
    return result
  }

  async loadAdventure(): Promise<LoadResult<GameSave>> {
    try {
      await this.writeQueue
      const database = await this.dbPromise
      const stored = await database.get('adventures', ADVENTURE_KEY)
      if (!stored) return { status: 'empty' }
      try {
        return {
          status: 'ready',
          value: migrateAndValidateGameSave(stored.value),
          updatedAt: stored.updatedAt
        }
      } catch (error) {
        return { status: 'invalid', error: asError(error, 'Der Spielstand ist beschädigt.') }
      }
    } catch (error) {
      return { status: 'error', error: asError(error, 'Der Speicher konnte nicht gelesen werden.') }
    }
  }

  saveAdventure(save: GameSave): Promise<void> {
    const validated = migrateAndValidateGameSave(save)
    return this.enqueue(async () => {
      const database = await this.dbPromise
      await database.put('adventures', {
        key: ADVENTURE_KEY,
        value: validated,
        updatedAt: new Date().toISOString()
      })
    })
  }

  deleteAdventure(): Promise<void> {
    return this.enqueue(async () => {
      const database = await this.dbPromise
      await database.delete('adventures', ADVENTURE_KEY)
    })
  }

  replaceAdventure(save: GameSave): Promise<void> {
    return this.saveAdventure(save)
  }

  async loadSettings(): Promise<LoadResult<AppSettings>> {
    try {
      await this.writeQueue
      const database = await this.dbPromise
      const stored = await database.get('settings', SETTINGS_KEY)
      if (!stored) return { status: 'ready', value: settingsOrDefaults(undefined), updatedAt: '' }
      try {
        return {
          status: 'ready',
          value: settingsOrDefaults(stored.value),
          updatedAt: stored.updatedAt
        }
      } catch (error) {
        return { status: 'invalid', error: asError(error, 'Die Einstellungen sind beschädigt.') }
      }
    } catch (error) {
      return { status: 'error', error: asError(error, 'Die Einstellungen konnten nicht gelesen werden.') }
    }
  }

  saveSettings(settings: AppSettings): Promise<void> {
    const validated = validateSettings(settings)
    return this.enqueue(async () => {
      const database = await this.dbPromise
      await database.put('settings', {
        key: SETTINGS_KEY,
        value: validated,
        updatedAt: new Date().toISOString()
      })
    })
  }

  async close(): Promise<void> {
    await this.writeQueue
    const database = await this.dbPromise
    database.close()
  }
}

export const gameRepository = new GameRepository()
