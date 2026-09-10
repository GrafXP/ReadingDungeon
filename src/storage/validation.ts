import type { DamageType, WorldDefinition } from '../domain/content'
import {
  CONTENT_VERSION,
  JOURNAL_LIMIT,
  SAVE_SCHEMA_VERSION,
  type ActiveEffect,
  type CombatState,
  type Combatant,
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
import { kantaraWorld } from '../content/world/kantaraWorld'
import { evaluateRequirement } from '../engine/requirements'
import { isPuzzleStateValid } from '../engine/puzzles'

export class DataValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DataValidationError'
  }
}

export class CampaignMismatchError extends DataValidationError {
  constructor(
    readonly foundCampaignId: string | null,
    readonly expectedCampaignId: string
  ) {
    super(foundCampaignId
      ? `Dieser Spielstand gehört zur Kampagne «${foundCampaignId}», nicht zu «${expectedCampaignId}». Er wurde nicht verändert.`
      : `Dieser ältere Spielstand hat keine Kampagnenkennung und kann nicht als «${expectedCampaignId}» geladen werden. Er wurde nicht verändert.`)
    this.name = 'CampaignMismatchError'
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
  if (typeof value !== 'string' || (!allowEmpty && value.trim() === '')) throw new DataValidationError(`${path} muss Text enthalten.`)
  return value
}

function requireFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new DataValidationError(`${path} muss eine gültige Zahl sein.`)
  return value
}

function requireNonNegativeInteger(value: unknown, path: string): number {
  const number = requireFiniteNumber(value, path)
  if (!Number.isSafeInteger(number) || number < 0) throw new DataValidationError(`${path} muss eine nicht-negative ganze Zahl sein.`)
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
  return Object.fromEntries(Object.entries(record).map(([key, count]) => [key, requireNonNegativeInteger(count, `${path}.${key}`)]))
}

function parseDamageType(value: unknown, path: string): DamageType {
  if (!['physical', 'fire', 'ice', 'lightning', 'light', 'shadow'].includes(String(value))) throw new DataValidationError(`${path} hat eine unbekannte Schadensart.`)
  return value as DamageType
}

function parseDamageTypeMap(value: unknown, path: string): Partial<Record<string, DamageType>> {
  const record = requireRecord(value, path)
  return Object.fromEntries(Object.entries(record).map(([key, mode]) => [key, parseDamageType(mode, `${path}.${key}`)]))
}

function parsePuzzleStates(value: unknown): Record<string, PuzzleState> {
  const states = requireRecord(value, 'puzzleStates')
  return Object.fromEntries(Object.entries(states).map(([id, stateValue]) => {
    const state = requireRecord(stateValue, `puzzleStates.${id}`)
    const values = requireRecord(state.values, `puzzleStates.${id}.values`)
    for (const [key, entry] of Object.entries(values)) {
      if (!['string', 'number', 'boolean'].includes(typeof entry) || (typeof entry === 'number' && !Number.isFinite(entry))) throw new DataValidationError(`puzzleStates.${id}.values.${key} hat einen unbekannten Wert.`)
    }
    return [id, { kind: requireString(state.kind, `puzzleStates.${id}.kind`), values } as PuzzleState]
  }))
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

function parseEffects(value: unknown, path: string): ActiveEffect[] {
  if (!Array.isArray(value)) throw new DataValidationError(`${path} muss eine Liste sein.`)
  const effects = value.map((entry, index) => {
    const effect = requireRecord(entry, `${path}[${index}]`)
    return {
      id: requireString(effect.id, `${path}[${index}].id`),
      remainingEnemyTurns: requirePositiveInteger(effect.remainingEnemyTurns, `${path}[${index}].remainingEnemyTurns`)
    }
  })
  if (new Set(effects.map((effect) => effect.id)).size !== effects.length) throw new DataValidationError(`${path} enthält doppelte Zustände.`)
  return effects
}

function parseCombatant(value: unknown, index: number): Combatant {
  const path = `activeCombat.combatants[${index}]`
  const combatant = requireRecord(value, path)
  const stance = requireString(combatant.stance, `${path}.stance`)
  if (!['normal', 'guarded', 'vulnerable'].includes(stance)) throw new DataValidationError(`${path}.stance ist ungültig.`)
  const life = requireNonNegativeInteger(combatant.life, `${path}.life`)
  const maxLife = requirePositiveInteger(combatant.maxLife, `${path}.maxLife`)
  if (life > maxLife) throw new DataValidationError(`${path}.life ist grösser als das Maximum.`)
  return {
    enemyId: requireString(combatant.enemyId, `${path}.enemyId`),
    life,
    maxLife,
    phase: requirePositiveInteger(combatant.phase, `${path}.phase`),
    announcedMoveId: requireString(combatant.announcedMoveId, `${path}.announcedMoveId`),
    stance: stance as Combatant['stance'],
    effects: parseEffects(combatant.effects, `${path}.effects`)
  }
}

function parseCombat(value: unknown): CombatState | null {
  if (value === null) return null
  const combat = requireRecord(value, 'activeCombat')
  if (!Array.isArray(combat.combatants) || combat.combatants.length < 1 || combat.combatants.length > 2) throw new DataValidationError('activeCombat.combatants braucht einen oder zwei Kämpfer.')
  const combatants = combat.combatants.map(parseCombatant)
  const targetIndex = requireNonNegativeInteger(combat.targetIndex, 'activeCombat.targetIndex')
  if (targetIndex >= combatants.length) throw new DataValidationError('activeCombat.targetIndex zeigt auf keinen Kämpfer.')
  const pendingSeal = combat.pendingSealItemId
  if (pendingSeal !== null && typeof pendingSeal !== 'string') throw new DataValidationError('activeCombat.pendingSealItemId ist ungültig.')
  return {
    encounterId: requireString(combat.encounterId, 'activeCombat.encounterId'),
    combatants,
    targetIndex,
    round: requirePositiveInteger(combat.round, 'activeCombat.round'),
    canFlee: requireBoolean(combat.canFlee, 'activeCombat.canFlee'),
    playerEffects: parseEffects(combat.playerEffects, 'activeCombat.playerEffects'),
    skillCooldown: requireNonNegativeInteger(combat.skillCooldown, 'activeCombat.skillCooldown'),
    pendingSealItemId: pendingSeal,
    placedSealItemIds: requireStringArray(combat.placedSealItemIds, 'activeCombat.placedSealItemIds'),
    awaitingFinalAction: requireBoolean(combat.awaitingFinalAction, 'activeCombat.awaitingFinalAction')
  }
}

function migrateSameCampaignSave(value: Record<string, unknown>, world: WorldDefinition): Record<string, unknown> {
  const version = value.schemaVersion
  if (version === SAVE_SCHEMA_VERSION) return value
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 0 || version > SAVE_SCHEMA_VERSION) throw new DataValidationError(`Spielstand-Version ${String(version)} wird nicht unterstützt.`)
  const legacyPlayer = isRecord(value.player) ? value.player : {}
  const maxLife = typeof legacyPlayer.maxLife === 'number' && Number.isFinite(legacyPlayer.maxLife) ? legacyPlayer.maxLife : world.start.maxLife
  const sanctuaryId = typeof value.lastSanctuaryId === 'string' ? value.lastSanctuaryId : world.start.areaId

  return {
    ...value,
    schemaVersion: SAVE_SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    currentAreaId: isRecord(value.activeCombat) ? sanctuaryId : value.currentAreaId,
    previousAreaId: isRecord(value.activeCombat) ? null : value.previousAreaId ?? null,
    player: {
      ...legacyPlayer,
      life: isRecord(value.activeCombat) ? maxLife : legacyPlayer.life,
      equippedWeaponId: legacyPlayer.equippedWeaponId ?? world.start.equippedWeaponId,
      equippedArmorId: legacyPlayer.equippedArmorId ?? null,
      equippedTalismanId: legacyPlayer.equippedTalismanId ?? null,
      weaponElementModes: legacyPlayer.weaponElementModes ?? {},
      inventory: { ...world.start.inventory, ...(isRecord(legacyPlayer.inventory) ? legacyPlayer.inventory : {}) }
    },
    visitedAreaIds: [...new Set([...(Array.isArray(value.visitedAreaIds) ? value.visitedAreaIds : []), sanctuaryId])],
    openedChestIds: value.openedChestIds ?? [],
    defeatedEncounterIds: value.defeatedEncounterIds ?? [],
    unlockedPassageIds: value.unlockedPassageIds ?? [],
    completedQuestSteps: value.completedQuestSteps ?? [],
    discoveredClueIds: value.discoveredClueIds ?? [],
    deliveredDialogueIds: value.deliveredDialogueIds ?? [],
    studiedEnemyIds: value.studiedEnemyIds ?? [],
    metEnemyIds: value.metEnemyIds ?? [],
    puzzleStates: value.puzzleStates ?? {},
    flags: value.flags ?? [],
    activeCombat: null,
    recentEvents: value.recentEvents ?? [],
    journal: value.journal ?? value.recentEvents ?? [],
    rngState: value.rngState ?? 1,
    turn: value.turn ?? 0
  }
}

function validateEquippedItem(id: string | null, slot: 'weapon' | 'body' | 'talisman', inventory: Record<string, number>, world: WorldDefinition): void {
  if (id === null) return
  if ((inventory[id] ?? 0) < 1) throw new DataValidationError(`Die ausgerüstete ${slot === 'weapon' ? 'Waffe' : slot === 'body' ? 'Rüstung' : 'Talisman'} fehlt im Inventar.`)
  const item = world.items.find((entry) => entry.id === id)
  if (slot === 'weapon' ? !item?.weapon : item?.armor?.slot !== slot) throw new DataValidationError(`Der ausgerüstete Gegenstand ${id} passt nicht auf den Platz ${slot}.`)
}

export function migrateAndValidateGameSave(value: unknown, world: WorldDefinition = kantaraWorld): GameSave {
  const original = requireRecord(value, 'Spielstand')
  const campaignId = typeof original.campaignId === 'string' ? original.campaignId : null
  if (campaignId !== world.campaignId) throw new CampaignMismatchError(campaignId, world.campaignId)
  const originalContentVersion = requireNonNegativeInteger(original.contentVersion, 'contentVersion')
  if (originalContentVersion > CONTENT_VERSION) throw new DataValidationError(`Inhaltsversion ${originalContentVersion} ist neuer als diese App.`)
  const source = migrateSameCampaignSave(original, world)
  const player = requireRecord(source.player, 'player')
  const life = requireNonNegativeInteger(player.life, 'player.life')
  const maxLife = requirePositiveInteger(player.maxLife, 'player.maxLife')
  if (life > maxLife) throw new DataValidationError('Die Lebenspunkte im Spielstand sind ungültig.')
  const inventory = requireStringMap(player.inventory, 'player.inventory')
  const equippedWeaponId = player.equippedWeaponId === null ? null : requireString(player.equippedWeaponId, 'player.equippedWeaponId')
  const equippedArmorId = player.equippedArmorId === null ? null : requireString(player.equippedArmorId, 'player.equippedArmorId')
  const equippedTalismanId = player.equippedTalismanId === null ? null : requireString(player.equippedTalismanId, 'player.equippedTalismanId')
  const previousAreaId = source.previousAreaId === null ? null : requireString(source.previousAreaId, 'previousAreaId')

  const save: GameSave = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    contentVersion: requireNonNegativeInteger(source.contentVersion, 'contentVersion'),
    campaignId,
    runId: requireString(source.runId, 'runId'),
    playerName: requireString(source.playerName, 'playerName'),
    currentAreaId: requireString(source.currentAreaId, 'currentAreaId'),
    previousAreaId,
    player: {
      life,
      maxLife,
      equippedWeaponId,
      equippedArmorId,
      equippedTalismanId,
      weaponElementModes: parseDamageTypeMap(player.weaponElementModes, 'player.weaponElementModes'),
      inventory
    },
    visitedAreaIds: requireStringArray(source.visitedAreaIds, 'visitedAreaIds'),
    openedChestIds: requireStringArray(source.openedChestIds, 'openedChestIds'),
    defeatedEncounterIds: requireStringArray(source.defeatedEncounterIds, 'defeatedEncounterIds'),
    unlockedPassageIds: requireStringArray(source.unlockedPassageIds, 'unlockedPassageIds'),
    completedQuestSteps: requireStringArray(source.completedQuestSteps, 'completedQuestSteps'),
    discoveredClueIds: requireStringArray(source.discoveredClueIds, 'discoveredClueIds'),
    deliveredDialogueIds: requireStringArray(source.deliveredDialogueIds, 'deliveredDialogueIds'),
    studiedEnemyIds: requireStringArray(source.studiedEnemyIds, 'studiedEnemyIds'),
    metEnemyIds: requireStringArray(source.metEnemyIds, 'metEnemyIds'),
    puzzleStates: parsePuzzleStates(source.puzzleStates),
    flags: requireStringArray(source.flags, 'flags'),
    lastSanctuaryId: requireString(source.lastSanctuaryId, 'lastSanctuaryId'),
    activeCombat: parseCombat(source.activeCombat),
    recentEvents: parseEvents(source.recentEvents),
    journal: parseEvents(source.journal, 'journal', JOURNAL_LIMIT),
    rngState: requireNonNegativeInteger(source.rngState, 'rngState'),
    turn: requireNonNegativeInteger(source.turn, 'turn')
  }

  if (!save.visitedAreaIds.includes(save.currentAreaId)) throw new DataValidationError('Der aktuelle Ort fehlt in den besuchten Orten.')
  validateWorldReferences(save, world)
  return save
}

function validateWorldReferences(save: GameSave, world: WorldDefinition): void {
  const known = (id: string, entries: { id: string }[], path: string) => {
    if (!entries.some((entry) => entry.id === id)) throw new DataValidationError(`${path}: unbekannter Eintrag ${id}.`)
  }
  known(save.currentAreaId, world.areas, 'currentAreaId')
  if (save.previousAreaId !== null) known(save.previousAreaId, world.areas, 'previousAreaId')
  for (const id of save.visitedAreaIds) known(id, world.areas, 'visitedAreaIds')
  for (const id of save.unlockedPassageIds) known(id, world.passages, 'unlockedPassageIds')
  for (const id of save.defeatedEncounterIds) known(id, world.encounters, 'defeatedEncounterIds')
  for (const id of save.openedChestIds) if (!world.interactions.some((entry) => entry.chestId === id)) throw new DataValidationError(`Unbekannte Truhe: ${id}.`)
  for (const id of Object.keys(save.player.inventory)) known(id, world.items, 'player.inventory')
  validateEquippedItem(save.player.equippedWeaponId, 'weapon', save.player.inventory, world)
  validateEquippedItem(save.player.equippedArmorId, 'body', save.player.inventory, world)
  validateEquippedItem(save.player.equippedTalismanId, 'talisman', save.player.inventory, world)
  for (const [weaponId, mode] of Object.entries(save.player.weaponElementModes)) {
    const elemental = world.items.find((item) => item.id === weaponId)?.weapon?.elemental
    if ((save.player.inventory[weaponId] ?? 0) < 1 || !elemental || !('choices' in elemental) || !elemental.choices.includes(mode!)) throw new DataValidationError(`Der Waffenmodus für ${weaponId} ist ungültig.`)
  }
  const sanctuary = world.areas.find((entry) => entry.id === save.lastSanctuaryId)
  if (!sanctuary?.safe || !evaluateRequirement(sanctuary.sanctuaryRequirement, save).met) throw new DataValidationError('Der letzte sichere Ort ist kein verfügbarer Rastplatz.')
  if (save.rngState < 1 || save.rngState >= 2_147_483_647) throw new DataValidationError('rngState liegt ausserhalb des gültigen Bereichs.')
  for (const id of save.metEnemyIds) known(id, world.enemies, 'metEnemyIds')
  for (const id of save.studiedEnemyIds) {
    known(id, world.enemies, 'studiedEnemyIds')
    if (!save.metEnemyIds.includes(id)) throw new DataValidationError(`Untersuchter Gegner ${id} wurde noch nicht getroffen.`)
  }
  for (const [id, state] of Object.entries(save.puzzleStates)) {
    const puzzle = world.puzzles?.find((entry) => entry.id === id)
    if (!puzzle || !isPuzzleStateValid(state, puzzle)) throw new DataValidationError(`Unbekanntes oder ungültiges Rätsel: ${id}.`)
  }

  const combat = save.activeCombat
  if (!combat) {
    if (save.player.life === 0) throw new DataValidationError('Ohne laufenden Kampf muss mindestens ein Lebenspunkt bleiben.')
    return
  }
  const encounter = world.encounters.find((entry) => entry.id === combat.encounterId)
  if (!encounter || encounter.areaId !== save.currentAreaId || save.defeatedEncounterIds.includes(encounter.id)) throw new DataValidationError('Der laufende Kampf passt nicht zu Ort oder Begegnung.')
  if (combat.combatants.map((entry) => entry.enemyId).join('|') !== encounter.enemyIds.join('|')) throw new DataValidationError('Die Kämpferliste passt nicht zur Begegnung.')
  const bossWasHit = combat.combatants.some((entry) => world.enemies.some((enemy) => enemy.id === entry.enemyId && enemy.kind === 'boss') && entry.life < entry.maxLife)
  if (bossWasHit && combat.canFlee) throw new DataValidationError('Der Rückweg eines begonnenen Bosskampfs darf nicht wieder geöffnet werden.')
  const knownEffects = new Map((world.statusEffects ?? []).map((effect) => [effect.id, effect]))
  for (const effect of combat.playerEffects) {
    const definition = knownEffects.get(effect.id)
    if (!definition || definition.target !== 'player' || (definition.maximumDuration && effect.remainingEnemyTurns > definition.maximumDuration)) throw new DataValidationError(`Unbekannter oder ungültiger Spielereffekt ${effect.id}.`)
  }
  for (const effect of combat.combatants.flatMap((entry) => entry.effects)) {
    const definition = knownEffects.get(effect.id)
    if (!definition || definition.target !== 'enemy' || (definition.maximumDuration && effect.remainingEnemyTurns > definition.maximumDuration)) throw new DataValidationError(`Unbekannter oder ungültiger Gegnereffekt ${effect.id}.`)
  }
  const equippedWeapon = world.items.find((item) => item.id === save.player.equippedWeaponId)?.weapon
  const equippedArmor = world.items.find((item) => item.id === save.player.equippedArmorId)?.armor
  const maximumCooldown = equippedWeapon?.skill ? equippedWeapon.skill.cooldown + (equippedArmor?.penalty?.kind === 'slowSkill' ? 1 : 0) : 0
  if (combat.skillCooldown > maximumCooldown) throw new DataValidationError('Die gespeicherte Waffenkunst-Abklingzeit ist ungültig.')
  for (const combatant of combat.combatants) {
    const enemy = world.enemies.find((entry) => entry.id === combatant.enemyId)
    const move = enemy?.movesByPhase[combatant.phase]?.find((entry) => entry.id === combatant.announcedMoveId)
    if (!enemy || !move || combatant.maxLife !== enemy.maxLife) throw new DataValidationError(`Kämpfer ${combatant.enemyId} passt nicht zu Gegner, Phase oder Bewegung.`)
    const effectStance = combatant.effects
      .map((effect) => knownEffects.get(effect.id)?.modifiers?.enemyStance)
      .find((stance) => stance !== undefined)
    const expectedStance = effectStance ?? (['guard', 'shield'].includes(move.kind) ? 'guarded' : 'normal')
    if (combatant.stance !== expectedStance) throw new DataValidationError(`Die Haltung von ${combatant.enemyId} passt nicht zur angekündigten Bewegung.`)
  }
  const target = combat.combatants[combat.targetIndex]
  const targetEnemy = world.enemies.find((entry) => entry.id === target.enemyId)!
  if (combat.pendingSealItemId && (targetEnemy.phaseSealItemIds?.[target.phase] !== combat.pendingSealItemId || target.life !== (targetEnemy.phaseThresholds?.[target.phase + 1] ?? 0))) throw new DataValidationError('Das bereite Phasensiegel passt nicht zum Ziel.')
  if (combat.awaitingFinalAction && (!targetEnemy.finalAction || target.life !== 0 || combat.pendingSealItemId !== null)) throw new DataValidationError('Die letzte Kampfaktion ist nicht bereit.')
}

export function validateSettings(value: unknown): AppSettings {
  const settings = requireRecord(value, 'Einstellungen')
  if (settings.schemaVersion !== 1 && settings.schemaVersion !== SETTINGS_SCHEMA_VERSION) throw new DataValidationError('Die Einstellungs-Version wird nicht unterstützt.')
  const textSizes: TextSize[] = ['normal', 'gross', 'sehr-gross']
  if (!textSizes.includes(settings.textSize as TextSize)) throw new DataValidationError('Die Textgrösse ist ungültig.')
  for (const key of ['highContrast', 'reducedMotion', 'soundEnabled'] as const) if (typeof settings[key] !== 'boolean') throw new DataValidationError(`${key} ist ungültig.`)
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

export function parseSaveImport(json: string, world: WorldDefinition = kantaraWorld): GameSave {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new DataValidationError('Die Datei enthält kein gültiges JSON.')
  }
  if (isRecord(parsed) && parsed.format === 'textdungeon-save') {
    if (parsed.formatVersion !== 1) throw new DataValidationError('Die Exportformat-Version wird nicht unterstützt.')
    if (typeof parsed.campaignId === 'string' && parsed.campaignId !== world.campaignId) throw new CampaignMismatchError(parsed.campaignId, world.campaignId)
    return migrateAndValidateGameSave(parsed.adventure, world)
  }
  return migrateAndValidateGameSave(parsed, world)
}

export function createSaveExport(save: GameSave, world: WorldDefinition = kantaraWorld): string {
  const adventure = migrateAndValidateGameSave(save, world)
  return JSON.stringify({
    format: 'textdungeon-save',
    formatVersion: 1,
    campaignId: adventure.campaignId,
    exportedAt: new Date().toISOString(),
    adventure
  }, null, 2)
}

/** Wraps a quarantined local value without interpreting or changing it. */
export function createQuarantinedSaveExport(value: unknown): string {
  const campaignId = isRecord(value) && typeof value.campaignId === 'string' ? value.campaignId : null
  return JSON.stringify({
    format: 'textdungeon-save',
    formatVersion: 1,
    campaignId,
    exportedAt: new Date().toISOString(),
    quarantined: true,
    adventure: value
  }, null, 2)
}
