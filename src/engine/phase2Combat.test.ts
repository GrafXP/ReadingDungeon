import { describe, expect, it } from 'vitest'
import { campaignWorld } from '../content/world/campaignWorld'
import type { WorldDefinition } from '../domain/content'
import { createNewGame, type GameSave } from '../domain/game'
import { createSaveExport, parseSaveImport } from '../storage/validation'
import { getInventoryActions } from './actions'
import { getEnemyKnowledge } from './bestiary'
import { reduceGame } from './reducer'
import { KANTARA_STATUS_EFFECTS } from './statusEffects'

function phase2TestWorld(): WorldDefinition {
  const world: WorldDefinition = {
    ...campaignWorld,
    items: campaignWorld.items.map((item) => ({
      ...item,
      weapon: item.weapon ? { ...item.weapon, elemental: item.weapon.elemental ? { ...item.weapon.elemental } : undefined, skill: item.weapon.skill ? { ...item.weapon.skill, effect: { ...item.weapon.skill.effect } } : undefined } : undefined,
      armor: item.armor ? { ...item.armor } : undefined,
      healing: item.healing ? { ...item.healing } : undefined
    })),
    enemies: campaignWorld.enemies.map((enemy) => ({
      ...enemy,
      movesByPhase: Object.fromEntries(Object.entries(enemy.movesByPhase).map(([phase, moves]) => [phase, moves.map((move) => ({ ...move }))]))
    })),
    encounters: campaignWorld.encounters.map((encounter) => ({ ...encounter, enemyIds: [...encounter.enemyIds], rewardEffects: [...encounter.rewardEffects] })),
    statusEffects: campaignWorld.statusEffects?.map((status) => ({ ...status }))
  }
  const legacyStatuses = world.statusEffects ?? []
  world.statusEffects = [
    ...KANTARA_STATUS_EFFECTS,
    ...legacyStatuses.filter((status) => !KANTARA_STATUS_EFFECTS.some((entry) => entry.id === status.id))
  ]
  const weapon = world.items.find((item) => item.id === 'reiseschwert')!
  weapon.weapon!.skill = {
    id: 'brandprobe', name: 'Brandprobe', description: 'Setzt den Gegner in Brand.', cooldown: 2,
    effect: { kind: 'inflict', effectId: 'brennt', duration: 3 }
  }
  const enemy = world.enemies.find((entry) => entry.id === 'pfuetzenhopser')!
  enemy.maxLife = 30
  return world
}

function begin(world = phase2TestWorld()): GameSave {
  const encounter = world.encounters.find((entry) => entry.id === 'begegnung_pfuetzenhopser')!
  const initial = createNewGame('Mira', world)
  const placed = { ...initial, currentAreaId: encounter.areaId, visitedAreaIds: [...initial.visitedAreaIds, encounter.areaId], rngState: 1 }
  return reduceGame(placed, { type: 'START_COMBAT', encounterId: encounter.id }, world)
}

describe('Waffenkunst, Zugarten und Register', () => {
  it('speichert Zustand und Abklingzeit einer Waffenkunst', () => {
    const world = phase2TestWorld()
    const used = reduceGame(begin(world), { type: 'USE_SKILL' }, world)
    expect(used.activeCombat).toMatchObject({
      round: 2,
      skillCooldown: 2,
      combatants: [{ life: 28, effects: [{ id: 'brennt', remainingEnemyTurns: 2 }] }]
    })
    expect(reduceGame(used, { type: 'USE_SKILL' }, world)).toBe(used)
    const coolingOne = reduceGame(used, { type: 'ATTACK' }, world)
    expect(coolingOne.activeCombat?.skillCooldown).toBe(1)
    const ready = reduceGame(coolingOne, { type: 'DEFEND' }, world)
    expect(ready.activeCombat?.skillCooldown).toBe(0)
    const loaded = parseSaveImport(createSaveExport(used, world), world)
    expect(loaded.activeCombat?.skillCooldown).toBe(2)
    expect(loaded.activeCombat?.combatants[0].effects[0].id).toBe('brennt')
  })

  it('unterbricht charge, blockiert shield und führt heal aus', () => {
    const world = phase2TestWorld()
    const enemy = world.enemies.find((entry) => entry.id === 'pfuetzenhopser')!
    enemy.movesByPhase[1] = [
      { id: 'ladung', name: 'Aufladung', telegraph: 'Funken wachsen.', icon: 'ϟ', damage: 9, damageType: 'lightning', kind: 'charge' },
      { id: 'schild', name: 'Deckung', telegraph: 'Panzer klappt zu.', icon: '◈', damage: 0, kind: 'shield' },
      { id: 'heilung', name: 'Reparatur', telegraph: 'Greift zum Werkzeug.', icon: '+', damage: 0, healAmount: 5, kind: 'heal' }
    ]
    const weapon = world.items.find((item) => item.id === 'reiseschwert')!
    weapon.weapon!.skill = { id: 'stopp', name: 'Stopp', description: 'Unterbricht.', cooldown: 1, effect: { kind: 'interrupt' } }
    const fighting = begin(world)
    const interrupted = reduceGame(fighting, { type: 'USE_SKILL' }, world)
    expect(interrupted.player.life).toBe(fighting.player.life)
    expect(interrupted.activeCombat).toMatchObject({ round: 2, combatants: [{ announcedMoveId: 'schild', stance: 'guarded' }] })
    const blocked = reduceGame(interrupted, { type: 'ATTACK' }, world)
    expect(blocked.activeCombat).toMatchObject({ combatants: [{ life: 30, announcedMoveId: 'heilung' }] })
    const damaged = { ...blocked, activeCombat: { ...blocked.activeCombat!, combatants: [{ ...blocked.activeCombat!.combatants[0], life: 20 }] } }
    const healed = reduceGame(damaged, { type: 'DEFEND' }, world)
    expect(healed.activeCombat?.combatants[0].life).toBe(25)
  })

  it('Beobachten kostet keinen Gegnerzug und schaltet das Register frei', () => {
    const world = phase2TestWorld()
    const fighting = begin(world)
    const enemy = world.enemies.find((entry) => entry.id === 'pfuetzenhopser')!
    expect(getEnemyKnowledge(fighting, enemy).weaknesses).toBe('unbekannt')
    const studied = reduceGame(fighting, { type: 'STUDY_ENEMY', enemyId: enemy.id }, world)
    expect(studied.activeCombat?.round).toBe(1)
    expect(studied.player.life).toBe(fighting.player.life)
    expect(getEnemyKnowledge(studied, enemy).studied).toBe(true)
  })

  it('verbraucht ein Gegenmittel auch bei vollem Leben und entfernt den Zustand', () => {
    const world = phase2TestWorld()
    const water = world.items.find((item) => item.id === 'quellwasser')!
    water.healing!.clearsEffectIds = ['benebelt']
    const fighting = begin(world)
    fighting.player.inventory.quellwasser = 1
    fighting.activeCombat!.playerEffects = [{ id: 'benebelt', remainingEnemyTurns: 3 }]
    const cleared = reduceGame(fighting, { type: 'USE_ITEM', itemId: 'quellwasser' }, world)
    expect(cleared.player.inventory.quellwasser).toBeUndefined()
    expect(cleared.activeCombat?.playerEffects).toEqual([])
  })
})

describe('Ausrüstungsplätze und Waffenmodus', () => {
  it('wechselt Körper und Talisman nur ausserhalb des Kampfes', () => {
    const world = phase2TestWorld()
    world.items.push(
      { id: 'test_wams', name: 'Testwams', description: 'Schützt.', kind: 'armor', armor: { slot: 'body', defense: 2 } },
      { id: 'test_ring', name: 'Testring', description: 'Schützt.', kind: 'armor', armor: { slot: 'talisman', defense: 0, protectsFrom: ['lightning'] } }
    )
    const initial = createNewGame('Mira', world)
    initial.player.inventory.test_wams = 1
    initial.player.inventory.test_ring = 1
    const armored = reduceGame(initial, { type: 'EQUIP_ARMOR', itemId: 'test_wams' }, world)
    const equipped = reduceGame(armored, { type: 'EQUIP_TALISMAN', itemId: 'test_ring' }, world)
    expect(equipped.player).toMatchObject({ equippedArmorId: 'test_wams', equippedTalismanId: 'test_ring' })

    const combat = begin(world)
    combat.player.inventory.test_wams = 1
    expect(reduceGame(combat, { type: 'EQUIP_ARMOR', itemId: 'test_wams' }, world)).toBe(combat)
  })

  it('ändert umstellbare Elemente nur am Rastplatz', () => {
    const world = phase2TestWorld()
    const weapon = world.items.find((item) => item.id === 'reiseschwert')!
    weapon.weapon!.elemental = { choices: ['fire', 'ice'], amount: 2 }
    const resting = createNewGame('Mira', world)
    const changed = reduceGame(resting, { type: 'SET_WEAPON_MODE', itemId: weapon.id, damageType: 'ice' }, world)
    expect(changed.player.weaponElementModes[weapon.id]).toBe('ice')
    expect(parseSaveImport(createSaveExport(changed, world), world).player.weaponElementModes[weapon.id]).toBe('ice')
    const away = { ...resting, currentAreaId: 'drei_wege_platz', visitedAreaIds: [...resting.visitedAreaIds, 'drei_wege_platz'] }
    expect(reduceGame(away, { type: 'SET_WEAPON_MODE', itemId: weapon.id, damageType: 'ice' }, world)).toBe(away)
    expect(getInventoryActions(away, weapon).find((action) => action.id.endsWith(':ice'))).toMatchObject({ disabled: true, reason: expect.stringContaining('Rastplatz') })
  })
})
