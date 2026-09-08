import { useInstallPrompt, useOnlineStatus, useServiceWorkerUpdate } from '../app/usePwa'
import { useAppState } from '../app/AppState'

export function PwaNotices() {
  const { saveStatus } = useAppState()
  const online = useOnlineStatus()
  const { canInstall, install } = useInstallPrompt()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker
  } = useServiceWorkerUpdate()

  if (!online) {
    return <div className="system-notice" role="status">Offline – dein Abenteuer bleibt auf diesem Gerät verfügbar.</div>
  }
  if (needRefresh) {
    return (
      <div className="system-notice system-notice--action" role="status">
        <span>Eine neue Version ist bereit.</span>
        <button disabled={saveStatus === 'saving' || saveStatus === 'error'} onClick={() => void updateServiceWorker(true)}>{saveStatus === 'saving' || saveStatus === 'error' ? 'Zuerst Abenteuer speichern' : 'Jetzt laden'}</button>
        <button className="text-button" onClick={() => setNeedRefresh(false)}>Später</button>
      </div>
    )
  }
  if (offlineReady) {
    return (
      <div className="system-notice system-notice--action" role="status">
        <span>ReadingDungeon ist jetzt offline bereit.</span>
        <button className="text-button" onClick={() => setOfflineReady(false)}>Schliessen</button>
      </div>
    )
  }
  if (canInstall) {
    return (
      <div className="system-notice system-notice--action" role="status">
        <span>Installiere ReadingDungeon für schnellen Zugriff.</span>
        <button onClick={() => void install()}>Installieren</button>
      </div>
    )
  }
  return null
}
