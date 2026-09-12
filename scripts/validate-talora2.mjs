import { readFileSync } from 'node:fs'

const read = (name) => readFileSync(new URL(`../src/content/world/${name}`, import.meta.url), 'utf8')
const sources = {
  places: read('talora2Places.ts'),
  items: read('talora2Items.ts'),
  combat: read('talora2Combat.ts'),
  puzzles: read('talora2Puzzles.ts'),
  interactions: read('talora2Interactions.ts'),
  world: read('talora2World.ts')
}

function ids(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => match[1])
}

function verify(label, values, expected) {
  if (values.length !== expected) throw new Error(`${label}: erwartet ${expected}, gefunden ${values.length}`)
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index)
  if (duplicates.length) throw new Error(`${label}: doppelte IDs ${[...new Set(duplicates)].join(', ')}`)
}

const areas = ids(sources.places, /\['((?:sm|ww|sk|dh|vp|fi|fs|lm|rn)_[^']+)',/g)
const passages = ids(sources.places, /\['(v\d{3})',/g)
const weapons = ids(sources.items, /^    id: '(item_weapon_[^']+)'/gm)
const protection = ids(sources.items, /^  \{ id: '(item_(?:armor|talisman)_[^']+)'/gm)
const enemies = ids(sources.combat, /^  \{ id: '(enemy_[^']+)'/gm)
const encounters = ids(sources.combat, /^  \['(enc_[^']+)',/gm)
const puzzles = ids(sources.puzzles, /^    id: '(puz_[^']+)'/gm)
const interactions = [...new Set(ids(sources.interactions, /'(int_[^']+)'/g))]

verify('Orte', areas, 78)
verify('Verbindungen', passages, 108)
verify('Waffen', weapons, 12)
verify('Rüstungen und Talismane', protection, 11)
verify('Gegnertypen', enemies, 39)
verify('Begegnungen', encounters, 48)
verify('Rätsel', puzzles, 18)
if (interactions.length < 18) throw new Error(`Interaktionen: mindestens 18 erwartet, gefunden ${interactions.length}`)
if (!sources.world.includes("campaignId: 'talora2'")) throw new Error('Die aktive Kampagnenkennung talora2 fehlt.')

console.log('Talora II gültig: 78 Orte, 108 Verbindungen, 12 Waffen, 11 Schutzgegenstände, 39 Gegnertypen, 48 Begegnungen und 18 Rätsel.')
