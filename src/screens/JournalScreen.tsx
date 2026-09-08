import { useMemo, useState } from 'react'
import { useAppState } from '../app/AppState'
import { JOURNAL_LIMIT } from '../domain/game'

type Order = 'neu' | 'alt'

export function JournalScreen() {
  const { game } = useAppState()
  const [order, setOrder] = useState<Order>('neu')
  const [query, setQuery] = useState('')

  const entries = useMemo(() => {
    if (!game) return []
    const term = query.trim().toLowerCase()
    const matching = term ? game.journal.filter((entry) => entry.text.toLowerCase().includes(term)) : game.journal
    return order === 'neu' ? [...matching].reverse() : matching
  }, [game, order, query])

  if (!game) return null
  const truncated = game.journal.length >= JOURNAL_LIMIT

  return (
    <main id="main-content" className="screen page-screen journal-screen">
      <header className="page-heading">
        <p className="eyebrow">Alles, was du erlebt hast</p>
        <h1>Tagebuch</h1>
        <p>
          {game.journal.length === 1
            ? 'Ein Eintrag steht bisher in deinem Tagebuch.'
            : `${game.journal.length} Einträge aus ${game.turn} ${game.turn === 1 ? 'Runde' : 'Runden'}.`}
        </p>
      </header>

      <div className="journal-controls">
        <label className="journal-search">
          <span>Im Tagebuch suchen</span>
          <input
            type="search"
            value={query}
            placeholder="z. B. Truhe, Kuno, Quelle"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <fieldset className="segmented-field journal-order">
          <legend>Reihenfolge</legend>
          {([
            ['neu', 'Neueste zuerst'],
            ['alt', 'Von Anfang an']
          ] as const).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="journal-order"
                value={value}
                checked={order === value}
                onChange={() => setOrder(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </div>

      {truncated && (
        <p className="muted-copy journal-note">
          Dein Tagebuch fasst die letzten {JOURNAL_LIMIT} Einträge. Ganz frühe Einträge sind verblasst.
        </p>
      )}

      {entries.length === 0 ? (
        <p className="muted-copy" role="status">
          {query.trim() ? `Kein Eintrag enthält «${query.trim()}».` : 'Noch nichts erlebt.'}
        </p>
      ) : (
        <ol className="journal-list" aria-label="Tagebucheinträge">
          {entries.map((entry) => (
            <li key={entry.id} className="journal-entry">
              <span className="journal-turn" aria-label={`Runde ${entry.turn}`}>
                {entry.turn}
              </span>
              <p>{entry.text}</p>
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
