import { useAppState } from '../app/AppState'
import { activeWorld } from '../content/world'

function ownedIds(inventory: Record<string, number>, prefix: string): string[] {
  return Object.keys(inventory).filter((id) => id.startsWith(prefix) && inventory[id] > 0)
}

export function CollectionScreen() {
  const { game } = useAppState()
  if (!game) return null
  const shards = ownedIds(game.player.inventory, 'item_shard_')
  const marks = ownedIds(game.player.inventory, 'item_marke_')
  const totalEnemies = activeWorld.contentInventory?.enemies.length ?? activeWorld.enemies.length

  const collections = [
    { id: 'splitter', icon: '✦', title: 'Resonanzsplitter', count: shards.length, total: 7, description: 'Verborgene Splitter aus den bewohnten Regionen Kantaras.' },
    { id: 'marken', icon: '◆', title: 'Alte Liefermarken', count: marks.length, total: 8, description: 'Kurze Geschichten über frühere Wege zwischen den Regionen.' },
    { id: 'register', icon: '⌖', title: 'Klicks Register', count: game.studiedEnemyIds.length, total: totalEnemies, description: 'Vollständige Einträge durch kostenloses Beobachten im Kampf.' }
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
