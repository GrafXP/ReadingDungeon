import { useAppState } from '../app/AppState'
import { QuestHints } from '../components/QuestHints'
import { activeWorld } from '../content/world'
import { reduceGame } from '../engine/reducer'

export function QuestsScreen() {
  const { game, updateAdventure } = useAppState()
  if (!game) return null
  const quests = activeWorld.journal?.getQuestViews?.(game) ?? []
  const mainGoal = activeWorld.journal?.getMainGoal?.(game) ?? {
    title: activeWorld.presentation.emptyQuestTitle,
    description: activeWorld.presentation.emptyQuestDescription
  }
  const notes = activeWorld.journal?.cardNotes ?? {}
  const foundNotes = Object.entries(notes).filter(([id]) => game.discoveredClueIds.includes(id))

  return (
    <main id="main-content" className="screen page-screen quests-screen">
      <header className="page-heading">
        <p className="eyebrow">Deine Notizen</p>
        <h1>Aufgaben</h1>
        <p>Die nächste sinnvolle Spur steht oben. Hinweise sind freiwillig und kosten nichts.</p>
      </header>

      <section className="quest-overview" aria-labelledby="main-goal-title">
        <div className="quest-compass" aria-hidden="true">↗</div>
        <div>
          <p className="eyebrow">Hauptziel</p>
          <h2 id="main-goal-title">{mainGoal.title}</h2>
          <p>{mainGoal.description}</p>
        </div>
      </section>

      <ol className="quest-list">
        {quests.map((quest, index) => (
          <li key={quest.id} className={`${quest.done ? 'quest-item quest-item--done' : 'quest-item'}${quest.current ? ' quest-item--current' : ''}`}>
            <span className="quest-number" aria-hidden="true">{quest.done ? '✓' : index + 1}</span>
            <div>
              <h2>{quest.title}</h2>
              <p>{quest.description}</p>
              {!quest.done && (
                <QuestHints game={game} quest={quest} world={activeWorld} onAction={(action) => updateAdventure((current) => reduceGame(current, action, activeWorld))} />
              )}
            </div>
          </li>
        ))}
      </ol>
      {Object.keys(notes).length > 0 && <section className="card-notes" aria-labelledby="card-notes-title">
        <h2 id="card-notes-title">Gefundene Notizen</h2>
        <p className="card-notes-intro">{foundNotes.length} von {Object.keys(notes).length} gefunden.</p>
        {foundNotes.length === 0 ? (
          <p className="muted-copy">Noch keine Notiz gefunden. Sie liegen an den Rändern der Karte.</p>
        ) : (
          <ul>{foundNotes.map(([id, note]) => <li key={id}><p>{note}</p></li>)}</ul>
        )}
      </section>}
    </main>
  )
}
