import { Link } from 'react-router-dom'
import { useAppState } from '../app/AppState'
import { phase2World } from '../content/world'
import { getKnownAreaIds } from '../engine/selectors'
import { getReminderGroups, type ReminderStatus } from '../engine/reminders'

const statusLabels: Record<ReminderStatus, string> = {
  missing: 'Fehlt noch',
  ready: 'Dabei',
  done: 'Erledigt'
}

export function RemindersScreen() {
  const { game } = useAppState()
  if (!game) return null

  const groups = getReminderGroups(game)
  const steps = groups.flatMap((group) => group.steps)
  const missing = steps.filter((step) => step.status === 'missing').length
  const ready = steps.filter((step) => step.status === 'ready').length
  const knownAreaIds = new Set(getKnownAreaIds(game, phase2World))

  return (
    <main id="main-content" className="screen page-screen reminders-screen">
      <header className="page-heading">
        <p className="eyebrow">Kunos Gedächtnisstütze</p>
        <h1>Merkliste</h1>
        <p>Hier stehen wichtige Dinge, Fundorte und ihr späterer Zweck. Die Liste ändert sich mit deiner Reise.</p>
      </header>

      <section className="reminder-summary" aria-label="Stand der Merkliste">
        <div><strong>{missing}</strong><span>fehlen noch</span></div>
        <div><strong>{ready}</strong><span>sind bereit</span></div>
        <div><strong>{steps.filter((step) => step.status === 'done').length}</strong><span>sind erledigt</span></div>
      </section>

      {groups.length === 0 ? (
        <section className="reminder-empty">
          <span aria-hidden="true">✓</span>
          <div><h2>Nichts mehr offen</h2><p>Kuno hat im Moment nichts mehr auf seiner Merkliste.</p></div>
        </section>
      ) : (
        <div className="reminder-groups">
          {groups.map((group) => (
            <section key={group.id} className="reminder-group" aria-labelledby={`reminder-${group.id}`}>
              <header>
                <div className="reminder-group-mark" aria-hidden="true">✦</div>
                <div><h2 id={`reminder-${group.id}`}>{group.title}</h2><p>{group.description}</p></div>
              </header>
              <ul>
                {group.steps.map((step) => {
                  const area = step.areaId ? phase2World.areas.find((entry) => entry.id === step.areaId) : undefined
                  const canShowOnMap = Boolean(area && knownAreaIds.has(area.id))
                  return (
                    <li key={step.id} className={`reminder-step reminder-step--${step.status}`}>
                      <span className="reminder-check" aria-hidden="true">{step.status === 'done' ? '✓' : step.status === 'ready' ? '◆' : '○'}</span>
                      <div>
                        <div className="reminder-step-heading">
                          <h3>{step.label}</h3>
                          <span className="reminder-status">{statusLabels[step.status]}</span>
                        </div>
                        <p>{step.detail}</p>
                        {area && (canShowOnMap ? (
                          <Link className="reminder-map-link" to={`/karte?ziel=${area.id}`}>Auf Karte zeigen: {area.name}</Link>
                        ) : (
                          <span className="reminder-unknown-place">Kartenort noch unbekannt: {area.name}</span>
                        ))}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}
