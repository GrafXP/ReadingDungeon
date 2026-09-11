import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppState } from '../app/AppState'
import { activeWorld } from '../content/world'
import { getMapAreaProgress } from '../engine/mapProgress'
import { getReminderGroups } from '../engine/reminders'
import { evaluateRequirement } from '../engine/requirements'
import { getConnectedKnownAreas, getKnownAreaIds } from '../engine/selectors'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.5
const DEFAULT_ZOOM = 3
const MAP_VIEW_BOX = { x: 20, y: 35, width: 1580, height: 740 }

export function MapScreen() {
  const { game } = useAppState()
  const [searchParams] = useSearchParams()
  const requestedHint = searchParams.get('hinweis')
  const requestedTarget = searchParams.get('ziel')
  const knownIds = new Set(game ? getKnownAreaIds(game, activeWorld) : [])
  const hintArea = game && game.discoveredClueIds.includes(`hinweis_ort:${requestedHint}`)
    ? activeWorld.areas.find((area) => area.id === requestedHint) : undefined
  const targetArea = game && requestedTarget && knownIds.has(requestedTarget)
    ? activeWorld.areas.find((area) => area.id === requestedTarget) : undefined
  const focusedArea = targetArea ?? hintArea
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const viewportRef = useRef<HTMLDivElement>(null)

  // Zoom around the middle of what is on screen, so the view does not jump.
  const changeZoom = (next: number) => {
    const target = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next * 100) / 100))
    const viewport = viewportRef.current
    if (!viewport || target === zoom) {
      setZoom(target)
      return
    }
    const ratio = target / zoom
    const centerX = viewport.scrollLeft + viewport.clientWidth / 2
    const centerY = viewport.scrollTop + viewport.clientHeight / 2
    setZoom(target)
    requestAnimationFrame(() => {
      viewport.scrollLeft = centerX * ratio - viewport.clientWidth / 2
      viewport.scrollTop = centerY * ratio - viewport.clientHeight / 2
    })
  }

  // The starting zoom only shows a section, so open the map centred on the current area.
  useEffect(() => {
    const viewport = viewportRef.current
    const area = focusedArea ?? activeWorld.areas.find((entry) => entry.id === game?.currentAreaId)
    if (!viewport || !area || !viewport.scrollWidth) return
    const scale = viewport.scrollWidth / MAP_VIEW_BOX.width
    viewport.scrollLeft = (area.mapPosition.x - MAP_VIEW_BOX.x) * scale - viewport.clientWidth / 2
    viewport.scrollTop = (area.mapPosition.y - MAP_VIEW_BOX.y) * scale - viewport.clientHeight / 2
  }, [game?.currentAreaId, focusedArea])

  if (!game) return null

  const knownAreas = activeWorld.areas.filter((area) => knownIds.has(area.id))
  const knownPassages = activeWorld.passages.filter((passage) => knownIds.has(passage.fromAreaId) && knownIds.has(passage.toAreaId))
  const isPassageBlocked = (passage: (typeof activeWorld.passages)[number]) => {
    const requirementBlocked = !evaluateRequirement(passage.requirement, game).met && !game.unlockedPassageIds.includes(passage.id)
    const guardBlocked = Boolean(passage.guardEncounterId && !game.defeatedEncounterIds.includes(passage.guardEncounterId))
    return requirementBlocked || guardBlocked
  }
  const blockedPassages = knownPassages.filter(isPassageBlocked)
  const progressByArea = new Map(knownAreas.map((area) => [area.id, getMapAreaProgress(game, activeWorld, area.id)]))
  const reminderAreaIds = new Set(getReminderGroups(game, activeWorld).flatMap((group) => group.steps.filter((step) => step.status !== 'done' && step.areaId).map((step) => step.areaId!)))
  const mapStats = {
    newAreas: [...progressByArea.values()].filter((progress) => progress.state === 'new').length,
    unfinished: [...progressByArea.values()].filter((progress) => progress.state === 'open' || progress.state === 'blocked').length,
    clear: [...progressByArea.values()].filter((progress) => progress.state === 'clear').length
  }

  return (
    <main id="main-content" className="screen page-screen map-screen">
      <header className="page-heading">
        <p className="eyebrow">Deine Entdeckungen</p>
        <h1>Karte von {activeWorld.presentation.fallbackPlaceName}</h1>
        <p>Sieh auf einen Blick, wo noch etwas offen ist, was dich aufhält und welche Orte du bereits erledigt hast.</p>
      </header>

      <section className="map-summary" aria-label="Kartenstand">
        <div><strong>{mapStats.unfinished}</strong><span>Orte mit offenen Dingen</span></div>
        <div><strong>{mapStats.newAreas}</strong><span>bekannt, noch unbesucht</span></div>
        <div><strong>{blockedPassages.length}</strong><span>gesperrte Wege</span></div>
        <div><strong>{mapStats.clear}</strong><span>derzeit erledigt</span></div>
      </section>

      <p>{focusedArea ? 'Die Karte startet beim ausgewählten Ziel.' : 'Die Karte startet nah bei deinem aktuellen Ort.'} Mit «Ganze Karte» siehst du die gesamte bekannte Welt; die Schrift bleibt beim Zoomen gleich gross. Die Karte lässt sich in alle Richtungen verschieben. Alle offenen Dinge und Sperren stehen auch in der Textliste darunter.</p>
      {hintArea && <p className="map-hint" role="status">Hinweis: Die Karte zeigt dir {hintArea.name}. Dieser Ort gilt erst als besucht, wenn du selbst dorthin reist.</p>}
      {targetArea && <p className="map-target-note" role="status">Merklistenziel: {targetArea.name} ist auf der Karte hervorgehoben.</p>}
      <section className="world-map" aria-labelledby="visual-map-title">
        <h2 id="visual-map-title" className="visually-hidden">Grafische Karte</h2>
        <div className="map-zoom" role="group" aria-label="Kartenzoom">
          <button type="button" onClick={() => changeZoom(zoom - ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Karte verkleinern">−</button>
          <span aria-live="polite">{zoom.toLocaleString('de-CH', { minimumFractionDigits: 1 })}×</span>
          <button type="button" onClick={() => changeZoom(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Karte vergrössern">+</button>
          <button type="button" className="map-zoom-reset" onClick={() => changeZoom(MIN_ZOOM)} disabled={zoom === MIN_ZOOM}>Ganze Karte</button>
        </div>
        <div className="map-viewport" ref={viewportRef} tabIndex={0} style={{ ['--map-zoom' as string]: zoom }}>
        <svg viewBox="20 35 1580 740" role="img" aria-labelledby="map-title map-description">
          <title id="map-title">Entdeckte Orte in {activeWorld.presentation.fallbackPlaceName}</title>
          <desc id="map-description">Die gleiche Verbindungsliste wie in der Reiseansicht, grafisch dargestellt.</desc>
          <path className="region-shape region-shape--forest" d="M35 190 Q210 120 345 245 L300 610 Q140 680 35 565Z" />
          <path className="region-shape region-shape--mark" d="M315 225 Q485 185 630 285 L575 480 Q430 505 310 410Z" />
          <path className="region-shape region-shape--mountain" d="M555 45 Q900 5 1245 105 L1235 345 Q900 375 565 335Z" />
          <path className="region-shape region-shape--coast" d="M535 395 Q900 360 1245 430 L1235 720 Q880 770 535 600Z" />
          <path className="region-shape region-shape--mark" d="M1240 215 Q1450 180 1585 285 L1580 525 Q1420 565 1240 500Z" />
          <path className="region-shape region-shape--final" d="M455 470 L555 470 L580 775 L430 775Z" />
          {knownPassages.map((passage) => {
            const from = activeWorld.areas.find((area) => area.id === passage.fromAreaId)!
            const to = activeWorld.areas.find((area) => area.id === passage.toAreaId)!
            const blocked = isPassageBlocked(passage)
            const middle = { x: (from.mapPosition.x + to.mapPosition.x) / 2, y: (from.mapPosition.y + to.mapPosition.y) / 2 }
            return (
              <g key={passage.id}>
                <line className={`map-edge${passage.shortcut ? ' map-edge--shortcut' : ''}${blocked ? ' map-edge--blocked' : ''}`} x1={from.mapPosition.x} y1={from.mapPosition.y} x2={to.mapPosition.x} y2={to.mapPosition.y} />
                {blocked && <g className="map-edge-lock" aria-hidden="true" transform={`translate(${middle.x} ${middle.y}) scale(${1 / zoom})`}><circle r="9" /><text y="4" textAnchor="middle">×</text></g>}
              </g>
            )
          })}
          {knownAreas.map((area) => {
            const visited = game.visitedAreaIds.includes(area.id)
            const current = game.currentAreaId === area.id
            const selected = focusedArea?.id === area.id
            const progress = progressByArea.get(area.id)!
            const remembered = reminderAreaIds.has(area.id)
            const marker = progress.state === 'new' ? '?' : progress.state === 'clear' ? '✓' : progress.state === 'blocked' ? '×' : String(progress.unfinishedCount)
            return (
              <g key={area.id} className={`map-node${visited ? ' map-node--visited' : ' map-node--known'} map-node--${progress.state}${current ? ' map-node--current' : ''}${selected ? ' map-node--target' : ''}${remembered ? ' map-node--remembered' : ''}`} transform={`translate(${area.mapPosition.x} ${area.mapPosition.y}) scale(${1 / zoom})`}>
                {remembered && <circle className="reminder-ring" r="24" />}
                {selected && <circle className="target-ring" r="30" />}
                {area.safe && evaluateRequirement(area.sanctuaryRequirement, game).met ? <rect className="map-node-shape" x="-11" y="-11" width="22" height="22" rx="4" /> : <circle className="map-node-shape" r="11" />}
                {current && <circle className="current-ring" r="18" />}
                <text className="map-node-label" y="-19" textAnchor="middle">{area.name}</text>
                <g className={`map-status-marker map-status-marker--${progress.state}`} aria-hidden="true" transform="translate(14 13)">
                  <circle r="8" />
                  <text className="map-status-symbol" y="3.5" textAnchor="middle">{marker}</text>
                </g>
              </g>
            )
          })}
        </svg>
        </div>
        <div className="map-legend" aria-hidden="true">
          <span><i className="legend-current" /> Aktuell</span>
          <span><i className="legend-visited" /> Besucht</span>
          <span><i className="legend-known" /> ? Noch unbesucht</span>
          <span><i className="legend-open">2</i> Offene Dinge</span>
          <span><i className="legend-blocked">×</i> Wartet auf etwas</span>
          <span><i className="legend-clear">✓</i> Erledigt</span>
          <span><i className="legend-reminder" /> Merklistenziel</span>
          <span><b>↯</b> Abkürzung</span>
          <span><b className="legend-locked-road">━×━</b> Gesperrter Weg</span>
        </div>
      </section>

      <section className="map-text-list" aria-labelledby="map-list-title">
        <h2 id="map-list-title">Entdeckte Orte und Wege</h2>
        <ul>
          {knownAreas.map((area) => {
            const connections = getConnectedKnownAreas(game, activeWorld, area.id)
            const progress = progressByArea.get(area.id)!
            const statusLabel = progress.state === 'new' ? 'Noch nicht besucht' : progress.state === 'clear' ? 'Derzeit erledigt' : progress.state === 'blocked' ? `${progress.unfinishedCount} wartet` : `${progress.unfinishedCount} offen`
            return (
              <li key={area.id} className={`map-list-item map-list-item--${progress.state}`}>
                <div><strong>{area.name}</strong><span className={`map-list-status map-list-status--${progress.state}`}>{game.currentAreaId === area.id ? 'Aktuell · ' : ''}{statusLabel}</span></div>
                <p>{game.visitedAreaIds.includes(area.id) ? 'Besucht' : game.discoveredClueIds.includes(`hinweis_ort:${area.id}`) ? 'Durch einen Hinweis bekannt' : 'Bekannt'} · Wege nach {connections.map((entry) => entry.name).join(', ') || 'noch unbekannt'}</p>
                {progress.open.length > 0 && <p className="map-open-detail"><strong>Jetzt möglich:</strong> {progress.open.map((task) => task.label).join(' · ')}</p>}
                {progress.blocked.map((task) => <p className="blocked-reason" key={task.label}><strong>Noch nötig für «{task.label}»:</strong> {task.detail}</p>)}
                {progress.state === 'clear' && <p className="map-clear-detail">✓ Hier ist derzeit nichts mehr offen.</p>}
                {knownPassages.filter((passage) => (passage.fromAreaId === area.id || passage.toAreaId === area.id) && isPassageBlocked(passage)).map((passage) => <p className="blocked-reason" key={passage.id}>Gesperrt: {passage.fromAreaId === area.id ? passage.labelFrom : passage.labelTo}. {passage.blockedText}</p>)}
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
