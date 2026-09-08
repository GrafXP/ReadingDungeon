import { useAppState } from '../app/AppState'

export function StorageNotice() {
  const { saveError, settingsError, retrySave, game } = useAppState()
  const message = saveError ?? settingsError
  if (!message) return null

  return (
    <div className="error-notice" role="alert">
      <div>
        <strong>Speicherproblem</strong>
        <span>{message}</span>
      </div>
      {saveError && game && <button onClick={() => void retrySave()}>Erneut speichern</button>}
    </div>
  )
}
