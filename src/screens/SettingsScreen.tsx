import { type ChangeEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '../app/AppState'
import type { GameSave } from '../domain/game'
import type { TextSize } from '../domain/settings'
import { campaignWorld } from '../content/world/campaignWorld'
import { createSaveExport, DataValidationError, parseSaveImport } from '../storage/validation'

function downloadSave(save: GameSave) {
  const blob = new Blob([createSaveExport(save)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `textdungeon-${save.playerName.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'spielstand'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function SettingsScreen() {
  const {
    settings,
    settingsReady,
    updateSettings,
    game,
    adventureStatus,
    resetAdventure,
    importAdventure
  } = useAppState()
  const [pendingImport, setPendingImport] = useState<GameSave | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [showReset, setShowReset] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const importSelection = useRef(0)
  const navigate = useNavigate()

  const selectImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const selection = ++importSelection.current
    setImportError(null)
    setPendingImport(null)
    const file = event.target.files?.[0]
    // A cancelled or rejected file must be selectable again, even at the same path.
    event.target.value = ''
    if (!file) return
    if (file.size > 2_000_000) {
      setImportError('Die Datei ist zu gross. Ein ReadingDungeon-Spielstand ist kleiner als 2 MB.')
      return
    }
    try {
      const imported = parseSaveImport(await file.text())
      if (selection === importSelection.current) {
        setShowReset(false)
        setPendingImport(imported)
      }
    } catch (error) {
      if (selection === importSelection.current) setImportError(error instanceof DataValidationError ? error.message : 'Die Datei konnte nicht gelesen werden.')
    }
  }

  const confirmImport = async () => {
    if (!pendingImport) return
    setBusy(true)
    const imported = await importAdventure(pendingImport)
    setBusy(false)
    if (imported) {
      setPendingImport(null)
      if (fileInput.current) fileInput.current.value = ''
      navigate('/spiel')
    }
  }

  const confirmReset = async () => {
    setBusy(true)
    const reset = await resetAdventure()
    setBusy(false)
    if (reset) {
      setShowReset(false)
      navigate('/')
    }
  }

  if (!settingsReady) return <main id="main-content" className="center-stage"><div className="loading-card">Einstellungen werden geladen …</div></main>

  return (
    <main id="main-content" className="screen page-screen settings-screen">
      <header className="page-heading">
        <p className="eyebrow">So passt Talora zu dir</p>
        <h1>Einstellungen</h1>
        <p>Änderungen werden sofort und getrennt von deinem Abenteuer gespeichert.</p>
      </header>

      <section className="settings-card" aria-labelledby="reading-settings">
        <div className="setting-intro"><span aria-hidden="true">Aa</span><div><h2 id="reading-settings">Lesen</h2><p>Wähle eine angenehme Darstellung für alle Texte.</p></div></div>
        <fieldset className="segmented-field">
          <legend>Textgrösse</legend>
          {([
            ['normal', 'Normal'],
            ['gross', 'Gross'],
            ['sehr-gross', 'Sehr gross']
          ] as const).map(([value, label]) => (
            <label key={value}><input type="radio" name="text-size" value={value} checked={settings.textSize === value} onChange={() => updateSettings({ textSize: value as TextSize })} /><span>{label}</span></label>
          ))}
        </fieldset>
        <label className="switch-row">
          <span><strong>Hoher Kontrast</strong><small>Kräftigere Kanten und weniger transparente Flächen</small></span>
          <input type="checkbox" role="switch" checked={settings.highContrast} onChange={(event) => updateSettings({ highContrast: event.target.checked })} />
        </label>
      </section>

      <section className="settings-card" aria-labelledby="comfort-settings">
        <div className="setting-intro"><span aria-hidden="true">◌</span><div><h2 id="comfort-settings">Ruhe</h2><p>Alle Klangrätsel zeigen ihre Folge auch als sichtbare Symbole.</p></div></div>
        <label className="switch-row">
          <span><strong>Bewegung reduzieren</strong><small>Schaltet dekorative Animationen aus</small></span>
          <input type="checkbox" role="switch" checked={settings.reducedMotion} onChange={(event) => updateSettings({ reducedMotion: event.target.checked })} />
        </label>
      </section>

      <section className="settings-card storage-card" aria-labelledby="storage-settings">
        <div className="setting-intro"><span aria-hidden="true">▣</span><div><h2 id="storage-settings">Abenteuer verwalten</h2><p>Spielstände bleiben lokal in diesem Browser.</p></div></div>
        {game ? (
          <div className="save-summary"><span className="save-avatar" aria-hidden="true">✦</span><div><strong>{game.playerName}</strong><small>{campaignWorld.areas.find((area) => area.id === game.currentAreaId)?.name} · Runde {game.turn}</small></div></div>
        ) : (
          <p className="muted-copy">{adventureStatus === 'invalid' ? 'Der gespeicherte Spielstand ist beschädigt und bleibt unangetastet, bis du ihn zurücksetzt.' : 'Noch kein gültiges Abenteuer gespeichert.'}</p>
        )}

        <div className="storage-actions">
          <button className="button button--secondary" disabled={!game} onClick={() => game && downloadSave(game)}>Spielstand exportieren</button>
          <label className="button button--secondary file-button">
            Spielstand importieren
            <input ref={fileInput} disabled={busy} type="file" accept="application/json,.json" onChange={(event) => void selectImport(event)} />
          </label>
          {(game || adventureStatus === 'invalid' || adventureStatus === 'error') && (
            <button className="button button--danger-quiet" disabled={busy} onClick={() => { ++importSelection.current; setPendingImport(null); setShowReset(true) }}>Abenteuer zurücksetzen</button>
          )}
        </div>

        {importError && <p className="inline-error" role="alert">{importError}</p>}
        {pendingImport && (
          <div className="confirm-card" role="alertdialog" aria-labelledby="import-title">
            <h3 id="import-title">Spielstand importieren?</h3>
            <p>Das Abenteuer von <strong>{pendingImport.playerName}</strong> ersetzt den aktuellen Spielstand. Die Datei wurde geprüft.</p>
            <div className="button-row">
              <button className="button button--primary" disabled={busy} onClick={() => void confirmImport()}>{busy ? 'Importiert …' : 'Import bestätigen'}</button>
              <button className="button button--quiet" disabled={busy} onClick={() => setPendingImport(null)}>Abbrechen</button>
            </div>
          </div>
        )}

        {showReset && (
          <div className="confirm-card confirm-card--danger" role="alertdialog" aria-labelledby="reset-title">
            <h3 id="reset-title">Abenteuer endgültig zurücksetzen?</h3>
            <p>Der lokale Spielstand wird gelöscht. Diese Aktion kann nur mit einer vorher exportierten Datei rückgängig gemacht werden.</p>
            <div className="button-row">
              <button className="button button--danger" disabled={busy} onClick={() => void confirmReset()}>{busy ? 'Löscht …' : 'Jetzt löschen'}</button>
              <button className="button button--quiet" disabled={busy} onClick={() => setShowReset(false)}>Abbrechen</button>
            </div>
          </div>
        )}
      </section>

      <p className="privacy-note">ReadingDungeon verwendet kein Konto, keine Werbung und keine Online-Rangliste. Exportdateien enthalten nur deinen Spielstand.</p>
    </main>
  )
}
