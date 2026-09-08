import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { createNewGame, type GameSave } from '../domain/game'
import { DEFAULT_SETTINGS, type AppSettings } from '../domain/settings'
import { gameRepository, type LoadResult } from '../storage/repository'

type AdventureStatus = 'loading' | 'empty' | 'ready' | 'invalid' | 'error'
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AppStateValue {
  adventureStatus: AdventureStatus
  game: GameSave | null
  settings: AppSettings
  settingsReady: boolean
  loadError: string | null
  saveError: string | null
  settingsError: string | null
  saveStatus: SaveStatus
  startAdventure(name: string): Promise<boolean>
  updateAdventure(update: (current: GameSave) => GameSave): void
  retrySave(): Promise<boolean>
  resetAdventure(): Promise<boolean>
  importAdventure(save: GameSave): Promise<boolean>
  updateSettings(patch: Partial<AppSettings>): void
}

const AppStateContext = createContext<AppStateValue | null>(null)

function messageFrom(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

function statusFrom<T>(result: LoadResult<T>): AdventureStatus {
  return result.status === 'ready' ? 'ready' : result.status
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [adventureStatus, setAdventureStatus] = useState<AdventureStatus>('loading')
  const [game, setGame] = useState<GameSave | null>(null)
  const gameRef = useRef<GameSave | null>(null)
  const replacingRef = useRef(false)
  const saveRevision = useRef(0)
  const settingsRevision = useRef(0)
  const settingsRef = useRef<AppSettings>(DEFAULT_SETTINGS)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [settingsReady, setSettingsReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    let active = true
    void Promise.all([gameRepository.loadAdventure(), gameRepository.loadSettings()]).then(
      ([adventureResult, settingsResult]) => {
        if (!active) return
        setAdventureStatus(statusFrom(adventureResult))
        if (adventureResult.status === 'ready') {
          gameRef.current = adventureResult.value
          setGame(adventureResult.value)
        }
        if (adventureResult.status === 'invalid' || adventureResult.status === 'error') {
          setLoadError(adventureResult.error.message)
        }

        if (settingsResult.status === 'ready') {
          settingsRef.current = settingsResult.value
          setSettings(settingsResult.value)
        } else if (settingsResult.status === 'invalid' || settingsResult.status === 'error') {
          setSettingsError(settingsResult.error.message)
        }
        setSettingsReady(true)
      }
    )
    return () => {
      active = false
    }
  }, [])

  const persistAdventure = useCallback(async (nextGame: GameSave): Promise<boolean> => {
    const revision = ++saveRevision.current
    setSaveStatus('saving')
    setSaveError(null)
    try {
      await gameRepository.saveAdventure(nextGame)
      if (revision === saveRevision.current) setSaveStatus('saved')
      return true
    } catch (error) {
      if (revision === saveRevision.current) {
        setSaveStatus('error')
        setSaveError(messageFrom(error, 'Das Abenteuer konnte nicht gespeichert werden.'))
      }
      return false
    }
  }, [])

  const startAdventure = useCallback(
    async (name: string) => {
      if (replacingRef.current) return false
      const nextGame = createNewGame(name)
      gameRef.current = nextGame
      setGame(nextGame)
      setAdventureStatus('ready')
      setLoadError(null)
      return persistAdventure(nextGame)
    },
    [persistAdventure]
  )

  const updateAdventure = useCallback(
    (update: (current: GameSave) => GameSave) => {
      const current = gameRef.current
      if (!current || replacingRef.current) return
      const nextGame = update(current)
      if (nextGame === current) return
      gameRef.current = nextGame
      setGame(nextGame)
      void persistAdventure(nextGame)
    },
    [persistAdventure]
  )

  const retrySave = useCallback(async () => {
    if (!gameRef.current || replacingRef.current) return false
    return persistAdventure(gameRef.current)
  }, [persistAdventure])

  const resetAdventure = useCallback(async () => {
    if (replacingRef.current) return false
    replacingRef.current = true
    ++saveRevision.current
    setSaveStatus('saving')
    try {
      await gameRepository.deleteAdventure()
      gameRef.current = null
      setGame(null)
      setAdventureStatus('empty')
      setLoadError(null)
      setSaveError(null)
      setSaveStatus('idle')
      return true
    } catch (error) {
      setSaveError(messageFrom(error, 'Das Abenteuer konnte nicht zurückgesetzt werden.'))
      setSaveStatus('error')
      return false
    } finally {
      replacingRef.current = false
    }
  }, [])

  const importAdventure = useCallback(
    async (nextGame: GameSave) => {
      if (replacingRef.current) return false
      replacingRef.current = true
      try {
        const saved = await persistAdventure(nextGame)
        if (saved) {
          gameRef.current = nextGame
          setGame(nextGame)
          setAdventureStatus('ready')
          setLoadError(null)
        }
        return saved
      } finally {
        replacingRef.current = false
      }
    },
    [persistAdventure]
  )

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    const nextSettings = { ...settingsRef.current, ...patch }
    const revision = ++settingsRevision.current
    settingsRef.current = nextSettings
    setSettings(nextSettings)
    setSettingsError(null)
    void gameRepository.saveSettings(nextSettings).catch((error) => {
      if (revision === settingsRevision.current) setSettingsError(messageFrom(error, 'Die Einstellungen konnten nicht gespeichert werden.'))
    })
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      adventureStatus,
      game,
      settings,
      settingsReady,
      loadError,
      saveError,
      settingsError,
      saveStatus,
      startAdventure,
      updateAdventure,
      retrySave,
      resetAdventure,
      importAdventure,
      updateSettings
    }),
    [
      adventureStatus,
      game,
      settings,
      settingsReady,
      loadError,
      saveError,
      settingsError,
      saveStatus,
      startAdventure,
      updateAdventure,
      retrySave,
      resetAdventure,
      importAdventure,
      updateSettings
    ]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext)
  if (!value) throw new Error('useAppState muss innerhalb von AppStateProvider verwendet werden.')
  return value
}
