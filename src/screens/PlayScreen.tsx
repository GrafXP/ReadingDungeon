import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppState } from '../app/AppState'
import { InventoryDialog } from '../components/InventoryDialog'
import { CombatPanel } from '../components/CombatPanel'
import { PuzzlePanel } from '../components/PuzzlePanel'
import { activeWorld } from '../content/world'
import { getAvailableActions, isInteractionComplete } from '../engine/actions'
import { reduceGame } from '../engine/reducer'
import { evaluateRequirement } from '../engine/requirements'
import {
  getAreaDescription,
  getCurrentArea,
  getInventoryItems,
  getLastEventText
} from '../engine/selectors'

export function PlayScreen() {
  const { game, updateAdventure } = useAppState()
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const inventoryButtonRef = useRef<HTMLButtonElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const previousGameRef = useRef(game)
  const showResult = () => {
    resultRef.current?.focus({ preventScroll: true })
    resultRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }
  useEffect(() => {
    const previous = previousGameRef.current
    previousGameRef.current = game
    if (previous?.activeCombat && !game?.activeCombat && previous.currentAreaId === game?.currentAreaId) showResult()
  }, [game])
  const view = useMemo(() => {
    if (!game) return null
    const area = getCurrentArea(game, activeWorld)
    return {
      area,
      description: getAreaDescription(game, area),
      actions: getAvailableActions(game, activeWorld),
      inventory: getInventoryItems(game, activeWorld),
      lastEvent: getLastEventText(game)
    }
  }, [game])

  if (!game || !view) return null
  const campaignCompleted = evaluateRequirement(activeWorld.completionRequirement, game).met
  const sanctuaryOpen = view.area.safe && evaluateRequirement(view.area.sanctuaryRequirement, game).met
  const areaInspected = game.flags.includes(`area_untersucht:${view.area.id}`)

  return (
    <main id="main-content" className="screen play-screen">
      <section className={`atmosphere-panel atmosphere-panel--${view.area.regionId}${game.activeCombat ? ' atmosphere-panel--combat' : ''}`} aria-label={`${view.area.name} in ${view.area.regionName}`}>
        <div className="sun" aria-hidden="true" />
        <div className="hills hills--back" aria-hidden="true" />
        <div className="hills hills--front" aria-hidden="true" />
        <div className="region-landmark" aria-hidden="true"><i /><b /><span /></div>
        <div className="atmosphere-info">
          <p>{view.area.regionName}</p>
          <strong>{sanctuaryOpen ? 'Sicherer Ort' : 'Erkundungsgebiet'}</strong>
        </div>
      </section>

      <article className="reading-card">
        <header className="location-heading">
          <div className="location-title">
            <p className="eyebrow">{view.area.regionName}</p>
            <h1>{view.area.name}</h1>
          </div>
          <div className="location-tools">
            {sanctuaryOpen && <span className="safe-badge"><span aria-hidden="true">⌂</span> Sicher</span>}
            <button ref={inventoryButtonRef} className="inventory-button" onClick={() => setInventoryOpen(true)}>
              <span aria-hidden="true">▦</span> Inventar
            </button>
          </div>
        </header>

        <p className="story-lead">{view.description}</p>

        {view.lastEvent && !game.activeCombat && (
          <div ref={resultRef} tabIndex={-1} className="event-result" role="status" aria-live="polite" aria-atomic="true">
            <span aria-hidden="true">✦</span>
            <p>{view.lastEvent}</p>
          </div>
        )}

        {campaignCompleted && (
          <section className="phase-note phase-note--success" aria-labelledby="phase-note-title">
            <h2 id="phase-note-title">Kampagne abgeschlossen</h2>
            <p>Die Hauptaufgabe ist erfüllt. Bereits geöffnete Wege bleiben erreichbar.</p>
          </section>
        )}

        {!game.activeCombat && <section className="carried-items" aria-labelledby="carried-title">
          <div>
            <h2 id="carried-title">Dabei</h2>
            <span>{view.inventory.length} Arten</span>
          </div>
          <ul>
            {view.inventory.map(({ item, quantity }) => (
              <li key={item.id} title={item.description}>
                <span aria-hidden="true">{item.kind === 'key' ? '◆' : item.kind === 'tool' ? '⌁' : item.kind === 'quest' ? '✦' : '•'}</span>
                {item.name}{quantity > 1 ? ` × ${quantity}` : ''}
              </li>
            ))}
          </ul>
        </section>}

        {!game.activeCombat && areaInspected && activeWorld.puzzles?.filter((puzzle) => puzzle.areaId === game.currentAreaId && !isInteractionComplete(activeWorld.interactions.find((entry) => entry.id === puzzle.interactionId)!, game)).map((puzzle) => (
          <PuzzlePanel key={puzzle.id} game={game} puzzle={puzzle} onAction={(action) => updateAdventure((current) => reduceGame(current, action, activeWorld))} />
        ))}

        {game.activeCombat ? (
          <CombatPanel
            game={game}
            world={activeWorld}
            onOpenInventory={() => setInventoryOpen(true)}
            onAction={(action) => updateAdventure((current) => reduceGame(current, action, activeWorld))}
          />
        ) : (
          <section className="actions-section" aria-labelledby="actions-title">
            <h2 id="actions-title">{areaInspected ? 'Was möchtest du tun?' : 'Schau dich zuerst um'}</h2>
            <div className="action-grid">
              {view.actions.map((action) => (
                <button
                  key={action.id}
                  data-action-id={action.id}
                  className={`action-card action-card--${action.kind}`}
                  aria-disabled={action.disabled}
                  onClick={() => {
                    if (!action.disabled) {
                      updateAdventure((current) => reduceGame(current, action.gameAction, activeWorld))
                      if (action.kind === 'inspect' || action.kind === 'interaction') requestAnimationFrame(showResult)
                    }
                  }}
                >
                  <span className="action-icon" aria-hidden="true">{action.icon}</span>
                  <strong>{action.label}</strong>
                  <small className={action.disabled ? 'blocked-reason' : undefined}>
                    {action.disabled ? action.blockedReason : action.description}
                  </small>
                </button>
              ))}
            </div>
          </section>
        )}

        {game.recentEvents.length > 1 && (
          <details className="travel-log">
            <summary>Letzte Ereignisse</summary>
            <ol>
              {game.recentEvents.slice(-5).reverse().map((event) => <li key={event.id}>{event.text}</li>)}
            </ol>
          </details>
        )}
      </article>
      {inventoryOpen && (
        <InventoryDialog
          game={game}
          world={activeWorld}
          returnFocusRef={inventoryButtonRef}
          onClose={() => setInventoryOpen(false)}
          onAction={(action) => {
            updateAdventure((current) => reduceGame(current, action, activeWorld))
            if (action.type === 'USE_ITEM' && game.activeCombat) setInventoryOpen(false)
          }}
        />
      )}
    </main>
  )
}
