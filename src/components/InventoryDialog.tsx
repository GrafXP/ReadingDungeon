import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { GameSave } from '../domain/game'
import type { WorldDefinition } from '../domain/content'
import { getInventoryActions } from '../engine/actions'
import { getInventoryItems } from '../engine/selectors'
import { getCombatView } from '../engine/combat'

interface InventoryDialogProps {
  game: GameSave
  world: WorldDefinition
  returnFocusRef: RefObject<HTMLButtonElement | null>
  onAction(action: ReturnType<typeof getInventoryActions>[number]['gameAction']): void
  onClose(): void
}

const KIND_LABELS = {
  weapon: 'Waffe',
  healing: 'Heilung',
  key: 'Schlüssel',
  tool: 'Werkzeug',
  quest: 'Wichtiger Gegenstand'
} as const

export function InventoryDialog({ game, world, returnFocusRef, onAction, onClose }: InventoryDialogProps) {
  const inventory = useMemo(() => getInventoryItems(game, world), [game, world])
  const [selectedId, setSelectedId] = useState(() => game.player.equippedWeaponId ?? inventory[0]?.item.id ?? '')
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const selectedEntry = inventory.find((entry) => entry.item.id === selectedId) ?? inventory[0]

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : returnFocusRef.current
    const previousOverflow = document.body.style.overflow
    const appRoot = document.getElementById('root')
    const previousInert = appRoot?.inert ?? false
    if (appRoot) appRoot.inert = true
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      if (appRoot) appRoot.inert = previousInert
      if (opener?.isConnected) opener.focus()
      else returnFocusRef.current?.focus()
    }
  }, [returnFocusRef])

  useEffect(() => {
    if (!inventory.some((entry) => entry.item.id === selectedId)) {
      setSelectedId(inventory[0]?.item.id ?? '')
    }
  }, [inventory, selectedId])

  const handleKeys = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled])')]
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const actions = selectedEntry ? getInventoryActions(game, selectedEntry.item) : []
  const combatView = getCombatView(game, world)

  return createPortal(
    <div className="inventory-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        ref={panelRef}
        className="inventory-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-title"
        onKeyDown={handleKeys}
      >
        <header className="inventory-heading">
          <div><p className="eyebrow">Deine Ausrüstung</p><h2 id="inventory-title">Inventar</h2></div>
          <button ref={closeButtonRef} className="dialog-close" onClick={onClose} aria-label="Inventar schliessen">×</button>
        </header>

        <div className="inventory-content">
          <nav className="item-list" aria-label="Gegenstände">
            {inventory.map(({ item, quantity }) => (
              <button
                key={item.id}
                className={item.id === selectedEntry?.item.id ? 'item-list-button item-list-button--selected' : 'item-list-button'}
                onClick={() => setSelectedId(item.id)}
                aria-pressed={item.id === selectedEntry?.item.id}
                aria-label={`${item.name} untersuchen, ${KIND_LABELS[item.kind]}`}
              >
                <span className={`item-glyph item-glyph--${item.kind}`} aria-hidden="true">
                  {item.kind === 'weapon' ? '⚔' : item.kind === 'healing' ? '♥' : item.kind === 'key' ? '◆' : item.kind === 'tool' ? '⌁' : '✦'}
                </span>
                <span><strong>{item.name}</strong><small>{KIND_LABELS[item.kind]} · Untersuchen</small></span>
                {quantity > 1 && <b aria-label={`Anzahl ${quantity}`}>{quantity}</b>}
              </button>
            ))}
          </nav>

          {selectedEntry && (
            <article className="item-details" aria-live="polite">
              <div className={`item-illustration item-illustration--${selectedEntry.item.kind}`} aria-hidden="true">
                {selectedEntry.item.kind === 'weapon' ? '⚔' : selectedEntry.item.kind === 'healing' ? '♥' : selectedEntry.item.kind === 'key' ? '◆' : selectedEntry.item.kind === 'tool' ? '⌁' : '✦'}
              </div>
              <p className="item-kind">{KIND_LABELS[selectedEntry.item.kind]}</p>
              <h3>{selectedEntry.item.name}</h3>
              {game.player.equippedWeaponId === selectedEntry.item.id && <span className="equipped-badge">Ausgerüstet</span>}
              <p>{selectedEntry.item.description}</p>

              {selectedEntry.item.weapon && (
                <dl className="item-stats">
                  <div><dt>Schaden</dt><dd>{selectedEntry.item.weapon.minDamage}–{selectedEntry.item.weapon.maxDamage}</dd></div>
                  <div><dt>Eigenschaft</dt><dd>{selectedEntry.item.weapon.trait}</dd></div>
                </dl>
              )}
              {selectedEntry.item.healing && (
                <dl className="item-stats">
                  <div><dt>Heilung</dt><dd>+{selectedEntry.item.healing.lifeRestored} Leben</dd></div>
                  <div><dt>Vorrat</dt><dd>{selectedEntry.quantity}</dd></div>
                  {selectedEntry.item.healing.extraEffect && <div><dt>Zusatzwirkung</dt><dd>{selectedEntry.item.healing.extraEffect}</dd></div>}
                </dl>
              )}

              <div className="item-actions">
                {combatView && selectedEntry.item.healing && !game.activeCombat?.pendingSealItemId && !game.activeCombat?.awaitingFinalPromise && (
                  <p className="action-reason">
                    Benutzen kostet einen Kampfzug. Danach folgt «{combatView.move.name}».
                    {combatView.move.kind === 'heavy' && ' Ein schwerer Angriff steht bevor. Verteidige dich zuerst und heile bei einer ruhigeren Bewegung.'}
                  </p>
                )}
                {actions.map((action) => (
                  <div key={action.id}>
                    <button
                      className="button button--primary"
                      aria-disabled={action.disabled}
                      onClick={() => !action.disabled && onAction(action.gameAction)}
                    >
                      {action.label}
                    </button>
                    {action.reason && <p className="action-reason">{action.reason}</p>}
                  </div>
                ))}
                {actions.length === 0 && <p className="protected-item-note">Dieser Gegenstand kann nicht versehentlich verbraucht oder weggeworfen werden.</p>}
              </div>
            </article>
          )}
        </div>
      </section>
    </div>, document.body
  )
}
