import { useEffect, useRef } from 'react'
import type { WorldDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'
import type { GameAction } from '../engine/actions'
import { getCombatView } from '../engine/combat'

interface CombatPanelProps {
  game: GameSave
  world: WorldDefinition
  onAction(action: GameAction): void
  onOpenInventory(): void
}

export function CombatPanel({ game, world, onAction, onOpenInventory }: CombatPanelProps) {
  const view = getCombatView(game, world)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const defeated = game.player.life === 0
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' })
  }, [game.activeCombat?.encounterId, defeated])
  if (!view || !game.activeCombat) {
    return <p className="inline-error">Dieser Kampf kann nicht geladen werden. Kehre über die Einstellungen zu einem früheren Spielstand zurück.</p>
  }
  const combat = game.activeCombat
  const enemyPercent = Math.round((combat.enemyLife / combat.enemyMaxLife) * 100)
  const playerPercent = Math.round((game.player.life / game.player.maxLife) * 100)

  if (game.player.life === 0) {
    return (
      <section className="combat-panel combat-panel--defeat" aria-labelledby="combat-title">
        <p className="eyebrow">Rettung</p>
        <h2 id="combat-title" ref={headingRef} tabIndex={-1}>Kuno holt Hilfe</h2>
        <p>Du bist erschöpft, aber nichts aus deinem Inventar oder deinen Entdeckungen geht bei der Rettung verloren. Bereits benutzte Heilmittel bleiben verbraucht; am Rastplatz bekommst du frisches Apfelbrot.</p>
        <button className="button button--primary combat-rescue" onClick={() => onAction({ type: 'RESPAWN' })}>
          Zum letzten sicheren Ort
        </button>
      </section>
    )
  }

  return (
    <section className="combat-panel" aria-labelledby="combat-title">
      <header className="combat-heading">
        <div>
          <p className="eyebrow">{view.enemy.kind === 'boss' ? `Boss · Phase ${combat.phase}` : `Kampf · Runde ${combat.round}`}</p>
          <h2 id="combat-title" ref={headingRef} tabIndex={-1}>{view.enemy.name}</h2>
        </div>
        <span className={`combat-stance combat-stance--${combat.enemyStance}`}>
          {combat.enemyStance === 'vulnerable'
            ? view.enemy.kind === 'boss' ? 'Riss offen' : 'Ungeschützt'
            : view.enemy.airborne ? 'In der Luft – unerreichbar' : combat.enemyStance === 'guarded' ? 'Geschützt' : 'Bereit'}
        </span>
      </header>

      {combat.entryMode === 'early-boss' && (
        <div className="boss-warning" role="note">
          <strong>Deine Waffe reicht nicht aus.</strong>
          <p>Der Grauschleier lässt nur die ausgerüstete Morgenklinge hindurch. Der Rückweg bleibt garantiert offen.</p>
        </div>
      )}

      {combat.placedSealItemIds.length > 0 && (
        <p className="seal-progress" aria-label={`${combat.placedSealItemIds.length} von 3 Siegellichtern gesetzt`}>
          Siegellichter: {combat.placedSealItemIds.map((id) => world.items.find((item) => item.id === id)?.name ?? id).join(' · ')}
        </p>
      )}

      {combat.effects.length > 0 && <p className="combat-effects">{combat.effects.map((effect) => `${effect.id === 'blitzschutz' ? 'Blitzschutz' : effect.id === 'grauschleier' ? 'Grauschleier: Angriff −1' : 'Trefferfenster: Schaden +2'} (${effect.remainingEnemyTurns})`).join(' · ')}</p>}

      <div className="combat-health">
        <div>
          <span><strong>{view.enemy.name}</strong><b>{combat.enemyLife}/{combat.enemyMaxLife}</b></span>
          <progress aria-label={`${view.enemy.name}: ${combat.enemyLife} von ${combat.enemyMaxLife} Leben`} max={combat.enemyMaxLife} value={combat.enemyLife} />
          <small>{enemyPercent}% Leben</small>
        </div>
        <div>
          <span><strong>{game.playerName}</strong><b>{game.player.life}/{game.player.maxLife}</b></span>
          <progress className="player-health" aria-label={`${game.playerName}: ${game.player.life} von ${game.player.maxLife} Leben`} max={game.player.maxLife} value={game.player.life} />
          <small>{playerPercent}% Leben</small>
        </div>
      </div>

      {!combat.pendingSealItemId && !combat.awaitingFinalPromise && (
        <article className={`enemy-intent enemy-intent--${view.move.kind}`} aria-live="polite" aria-atomic="true">
          <span aria-hidden="true">{view.move.icon}</span>
          <div>
            <p>Nächste Bewegung</p>
            <h3>{view.move.name}</h3>
            <p>{view.move.telegraph}</p>
          </div>
        </article>
      )}

      {combat.pendingSealItemId ? (
        <div className="final-action" role="status">
          <p>Der Schattenriss bleibt offen. Diese Aktion ist sicher und löst keinen Gegentreffer aus.</p>
          <button className="button button--primary" onClick={() => onAction({ type: 'PLACE_SEAL', itemId: combat.pendingSealItemId! })}>
            Setze das {world.items.find((item) => item.id === combat.pendingSealItemId)?.name ?? 'Siegel'}
          </button>
        </div>
      ) : combat.awaitingFinalPromise ? (
        <div className="final-action" role="status">
          <p>Alle drei Siegellichter leuchten. Die Morgenklinge wartet über dem Bannschloss.</p>
          <p>«Finde den Weg. Kehre zurück. Geh nicht allein.»</p>
          <button className="button button--primary" onClick={() => onAction({ type: 'SPEAK_PROMISE' })}>
            Sprich Alvas Versprechen
          </button>
        </div>
      ) : <div className="combat-actions" aria-label="Kampfaktionen">
        <button className="combat-action combat-action--attack" onClick={() => onAction({ type: 'ATTACK' })}>
          <span aria-hidden="true">⚔</span><strong>Angreifen</strong><small>Mit der ausgerüsteten Waffe</small>
        </button>
        <button className="combat-action combat-action--defend" onClick={() => onAction({ type: 'DEFEND' })}>
          <span aria-hidden="true">◈</span><strong>Verteidigen</strong><small>Schaden halbieren, schwere Treffer abfangen</small>
        </button>
        <button className="combat-action" onClick={onOpenInventory}>
          <span aria-hidden="true">♥</span><strong>Gegenstand</strong><small>Heilmittel aus dem Inventar nutzen</small>
        </button>
        <button
          className="combat-action combat-action--flee"
          aria-disabled={!combat.canFlee}
          onClick={() => combat.canFlee && onAction({ type: 'FLEE' })}
        >
          <span aria-hidden="true">↩</span>
          <strong>{combat.entryMode === 'early-boss' ? 'Zieh dich zurück, solange du den Weg kennst' : 'Fliehen'}</strong>
          <small>{combat.canFlee ? 'Kampf verlassen' : 'Nach dem ersten Treffer ist der Rückweg geschlossen'}</small>
        </button>
      </div>}
      <div className="event-result" role="status" aria-live="polite" aria-atomic="true">
        <span aria-hidden="true">✦</span><p>{game.recentEvents.at(-1)?.text}</p>
      </div>
    </section>
  )
}
