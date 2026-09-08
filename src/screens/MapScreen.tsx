import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppState } from '../app/AppState'
import { phase2World } from '../content/world'
import { getMapAreaProgress } from '../engine/mapProgress'
import { getReminderGroups } from '../engine/reminders'
import { evaluateRequirement } from '../engine/requirements'
import { getConnectedKnownAreas, getKnownAreaIds } from '../engine/selectors'

const MIN_ZOOM = 1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.5
const DEFAULT_ZOOM = 3
const MAP_VIEW_BOX = { x: 20, y: 45, width: 960, height: 730 }

export function MapScreen() {
  const { game } = useAppState()
  const [searchParams] = useSearchParams()
  const requestedHint = searchParams.get('hinweis')
  const requestedTarget = searchParams.get('ziel')
  const knownIds = new Set(game ? getKnownAreaIds(game, phase2World) : [])
  const hintArea = game && game.discoveredClueIds.includes(`hinweis_ort:${requestedHint}`)
    ? phase2World.areas.find((area) => area.id === requestedHint) : undefined
  const targetArea = game && requestedTarget && knownIds.has(requestedTarget)
    ? phase2World.areas.find((area) => area.id === requestedTarget) : undefined
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
    const area = focusedArea ?? phase2World.areas.find((entry) => entry.id === game?.currentAreaId)
    if (!viewport || !area || !viewport.scrollWidth) return
    const scale = viewport.scrollWidth / MAP_VIEW_BOX.width
    viewport.scrollLeft = (area.mapPosition.x - MAP_VIEW_BOX.x) * scale - viewport.clientWidth / 2
    viewport.scrollTop = (area.mapPosition.y - MAP_VIEW_BOX.y) * scale - viewport.clientHeight / 2
  }, [game?.currentAreaId, focusedArea])

  if (!game) return null

  const knownAreas = phase2World.areas.filter((area) => knownIds.has(area.id))
  const knownPassages = phase2World.passages.filter((passage) => knownIds.has(passage.fromAreaId) && knownIds.has(passage.toAreaId))
  const blockedPassages = knownPassages.filter((passage) => !evaluateRequirement(passage.requirement, game).met && !game.unlockedPassageIds.includes(passage.id))
  const progressByArea = new Map(knownAreas.map((area) => [area.id, getMapAreaProgress(game, phase2World, area.id)]))
  const reminderAreaIds = new Set(getReminderGroups(game).flatMap((group) => group.steps.filter((step) => step.status !== 'done' && step.areaId).map((step) => step.areaId!)))
  const mapStats = {
    newAreas: [...progressByArea.values()].filter((progress) => progress.state === 'new').length,
    unfinished: [...progressByArea.values()].filter((progress) => progress.state === 'open' || progress.state === 'blocked').length,
    clear: [...progressByArea.values()].filter((progress) => progress.state === 'clear').length
  }

  return (
    <main id="main-content" className="screen page-screen map-screen">
      <header className="page-heading">
        <p className="eyebrow">Deine Entdeckungen</p>
        <h1>Karte von Talora</h1>
        <p>Sieh auf einen Blick, wo noch etwas offen ist, was dich aufhält und welche Orte du bereits erledigt hast.</p>
      </header>

      <section className="map-summary" aria-label="Kartenstand">
        <div><strong>{mapStats.unfinished}</strong><span>Orte mit offenen Dingen</span></div>
        <div><strong>{mapStats.newAreas}</strong><span>bekannt, noch unbesucht</span></div>
        <div><strong>{blockedPassages.length}</strong><span>gesperrte Wege</span></div>
        <div><strong>{mapStats.clear}</strong><span>derzeit erledigt</span></div>
      </section>

      <p>{focusedArea ? 'Die Karte startet beim ausgewählten Ziel.' : 'Die Karte startet nah bei deinem aktuellen Ort.'} Mit «Ganze Karte» siehst du ganz Talora; die Schrift bleibt beim Zoomen gleich gross. Die Karte lässt sich in alle Richtungen verschieben. Alle offenen Dinge und Sperren stehen auch in der Textliste darunter.</p>
      {hintArea && <p className="map-hint" role="status">Kunos Hinweis: Die Karte zeigt dir {hintArea.name}. Dieser Ort gilt erst als besucht, wenn du selbst dorthin reist.</p>}
      {targetArea && <p className="map-target-note" role="status">Merklistenziel: {targetArea.name} ist auf der Karte hervorgehoben.</p>}
      {game.flags.includes('kartennotiz_sichtbar') && <p>Alvas Notiz: «Eine gute Karte zeigt nicht nur, wohin du gehst. Sie zeigt auch, wer auf deine Rückkehr wartet.»</p>}
      <section className="world-map" aria-labelledby="visual-map-title">
        <h2 id="visual-map-title" className="visually-hidden">Grafische Karte</h2>
        <div className="map-zoom" role="group" aria-label="Kartenzoom">
          <button type="button" onClick={() => changeZoom(zoom - ZOOM_STEP)} disabled={zoom <= MIN_ZOOM} aria-label="Karte verkleinern">−</button>
          <span aria-live="polite">{zoom.toLocaleString('de-CH', { minimumFractionDigits: 1 })}×</span>
          <button type="button" onClick={() => changeZoom(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} aria-label="Karte vergrössern">+</button>
          <button type="button" className="map-zoom-reset" onClick={() => changeZoom(MIN_ZOOM)} disabled={zoom === MIN_ZOOM}>Ganze Karte</button>
        </div>
        <div className="map-viewport" ref={viewportRef} tabIndex={0} style={{ ['--map-zoom' as string]: zoom }}>
        <svg viewBox="20 45 960 730" role="img" aria-labelledby="map-title map-description">
          <title id="map-title">Entdeckte Orte in ganz Talora</title>
          <desc id="map-description">Die gleiche Verbindungsliste wie in der Reiseansicht, grafisch dargestellt.</desc>
          <path className="region-shape region-shape--forest" d="M35 190 Q210 120 345 245 L300 610 Q140 680 35 565Z" />
          <path className="region-shape region-shape--mark" d="M315 225 Q485 185 630 285 L575 480 Q430 505 310 410Z" />
          <path className="region-shape region-shape--mountain" d="M555 55 Q800 15 970 125 L925 420 Q720 400 565 335Z" />
          <path className="region-shape region-shape--coast" d="M535 395 Q765 360 970 430 L955 705 Q730 760 535 600Z" />
          <path className="region-shape region-shape--final" d="M455 470 L555 470 L580 775 L430 775Z" />
          {knownPassages.map((passage) => {
            const from = phase2World.areas.find((area) => area.id === passage.fromAreaId)!
            const to = phase2World.areas.find((area) => area.id === passage.toAreaId)!
            const blocked = !evaluateRequirement(passage.requirement, game).met && !game.unlockedPassageIds.includes(passage.id)
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
            const connections = getConnectedKnownAreas(game, phase2World, area.id)
            const progress = progressByArea.get(area.id)!
            const statusLabel = progress.state === 'new' ? 'Noch nicht besucht' : progress.state === 'clear' ? 'Derzeit erledigt' : progress.state === 'blocked' ? `${progress.unfinishedCount} wartet` : `${progress.unfinishedCount} offen`
            return (
              <li key={area.id} className={`map-list-item map-list-item--${progress.state}`}>
                <div><strong>{area.name}</strong><span className={`map-list-status map-list-status--${progress.state}`}>{game.currentAreaId === area.id ? 'Aktuell · ' : ''}{statusLabel}</span></div>
                <p>{game.visitedAreaIds.includes(area.id) ? 'Besucht' : game.discoveredClueIds.includes(`hinweis_ort:${area.id}`) ? 'Bekannt durch Kunos Hinweis' : 'Bekannt'} · Wege nach {connections.map((entry) => entry.name).join(', ') || 'noch unbekannt'}</p>
                {progress.open.length > 0 && <p className="map-open-detail"><strong>Jetzt möglich:</strong> {progress.open.map((task) => task.label).join(' · ')}</p>}
                {progress.blocked.map((task) => <p className="blocked-reason" key={task.label}><strong>Noch nötig für «{task.label}»:</strong> {task.detail}</p>)}
                {progress.state === 'clear' && <p className="map-clear-detail">✓ Hier ist derzeit nichts mehr offen.</p>}
                {knownPassages.filter((passage) => (passage.fromAreaId === area.id || passage.toAreaId === area.id) && !evaluateRequirement(passage.requirement, game).met && !game.unlockedPassageIds.includes(passage.id)).map((passage) => <p className="blocked-reason" key={passage.id}>Gesperrt: {passage.fromAreaId === area.id ? passage.labelFrom : passage.labelTo}. {passage.blockedText}</p>)}
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}
