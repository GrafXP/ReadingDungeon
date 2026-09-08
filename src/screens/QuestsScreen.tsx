import { useAppState } from '../app/AppState'
import { getMainGoal, getQuestViews } from '../engine/selectors'
import { cardNotes } from '../content/world/campaignExtras'
import { QuestHints } from '../components/QuestHints'
import { campaignWorld } from '../content/world/campaignWorld'
import { reduceGame } from '../engine/reducer'

export function QuestsScreen() {
  const { game, updateAdventure } = useAppState()
  if (!game) return null
  const quests = getQuestViews(game)
  const mainGoal = getMainGoal(game)
  const foundNotes = Object.entries(cardNotes).filter(([id]) => game.discoveredClueIds.includes(id))

  return (
    <main id="main-content" className="screen page-screen quests-screen">
      <header className="page-heading">
        <p className="eyebrow">Kunos Notizen</p>
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
                <QuestHints game={game} quest={quest} onAction={(action) => updateAdventure((current) => reduceGame(current, action, campaignWorld))} />
              )}
            </div>
          </li>
        ))}
      </ol>
      <section className="card-notes" aria-labelledby="card-notes-title">
        <h2 id="card-notes-title">Alvas Kartenränder</h2>
        <p className="card-notes-intro">{foundNotes.length} von 6 gefunden. Die Notizen erzählen Alvas Erinnerungen.</p>
        {foundNotes.length === 0 ? (
          <p className="muted-copy">Noch keine Notiz gefunden. Sie liegen an den Rändern der Karte.</p>
        ) : (
          <ul>{foundNotes.map(([id, note]) => <li key={id}><p>{note}</p></li>)}</ul>
        )}
      </section>
    </main>
  )
}
