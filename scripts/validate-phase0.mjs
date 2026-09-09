import { readFileSync } from 'node:fs'

const bible = readFileSync(new URL('../STORY_BIBLE_V2.md', import.meta.url), 'utf8')
const runtimeInventory = readFileSync(new URL('../src/content/world/kantaraInventory.ts', import.meta.url), 'utf8')

function fail(message) {
  throw new Error(`Phase-0-Validierung: ${message}`)
}

function section(start, end) {
  const startIndex = bible.indexOf(start)
  if (startIndex < 0) fail(`Abschnitt fehlt: ${start}`)
  const endIndex = end ? bible.indexOf(end, startIndex + start.length) : bible.length
  if (end && endIndex < 0) fail(`Folgeabschnitt fehlt: ${end}`)
  return bible.slice(startIndex, endIndex)
}

function matches(text, pattern) {
  return [...text.matchAll(pattern)]
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) fail(`${label}: erwartet ${expected}, gefunden ${actual}`)
}

function assertUnique(values, label) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index)
  if (duplicates.length > 0) fail(`${label}: doppelte IDs ${[...new Set(duplicates)].join(', ')}`)
}

const locationSection = section('### 13.1', '### 13.2')
const connectionSection = section('### 13.2', '### 13.3')
const enemySection = section('### 13.3', '### 13.4')
const encounterSection = section('### 13.4', '### 13.5')
const puzzleSection = section('### 13.5', '### 13.6')
const itemSection = section('### 13.6', '### 13.7')
const interactionSection = section('### 13.7', '### 13.8')
const phaseZeroSection = section('## 13. Phase-0-Vertrag')

const locations = matches(
  locationSection,
  /^\| `((?:kb|bd|kd|sw|wg|gc|fo|lm|zw)_[^`]+)` \|/gm,
).map((match) => match[1])
const connections = matches(
  connectionSection,
  /^\| `(v\d{3})` \| `([^`]+)` \| `([^`]+)` \|([^\n]+)$/gm,
).map((match) => ({ id: match[1], from: match[2], to: match[3], row: match[4] }))
const enemies = matches(enemySection, /^\| \d{2} `(enemy_[^`]+)` \|/gm).map(
  (match) => match[1],
)
const encounters = matches(
  encounterSection,
  /^\| \d{2} `(enc_[^`]+)` \| `([^`]+)` \| `([^`]+)` \| ([^|]+) \| `([^`]+)` \|/gm,
).map((match) => ({
  id: match[1],
  location: match[2],
  enemy: match[3],
  kind: match[4],
  fleeTarget: match[5],
}))
const puzzles = matches(
  puzzleSection,
  /^\| \d{2} `(puz_[^`]+)` \| `([^`]+)` \/ `[^`]+` \|/gm,
).map((match) => ({ id: match[1], location: match[2] }))
const items = matches(itemSection, /^\| \d{2} `(item_[^`]+)` \|/gm).map(
  (match) => match[1],
)
const interactions = matches(
  interactionSection,
  /^\| \d{3} `(int_[^`]+)` \| `([^`]+)` \|/gm,
).map((match) => ({ id: match[1], location: match[2] }))

const inventories = [
  ['Orte', locations, 78],
  ['Verbindungen', connections.map(({ id }) => id), 108],
  ['Gegnertypen', enemies, 39],
  ['Begegnungen', encounters.map(({ id }) => id), 48],
  ['Rätsel', puzzles.map(({ id }) => id), 18],
  ['Gegenstände', items, 85],
  ['Interaktionen', interactions.map(({ id }) => id), 110],
]

for (const [label, ids, target] of inventories) {
  assertEqual(ids.length, target, label)
  assertUnique(ids, label)
}

function runtimeIds(field) {
  const block = runtimeInventory.match(new RegExp(`\\b${field}: \\[([\\s\\S]*?)\\n  \\]`))
  if (!block) fail(`Laufzeit-Inhaltsinventar fehlt: ${field}`)
  return matches(block[1], /'([^']+)'/g).map((match) => match[1])
}

for (const [field, expected] of [
  ['areas', locations],
  ['items', items],
  ['interactions', interactions.map(({ id }) => id)],
  ['puzzles', puzzles.map(({ id }) => id)],
  ['enemies', enemies],
  ['encounters', encounters.map(({ id }) => id)],
]) {
  const actual = runtimeIds(field)
  assertEqual(actual.length, expected.length, `Laufzeit-Inventar ${field}`)
  if (actual.some((id, index) => id !== expected[index])) fail(`Laufzeit-Inventar ${field} weicht von Abschnitt 13 ab`)
}
if (!runtimeInventory.includes("passages: sequence('v', 108)")) fail('Laufzeit-Inventar passages weicht von Abschnitt 13 ab')

const definedIds = new Set(inventories.flatMap(([, ids]) => ids))
const referencedIds = matches(
  phaseZeroSection,
  /`((?:v\d{3})|(?:(?:kb|bd|kd|sw|wg|gc|fo|lm|zw|enemy|enc|puz|item|int)_[^`]+))`/g,
).map((match) => match[1])
for (const reference of referencedIds) {
  if (!reference.includes('*') && !definedIds.has(reference)) {
    fail(`unbekannte Referenz in Abschnitt 13: ${reference}`)
  }
}

const expectedRegionCounts = {
  kb: 7,
  bd: 9,
  kd: 9,
  sw: 9,
  wg: 5,
  gc: 12,
  fo: 12,
  lm: 11,
  zw: 4,
}
for (const [prefix, target] of Object.entries(expectedRegionCounts)) {
  assertEqual(locations.filter((id) => id.startsWith(`${prefix}_`)).length, target, `Orte ${prefix}`)
}

const locationSet = new Set(locations)
const enemySet = new Set(enemies)
for (const connection of connections) {
  if (!locationSet.has(connection.from) || !locationSet.has(connection.to)) {
    fail(`${connection.id} verweist auf unbekannten Ort`)
  }
}
for (const puzzle of puzzles) {
  if (!locationSet.has(puzzle.location)) fail(`${puzzle.id} verweist auf unbekannten Ort`)
}
for (const interaction of interactions) {
  if (!locationSet.has(interaction.location)) fail(`${interaction.id} verweist auf unbekannten Ort`)
}
for (const encounter of encounters) {
  if (!locationSet.has(encounter.location)) fail(`${encounter.id} verweist auf unbekannten Ort`)
  if (!enemySet.has(encounter.enemy)) fail(`${encounter.id} verweist auf unbekannten Gegner`)
}
for (const enemy of enemies) {
  if (!encounters.some((encounter) => encounter.enemy === enemy)) {
    fail(`${enemy} wird in keiner Begegnung verwendet`)
  }
}

const edgeKeys = connections.map(({ from, to }) => [from, to].sort().join('|'))
assertUnique(edgeKeys, 'Verbindungspaare')

const adjacency = new Map(locations.map((location) => [location, new Set()]))
for (const { from, to } of connections) {
  adjacency.get(from).add(to)
  adjacency.get(to).add(from)
}
const reached = new Set(['kb_kurierhof'])
const queue = ['kb_kurierhof']
while (queue.length > 0) {
  const current = queue.shift()
  for (const next of adjacency.get(current)) {
    if (!reached.has(next)) {
      reached.add(next)
      queue.push(next)
    }
  }
}
assertEqual(reached.size, locations.length, 'zusammenhängende Orte im abstrakten Graphen')
for (const [location, neighbours] of adjacency) {
  if (neighbours.size === 0) fail(`${location} besitzt keine Verbindung`)
}

const restLocations = new Set(
  matches(locationSection, /^\| `([^`]+)` \|[^\n]+\| ja \|$/gm).map((match) => match[1]),
)
assertEqual(restLocations.size, 9, 'Rastplätze')
for (const encounter of encounters) {
  if (!restLocations.has(encounter.fleeTarget)) {
    fail(`${encounter.id} flieht nicht zu einem Rastplatz: ${encounter.fleeTarget}`)
  }
}

const guardedEncounters = encounters
  .filter(({ kind }) => kind.includes('H/W'))
  .map(({ id }) => id)
const guardedConnections = matches(
  connectionSection,
  /^\| `(v\d{3})` \| `([^`]+)` \| `([^`]+)` \| Wächter `(enc_[^`]+)`/gm,
).map((match) => ({ edge: match[1], from: match[2], to: match[3], encounter: match[4] }))
assertEqual(guardedEncounters.length, 12, 'wegsperrende Begegnungen')
assertEqual(guardedConnections.length, 12, 'wächtergesperrte Verbindungen')
assertUnique(guardedConnections.map(({ encounter }) => encounter), 'Wächterreferenzen')
for (const guard of guardedConnections) {
  const encounter = encounters.find(({ id }) => id === guard.encounter)
  if (!encounter || !guardedEncounters.includes(guard.encounter)) {
    fail(`${guard.edge} verweist nicht auf eine wegsperrende Begegnung`)
  }
  if (encounter.location !== guard.from) {
    fail(`${guard.encounter} liegt nicht auf der sicheren Seite von ${guard.edge}`)
  }
}

const connectionById = new Map(connections.map((connection) => [connection.id, connection]))
const safePaths = {
  enc_bd_aststampfer: ['v011'],
  enc_bd_kronenheber: ['v018', 'v012', 'v009'],
  enc_kd_schottknacker: ['v028', 'v025', 'v021'],
  enc_kd_deltarad: ['v029', 'v028', 'v025', 'v021'],
  enc_sw_spulenlaeufer: ['v040', 'v039', 'v035'],
  enc_sw_wolkenspule: ['v043', 'v040', 'v039', 'v035'],
  enc_gc_glutwalze: ['v060', 'v059', 'v053', 'v051'],
  enc_gc_schmelzsammler: ['v063', 'v061', 'v060', 'v059', 'v053', 'v051'],
  enc_fo_reifjaeger: ['v073', 'v068', 'v066'],
  enc_fo_nullgradsammler: ['v077', 'v076', 'v074', 'v073', 'v068', 'v066'],
  enc_lm_dunstschwinge: ['v088', 'v082', 'v079'],
  enc_lm_dunstsammler: ['v091', 'v090', 'v088', 'v082', 'v079'],
}
for (const encounterId of guardedEncounters) {
  const encounter = encounters.find(({ id }) => id === encounterId)
  const blockedEdge = guardedConnections.find(({ encounter: id }) => id === encounterId).edge
  const path = safePaths[encounterId]
  if (!path) fail(`kein expliziter Rückweg für ${encounterId}`)
  if (path.includes(blockedEdge)) fail(`Rückweg für ${encounterId} nutzt die eigene Sperre`)
  let current = encounter.location
  for (const edgeId of path) {
    const edge = connectionById.get(edgeId)
    if (!edge) fail(`Rückweg für ${encounterId} nutzt unbekannte Verbindung ${edgeId}`)
    if (edge.from === current) current = edge.to
    else if (edge.to === current) current = edge.from
    else fail(`Rückweg für ${encounterId} ist bei ${edgeId} nicht zusammenhängend`)
  }
  if (current !== encounter.fleeTarget) {
    fail(`Rückweg für ${encounterId} endet bei ${current} statt ${encounter.fleeTarget}`)
  }
}

console.log('Phase 0 gültig: 78 Orte, 108 Verbindungen, 85 Gegenstände, 110 Interaktionen, 18 Rätsel, 39 Gegnertypen, 48 Begegnungen und 12 Wegwächter.')
