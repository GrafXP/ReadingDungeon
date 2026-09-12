import { useAppState } from '../app/AppState'
import { activeWorld } from '../content/world'
import { getEnemyKnowledge, getMetEnemies } from '../engine/bestiary'
import { evaluateRequirement } from '../engine/requirements'

export function BestiaryScreen() {
  const { game } = useAppState()
  if (!game) return null
  const enemies = getMetEnemies(game, activeWorld)
  const total = activeWorld.contentInventory?.enemies.length ?? activeWorld.enemies.length
  const ruleCards = activeWorld.ruleCards?.filter((card) => evaluateRequirement(card.requirement, game).met) ?? []
  const totalRules = activeWorld.ruleCards?.length ?? 0

  return <main id="main-content" className="screen collection-screen">
    <header className="screen-heading">
      <div><p className="eyebrow">Kunos Wegbuch</p><h1>Register</h1></div>
      <span className="count-badge">{game.studiedEnemyIds.length}/{total} Gegner · {ruleCards.length}/{totalRules} Regeln</span>
    </header>
    <p className="screen-intro">Begegnete Gegner erscheinen hier. Beobachte sie im Kampf kostenlos, um ihre vollständigen Merksätze freizuschalten.</p>
    {ruleCards.length > 0 && <section aria-labelledby="rule-cards-title">
      <h2 id="rule-cards-title">Gelesene Regeln</h2>
      <div className="bestiary-grid">{ruleCards.map((card) => <article className="bestiary-card" key={card.id}>
        <p className="eyebrow">Regelkarte</p>
        <h3>{card.title}</h3>
        <p>{card.description}</p>
      </article>)}</div>
    </section>}
    {enemies.length === 0 ? <section className="empty-state"><h2>Noch kein Gegner</h2><p>Die erste Begegnung legt automatisch einen Gegner-Eintrag an.</p></section> : <div className="bestiary-grid">
      {enemies.map((enemy) => {
        const knowledge = getEnemyKnowledge(game, enemy)
        const moves = Object.values(enemy.movesByPhase).flat()
        return <article className="bestiary-card" key={enemy.id}>
          <p className="eyebrow">{enemy.kind === 'boss' ? 'Wegwächter' : 'Begegnung'}</p>
          <h2>{enemy.name}</h2>
          <dl>
            <div><dt>Schwächen</dt><dd>{knowledge.weaknesses}</dd></div>
            <div><dt>Widerstände</dt><dd>{knowledge.resistances}</dd></div>
            <div><dt>Immun</dt><dd>{knowledge.immunities}</dd></div>
          </dl>
          {knowledge.studied
            ? <><h3>Bewegungen</h3><ul>{moves.map((move, index) => <li key={`${move.id}:${index}`}><strong>{move.name}:</strong> {move.telegraph}</li>)}</ul></>
            : <p className="locked-note">Noch nicht beobachtet. Schwächen und Bewegungen bleiben unbekannt.</p>}
        </article>
      })}
    </div>}
  </main>
}
