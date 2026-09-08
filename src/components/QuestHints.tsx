import { Link } from 'react-router-dom'
import type { GameSave } from '../domain/game'
import type { GameAction } from '../engine/actions'
import type { QuestView } from '../engine/selectors'
import { getHintLevel, getHintTexts } from '../engine/hints'

export function QuestHints({ game, quest, onAction }: { game: GameSave; quest: QuestView; onAction: (action: GameAction) => void }) {
  const level = getHintLevel(game, quest)
  const texts = getHintTexts(quest)
  const target = quest.hintAreaIds?.[0]
  return (
    <details className="hint-details" onToggle={(event) => {
      if (event.currentTarget.open && level === 0) onAction({ type: 'SHOW_HINT', questId: quest.id, level: 1 })
    }}>
      <summary>Kunos Hinweis öffnen{level > 0 ? ` (${level} von 3)` : ''}</summary>
      {texts.slice(0, level).map((text, index) => <p key={index}><strong>Hinweis {index + 1}:</strong> «{text}»</p>)}
      {level > 0 && <div className="hint-actions">
        <button className="button button--secondary" aria-disabled={level === 3} onClick={() => {
          if (level < 3) onAction({ type: 'SHOW_HINT', questId: quest.id, level: level + 1 })
        }}>{level === 1 ? 'Genauerer Hinweis' : level === 2 ? 'Lösung und Ort zeigen' : 'Alle Hinweise geöffnet'}</button>
        {level === 3 && target && <Link className="button button--quiet" to={`/karte?hinweis=${encodeURIComponent(target)}`}>Hinweis auf der Karte ansehen</Link>}
      </div>}
    </details>
  )
}
