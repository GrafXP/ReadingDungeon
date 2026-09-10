import { useLayoutEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppState } from '../app/AppState'
import { activeWorld } from '../content/world'

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link nav-link--active' : 'nav-link'
}

export function AppLayout() {
  const { adventureStatus, game, saveStatus } = useAppState()
  const { pathname } = useLocation()
  const chromeRef = useRef<HTMLDivElement>(null)
  const hasAdventure = adventureStatus === 'ready' && game
  useLayoutEffect(() => {
    const heading = document.querySelector<HTMLElement>('#main-content h1')
    if (!heading) return
    heading.tabIndex = -1
    heading.focus({ preventScroll: true })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, game?.currentAreaId])
  const weaponName = game?.player.equippedWeaponId
    ? activeWorld.items.find((item) => item.id === game.player.equippedWeaponId)?.name ?? 'Unbekannt'
    : 'Keine Waffe'

  // The pinned header grows with the text size setting; its height is published as a
  // variable for anything that sticks below it, such as the map zoom bar.
  useLayoutEffect(() => {
    const chrome = chromeRef.current
    if (!chrome) return
    const measure = () => {
      const height = chrome.getBoundingClientRect().height
      if (height) document.documentElement.style.setProperty('--chrome-height', `${Math.round(height)}px`)
    }
    measure()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(chrome)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="app-chrome" ref={chromeRef}>
        <header className="app-header">
          <NavLink to="/" className="brand" aria-label="ReadingDungeon – Startseite">
            <span className="brand-mark" aria-hidden="true">✦</span>
            <span>ReadingDungeon</span>
          </NavLink>
          {hasAdventure && (
            <div className="quick-status" aria-label="Abenteuerstatus">
              <span
                className={`life-status${game.player.life <= game.player.maxLife / 4 ? ' life-status--low' : ''}`}
                title="Lebenspunkte"
                aria-label={`${game.player.life} von ${game.player.maxLife} Lebenspunkten`}
              >
                <span aria-hidden="true">♥</span> {game.player.life}/{game.player.maxLife}
              </span>
              <span className="weapon-status"><span aria-hidden="true">⚔</span> {weaponName}</span>
              <span className={`save-state save-state--${saveStatus}`} aria-live="polite">
                {saveStatus === 'saving' ? 'Speichert …' : saveStatus === 'error' ? 'Nicht gespeichert' : 'Gespeichert'}
              </span>
            </div>
          )}
        </header>

        <nav className="main-nav" aria-label="Hauptnavigation">
          {hasAdventure && <NavLink to="/spiel" className={navClass}>Abenteuer</NavLink>}
          {hasAdventure && <NavLink to="/karte" className={navClass}>Karte</NavLink>}
          {hasAdventure && <NavLink to="/aufgaben" className={navClass}>Aufgaben</NavLink>}
          {hasAdventure && <NavLink to="/merkliste" className={navClass}>Merkliste</NavLink>}
          {hasAdventure && <NavLink to="/tagebuch" className={navClass}>Tagebuch</NavLink>}
          {hasAdventure && <NavLink to="/register" className={navClass}>Register</NavLink>}
          {hasAdventure && <NavLink to="/sammlung" className={navClass}>Sammlung</NavLink>}
          <NavLink to="/einstellungen" className={navClass}>Einstellungen</NavLink>
        </nav>
      </div>
      <Outlet />
    </>
  )
}
