import { useAppState } from '../app/AppState'
import { activeWorld } from '../content/world'
import { getEncounterEnemies } from '../engine/bestiary'

function ownedIds(inventory: Record<string, number>, prefix: string): string[] {
  return Object.keys(inventory).filter((id) => id.startsWith(prefix) && inventory[id] > 0)
}

export function CollectionScreen() {
  const { game } = useAppState()
  if (!game) return null
  const mapEdges = ownedIds(game.player.inventory, 'item_quest_kartenrand_')
  const weapons = ownedIds(game.player.inventory, 'item_weapon_')
  const enemies = getEncounterEnemies(activeWorld)
  const studied = enemies.filter((enemy) => game.studiedEnemyIds.includes(enemy.id)).length

  const collections = [
    { id: 'kartenraender', icon: '✦', title: 'Alvas Kartenränder', count: mapEdges.length, total: 6, description: 'Kurze Erinnerungen an Freunde, die Alva auf ihren Wegen traf.' },
    { id: 'waffen', icon: '◆', title: 'Waffen', count: weapons.length, total: activeWorld.items.filter((item) => item.weapon).length, description: 'Finde die Waffen der Regionen und lerne ihre Waffenkünste kennen.' },
    { id: 'register', icon: '⌖', title: 'Kunos Wegbuch', count: studied, total: enemies.length, description: 'Beobachte jeden Gegner vor dem Sieg kostenlos im Kampf, um seinen Eintrag zu vervollständigen.' }
  ]

  return <main id="main-content" className="screen collection-screen">
    <header className="screen-heading"><div><p className="eyebrow">Deine Funde</p><h1>Sammlung</h1></div></header>
    <p className="screen-intro">Sammlungen sind freiwillig. Kein Eintrag ist nötig, um die Hauptgeschichte abzuschliessen.</p>
    <div className="collection-grid">{collections.map((collection) => <article className="collection-card" key={collection.id}>
      <span className="collection-icon" aria-hidden="true">{collection.icon}</span>
      <h2>{collection.title}</h2>
      <p>{collection.description}</p>
      <progress aria-label={`${collection.title}: ${collection.count} von ${collection.total}`} max={collection.total} value={collection.count} />
      <strong>{collection.count} von {collection.total}</strong>
    </article>)}</div>
  </main>
}
