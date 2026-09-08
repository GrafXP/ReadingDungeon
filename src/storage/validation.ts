import {
  CONTENT_VERSION,
  JOURNAL_LIMIT,
  SAVE_SCHEMA_VERSION,
  type CombatState,
  type GameEvent,
  type GameSave,
  type PuzzleState
} from '../domain/game'
import {
  DEFAULT_SETTINGS,
  SETTINGS_SCHEMA_VERSION,
  type AppSettings,
  type TextSize
} from '../domain/settings'
import { campaignWorld } from '../content/world/campaignWorld'
import { evaluateRequirement } from '../engine/requirements'

export class DataValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DataValidationError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireRecord(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) throw new DataValidationError(`${path} ist kein gültiges Objekt.`)
  return value
}

function requireString(value: unknown, path: string, allowEmpty = false): string {
  if (typeof value !== 'string' || (!allowEmpty && value.trim() === '')) {
    throw new DataValidationError(`${path} muss Text enthalten.`)
  }
  return value
}

function requireFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new DataValidationError(`${path} muss eine gültige Zahl sein.`)
  }
  return value
}

function requireNonNegativeInteger(value: unknown, path: string): number {
  const number = requireFiniteNumber(value, path)
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new DataValidationError(`${path} muss eine nicht-negative ganze Zahl sein.`)
  }
  return number
}

function requirePositiveInteger(value: unknown, path: string): number {
  const number = requireNonNegativeInteger(value, path)
  if (number < 1) throw new DataValidationError(`${path} muss mindestens 1 sein.`)
  return number
}

function requireBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') throw new DataValidationError(`${path} muss wahr oder falsch sein.`)
  return value
}

function requireStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) throw new DataValidationError(`${path} muss eine Liste sein.`)
  const strings = value.map((entry, index) => requireString(entry, `${path}[${index}]`))
  if (new Set(strings).size !== strings.length) throw new DataValidationError(`${path} enthält doppelte Einträge.`)
  return strings
}

function requireStringMap(value: unknown, path: string): Record<string, number> {
  const record = requireRecord(value, path)
  return Object.fromEntries(
    Object.entries(record).map(([key, count]) => [key, requireNonNegativeInteger(count, `${path}.${key}`)])
  )
}

function parsePuzzleStates(value: unknown): Record<string, PuzzleState> {
  const states = requireRecord(value, 'puzzleStates')
  return Object.fromEntries(
    Object.entries(states).map(([id, stateValue]) => {
      const state = requireRecord(stateValue, `puzzleStates.${id}`)
      const values = requireRecord(state.values, `puzzleStates.${id}.values`)
      for (const [key, entry] of Object.entries(values)) {
        if (!['string', 'number', 'boolean'].includes(typeof entry) || (typeof entry === 'number' && !Number.isFinite(entry))) {
          throw new DataValidationError(`puzzleStates.${id}.values.${key} hat einen unbekannten Wert.`)
        }
      }
      return [id, { kind: requireString(state.kind, `puzzleStates.${id}.kind`), values } as PuzzleState]
    })
  )
}

function parseEvents(value: unknown, field = 'recentEvents', keep = 50): GameEvent[] {
  if (!Array.isArray(value)) throw new DataValidationError(`${field} muss eine Liste sein.`)
  return value.slice(-keep).map((entry, index) => {
    const event = requireRecord(entry, `${field}[${index}]`)
    return {
      id: requireString(event.id, `${field}[${index}].id`),
      text: requireString(event.text, `${field}[${index}].text`),
      turn: requireNonNegativeInteger(event.turn, `${field}[${index}].turn`)
    }
  })
}

function parseCombat(value: unknown): CombatState | null {
  if (value === null) return null
  const combat = requireRecord(value, 'activeCombat')
  const enemyStance = requireString(combat.enemyStance, 'activeCombat.enemyStance')
  if (!['normal', 'guarded', 'vulnerable'].includes(enemyStance)) {
    throw new DataValidationError('activeCombat.enemyStance ist ungültig.')
  }
  const entryMode = requireString(combat.entryMode, 'activeCombat.entryMode')
  if (!['normal', 'early-boss', 'prepared-boss'].includes(entryMode)) {
    throw new DataValidationError('activeCombat.entryMode ist ungültig.')
  }
  if (!Array.isArray(combat.effects)) throw new DataValidationError('activeCombat.effects muss eine Liste sein.')
  const effects = combat.effects.map((value, index) => {
    const effect = requireRecord(value, `activeCombat.effects[${index}]`)
    return {
      id: requireString(effect.id, `activeCombat.effects[${index}].id`),
      remainingEnemyTurns: requirePositiveInteger(effect.remainingEnemyTurns, `activeCombat.effects[${index}].remainingEnemyTurns`)
    }
  })
  const enemyLife = requireNonNegativeInteger(combat.enemyLife, 'activeCombat.enemyLife')
  const enemyMaxLife = requirePositiveInteger(combat.enemyMaxLife, 'activeCombat.enemyMaxLife')
  if (enemyLife > enemyMaxLife) throw new DataValidationError('activeCombat.enemyLife ist grösser als das Maximum.')
  const pendingSeal = combat.pendingSealItemId
  if (pendingSeal !== null && typeof pendingSeal !== 'string') {
    throw new DataValidationError('activeCombat.pendingSealItemId ist ungültig.')
  }
  return {
    encounterId: requireString(combat.encounterId, 'activeCombat.encounterId'),
    enemyLife,
    enemyMaxLife,
    phase: requirePositiveInteger(combat.phase, 'activeCombat.phase'),
    announcedMoveId: requireString(combat.announcedMoveId, 'activeCombat.announcedMoveId'),
    round: requirePositiveInteger(combat.round, 'activeCombat.round'),
    enemyStance: enemyStance as CombatState['enemyStance'],
    entryMode: entryMode as CombatState['entryMode'],
    canFlee: requireBoolean(combat.canFlee, 'activeCombat.canFlee'),
    pendingSealItemId: pendingSeal,
    placedSealItemIds: requireStringArray(combat.placedSealItemIds, 'activeCombat.placedSealItemIds'),
    awaitingFinalPromise: requireBoolean(combat.awaitingFinalPromise, 'activeCombat.awaitingFinalPromise'),
    effects
  }
}

function migrateLegacySave(value: Record<string, unknown>): Record<string, unknown> {
  const version = value.schemaVersion
  if (version === SAVE_SCHEMA_VERSION) return value
  // Every released schema below the current one migrates forward; anything else is unknown.
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 0 || version > SAVE_SCHEMA_VERSION) {
    throw new DataValidationError(`Spielstand-Version ${String(version)} wird nicht unterstützt.`)
  }

  const legacyPlayer = isRecord(value.player) ? value.player : {}

  // Version 4 introduced the seal fields, so those saves already carry a full combat.
  const legacyCombat = !isRecord(value.activeCombat)
    ? null
    : version >= 4
      ? value.activeCombat
      : version === 3
        ? {
            ...value.activeCombat,
            pendingSealItemId: null,
            placedSealItemIds: [],
            awaitingFinalPromise: false
          }
        : null

  return {
    ...value,
    schemaVersion: SAVE_SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    previousAreaId: value.previousAreaId ?? null,
    player: {
      ...legacyPlayer,
      equippedWeaponId: legacyPlayer.equippedWeaponId ?? 'reiseschwert',
      inventory: {
        reiseschwert: 1,
        laterne: 1,
        apfelbrot: 3,
        ...(isRecord(legacyPlayer.inventory) ? legacyPlayer.inventory : {})
      }
    },
    openedChestIds: value.openedChestIds ?? [],
    defeatedEncounterIds: value.defeatedEncounterIds ?? [],
    unlockedPassageIds: value.unlockedPassageIds ?? [],
    completedQuestSteps: value.completedQuestSteps ?? [],
    discoveredClueIds: value.discoveredClueIds ?? [],
    deliveredDialogueIds: value.deliveredDialogueIds ?? [],
    puzzleStates: value.puzzleStates ?? {},
    flags: value.flags ?? [],
    activeCombat: legacyCombat,
    recentEvents: value.recentEvents ?? [],
    journal: value.journal ?? value.recentEvents ?? [],
    rngState: value.rngState ?? 1,
    turn: value.turn ?? 0
  }
}

export function migrateAndValidateGameSave(value: unknown): GameSave {
  const original = requireRecord(value, 'Spielstand')
  const originalContentVersion = requireNonNegativeInteger(original.contentVersion, 'contentVersion')
  if (originalContentVersion > CONTENT_VERSION) throw new DataValidationError(`Inhaltsversion ${originalContentVersion} ist neuer als diese App.`)
  const source = migrateLegacySave(original)
  const player = requireRecord(source.player, 'player')
  const life = requireNonNegativeInteger(player.life, 'player.life')
  const maxLife = requireNonNegativeInteger(player.maxLife, 'player.maxLife')
  if (maxLife < 1 || life > maxLife) {
    throw new DataValidationError('Die Lebenspunkte im Spielstand sind ungültig.')
  }
  const equipped = player.equippedWeaponId
  if (equipped !== null && typeof equipped !== 'string') {
    throw new DataValidationError('player.equippedWeaponId ist ungültig.')
  }
  const inventory = requireStringMap(player.inventory, 'player.inventory')
  if (equipped !== null && (inventory[equipped] ?? 0) < 1) {
    throw new DataValidationError('Die ausgerüstete Waffe fehlt im Inventar.')
  }
  const previous = source.previousAreaId
  if (previous !== null && typeof previous !== 'string') {
    throw new DataValidationError('previousAreaId ist ungültig.')
  }

  const save: GameSave = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    contentVersion: requireNonNegativeInteger(source.contentVersion, 'contentVersion'),
    runId: requireString(source.runId, 'runId'),
    playerName: requireString(source.playerName, 'playerName'),
    currentAreaId: requireString(source.currentAreaId, 'currentAreaId'),
    previousAreaId: previous,
    player: {
      life,
      maxLife,
      equippedWeaponId: equipped,
      inventory
    },
    visitedAreaIds: requireStringArray(source.visitedAreaIds, 'visitedAreaIds'),
    openedChestIds: requireStringArray(source.openedChestIds, 'openedChestIds'),
    defeatedEncounterIds: requireStringArray(source.defeatedEncounterIds, 'defeatedEncounterIds'),
    unlockedPassageIds: requireStringArray(source.unlockedPassageIds, 'unlockedPassageIds'),
    completedQuestSteps: requireStringArray(source.completedQuestSteps, 'completedQuestSteps'),
    discoveredClueIds: requireStringArray(source.discoveredClueIds, 'discoveredClueIds'),
    deliveredDialogueIds: requireStringArray(source.deliveredDialogueIds, 'deliveredDialogueIds'),
    puzzleStates: parsePuzzleStates(source.puzzleStates),
    flags: requireStringArray(source.flags, 'flags'),
    lastSanctuaryId: requireString(source.lastSanctuaryId, 'lastSanctuaryId'),
    activeCombat: parseCombat(source.activeCombat),
    recentEvents: parseEvents(source.recentEvents),
    journal: parseEvents(source.journal, 'journal', JOURNAL_LIMIT),
    rngState: requireNonNegativeInteger(source.rngState, 'rngState'),
    turn: requireNonNegativeInteger(source.turn, 'turn')
  }

  if (!save.visitedAreaIds.includes(save.currentAreaId)) {
    throw new DataValidationError('Der aktuelle Ort fehlt in den besuchten Orten.')
  }
  if (save.contentVersion > CONTENT_VERSION) {
    throw new DataValidationError(`Inhaltsversion ${save.contentVersion} ist neuer als diese App.`)
  }
  if (originalContentVersion < 5) {
    // The coast encounter moved to the flooded market in the full map.
    if (save.activeCombat?.encounterId === 'begegnung_pfuetzenhopser' && save.currentAreaId === 'kuestenpfad') {
      save.currentAreaId = 'ueberfluteter_markt'
      save.visitedAreaIds = [...new Set([...save.visitedAreaIds, save.currentAreaId])]
    }
    const sanctuary = campaignWorld.areas.find((area) => area.id === save.lastSanctuaryId)
    if (sanctuary && (!sanctuary.safe || !evaluateRequirement(sanctuary.sanctuaryRequirement, save).met)) save.lastSanctuaryId = 'sonnenwacht'
    if (save.flags.includes('archiv_geoeffnet') && !save.discoveredClueIds.includes('karte_marea')) save.discoveredClueIds.push('karte_marea')
  }
  validateWorldReferences(save)
  return save
}

function validateWorldReferences(save: GameSave): void {
  const known = (id: string, entries: { id: string }[], path: string) => {
    if (!entries.some((entry) => entry.id === id)) throw new DataValidationError(`${path}: unbekannter Eintrag ${id}.`)
  }
  known(save.currentAreaId, campaignWorld.areas, 'currentAreaId')
  if (save.previousAreaId !== null) known(save.previousAreaId, campaignWorld.areas, 'previousAreaId')
  for (const id of save.visitedAreaIds) known(id, campaignWorld.areas, 'visitedAreaIds')
  for (const id of save.unlockedPassageIds) known(id, campaignWorld.passages, 'unlockedPassageIds')
  for (const id of save.defeatedEncounterIds) known(id, campaignWorld.encounters, 'defeatedEncounterIds')
  for (const id of save.openedChestIds) {
    if (!campaignWorld.interactions.some((entry) => entry.chestId === id)) throw new DataValidationError(`Unbekannte Truhe: ${id}.`)
  }
  for (const id of Object.keys(save.player.inventory)) known(id, campaignWorld.items, 'player.inventory')
  if (save.player.equippedWeaponId !== null && !campaignWorld.items.some((item) => item.id === save.player.equippedWeaponId && item.kind === 'weapon')) throw new DataValidationError('Die ausgerüstete Waffe ist keine Waffe.')
  const sanctuary = campaignWorld.areas.find((entry) => entry.id === save.lastSanctuaryId)
  if (!sanctuary?.safe || !evaluateRequirement(sanctuary.sanctuaryRequirement, save).met) throw new DataValidationError('Der letzte sichere Ort ist kein verfügbarer Rastplatz.')
  if (save.rngState < 1 || save.rngState >= 2_147_483_647) throw new DataValidationError('rngState liegt ausserhalb des gültigen Bereichs.')
  for (const [id, state] of Object.entries(save.puzzleStates)) {
    const puzzle = campaignWorld.puzzles?.find((entry) => entry.id === id)
    if (!puzzle || state.kind !== 'controls') throw new DataValidationError(`Unbekanntes Rätsel: ${id}.`)
    const expectedKeys = ['sequence', ...puzzle.controls.map((control) => control.id)]
    if (Object.keys(state.values).length !== expectedKeys.length || expectedKeys.some((key) => !Object.hasOwn(state.values, key))) throw new DataValidationError(`Rätsel ${id}: unvollständige Stellung.`)
    for (const control of puzzle.controls) {
      const choice = requireNonNegativeInteger(state.values[control.id], `puzzleStates.${id}.${control.id}`)
      if (choice >= control.options.length) throw new DataValidationError(`Rätsel ${id}: ungültige Stellung.`)
    }
    const sequence = requireNonNegativeInteger(state.values.sequence, `puzzleStates.${id}.sequence`)
    if (sequence > (puzzle.sequence?.solution.length ?? 0) || (puzzle.maxOpenControls && puzzle.controls.filter((control) => state.values[control.id] === 1).length > puzzle.maxOpenControls)) throw new DataValidationError(`Rätsel ${id}: ungültiger Fortschritt.`)
  }
  const combat = save.activeCombat
  if (!combat) {
    if (save.player.life === 0) throw new DataValidationError('Ohne laufenden Kampf muss mindestens ein Lebenspunkt bleiben.')
    return
  }
  const encounter = campaignWorld.encounters.find((entry) => entry.id === combat.encounterId)
  const enemy = campaignWorld.enemies.find((entry) => entry.id === encounter?.enemyId)
  const move = enemy?.movesByPhase[combat.phase]?.find((entry) => entry.id === combat.announcedMoveId)
  if (!encounter || !enemy || !move || encounter.areaId !== save.currentAreaId || save.defeatedEncounterIds.includes(encounter.id)) throw new DataValidationError('Der laufende Kampf passt nicht zu Ort, Gegner oder Phase.')
  if (combat.enemyMaxLife !== enemy.maxLife || !save.player.equippedWeaponId) throw new DataValidationError('Der laufende Kampf hat ungültige Lebenspunkte oder keine Waffe.')
  const prepared = save.player.equippedWeaponId === 'morgenklinge'
  if (combat.entryMode !== (enemy.kind === 'normal' ? 'normal' : prepared ? 'prepared-boss' : 'early-boss') || (combat.entryMode !== 'prepared-boss' && !combat.canFlee)) throw new DataValidationError('Der Kampfmodus passt nicht zur Ausrüstung.')
  if (combat.entryMode === 'prepared-boss' && combat.canFlee !== (combat.enemyLife === combat.enemyMaxLife)) throw new DataValidationError('Der Rückweg passt nicht zum bisherigen Bosskampf.')
  if (combat.entryMode === 'early-boss' && combat.enemyLife !== combat.enemyMaxLife) throw new DataValidationError('Ohne Morgenklinge kann der Schattenpanzer keinen Schaden nehmen.')
  if (new Set(combat.effects.map((effect) => effect.id)).size !== combat.effects.length || combat.effects.some((effect) => !['blitzschutz', 'offener_riss', 'grauschleier'].includes(effect.id) || effect.remainingEnemyTurns > 3)) throw new DataValidationError('Unbekannter oder ungültiger Kampfeffekt.')
  const expectedStance = combat.effects.some((effect) => effect.id === 'offener_riss') ? 'vulnerable' : move.kind === 'guard' ? 'guarded' : 'normal'
  if (combat.enemyStance !== expectedStance) throw new DataValidationError('Die Kampfhaltung passt nicht zur angekündigten Bewegung.')
  if (!enemy.phaseSealItemIds) {
    const expectedPhase = enemy.phaseTwoAtLife !== undefined && combat.enemyLife <= enemy.phaseTwoAtLife ? 2 : 1
    if (combat.enemyLife === 0 || combat.phase !== expectedPhase || combat.pendingSealItemId !== null || combat.placedSealItemIds.length || combat.awaitingFinalPromise) throw new DataValidationError('Ungültiger Phasen- oder Siegelfortschritt.')
    return
  }
  const seals = Object.values(enemy.phaseSealItemIds)
  const expectedPlaced = combat.awaitingFinalPromise ? seals : seals.slice(0, combat.phase - 1)
  const floor = enemy.phaseThresholds?.[combat.phase + 1] ?? 0
  const ceiling = combat.phase === 1 ? enemy.maxLife : enemy.phaseThresholds![combat.phase]
  if (seals.some((id) => (save.player.inventory[id] ?? 0) < 1) || combat.placedSealItemIds.join('|') !== expectedPlaced.join('|') || combat.enemyLife < floor || combat.enemyLife > ceiling || (combat.pendingSealItemId !== null && (combat.pendingSealItemId !== enemy.phaseSealItemIds[combat.phase] || combat.enemyLife !== floor)) || (combat.awaitingFinalPromise && (combat.phase !== 3 || combat.enemyLife !== 0 || combat.pendingSealItemId !== null)) || (!combat.awaitingFinalPromise && combat.enemyLife === floor && combat.pendingSealItemId === null)) throw new DataValidationError('Die Siegel und Lebenspunkte des Finalkampfs passen nicht zusammen.')
}

export function validateSettings(value: unknown): AppSettings {
  const settings = requireRecord(value, 'Einstellungen')
  if (settings.schemaVersion !== 1 && settings.schemaVersion !== SETTINGS_SCHEMA_VERSION) {
    throw new DataValidationError('Die Einstellungs-Version wird nicht unterstützt.')
  }
  const textSizes: TextSize[] = ['normal', 'gross', 'sehr-gross']
  if (!textSizes.includes(settings.textSize as TextSize)) {
    throw new DataValidationError('Die Textgrösse ist ungültig.')
  }
  for (const key of ['highContrast', 'reducedMotion', 'soundEnabled'] as const) {
    if (typeof settings[key] !== 'boolean') throw new DataValidationError(`${key} ist ungültig.`)
  }
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    textSize: settings.textSize as TextSize,
    highContrast: settings.highContrast as boolean,
    reducedMotion: settings.reducedMotion as boolean,
    soundEnabled: settings.soundEnabled as boolean
  }
}

export function settingsOrDefaults(value: unknown): AppSettings {
  if (value === undefined) return DEFAULT_SETTINGS
  return validateSettings(value)
}

export function parseSaveImport(json: string): GameSave {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new DataValidationError('Die Datei enthält kein gültiges JSON.')
  }
  if (isRecord(parsed) && parsed.format === 'textdungeon-save') {
    if (parsed.formatVersion !== 1) throw new DataValidationError('Die Exportformat-Version wird nicht unterstützt.')
    return migrateAndValidateGameSave(parsed.adventure)
  }
  return migrateAndValidateGameSave(parsed)
}

export function createSaveExport(save: GameSave): string {
  return JSON.stringify(
    {
      format: 'textdungeon-save',
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      adventure: migrateAndValidateGameSave(save)
    },
    null,
    2
  )
}
