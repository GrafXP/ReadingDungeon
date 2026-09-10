import { useEffect, useRef } from 'react'
import type { WorldDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'
import type { GameAction } from '../engine/actions'
import { getCombatView } from '../engine/combat'
import { getEnemyKnowledge } from '../engine/bestiary'
import { DAMAGE_TYPE_ICONS, DAMAGE_TYPE_LABELS } from '../engine/damage'

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
  const combatant = view.combatant
  const knowledge = getEnemyKnowledge(game, view.enemy)
  const weaponItem = world.items.find((item) => item.id === game.player.equippedWeaponId)
  const armorItem = world.items.find((item) => item.id === game.player.equippedArmorId)
  const talismanItem = world.items.find((item) => item.id === game.player.equippedTalismanId)
  const weaponMode = weaponItem?.weapon?.elemental && 'choices' in weaponItem.weapon.elemental
    ? game.player.weaponElementModes[weaponItem.id] ?? weaponItem.weapon.elemental.choices[0]
    : weaponItem?.weapon?.elemental && 'type' in weaponItem.weapon.elemental ? weaponItem.weapon.elemental.type : weaponItem?.weapon?.damageType
  const skill = weaponItem?.weapon?.skill
  const enemyPercent = Math.round((combatant.life / combatant.maxLife) * 100)
  const playerPercent = Math.round((game.player.life / game.player.maxLife) * 100)

  if (game.player.life === 0) {
    return (
      <section className="combat-panel combat-panel--defeat" aria-labelledby="combat-title">
        <p className="eyebrow">Rettung</p>
        <h2 id="combat-title" ref={headingRef} tabIndex={-1}>Hilfe ist unterwegs</h2>
        <p>Du bist erschöpft, aber nichts aus deinem Inventar oder deinen Entdeckungen geht bei der Rettung verloren. Bereits benutzte Heilmittel bleiben verbraucht; am Rastplatz wird dein Grundvorrat ergänzt.</p>
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
          <p className="eyebrow">{view.enemy.kind === 'boss' ? `Boss · Phase ${combatant.phase}` : `Kampf · Runde ${combat.round}`}</p>
          <h2 id="combat-title" ref={headingRef} tabIndex={-1}>{view.enemy.name}</h2>
        </div>
        <span className={`combat-stance combat-stance--${combatant.stance}`}>
          {combatant.stance === 'vulnerable'
            ? view.enemy.kind === 'boss' ? 'Riss offen' : 'Ungeschützt'
            : view.enemy.airborne ? 'In der Luft – unerreichbar' : combatant.stance === 'guarded' ? 'Geschützt' : 'Bereit'}
        </span>
      </header>

      {combat.placedSealItemIds.length > 0 && (
        <p className="seal-progress" aria-label={`${combat.placedSealItemIds.length} von ${Object.keys(view.enemy.phaseSealItemIds ?? {}).length} Phasenzeichen gesetzt`}>
          Siegellichter: {combat.placedSealItemIds.map((id) => world.items.find((item) => item.id === id)?.name ?? id).join(' · ')}
        </p>
      )}

      <p className="combat-equipment" aria-label="Ausgerüstete Gegenstände">
        <span>⚔ {weaponItem?.name ?? 'Keine Waffe'}{weaponMode ? ` · ${DAMAGE_TYPE_ICONS[weaponMode]} ${DAMAGE_TYPE_LABELS[weaponMode]}` : ''}</span>
        <span>◈ {armorItem?.name ?? 'Keine Rüstung'}</span>
        <span>◇ {talismanItem?.name ?? 'Kein Talisman'}</span>
      </p>

      <div className="enemy-knowledge">
        <p><strong>Schwach gegen:</strong> {knowledge.weaknesses}</p>
        {!knowledge.studied && <button className="button button--quiet" onClick={() => onAction({ type: 'STUDY_ENEMY', enemyId: view.enemy.id })}>Beobachten</button>}
      </div>

      {[...combat.playerEffects, ...combatant.effects].length > 0 && <p className="combat-effects">{[...combat.playerEffects, ...combatant.effects].map((effect) => `${world.statusEffects?.find((entry) => entry.id === effect.id)?.name ?? effect.id} (${effect.remainingEnemyTurns})`).join(' · ')}</p>}

      <div className="combat-health">
        <div>
          <span><strong>{view.enemy.name}</strong><b>{combatant.life}/{combatant.maxLife}</b></span>
          <progress aria-label={`${view.enemy.name}: ${combatant.life} von ${combatant.maxLife} Leben`} max={combatant.maxLife} value={combatant.life} />
          <small>{enemyPercent}% Leben</small>
        </div>
        <div>
          <span><strong>{game.playerName}</strong><b>{game.player.life}/{game.player.maxLife}</b></span>
          <progress className="player-health" aria-label={`${game.playerName}: ${game.player.life} von ${game.player.maxLife} Leben`} max={game.player.maxLife} value={game.player.life} />
          <small>{playerPercent}% Leben</small>
        </div>
      </div>

      {!combat.pendingSealItemId && !combat.awaitingFinalAction && (
        <article className={`enemy-intent enemy-intent--${view.move.kind}`} aria-live="polite" aria-atomic="true">
          <span aria-hidden="true">{view.move.icon}</span>
          <div>
            <p>Nächste Bewegung</p>
            <h3>{view.move.name}</h3>
            <p>{view.move.telegraph}</p>
          </div>
        </article>
      )}

      {combat.combatants.length > 1 && <div className="combat-targets" aria-label="Kampfziel">
        {combat.combatants.map((entry, index) => <button
          key={`${entry.enemyId}:${index}`}
          aria-pressed={combat.targetIndex === index}
          disabled={entry.life === 0}
          onClick={() => onAction({ type: 'SET_TARGET', targetIndex: index })}
        >{world.enemies.find((enemy) => enemy.id === entry.enemyId)?.name ?? entry.enemyId}</button>)}
      </div>}

      {combat.pendingSealItemId ? (
        <div className="final-action" role="status">
          <p>Der Schattenriss bleibt offen. Diese Aktion ist sicher und löst keinen Gegentreffer aus.</p>
          <button className="button button--primary" onClick={() => onAction({ type: 'PLACE_SEAL', itemId: combat.pendingSealItemId! })}>
            Setze das {world.items.find((item) => item.id === combat.pendingSealItemId)?.name ?? 'Siegel'}
          </button>
        </div>
      ) : combat.awaitingFinalAction ? (
        <div className="final-action" role="status">
          <p>{view.enemy.finalAction?.prompt ?? 'Die letzte sichere Aktion ist bereit.'}</p>
          <button className="button button--primary" onClick={() => onAction({ type: 'COMPLETE_FINAL_ACTION' })}>
            {view.enemy.finalAction?.label ?? 'Kampf abschliessen'}
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
          className="combat-action combat-action--skill"
          aria-disabled={!skill || combat.skillCooldown > 0}
          onClick={() => skill && combat.skillCooldown === 0 && onAction({ type: 'USE_SKILL' })}
        >
          <span aria-hidden="true">✦</span>
          <strong>{skill?.name ?? 'Waffenkunst'}</strong>
          <small>{!skill ? 'Diese Waffe hat keine Waffenkunst' : combat.skillCooldown > 0 ? `Bereit in ${combat.skillCooldown} ${combat.skillCooldown === 1 ? 'Runde' : 'Runden'}` : skill.description}</small>
        </button>
        <button
          className="combat-action combat-action--flee"
          aria-disabled={!combat.canFlee}
          onClick={() => combat.canFlee && onAction({ type: 'FLEE' })}
        >
          <span aria-hidden="true">↩</span>
          <strong>Fliehen</strong>
          <small>{combat.canFlee ? 'Kampf verlassen' : 'Nach dem ersten Treffer ist der Rückweg geschlossen'}</small>
        </button>
      </div>}
      <div className="event-result" role="status" aria-live="polite" aria-atomic="true">
        <span aria-hidden="true">✦</span><p>{game.recentEvents.at(-1)?.text}</p>
      </div>
    </section>
  )
}
