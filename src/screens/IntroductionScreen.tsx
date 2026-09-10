import { Link, Navigate } from 'react-router-dom'
import { useAppState } from '../app/AppState'
import { activeWorld } from '../content/world'

export function IntroductionScreen() {
  const { game } = useAppState()
  const introduction = activeWorld.presentation.introduction

  if (!game) return null
  if (!introduction) return <Navigate to="/spiel" replace />

  return (
    <main id="main-content" className="screen introduction-screen">
      <article className="introduction-card">
        <header className="introduction-heading">
          <div className="introduction-emblem" aria-hidden="true"><span>✦</span></div>
          <div>
            <p className="eyebrow">{introduction.eyebrow}</p>
            <h1>{introduction.title}</h1>
            <p className="introduction-lead">{introduction.lead.replaceAll('{playerName}', game.playerName)}</p>
          </div>
        </header>

        <section className="introduction-story" aria-labelledby="story-title">
          <h2 id="story-title">Was geschehen ist</h2>
          {introduction.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>

        <section aria-labelledby="basics-title">
          <h2 id="basics-title">So beginnt dein Abenteuer</h2>
          <ol className="introduction-basics">
            {introduction.basics.map((basic) => (
              <li key={basic.title}>
                <span className="introduction-number" aria-hidden="true" />
                <div><h3>{basic.title}</h3><p>{basic.text}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="introduction-first-step" aria-labelledby="first-step-title">
          <span aria-hidden="true">➜</span>
          <div><h2 id="first-step-title">Dein erster Schritt</h2><p>{introduction.firstStep}</p></div>
        </aside>

        <Link className="button button--primary introduction-continue" to="/spiel">Weiter zum Kurierhof</Link>
      </article>
    </main>
  )
}
