import { describe, expect, it } from 'vitest'
import { CONTENT_VERSION, createNewGame, SAVE_SCHEMA_VERSION } from '../domain/game'
import { SETTINGS_SCHEMA_VERSION } from '../domain/settings'
import { campaignWorld } from '../content/world/campaignWorld'
import { kantaraWorld } from '../content/world/kantaraWorld'
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
  it('erstellt einen vollständig gekennzeichneten Kantara-Spielstand im Kurierhof', () => {
    const save = createNewGame('  Mira  ', kantaraWorld)
    const validated = migrateAndValidateGameSave(save, kantaraWorld)

    expect(validated).toMatchObject({
      schemaVersion: SAVE_SCHEMA_VERSION,
      contentVersion: CONTENT_VERSION,
      campaignId: 'kantara',
      playerName: 'Mira',
      currentAreaId: 'kb_kurierhof',
      studiedEnemyIds: [],
      metEnemyIds: []
    })
    expect(validated.player).toMatchObject({
      equippedWeaponId: null,
      equippedArmorId: null,
      equippedTalismanId: null,
      weaponElementModes: {}
    })
  })

  it.each([
    ['Ort', (save: ReturnType<typeof createNewGame>) => { save.currentAreaId = 'nirgendwo'; save.visitedAreaIds.push('nirgendwo') }],
    ['Gegenstand', (save: ReturnType<typeof createNewGame>) => { save.player.inventory.unbekannt = 1 }],
    ['Waffentyp', (save: ReturnType<typeof createNewGame>) => { save.player.equippedWeaponId = 'item_armor_kurierwams' }],
    ['Rüstungstyp', (save: ReturnType<typeof createNewGame>) => { save.player.equippedArmorId = 'item_weapon_kurierklinge' }],
    ['Tod ohne Kampf', (save: ReturnType<typeof createNewGame>) => { save.player.life = 0 }],
    ['Doppelte Orte', (save: ReturnType<typeof createNewGame>) => { save.visitedAreaIds.push('kb_kurierhof') }],
    ['Zufallszustand', (save: ReturnType<typeof createNewGame>) => { save.rngState = 2_147_483_647 }],
    ['Waffenmodus', (save: ReturnType<typeof createNewGame>) => { save.player.weaponElementModes.item_weapon_kurierklinge = 'fire' }]
  ] as const)('lehnt ungültige Referenzen und Zustände ab: %s', (_, mutate) => {
    const save = createNewGame('Mia', kantaraWorld)
    mutate(save)
    expect(() => migrateAndValidateGameSave(save, kantaraWorld)).toThrow(DataValidationError)
  })

  it('lehnt einen kennungslosen oder fremden Spielstand vor jeder Migration ab', () => {
    const oldSave: Record<string, unknown> = { ...createNewGame('Alt', campaignWorld), schemaVersion: 5 }
    delete oldSave.campaignId

    expect(() => migrateAndValidateGameSave(oldSave, kantaraWorld)).toThrow(CampaignMismatchError)
    expect(() => migrateAndValidateGameSave(createNewGame('Tal', campaignWorld), kantaraWorld)).toThrow('gehört zur Kampagne')
  })

  it('migriert nur eine ältere technische Version derselben Kampagne und beendet ihren alten Kampf', () => {
    const current = createNewGame('Nia', kantaraWorld)
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

    const migrated = migrateAndValidateGameSave(legacy, kantaraWorld)
    expect(migrated.schemaVersion).toBe(6)
    expect(migrated.activeCombat).toBeNull()
    expect(migrated.currentAreaId).toBe('kb_kurierhof')
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
    const save = createNewGame('Sam', kantaraWorld)
    const json = createSaveExport(save, kantaraWorld)
    const envelope = JSON.parse(json)

    expect(envelope.campaignId).toBe('kantara')
    expect(parseSaveImport(json, kantaraWorld)).toEqual(save)
  })

  it('lehnt neuere Inhalts- und Exportversionen ab', () => {
    expect(() => migrateAndValidateGameSave({ ...createNewGame('Mia', kantaraWorld), contentVersion: CONTENT_VERSION + 1 }, kantaraWorld)).toThrow('neuer als diese App')
    expect(() => parseSaveImport(JSON.stringify({ format: 'textdungeon-save', formatVersion: 99, adventure: createNewGame('Mia', kantaraWorld) }), kantaraWorld)).toThrow('Exportformat-Version')
  })

  it('meldet unlesbares JSON verständlich', () => {
    expect(() => parseSaveImport('{kaputt', kantaraWorld)).toThrow('kein gültiges JSON')
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
