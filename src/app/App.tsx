import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { PwaNotices } from '../components/PwaNotices'
import { StorageNotice } from '../components/StorageNotice'
import { MapScreen } from '../screens/MapScreen'
import { PlayScreen } from '../screens/PlayScreen'
import { JournalScreen } from '../screens/JournalScreen'
import { QuestsScreen } from '../screens/QuestsScreen'
import { RemindersScreen } from '../screens/RemindersScreen'
import { SettingsScreen } from '../screens/SettingsScreen'
import { TitleScreen } from '../screens/TitleScreen'
import { useAppState } from './AppState'

function AdventureRoute({ children }: { children: React.ReactNode }) {
  const { adventureStatus } = useAppState()
  if (adventureStatus === 'loading') return <main className="center-stage"><div className="loading-card">Abenteuer wird geladen …</div></main>
  if (adventureStatus !== 'ready') return <Navigate to="/" replace />
  return children
}

export function App() {
  const { settings } = useAppState()

  useEffect(() => {
    const root = document.documentElement
    root.dataset.textSize = settings.textSize
    root.dataset.contrast = settings.highContrast ? 'hoch' : 'normal'
    root.dataset.motion = settings.reducedMotion ? 'reduziert' : 'normal'
  }, [settings])

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Zum Inhalt springen</a>
      <StorageNotice />
      <PwaNotices />
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route element={<AppLayout />}>
          <Route path="/spiel" element={<AdventureRoute><PlayScreen /></AdventureRoute>} />
          <Route path="/karte" element={<AdventureRoute><MapScreen /></AdventureRoute>} />
          <Route path="/aufgaben" element={<AdventureRoute><QuestsScreen /></AdventureRoute>} />
          <Route path="/merkliste" element={<AdventureRoute><RemindersScreen /></AdventureRoute>} />
          <Route path="/tagebuch" element={<AdventureRoute><JournalScreen /></AdventureRoute>} />
          <Route path="/einstellungen" element={<SettingsScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
