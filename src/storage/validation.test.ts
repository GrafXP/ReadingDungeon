import { describe, expect, it } from 'vitest'
import { CONTENT_VERSION, createNewGame, SAVE_SCHEMA_VERSION } from '../domain/game'
import { SETTINGS_SCHEMA_VERSION } from '../domain/settings'
import { campaignWorld } from '../content/world/campaignWorld'
import { talora2World } from '../content/world/talora2World'
import { reduceGame } from '../engine/reducer'
import {
  CampaignMismatchError,
  createSaveExport,
  DataValidationError,
  migrateAndValidateGameSave,
  parseSaveImport,
  validateSettings
} from './validation'

describe('Spielstandprüfung', () => {
  it('erstellt einen vollständig gekennzeichneten Talora-II-Spielstand in Sonnenwacht', () => {
    const save = createNewGame('  Mira  ', talora2World)
    const validated = migrateAndValidateGameSave(save, talora2World)

    expect(validated).toMatchObject({
      schemaVersion: SAVE_SCHEMA_VERSION,
      contentVersion: CONTENT_VERSION,
      campaignId: 'talora2',
      playerName: 'Mira',
      currentAreaId: 'sm_sonnenwacht',
      studiedEnemyIds: [],
      metEnemyIds: []
    })
    expect(validated.player).toMatchObject({
      equippedWeaponId: 'item_weapon_reiseschwert',
      equippedArmorId: 'item_armor_reisewams',
      equippedTalismanId: null,
      weaponElementModes: {}
    })
  })

  it.each([
    ['Ort', (save: ReturnType<typeof createNewGame>) => { save.currentAreaId = 'nirgendwo'; save.visitedAreaIds.push('nirgendwo') }],
    ['Gegenstand', (save: ReturnType<typeof createNewGame>) => { save.player.inventory.unbekannt = 1 }],
    ['Waffentyp', (save: ReturnType<typeof createNewGame>) => { save.player.equippedWeaponId = 'item_armor_reisewams' }],
    ['Rüstungstyp', (save: ReturnType<typeof createNewGame>) => { save.player.equippedArmorId = 'item_weapon_reiseschwert' }],
    ['Tod ohne Kampf', (save: ReturnType<typeof createNewGame>) => { save.player.life = 0 }],
    ['Doppelte Orte', (save: ReturnType<typeof createNewGame>) => { save.visitedAreaIds.push('sm_sonnenwacht') }],
    ['Zufallszustand', (save: ReturnType<typeof createNewGame>) => { save.rngState = 2_147_483_647 }],
    ['Waffenmodus', (save: ReturnType<typeof createNewGame>) => { save.player.weaponElementModes.item_weapon_reiseschwert = 'fire' }]
  ] as const)('lehnt ungültige Referenzen und Zustände ab: %s', (_, mutate) => {
    const save = createNewGame('Mia', talora2World)
    mutate(save)
    expect(() => migrateAndValidateGameSave(save, talora2World)).toThrow(DataValidationError)
  })

  it('lehnt einen kennungslosen oder fremden Spielstand vor jeder Migration ab', () => {
    const oldSave: Record<string, unknown> = { ...createNewGame('Alt', campaignWorld), schemaVersion: 5 }
    delete oldSave.campaignId

    expect(() => migrateAndValidateGameSave(oldSave, talora2World)).toThrow(CampaignMismatchError)
    expect(() => migrateAndValidateGameSave(createNewGame('Tal', campaignWorld), talora2World)).toThrow('gehört zur Kampagne')
  })

  it('migriert nur eine ältere technische Version derselben Kampagne und beendet ihren alten Kampf', () => {
    const current = createNewGame('Nia', talora2World)
    const legacy = {
      ...current,
      schemaVersion: 5,
      player: {
        life: 7,
        maxLife: 20,
        equippedWeaponId: current.player.equippedWeaponId,
        inventory: current.player.inventory
      },
      studiedEnemyIds: undefined,
      metEnemyIds: undefined,
      activeCombat: { encounterId: 'alter-kampf', enemyLife: 4 }
    }

    const migrated = migrateAndValidateGameSave(legacy, talora2World)
    expect(migrated.schemaVersion).toBe(6)
    expect(migrated.activeCombat).toBeNull()
    expect(migrated.currentAreaId).toBe('sm_sonnenwacht')
    expect(migrated.player.life).toBe(20)
    expect(migrated.player.equippedArmorId).toBeNull()
  })

  it('prüft eine gespeicherte Kämpferliste gegen die Begegnung', () => {
    const initial = createNewGame('Mia', campaignWorld)
    const atEncounter = {
      ...initial,
      currentAreaId: 'ueberfluteter_markt',
      visitedAreaIds: ['sonnenwacht', 'ueberfluteter_markt']
    }
    const save = reduceGame(atEncounter, { type: 'START_COMBAT', encounterId: 'begegnung_pfuetzenhopser' }, campaignWorld)
    save.activeCombat!.combatants[0].enemyId = 'wasserwaechter'

    expect(() => migrateAndValidateGameSave(save, campaignWorld)).toThrow('Kämpferliste')
  })

  it('exportiert Kampagnenkennung und Kämpferstruktur und importiert beides unverändert', () => {
    const save = createNewGame('Sam', talora2World)
    const json = createSaveExport(save, talora2World)
    const envelope = JSON.parse(json)

    expect(envelope.campaignId).toBe('talora2')
    expect(parseSaveImport(json, talora2World)).toEqual(save)
  })

  it('lehnt neuere Inhalts- und Exportversionen ab', () => {
    expect(() => migrateAndValidateGameSave({ ...createNewGame('Mia', talora2World), contentVersion: CONTENT_VERSION + 1 }, talora2World)).toThrow('neuer als diese App')
    expect(() => parseSaveImport(JSON.stringify({ format: 'textdungeon-save', formatVersion: 99, adventure: createNewGame('Mia', talora2World) }), talora2World)).toThrow('Exportformat-Version')
  })

  it('meldet unlesbares JSON verständlich', () => {
    expect(() => parseSaveImport('{kaputt', talora2World)).toThrow('kein gültiges JSON')
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
