import { useAppState } from '../app/AppState'
import { activeWorld } from '../content/world'

function ownedIds(inventory: Record<string, number>, prefix: string): string[] {
  return Object.keys(inventory).filter((id) => id.startsWith(prefix) && inventory[id] > 0)
}

export function CollectionScreen() {
  const { game } = useAppState()
  if (!game) return null
  const mapEdges = ownedIds(game.player.inventory, 'item_quest_kartenrand_')
  const weapons = ownedIds(game.player.inventory, 'item_weapon_')
  const totalEnemies = activeWorld.contentInventory?.enemies.length ?? activeWorld.enemies.length

  const collections = [
    { id: 'kartenraender', icon: '✦', title: 'Alvas Kartenränder', count: mapEdges.length, total: 6, description: 'Kurze Erinnerungen an Freunde, die Alva auf ihren Wegen traf.' },
    { id: 'waffen', icon: '◆', title: 'Waffen und Werkzeuge', count: weapons.length, total: 12, description: 'Jede Region besitzt eine eigene Waffe oder eine besondere Waffenkunst.' },
    { id: 'register', icon: '⌖', title: 'Kunos Wegbuch', count: game.studiedEnemyIds.length, total: totalEnemies, description: 'Vollständige Einträge durch kostenloses Beobachten im Kampf.' }
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
