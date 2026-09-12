import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CombatPanel } from '../components/CombatPanel'
import { PuzzlePanel } from '../components/PuzzlePanel'
import { activeWorld } from '../content/world'
import type {
  EncounterDefinition,
  InteractionEffect,
  PuzzleDefinition,
  Requirement
} from '../domain/content'
import { createNewGame, type GameSave } from '../domain/game'
import type { GameAction } from '../engine/actions'
import { DAMAGE_TYPE_ICONS, DAMAGE_TYPE_LABELS } from '../engine/damage'
import { getPuzzleKind } from '../engine/puzzles'
import { reduceGame } from '../engine/reducer'

type DebugSection = 'uebersicht' | 'orte' | 'raetsel' | 'gegner' | 'kaempfe' | 'gegenstaende' | 'wege' | 'interaktionen' | 'systeme'

const sectionIds: DebugSection[] = ['uebersicht', 'orte', 'raetsel', 'gegner', 'kaempfe', 'gegenstaende', 'wege', 'interaktionen', 'systeme']
const cardNoteEntries = Object.entries(activeWorld.journal?.cardNotes ?? {}).map(([id, note]) => ({ id, note }))
const campaignConfig = {
  campaignId: activeWorld.campaignId,
  presentation: activeWorld.presentation,
  start: activeWorld.start,
  completionRequirement: activeWorld.completionRequirement,
  mapRevealRequirement: activeWorld.mapRevealRequirement,
  contentInventory: activeWorld.contentInventory
}
const systemEntries: unknown[] = [campaignConfig, ...(activeWorld.statusEffects ?? []), ...(activeWorld.ruleCards ?? []), ...(activeWorld.storyBeats ?? []), ...cardNoteEntries]

function itemName(itemId: string): string {
  return activeWorld.items.find((item) => item.id === itemId)?.name ?? itemId
}

function areaName(areaId: string): string {
  return activeWorld.areas.find((area) => area.id === areaId)?.name ?? areaId
}

function enemyName(enemyId: string): string {
  return activeWorld.enemies.find((enemy) => enemy.id === enemyId)?.name ?? enemyId
}

function describeRequirement(requirement?: Requirement): string {
  if (!requirement) return 'Keine Voraussetzung'
  switch (requirement.kind) {
    case 'item': return `${itemName(requirement.itemId)} × ${requirement.quantity ?? 1} [${requirement.itemId}]`
    case 'equipped': return `${itemName(requirement.itemId)} ausgerüstet (${requirement.slot}) [${requirement.itemId}]`
    case 'flag': return `Fortschritt: ${requirement.flag}`
    case 'clue': return `Hinweis: ${requirement.clueId}`
    case 'all': return `ALLE: (${requirement.requirements.map(describeRequirement).join(' UND ')})`
    case 'any': return `EINE DAVON: (${requirement.requirements.map(describeRequirement).join(' ODER ')})`
  }
}

function describeEffect(effect: InteractionEffect): string {
  switch (effect.kind) {
    case 'addItem': return `Gibt ${itemName(effect.itemId)} × ${effect.quantity} [${effect.itemId}]`
    case 'removeItem': return `Entfernt ${itemName(effect.itemId)} × ${effect.quantity} [${effect.itemId}]`
    case 'setFlag': return `Setzt Fortschritt: ${effect.flag}`
    case 'discoverClue': return `Entdeckt Hinweis: ${effect.clueId}`
    case 'unlockPassage': return `Öffnet Weg: ${effect.passageId}`
    case 'equipItem': return `Rüstet ${itemName(effect.itemId)} aus [${effect.itemId}]`
  }
}

function matchesQuery(value: unknown, query: string): boolean {
  return !query || JSON.stringify(value).toLocaleLowerCase('de-CH').includes(query)
}

function Effects({ effects }: { effects: InteractionEffect[] }) {
  if (!effects.length) return <span>Keine</span>
  return <ul className="debug-compact-list">{effects.map((effect, index) => <li key={`${effect.kind}:${index}`}>{describeEffect(effect)}</li>)}</ul>
}

function Id({ children }: { children: string }) {
  return <code className="debug-id">{children}</code>
}

function Entry({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return <details className="debug-entry">
    <summary><strong>{title}</strong><Id>{id}</Id></summary>
    <div className="debug-entry-body">{children}</div>
  </details>
}

function Meta({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return <dl className="debug-meta">{rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
}

function puzzleSolution(puzzle: PuzzleDefinition): string[] {
  const lines = puzzle.controls.map((control) => `${control.label}: ${control.options[control.solution]} (${control.solution})`)
  if (puzzle.sequence) lines.push(`Folge: ${puzzle.sequence.solution.map((index) => puzzle.sequence!.options[index]).join(' → ')}`)
  if (puzzle.pairing) {
    for (const left of puzzle.pairing.left) {
      const rightId = puzzle.pairing.solution[left.id]
      const right = puzzle.pairing.right.find((entry) => entry.id === rightId)
      lines.push(`${left.label} → ${right?.label ?? rightId}`)
    }
  }
  if (puzzle.ordering) {
    lines.push(`Reihenfolge: ${puzzle.ordering.solution.map((id) => puzzle.ordering!.items.find((item) => item.id === id)?.label ?? id).join(' → ')}`)
  }
  if (puzzle.grid) lines.push(`Wegfelder: ${puzzle.grid.solution.map((cell) => cell + 1).join(' → ')}`)
  if (puzzle.reading) {
    for (const prompt of puzzle.reading.prompts) lines.push(`${prompt.label}: ${prompt.options[prompt.solution]} (${prompt.solution})`)
  }
  if (puzzle.weighing) {
    for (const item of puzzle.weighing.items) lines.push(`${item.label}: ${puzzle.weighing.solution[item.id]}`)
  }
  return lines
}

function createPuzzleSave(puzzle: PuzzleDefinition): GameSave {
  const save = createNewGame('Debugkind', activeWorld)
  return {
    ...save,
    currentAreaId: puzzle.areaId,
    visitedAreaIds: [...new Set([...save.visitedAreaIds, puzzle.areaId])],
    flags: [...save.flags, `area_untersucht:${puzzle.areaId}`]
  }
}

function PuzzleSandbox({ puzzle, onClose }: { puzzle: PuzzleDefinition; onClose(): void }) {
  const [game, setGame] = useState(() => createPuzzleSave(puzzle))
  const dispatch = (action: GameAction) => setGame((current) => reduceGame(current, action, activeWorld))
  return <section className="debug-sandbox" aria-labelledby="debug-puzzle-title">
    <header className="debug-sandbox-heading">
      <div><p className="eyebrow">Isolierter Rätseltester</p><h2 id="debug-puzzle-title">{puzzle.title}</h2></div>
      <button className="button button--secondary" onClick={onClose}>Tester schliessen</button>
    </header>
    <p className="debug-note">Nur dieser Testzustand wird verändert. Der gespeicherte Spielstand bleibt unberührt.</p>
    <PuzzlePanel game={game} puzzle={puzzle} onAction={dispatch} />
    <details className="debug-solution"><summary>Debug-Lösung anzeigen</summary><pre>{puzzleSolution(puzzle).join('\n')}</pre></details>
  </section>
}

function preferredEquipment(requirement: Requirement | undefined): Partial<Record<'weapon' | 'body' | 'talisman', string>> {
  if (!requirement || requirement.kind === 'item' || requirement.kind === 'flag' || requirement.kind === 'clue') return {}
  if (requirement.kind === 'equipped') return { [requirement.slot]: requirement.itemId }
  const choices = requirement.kind === 'any' ? requirement.requirements.slice(0, 1) : requirement.requirements
  return Object.assign({}, ...choices.map(preferredEquipment))
}

export function createDebugCombatSave(encounter: EncounterDefinition): GameSave {
  const fresh = createNewGame('Debugkind', activeWorld)
  const inventory = Object.fromEntries(activeWorld.items.map((item) => [item.id, item.kind === 'healing' ? 9 : 1]))
  const equipment = preferredEquipment(encounter.requiredGear)
  const firstEnemy = activeWorld.enemies.find((enemy) => encounter.enemyIds.includes(enemy.id))
  const weaponId = equipment.weapon ?? fresh.player.equippedWeaponId ?? activeWorld.items.find((item) => item.weapon)?.id ?? null
  const bodyId = equipment.body ?? fresh.player.equippedArmorId ?? activeWorld.items.find((item) => item.armor?.slot === 'body')?.id ?? null
  const talismanId = equipment.talisman ?? fresh.player.equippedTalismanId ?? activeWorld.items.find((item) => item.armor?.slot === 'talisman')?.id ?? null
  const weaponElementModes = { ...fresh.player.weaponElementModes }
  for (const item of activeWorld.items) {
    if (!item.weapon?.elemental || !('choices' in item.weapon.elemental)) continue
    weaponElementModes[item.id] = item.weapon.elemental.choices.find((type) => firstEnemy?.weakTo?.includes(type)) ?? item.weapon.elemental.choices[0]
  }
  const prepared: GameSave = {
    ...fresh,
    currentAreaId: encounter.areaId,
    previousAreaId: encounter.fleeAreaId,
    visitedAreaIds: [...new Set([...fresh.visitedAreaIds, encounter.areaId, encounter.fleeAreaId])],
    studiedEnemyIds: [...encounter.enemyIds],
    metEnemyIds: [...encounter.enemyIds],
    flags: [...fresh.flags, `area_untersucht:${encounter.areaId}`],
    player: {
      ...fresh.player,
      life: 40,
      maxLife: 40,
      inventory,
      equippedWeaponId: weaponId,
      equippedArmorId: bodyId,
      equippedTalismanId: talismanId,
      weaponElementModes
    }
  }
  return reduceGame(prepared, { type: 'START_COMBAT', encounterId: encounter.id }, activeWorld)
}

function CombatSandbox({ encounter, onClose }: { encounter: EncounterDefinition; onClose(): void }) {
  const [game, setGame] = useState(() => createDebugCombatSave(encounter))
  const [showItems, setShowItems] = useState(false)
  const dispatch = (action: GameAction) => setGame((current) => reduceGame(current, action, activeWorld))
  const healingItems = activeWorld.items.filter((item) => item.healing)
  return <section className="debug-sandbox" aria-labelledby="debug-combat-title">
    <header className="debug-sandbox-heading">
      <div><p className="eyebrow">Isolierter Kampfsimulator</p><h2 id="debug-combat-title">{encounter.label}</h2></div>
      <div className="button-row">
        <button className="button button--secondary" onClick={() => { setGame(createDebugCombatSave(encounter)); setShowItems(false) }}>Kampf neu starten</button>
        <button className="button button--secondary" onClick={onClose}>Tester schliessen</button>
      </div>
    </header>
    <p className="debug-note">Der Tester gibt dir 40 LP, alle Gegenstände und passende Pflichtausrüstung. Er speichert nichts.</p>
    {showItems && game.activeCombat && <div className="debug-item-tray" aria-label="Debug-Heilmittel">
      {healingItems.map((item) => <button key={item.id} disabled={(game.player.inventory[item.id] ?? 0) < 1} onClick={() => dispatch({ type: 'USE_ITEM', itemId: item.id })}>{item.name} ({game.player.inventory[item.id] ?? 0})</button>)}
    </div>}
    {game.activeCombat || game.player.life === 0
      ? <CombatPanel game={game} world={activeWorld} onAction={dispatch} onOpenInventory={() => setShowItems((open) => !open)} />
      : <div className="debug-result" role="status"><strong>Kampf beendet.</strong><p>{game.recentEvents.at(-1)?.text}</p></div>}
  </section>
}

function Overview({ choose }: { choose(section: DebugSection): void }) {
  const categories = [
    ['orte', 'Orte und Regionen', activeWorld.areas.length + activeWorld.regions.length],
    ['raetsel', 'Rätsel', activeWorld.puzzles?.length ?? 0],
    ['gegner', 'Gegner', activeWorld.enemies.length],
    ['kaempfe', 'Begegnungen', activeWorld.encounters.length],
    ['gegenstaende', 'Gegenstände', activeWorld.items.length],
    ['wege', 'Wege', activeWorld.passages.length],
    ['interaktionen', 'Interaktionen', activeWorld.interactions.length],
    ['systeme', 'Status, Regeln und Geschichte', systemEntries.length]
  ] as const
  return <>
    <div className="debug-overview-grid">
      {categories.map(([id, label, count]) => <button key={id} aria-label={`${label}: ${count}`} onClick={() => choose(id)}><strong>{count}</strong><span>{label}</span></button>)}
    </div>
    <section className="debug-welcome">
      <h2>Was du hier prüfen kannst</h2>
      <p>Der Katalog zeigt auch interne IDs, Bedingungen, Belohnungen, Lösungen und Verknüpfungen. Rätsel und Kämpfe lassen sich direkt in sicheren Testzuständen öffnen.</p>
      <Meta rows={[
        { label: 'Kampagne', value: `${activeWorld.presentation.title} [${activeWorld.campaignId}]` },
        { label: 'Start', value: `${areaName(activeWorld.start.areaId)} · ${activeWorld.start.maxLife} LP` },
        { label: 'Kampagnenende', value: describeRequirement(activeWorld.completionRequirement) },
        { label: 'Kartenfreigabe', value: describeRequirement(activeWorld.mapRevealRequirement) }
      ]} />
    </section>
  </>
}

export function DebugScreen() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedSection = searchParams.get('bereich') as DebugSection | null
  const section = requestedSection && sectionIds.includes(requestedSection) ? requestedSection : 'uebersicht'
  const [query, setQuery] = useState('')
  const [puzzleId, setPuzzleId] = useState<string | null>(null)
  const [encounterId, setEncounterId] = useState<string | null>(null)
  const normalizedQuery = query.trim().toLocaleLowerCase('de-CH')
  const selectedPuzzle = activeWorld.puzzles?.find((puzzle) => puzzle.id === puzzleId)
  const selectedEncounter = activeWorld.encounters.find((encounter) => encounter.id === encounterId)
  useEffect(() => {
    if (!selectedPuzzle && !selectedEncounter) return
    document.getElementById(selectedPuzzle ? 'debug-puzzle-title' : 'debug-combat-title')?.scrollIntoView?.({ block: 'start', behavior: 'smooth' })
  }, [selectedEncounter, selectedPuzzle])
  const counts: Record<DebugSection, number | null> = {
    uebersicht: null,
    orte: activeWorld.areas.length,
    raetsel: activeWorld.puzzles?.length ?? 0,
    gegner: activeWorld.enemies.length,
    kaempfe: activeWorld.encounters.length,
    gegenstaende: activeWorld.items.length,
    wege: activeWorld.passages.length,
    interaktionen: activeWorld.interactions.length,
    systeme: systemEntries.length
  }
  const labels: Record<DebugSection, string> = {
    uebersicht: 'Übersicht', orte: 'Orte', raetsel: 'Rätsel', gegner: 'Gegner', kaempfe: 'Kämpfe', gegenstaende: 'Gegenstände', wege: 'Wege', interaktionen: 'Interaktionen', systeme: 'Systeme'
  }
  const choose = (next: DebugSection) => {
    setSearchParams(next === 'uebersicht' ? {} : { bereich: next })
    setQuery('')
    setPuzzleId(null)
    setEncounterId(null)
  }

  const visibleCount = useMemo(() => {
    const collections: Partial<Record<DebugSection, unknown[]>> = {
      orte: activeWorld.areas,
      raetsel: activeWorld.puzzles ?? [],
      gegner: activeWorld.enemies,
      kaempfe: activeWorld.encounters,
      gegenstaende: activeWorld.items,
      wege: activeWorld.passages,
      interaktionen: activeWorld.interactions,
      systeme: systemEntries
    }
    return collections[section]?.filter((entry) => matchesQuery(entry, normalizedQuery)).length
  }, [normalizedQuery, section])

  return <main className="screen debug-screen" id="main-content">
    <div className="screen-heading">
      <div><p className="eyebrow">Entwicklungswerkzeug · nichts wird gespeichert</p><h1>Inhalts-Debug</h1></div>
      <span className="count-badge">{activeWorld.campaignId}</span>
    </div>
    <p className="screen-intro">Der vollständige Datenkatalog für {activeWorld.presentation.title}. Wähle einen Bereich, suche nach Namen oder ID und klappe die Einträge auf.</p>

    <nav className="debug-tabs" aria-label="Debug-Bereiche">
      {sectionIds.map((id) => <button key={id} aria-current={section === id ? 'page' : undefined} onClick={() => choose(id)}>{labels[id]}{counts[id] === null ? '' : ` (${counts[id]})`}</button>)}
    </nav>

    {section !== 'uebersicht' && <div className="debug-search">
      <label htmlFor="debug-search-input">In {labels[section]} suchen</label>
      <input id="debug-search-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, Text oder interne ID" aria-describedby="debug-search-count" />
      {visibleCount !== undefined && <small id="debug-search-count">{visibleCount} von {counts[section]} Einträgen sichtbar</small>}
    </div>}

    {selectedPuzzle && <PuzzleSandbox key={selectedPuzzle.id} puzzle={selectedPuzzle} onClose={() => setPuzzleId(null)} />}
    {selectedEncounter && <CombatSandbox key={selectedEncounter.id} encounter={selectedEncounter} onClose={() => setEncounterId(null)} />}

    {section !== 'uebersicht' && visibleCount === 0 && <p className="empty-state">Keine Einträge passen zu „{query}“.</p>}

    {section === 'uebersicht' && <Overview choose={choose} />}

    {section === 'orte' && <section className="debug-list" aria-label="Alle Orte">
      <div className="debug-region-strip">{activeWorld.regions.map((region) => <span key={region.id}><strong>{region.name}</strong><Id>{region.id}</Id></span>)}</div>
      {activeWorld.areas.filter((area) => matchesQuery(area, normalizedQuery)).map((area) => {
        const puzzles = activeWorld.puzzles?.filter((puzzle) => puzzle.areaId === area.id) ?? []
        const encounters = activeWorld.encounters.filter((encounter) => encounter.areaId === area.id)
        const interactions = activeWorld.interactions.filter((interaction) => interaction.areaId === area.id)
        const passages = activeWorld.passages.filter((passage) => passage.fromAreaId === area.id || passage.toAreaId === area.id)
        return <Entry key={area.id} title={area.name} id={area.id}>
          <Meta rows={[
            { label: 'Region', value: `${area.regionName} [${area.regionId}]` },
            { label: 'Karte', value: `x ${area.mapPosition.x}, y ${area.mapPosition.y}` },
            { label: 'Sicher', value: area.safe ? `Ja · ${describeRequirement(area.sanctuaryRequirement)}` : 'Nein' },
            { label: 'Verknüpft', value: `${passages.length} Wege · ${interactions.length} Interaktionen · ${puzzles.length} Rätsel · ${encounters.length} Kämpfe` }
          ]} />
          <h3>Erster Besuch</h3><p>{area.firstDescription}</p>
          <h3>Wiederbesuch</h3><p>{area.revisitDescription}</p>
          <h3>Untersuchen</h3><p>{area.inspectText}</p>
          {area.variants?.map((variant, index) => <div className="debug-subcard" key={index}><strong>Textvariante {index + 1}</strong><p>{describeRequirement(variant.requirement)}</p><p>{variant.description}</p>{variant.inspectText && <p><em>Untersuchen:</em> {variant.inspectText}</p>}</div>)}
          {area.firstVisitRestocks?.length ? <><h3>Vorrat beim ersten Besuch</h3><ul>{area.firstVisitRestocks.map((restock) => <li key={restock.itemId}>{itemName(restock.itemId)} × {restock.quantity}</li>)}</ul></> : null}
          <p><strong>Wege:</strong> {passages.map((entry) => entry.id).join(', ') || 'keine'}</p>
          <p><strong>Rätsel:</strong> {puzzles.map((entry) => entry.id).join(', ') || 'keine'} · <strong>Kämpfe:</strong> {encounters.map((entry) => entry.id).join(', ') || 'keine'} · <strong>Interaktionen:</strong> {interactions.map((entry) => entry.id).join(', ') || 'keine'}</p>
        </Entry>
      })}
    </section>}

    {section === 'raetsel' && <section className="debug-list" aria-label="Alle Rätsel">
      {(activeWorld.puzzles ?? []).filter((puzzle) => matchesQuery(puzzle, normalizedQuery)).map((puzzle) => <Entry key={puzzle.id} title={puzzle.title} id={puzzle.id}>
        <Meta rows={[
          { label: 'Art', value: getPuzzleKind(puzzle) },
          { label: 'Ort', value: `${areaName(puzzle.areaId)} [${puzzle.areaId}]` },
          { label: 'Interaktion', value: puzzle.interactionId ?? 'keine' },
          { label: 'Offene Regler', value: puzzle.maxOpenControls ?? 'unbegrenzt' }
        ]} />
        <p><strong>Hinweis:</strong> {puzzle.hint}</p>
        {puzzle.hints && <ol>{puzzle.hints.map((hint) => <li key={hint}>{hint}</li>)}</ol>}
        {puzzle.reading && <div className="debug-subcard"><strong>{puzzle.reading.sourceTitle}</strong><p>{puzzle.reading.sourceText}</p></div>}
        {puzzle.completion && <div className="debug-subcard"><strong>Abschluss: {puzzle.completion.label}</strong><p>{puzzle.completion.description}</p><p>{puzzle.completion.resultText}</p><Effects effects={puzzle.completion.effects} /></div>}
        <details className="debug-solution"><summary>Lösung anzeigen</summary><pre>{puzzleSolution(puzzle).join('\n')}</pre></details>
        <button className="button button--primary" onClick={() => setPuzzleId(puzzle.id)}>Im Rätseltester öffnen</button>
      </Entry>)}
    </section>}

    {section === 'gegner' && <section className="debug-list" aria-label="Alle Gegner">
      {activeWorld.enemies.filter((enemy) => matchesQuery(enemy, normalizedQuery)).map((enemy) => <Entry key={enemy.id} title={enemy.name} id={enemy.id}>
        <Meta rows={[
          { label: 'Klasse', value: enemy.kind === 'boss' ? 'Boss' : 'Normal' },
          { label: 'Werte', value: `${enemy.maxLife} LP · ${enemy.defense} Panzerung` },
          { label: 'Tags', value: enemy.tags.join(', ') || 'keine' },
          { label: 'Schwächen', value: enemy.weakTo?.map((type) => `${DAMAGE_TYPE_ICONS[type]} ${DAMAGE_TYPE_LABELS[type]}`).join(', ') || 'keine' },
          { label: 'Widerstände', value: enemy.resistantTo?.map((type) => DAMAGE_TYPE_LABELS[type]).join(', ') || 'keine' },
          { label: 'Immun', value: enemy.immuneTo?.map((type) => DAMAGE_TYPE_LABELS[type]).join(', ') || 'gegen nichts' },
          { label: 'Eigenschaften', value: [enemy.airborne && 'fliegend', enemy.stealth && 'verborgen'].filter(Boolean).join(', ') || 'keine' },
          { label: 'Phasen', value: Object.keys(enemy.movesByPhase).length }
        ]} />
        {Object.entries(enemy.movesByPhase).map(([phase, moves]) => <div className="debug-subcard" key={phase}>
          <h3>Phase {phase}{enemy.phaseThresholds?.[Number(phase)] !== undefined ? ` ab ${enemy.phaseThresholds[Number(phase)]} LP` : ''}</h3>
          <ul className="debug-move-list">{moves.map((move) => <li key={move.id}><strong>{move.icon} {move.name}</strong> <Id>{move.id}</Id><span>{move.kind} · {move.damage} {DAMAGE_TYPE_LABELS[move.damageType ?? 'physical']}{move.healAmount ? ` · heilt ${move.healAmount}` : ''}</span><p>{move.telegraph}</p>{move.inflictedEffect && <small>Zustand: {move.inflictedEffect.id} für {move.inflictedEffect.duration} Züge{move.inflictedEffect.text ? ` · ${move.inflictedEffect.text}` : ''}</small>}</li>)}</ul>
        </div>)}
        {enemy.phaseSealItemIds && <p><strong>Phasensiegel:</strong> {Object.entries(enemy.phaseSealItemIds).map(([phase, id]) => `Phase ${phase}: ${itemName(id)}`).join(' · ')}</p>}
        {enemy.finalAction && <p><strong>Letzte Aktion:</strong> {enemy.finalAction.prompt} / {enemy.finalAction.label} / {enemy.finalAction.spokenText}</p>}
      </Entry>)}
    </section>}

    {section === 'kaempfe' && <section className="debug-list" aria-label="Alle Begegnungen">
      {activeWorld.encounters.filter((encounter) => matchesQuery(encounter, normalizedQuery)).map((encounter) => <Entry key={encounter.id} title={encounter.label} id={encounter.id}>
        <Meta rows={[
          { label: 'Ort', value: `${areaName(encounter.areaId)} [${encounter.areaId}]` },
          { label: 'Gegner', value: encounter.enemyIds.map((id) => `${enemyName(id)} [${id}]`).join(', ') },
          { label: 'Fluchtziel', value: `${areaName(encounter.fleeAreaId)} [${encounter.fleeAreaId}]` },
          { label: 'Pflichtausrüstung', value: describeRequirement(encounter.requiredGear) }
        ]} />
        <p>{encounter.description}</p>{encounter.gearWarning && <p><strong>Warnung:</strong> {encounter.gearWarning}</p>}
        <p><strong>Sieg:</strong> {encounter.victoryText}</p><h3>Belohnungen</h3><Effects effects={encounter.rewardEffects} />
        <button className="button button--primary" onClick={() => setEncounterId(encounter.id)}>Im Kampfsimulator öffnen</button>
      </Entry>)}
    </section>}

    {section === 'gegenstaende' && <section className="debug-list" aria-label="Alle Gegenstände">
      {activeWorld.items.filter((item) => matchesQuery(item, normalizedQuery)).map((item) => <Entry key={item.id} title={item.name} id={item.id}>
        <Meta rows={[{ label: 'Art', value: item.kind }, { label: 'Beschreibung', value: item.description }]} />
        {item.weapon && <div className="debug-subcard"><h3>Waffe</h3><p>{item.weapon.minDamage}–{item.weapon.maxDamage} {DAMAGE_TYPE_LABELS[item.weapon.damageType]} · {item.weapon.trait}</p>{item.weapon.elemental && <p>Element: {'type' in item.weapon.elemental ? DAMAGE_TYPE_LABELS[item.weapon.elemental.type] : item.weapon.elemental.choices.map((type) => DAMAGE_TYPE_LABELS[type]).join(' / ')} +{item.weapon.elemental.amount}</p>}{item.weapon.armorPiercing ? <p>Rüstungsdurchdringung: {item.weapon.armorPiercing}</p> : null}{item.weapon.bonusAgainstTag && <p>+{item.weapon.bonusAgainstTag.amount} gegen Tag „{item.weapon.bonusAgainstTag.tag}“</p>}{item.weapon.skill && <p><strong>Waffenkunst {item.weapon.skill.name}:</strong> {item.weapon.skill.description} · Abklingzeit {item.weapon.skill.cooldown} · <Id>{item.weapon.skill.id}</Id></p>}</div>}
        {item.armor && <div className="debug-subcard"><h3>{item.armor.slot === 'body' ? 'Rüstung' : 'Talisman'}</h3><p>{item.armor.defense} Panzerung · Schutz: {item.armor.protectsFrom?.map((type) => DAMAGE_TYPE_LABELS[type]).join(', ') || 'keiner'} · Immun: {item.armor.immuneTo?.map((type) => DAMAGE_TYPE_LABELS[type]).join(', ') || 'keine'}</p>{item.armor.penalty && <p><strong>Nachteil:</strong> {item.armor.penalty.text} [{item.armor.penalty.kind}]</p>}</div>}
        {item.healing && <div className="debug-subcard"><h3>Heilmittel</h3><p>+{item.healing.lifeRestored} LP{item.healing.extraEffect ? ` · ${item.healing.extraEffect}` : ''}</p>{item.healing.combatEffect && <p>Zustand: {item.healing.combatEffect.id} für {item.healing.combatEffect.duration} Züge</p>}{item.healing.clearsEffectIds?.length ? <p>Entfernt: {item.healing.clearsEffectIds.join(', ')}</p> : null}</div>}
      </Entry>)}
    </section>}

    {section === 'wege' && <section className="debug-list" aria-label="Alle Wege">
      {activeWorld.passages.filter((passage) => matchesQuery(passage, normalizedQuery)).map((passage) => <Entry key={passage.id} title={`${areaName(passage.fromAreaId)} ↔ ${areaName(passage.toAreaId)}`} id={passage.id}>
        <Meta rows={[
          { label: 'Von', value: `${areaName(passage.fromAreaId)} [${passage.fromAreaId}] · „${passage.labelFrom}“` },
          { label: 'Nach', value: `${areaName(passage.toAreaId)} [${passage.toAreaId}] · „${passage.labelTo}“` },
          { label: 'Voraussetzung', value: describeRequirement(passage.requirement) },
          { label: 'Abkürzung', value: passage.shortcut ? 'Ja' : 'Nein' },
          { label: 'Wächterkampf', value: passage.guardEncounterId ?? 'keiner' }
        ]} />
        {passage.blockedText && <p><strong>Blockiert:</strong> {passage.blockedText}</p>}
      </Entry>)}
    </section>}

    {section === 'interaktionen' && <section className="debug-list" aria-label="Alle Interaktionen">
      {activeWorld.interactions.filter((interaction) => matchesQuery(interaction, normalizedQuery)).map((interaction) => <Entry key={interaction.id} title={interaction.label} id={interaction.id}>
        <Meta rows={[
          { label: 'Ort', value: `${areaName(interaction.areaId)} [${interaction.areaId}]` },
          { label: 'Aktion', value: interaction.actionType },
          { label: 'Voraussetzung', value: describeRequirement(interaction.requirement) },
          { label: 'Sichtbar wenn', value: describeRequirement(interaction.visibilityRequirement) },
          { label: 'Erledigt wenn', value: describeRequirement(interaction.completedWhen) },
          { label: 'Truhe', value: interaction.chestId ?? 'keine' },
          { label: 'Nach Rast erneuert', value: interaction.restockAfterRest ? 'Ja' : 'Nein' }
        ]} />
        <p>{interaction.description}</p><p><strong>Ergebnis:</strong> {interaction.resultText}</p>{interaction.blockedText && <p><strong>Blockiert:</strong> {interaction.blockedText}</p>}
        <h3>Auswirkungen</h3><Effects effects={interaction.effects} />
      </Entry>)}
    </section>}

    {section === 'systeme' && <section className="debug-systems">
      {matchesQuery(campaignConfig, normalizedQuery) && <section><h2>Kampagnenkonfiguration</h2><div className="debug-list"><Entry title={activeWorld.presentation.title} id={activeWorld.campaignId}><Meta rows={[{ label: 'Startort', value: `${areaName(activeWorld.start.areaId)} [${activeWorld.start.areaId}]` }, { label: 'Startleben', value: activeWorld.start.maxLife }, { label: 'Startwaffe', value: activeWorld.start.equippedWeaponId ? itemName(activeWorld.start.equippedWeaponId) : 'keine' }, { label: 'Startrüstung', value: activeWorld.start.equippedArmorId ? itemName(activeWorld.start.equippedArmorId) : 'keine' }, { label: 'Endbedingung', value: describeRequirement(activeWorld.completionRequirement) }, { label: 'Kartenfreigabe', value: describeRequirement(activeWorld.mapRevealRequirement) }]} /><details className="debug-solution"><summary>Inhaltsinventar mit allen IDs</summary><pre>{JSON.stringify(activeWorld.contentInventory ?? {}, null, 2)}</pre></details></Entry></div></section>}
      <section><h2>Status-Effekte ({activeWorld.statusEffects?.length ?? 0})</h2><div className="debug-list">{activeWorld.statusEffects?.filter((effect) => matchesQuery(effect, normalizedQuery)).map((effect) => <Entry key={effect.id} title={`${effect.icon} ${effect.name}`} id={effect.id}><p>{effect.description}</p><Meta rows={[{ label: 'Ziel', value: effect.target }, { label: 'Pro Zug', value: effect.perTurn ? `${effect.perTurn.damage} ${DAMAGE_TYPE_LABELS[effect.perTurn.damageType]}` : 'nichts' }, { label: 'Höchstdauer', value: effect.maximumDuration ?? 'nicht gesetzt' }, { label: 'Entfernbar mit', value: effect.clearedByItemIds?.map(itemName).join(', ') || 'keinem Gegenstand' }, { label: 'Modifikatoren', value: <pre>{JSON.stringify(effect.modifiers ?? {}, null, 2)}</pre> }]} /></Entry>)}</div></section>
      <section><h2>Regelkarten ({activeWorld.ruleCards?.length ?? 0})</h2><div className="debug-list">{activeWorld.ruleCards?.filter((card) => matchesQuery(card, normalizedQuery)).map((card) => <Entry key={card.id} title={card.title} id={card.id}><p>{card.description}</p><p><strong>Freigabe:</strong> {describeRequirement(card.requirement)}</p></Entry>)}</div></section>
      <section><h2>Story-Ereignisse ({activeWorld.storyBeats?.length ?? 0})</h2><div className="debug-list">{activeWorld.storyBeats?.filter((beat) => matchesQuery(beat, normalizedQuery)).map((beat) => <Entry key={beat.id} title={beat.text.slice(0, 72)} id={beat.id}><p><strong>Auslöser:</strong> {describeRequirement(beat.requirement)}</p><p>{beat.text}</p></Entry>)}</div></section>
      <section><h2>Kartennotizen ({cardNoteEntries.length})</h2><div className="debug-list">{cardNoteEntries.filter((entry) => matchesQuery(entry, normalizedQuery)).map(({ id, note }) => <Entry key={id} title={note.slice(0, 72)} id={id}><p>{note}</p></Entry>)}</div></section>
      <section className="debug-welcome"><h2>Start- und Inventardaten</h2><pre>{JSON.stringify({ start: activeWorld.start, contentInventory: activeWorld.contentInventory }, null, 2)}</pre></section>
    </section>}

    {section !== 'uebersicht' && visibleCount === 0 && <p className="empty-state">Keine Einträge passen zu „{query}“.</p>}
  </main>
}
