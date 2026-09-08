import { describe, expect, it } from 'vitest'
import { CONTENT_VERSION, createNewGame, SAVE_SCHEMA_VERSION } from '../domain/game'
import { SETTINGS_SCHEMA_VERSION } from '../domain/settings'
import { campaignWorld } from '../content/world/campaignWorld'
import { reduceGame } from '../engine/reducer'
import {
  createSaveExport,
  DataValidationError,
  migrateAndValidateGameSave,
  parseSaveImport,
  validateSettings
} from './validation'

describe('Spielstandprüfung', () => {
  it.each([
    ['Ort', (save: ReturnType<typeof createNewGame>) => { save.currentAreaId = 'nirgendwo'; save.visitedAreaIds.push('nirgendwo') }],
    ['Gegenstand', (save: ReturnType<typeof createNewGame>) => { save.player.inventory.unbekannt = 1 }],
    ['Waffentyp', (save: ReturnType<typeof createNewGame>) => { save.player.equippedWeaponId = 'laterne' }],
    ['Rastplatz', (save: ReturnType<typeof createNewGame>) => { save.lastSanctuaryId = 'spinnenhain' }],
    ['Tod ohne Kampf', (save: ReturnType<typeof createNewGame>) => { save.player.life = 0 }],
    ['Doppelte Orte', (save: ReturnType<typeof createNewGame>) => { save.visitedAreaIds.push('sonnenwacht') }],
    ['Zufallszustand', (save: ReturnType<typeof createNewGame>) => { save.rngState = 2_147_483_647 }],
    ['Unsichere Ganzzahl', (save: ReturnType<typeof createNewGame>) => { save.turn = Number.MAX_SAFE_INTEGER + 1 }],
    ['Rätselwert', (save: ReturnType<typeof createNewGame>) => { save.puzzleStates.echo = { kind: 'controls', values: { sequence: 99 } } }],
    ['Nicht endliche Zahl', (save: ReturnType<typeof createNewGame>) => { save.puzzleStates.echo = { kind: 'controls', values: { sequence: Infinity } } }]
  ] as const)('lehnt ungültige Referenzen und Zustände ab: %s', (_, mutate) => {
    const save = createNewGame('Mia')
    mutate(save)
    expect(() => migrateAndValidateGameSave(save)).toThrow(DataValidationError)
  })

  it.each(['Ort', 'Phase', 'Bewegung', 'Maximalleben', 'Siegel', 'Effekt', 'Sieg'] as const)('lehnt inkonsistente Kämpfe ab: %s', (field) => {
    const initial = createNewGame('Mia')
    const save = reduceGame({ ...initial, currentAreaId: 'ueberfluteter_markt', visitedAreaIds: ['sonnenwacht', 'ueberfluteter_markt'] }, { type: 'START_COMBAT', encounterId: 'begegnung_pfuetzenhopser' }, campaignWorld)
    if (field === 'Ort') save.currentAreaId = 'sonnenwacht'
    if (field === 'Phase') save.activeCombat!.phase = 9
    if (field === 'Bewegung') save.activeCombat!.announcedMoveId = 'nein'
    if (field === 'Maximalleben') save.activeCombat!.enemyMaxLife = 999
    if (field === 'Siegel') save.activeCombat!.pendingSealItemId = 'wurzelsiegel'
    if (field === 'Effekt') save.activeCombat!.effects = [{ id: 'unbekannt', remainingEnemyTurns: 1 }]
    if (field === 'Sieg') save.defeatedEncounterIds.push(save.activeCombat!.encounterId)
    expect(() => migrateAndValidateGameSave(save)).toThrow(DataValidationError)
  })

  it('lehnt neuere Inhalts- und Exportversionen auch in einem alten Schema ab', () => {
    expect(() => migrateAndValidateGameSave({ ...createNewGame('Mia'), schemaVersion: 1, contentVersion: CONTENT_VERSION + 1 })).toThrow('neuer als diese App')
    expect(() => parseSaveImport(JSON.stringify({ format: 'textdungeon-save', formatVersion: 99, adventure: createNewGame('Mia') }))).toThrow('Exportformat-Version')
  })

  it('migriert den alten Küstenkampf an seinen neuen Ort und behält Fortschritt', () => {
    const initial = createNewGame('Mia')
    const save = reduceGame({ ...initial, currentAreaId: 'ueberfluteter_markt', visitedAreaIds: ['sonnenwacht', 'kuestenpfad', 'ueberfluteter_markt'] }, { type: 'START_COMBAT', encounterId: 'begegnung_pfuetzenhopser' }, campaignWorld)
    const migrated = migrateAndValidateGameSave({ ...save, contentVersion: 4, schemaVersion: 3, currentAreaId: 'kuestenpfad', lastSanctuaryId: 'alter_markt' })
    expect(migrated.currentAreaId).toBe('ueberfluteter_markt')
    expect(migrated.lastSanctuaryId).toBe('sonnenwacht')
    expect(migrated.activeCombat?.enemyLife).toBe(8)
  })
  it('akzeptiert einen neuen Spielstand und einen eigenen Namen', () => {
    const save = createNewGame('  Mira  ')
    const validated = migrateAndValidateGameSave(save)

    expect(validated.playerName).toBe('Mira')
    expect(validated.currentAreaId).toBe('sonnenwacht')
    expect(validated.player.life).toBe(20)
  })

  it('migriert einen Spielstand der Version 0 ohne Fortschritt zu verlieren', () => {
    const current = createNewGame('Noah')
    const legacy = {
      ...current,
      schemaVersion: 0,
      flags: undefined,
      recentEvents: undefined
    }

    const migrated = migrateAndValidateGameSave(legacy)

    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION)
    expect(migrated.playerName).toBe('Noah')
    expect(migrated.flags).toEqual([])
    expect(migrated.recentEvents).toEqual([])
  })

  it('ergänzt bei Phase-1-Spielständen die Startausrüstung', () => {
    const current = createNewGame('Kim')
    const phaseOne = {
      ...current,
      schemaVersion: 1,
      contentVersion: 1,
      player: { ...current.player, equippedWeaponId: null, inventory: {} }
    }

    const migrated = migrateAndValidateGameSave(phaseOne)

    expect(migrated.contentVersion).toBe(CONTENT_VERSION)
    expect(migrated.player.equippedWeaponId).toBe('reiseschwert')
    expect(migrated.player.inventory).toMatchObject({ reiseschwert: 1, laterne: 1, apfelbrot: 3 })
  })

  it('migriert Phase-3-Spielstände ohne den alten Kampfplatzhalter zu übernehmen', () => {
    const current = createNewGame('Nia')
    const phaseThree = {
      ...current,
      schemaVersion: 2,
      contentVersion: 3,
      activeCombat: { encounterId: 'alt', enemyLife: 4, phase: 1, announcedMoveId: 'alt' }
    }

    const migrated = migrateAndValidateGameSave(phaseThree)
    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION)
    expect(migrated.contentVersion).toBe(CONTENT_VERSION)
    expect(migrated.activeCombat).toBeNull()
  })

  it('prüft und erhält einen laufenden Phase-4-Kampf vollständig', () => {
    const save = createNewGame('Ari')
    save.currentAreaId = 'perlenbecken'
    save.visitedAreaIds.push('perlenbecken')
    save.player.inventory.morgenklinge = 1
    save.player.equippedWeaponId = 'morgenklinge'
    save.activeCombat = {
      encounterId: 'boss_marea',
      enemyLife: 11,
      enemyMaxLife: 24,
      phase: 2,
      announcedMoveId: 'kleine_wellen',
      round: 5,
      enemyStance: 'vulnerable',
      entryMode: 'prepared-boss',
      canFlee: false,
      pendingSealItemId: null,
      placedSealItemIds: [],
      awaitingFinalPromise: false,
      effects: [{ id: 'offener_riss', remainingEnemyTurns: 2 }]
    }
    save.rngState = 48_271

    expect(parseSaveImport(createSaveExport(save))).toEqual(save)
  })

  it('migriert einen laufenden Kampf aus Speicherversion 3 ohne ihn zurückzusetzen', () => {
    const current = createNewGame('Mara')
    current.currentAreaId = 'perlenbecken'
    current.visitedAreaIds.push('perlenbecken')
    current.player.inventory.morgenklinge = 1
    current.player.equippedWeaponId = 'morgenklinge'
    const legacy = {
      ...current,
      schemaVersion: 3,
      activeCombat: {
        encounterId: 'boss_marea', enemyLife: 12, enemyMaxLife: 24, phase: 2,
        announcedMoveId: 'kleine_wellen', round: 4, enemyStance: 'normal',
        entryMode: 'prepared-boss', canFlee: false, effects: []
      }
    }

    const migrated = migrateAndValidateGameSave(legacy)
    expect(migrated.activeCombat).toMatchObject({
      encounterId: 'boss_marea', enemyLife: 12, phase: 2,
      pendingSealItemId: null, placedSealItemIds: [], awaitingFinalPromise: false
    })
  })

  it('übernimmt bei Spielständen ohne Tagebuch die bekannten Ereignisse', () => {
    const legacy: Record<string, unknown> = { ...createNewGame('Mia'), schemaVersion: 4 }
    delete legacy.journal

    const migrated = migrateAndValidateGameSave(legacy)

    expect(migrated.schemaVersion).toBe(SAVE_SCHEMA_VERSION)
    expect(migrated.journal).toEqual(migrated.recentEvents)
    expect(migrated.journal).toHaveLength(1)
  })

  it('behält beim Import ein vollständiges Tagebuch, das länger als die letzten Ereignisse ist', () => {
    let save = createNewGame('Mia')
    for (let round = 0; round < 6; round += 1) {
      save = reduceGame(save, { type: 'MOVE', passageId: 'p02', toAreaId: 'alter_markt' }, campaignWorld)
      save = reduceGame(save, { type: 'MOVE', passageId: 'p02', toAreaId: 'sonnenwacht' }, campaignWorld)
    }
    expect(save.recentEvents.length).toBeLessThan(save.journal.length)

    const restored = parseSaveImport(createSaveExport(save))

    expect(restored.journal).toHaveLength(save.journal.length)
    expect(restored.journal.at(-1)).toEqual(save.journal.at(-1))
    expect(restored.journal[0]).toEqual(save.journal[0])
  })

  it('lehnt Lebenspunkte ausserhalb des gültigen Bereichs ab', () => {
    const save = createNewGame('Lina')
    save.player.life = 21

    expect(() => migrateAndValidateGameSave(save)).toThrow(DataValidationError)
  })

  it('lehnt eine ausgerüstete Waffe ab, die nicht im Inventar liegt', () => {
    const save = createNewGame('Lina')
    save.player.inventory = { laterne: 1 }

    expect(() => migrateAndValidateGameSave(save)).toThrow('ausgerüstete Waffe fehlt')
  })

  it('exportiert und importiert ein geprüftes Dateiformat', () => {
    const save = createNewGame('Sam')
    const imported = parseSaveImport(createSaveExport(save))

    expect(imported).toEqual(save)
  })

  it('meldet unlesbares JSON verständlich', () => {
    expect(() => parseSaveImport('{kaputt')).toThrow('kein gültiges JSON')
  })

  it('entfernt die alte Vorleseeinstellung bei der Einstellungsmigration', () => {
    const migrated = validateSettings({
      schemaVersion: 1,
      textSize: 'gross',
      highContrast: false,
      reducedMotion: true,
      readAloud: true,
      soundEnabled: false
    })

    expect(migrated.schemaVersion).toBe(SETTINGS_SCHEMA_VERSION)
    expect(migrated).not.toHaveProperty('readAloud')
  })
})
