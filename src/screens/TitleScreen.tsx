import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState } from '../app/AppState'
import { phase2World } from '../content/world'

export function TitleScreen() {
  const { adventureStatus, game, loadError, startAdventure, resetAdventure } = useAppState()
  const [name, setName] = useState('')
  const [showNewGame, setShowNewGame] = useState(false)
  const [starting, setStarting] = useState(false)
  const navigate = useNavigate()

  const handleStart = async (event: FormEvent) => {
    event.preventDefault()
    if (starting || !name.trim()) return
    setShowNewGame(false)
    setStarting(true)
    const saved = await startAdventure(name)
    setStarting(false)
    if (saved) navigate('/spiel')
  }

  const abandonAndShowForm = async () => {
    const reset = await resetAdventure()
    if (reset) setShowNewGame(true)
  }

  const showForm = adventureStatus === 'empty' || showNewGame
  const savedAreaName = game ? phase2World.areas.find((area) => area.id === game.currentAreaId)?.name ?? 'Talora' : ''

  return (
    <main id="main-content" className="title-screen">
      <div className="sky-glow" aria-hidden="true" />
      <section className="title-hero" aria-labelledby="game-title">
        <div className="compass-emblem" aria-hidden="true">
          <span>N</span><i /><b>✦</b>
        </div>
        <p className="eyebrow">Ein Abenteuer in Talora</p>
        <h1 id="game-title">Die Morgenklinge</h1>
        <p className="title-subtitle">Farben verblassen. Wege verlieren ihre Namen. Und ein kleiner Kompass hat sehr viel zu sagen.</p>

        <div className="title-actions">
          {adventureStatus === 'loading' && <p className="loading-card" role="status">Spielstand wird gesucht …</p>}

          {adventureStatus === 'ready' && game && !showNewGame && (
            <>
              <Link className="button button--primary button--wide" to="/spiel">
                Abenteuer fortsetzen
                <small>{game.playerName} · {savedAreaName}</small>
              </Link>
              <button className="button button--quiet" onClick={() => setShowNewGame(true)}>Neues Abenteuer</button>
            </>
          )}

          {adventureStatus === 'ready' && game && showNewGame && (
            <div className="confirm-card" role="alertdialog" aria-labelledby="new-game-title">
              <h2 id="new-game-title">Wirklich neu beginnen?</h2>
              <p>Der Spielstand von {game.playerName} wird gelöscht. Die Einstellungen bleiben erhalten.</p>
              <div className="button-row">
                <button className="button button--danger" onClick={() => void abandonAndShowForm()}>Spielstand löschen</button>
                <button className="button button--quiet" onClick={() => setShowNewGame(false)}>Abbrechen</button>
              </div>
            </div>
          )}

          {showForm && adventureStatus === 'empty' && (
            <form className="name-form" onSubmit={handleStart}>
              <label htmlFor="player-name">Wie heisst du?</label>
              <div className="name-entry">
                <input
                  id="player-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={30}
                  autoComplete="nickname"
                  autoFocus
                  required
                />
                <button className="button button--primary" disabled={starting || !name.trim()}>
                  {starting ? 'Startet …' : 'Abenteuer starten'}
                </button>
              </div>
            </form>
          )}

          {(adventureStatus === 'invalid' || adventureStatus === 'error') && (
            <div className="load-error" role="alert">
              <h2>Dein Spielstand braucht Hilfe</h2>
              <p>{loadError ?? 'Der lokale Speicher konnte nicht gelesen werden.'}</p>
              <p>Er wurde nicht überschrieben. In den Einstellungen kannst du ihn zurücksetzen.</p>
              <Link className="button button--secondary" to="/einstellungen">Speicherverwaltung öffnen</Link>
            </div>
          )}
        </div>

        <Link className="title-settings" to="/einstellungen">Einstellungen &amp; Zugänglichkeit</Link>
      </section>
      <footer className="title-footer">Lokal gespeichert · Offline spielbar · Ohne Konto</footer>
    </main>
  )
}
