import { describe, expect, it } from 'vitest'
import { kantaraWorld as world } from '../content/world/kantaraWorld'
import { createNewGame, type GameSave } from '../domain/game'
import { reduceGame } from './reducer'
import { getCombatView } from './combat'
import { resolvePlayerHit } from './damage'
import { validateWorld } from './worldValidator'

type Region = 'B' | 'K' | 'S'

function act(save: GameSave, action: Parameters<typeof reduceGame>[1]) {
  const next = reduceGame(save, action, world)
  expect(next, `Aktion ${action.type} sollte den Zustand ändern`).not.toBe(save)
  return next
}

function visit(save: GameSave, areaId: string) {
  save = {
    ...save,
    currentAreaId: areaId,
    previousAreaId: save.currentAreaId,
    visitedAreaIds: [...new Set([...save.visitedAreaIds, areaId])]
  }
  return save.flags.includes(`area_untersucht:${areaId}`) ? save : act(save, { type: 'INSPECT', areaId })
}

function interact(save: GameSave, interactionId: string, type: 'TAKE_ITEM' | 'COMPLETE_INTERACTION' = 'COMPLETE_INTERACTION') {
  return act(save, { type, interactionId })
}

function inputs(save: GameSave, puzzleId: string, values: Array<[string, string | number]>) {
  for (const [controlId, value] of values) save = act(save, { type: 'PUZZLE_INPUT', puzzleId, controlId, value })
  return save
}

function completePuzzle(save: GameSave, puzzleId: string) {
  return act(save, { type: 'COMPLETE_PUZZLE', puzzleId })
}

function winCombat(save: GameSave, encounterId: string) {
  save = act(save, { type: 'START_COMBAT', encounterId })
  const view = getCombatView(save, world)!
  const phase = view.enemy.movesByPhase[2] ? 2 : 1
  const move = view.enemy.movesByPhase[phase].find((entry) => entry.kind !== 'guard' && entry.kind !== 'shield')!
  save.activeCombat!.combatants[0] = {
    ...save.activeCombat!.combatants[0],
    life: 1,
    phase,
    announcedMoveId: move.id,
    stance: 'normal'
  }
  save = act(save, { type: 'ATTACK' })
  expect(save.defeatedEncounterIds).toContain(encounterId)
  return save
}

function preparedRing() {
  const save = createNewGame('Mira', world)
  save.flags.push('medizin_geliefert', 'marktleiter_geoeffnet')
  save.player.inventory.item_weapon_kurierklinge = 1
  save.player.inventory.item_armor_kurierwams = 1
  save.player.inventory.item_tool_werkhofbuch = 1
  save.player.equippedWeaponId = 'item_weapon_kurierklinge'
  save.player.equippedArmorId = 'item_armor_kurierwams'
  save.rngState = 1
  return save
}

function playLeaves(save: GameSave) {
  save = visit(save, 'bd_kronengarten')
  save = inputs(save, 'puz_bd_pflanzenschilder', [['jungtrieb', 'schattenbeet'], ['tragwurzel', 'quellrinne'], ['fruchtranke', 'sonnenseil']])
  save = interact(save, 'int_bd_fenn_fragen')
  save = visit(save, 'bd_quellast')
  save = inputs(save, 'puz_bd_quellzeile', [['klemme', 1], ['rinne', 2], ['ast', 1]])
  save = interact(save, 'int_bd_quellventil_oeffnen')
  save = visit(save, 'bd_kronengarten')
  save = interact(save, 'int_bd_rankenseil_ernten', 'TAKE_ITEM')
  save = visit(save, 'bd_seilmarkt')
  save = interact(save, 'int_bd_ina_helfen')
  save = visit(save, 'bd_brueckenwerk')
  save = interact(save, 'int_bd_astholz_nehmen', 'TAKE_ITEM')
  save = interact(save, 'int_bd_bruecke_reparieren')
  save = visit(save, 'kb_werkhof')
  save = interact(save, 'int_kb_astbeil_bauen')
  save = act(save, { type: 'EQUIP_WEAPON', itemId: 'item_weapon_astbeil' })
  save = visit(save, 'bd_rankentor')
  save = interact(save, 'int_bd_rammwarnung_lesen')
  save = winCombat(save, 'enc_bd_aststampfer')
  save = visit(save, 'bd_kranplatz')
  save = winCombat(save, 'enc_bd_kronenheber')
  save = visit(save, 'bd_kronenstation')
  return interact(save, 'int_bd_stempel_praegen')
}

function playDelta(save: GameSave) {
  save = visit(save, 'kd_hausboothafen')
  save = inputs(save, 'puz_kd_lieferkaehne', [['metall', 'c'], ['kraeuter', 'a'], ['seile', 'b']])
  save = interact(save, 'int_kd_suri_fragen')
  save = interact(save, 'int_kd_bo_zuhoeren')
  save = visit(save, 'kd_schleusensteg')
  save = inputs(save, 'puz_kd_schleusentore', [['oben', 2], ['mitte', 1], ['unten', 0]])
  save = completePuzzle(save, 'puz_kd_schleusentore')
  save = visit(save, 'kd_rohrinsel')
  save = interact(save, 'int_kd_rohrventil_oeffnen')
  save = visit(save, 'kd_schilfkanal')
  save = interact(save, 'int_kd_schwemmholz_nehmen', 'TAKE_ITEM')
  save = interact(save, 'int_kd_wasserfaser_ernten', 'TAKE_ITEM')
  save = visit(save, 'kd_fischertreppe')
  save = interact(save, 'int_kd_fischertreppe_reparieren')
  save = visit(save, 'kb_werkhof')
  save = interact(save, 'int_kb_bootsspeer_bauen')
  save = act(save, { type: 'EQUIP_WEAPON', itemId: 'item_weapon_bootsspeer' })
  save = visit(save, 'kd_schieberkai')
  save = winCombat(save, 'enc_kd_schottknacker')
  save = visit(save, 'kd_radwehr')
  save = interact(save, 'int_kd_schwall_ausloesen')
  save = winCombat(save, 'enc_kd_deltarad')
  save = visit(save, 'kd_deltastation')
  return interact(save, 'int_kd_stempel_praegen')
}

function playYard(save: GameSave) {
  save = visit(save, 'sw_drachenwerkstatt')
  save = interact(save, 'int_sw_rikas_warnreim')
  save = interact(save, 'int_sw_jaro_fragen')
  save = interact(save, 'int_sw_erdungsring_annehmen', 'TAKE_ITEM')
  save = act(save, { type: 'EQUIP_TALISMAN', itemId: 'item_talisman_erdungsring' })
  save = visit(save, 'sw_warnmast')
  for (const value of [0, 1, 2]) save = act(save, { type: 'PUZZLE_INPUT', puzzleId: 'puz_sw_warnfahnen', controlId: 'sequence', value })
  save = completePuzzle(save, 'puz_sw_warnfahnen')
  save = visit(save, 'sw_spulengasse')
  save = inputs(save, 'puz_sw_spulenbauplan', [['erst', 1], ['dann', 0], ['zuletzt', 1]])
  save = completePuzzle(save, 'puz_sw_spulenbauplan')
  save = visit(save, 'sw_erdungsfeld')
  save = interact(save, 'int_sw_pfaehle_erden')
  save = visit(save, 'sw_spulengasse')
  save = interact(save, 'int_sw_spulendraht_wickeln', 'TAKE_ITEM')
  save = visit(save, 'sw_blitzspeicher')
  save = interact(save, 'int_sw_stahl_bergen', 'TAKE_ITEM')
  save = interact(save, 'int_sw_speicherplan_lesen')
  save = visit(save, 'kb_werkhof')
  save = interact(save, 'int_kb_spulenhammer_bauen')
  save = act(save, { type: 'EQUIP_WEAPON', itemId: 'item_weapon_spulenhammer' })
  save = visit(save, 'sw_blitzspeicher')
  save = winCombat(save, 'enc_sw_spulenlaeufer')
  save = visit(save, 'sw_werftkran')
  save = winCombat(save, 'enc_sw_wolkenspule')
  save = visit(save, 'sw_wolkenstation')
  return interact(save, 'int_sw_stempel_praegen')
}

function finishConnectors(save: GameSave) {
  save = visit(save, 'wg_bergungslager')
  save = interact(save, 'int_wg_teamtafel_lesen')
  save = interact(save, 'int_wg_gleishaken_nehmen', 'TAKE_ITEM')
  save = visit(save, 'wg_kreuzweiche')
  for (const cell of [1, 5, 9, 13, 14, 15]) save = act(save, { type: 'PUZZLE_INPUT', puzzleId: 'puz_wg_kreuzweiche', controlId: 'grid', value: cell })
  save = completePuzzle(save, 'puz_wg_kreuzweiche')
  save = visit(save, 'wg_nordstollen')
  save = interact(save, 'int_wg_nordstollen_reparieren')
  save = visit(save, 'wg_suedstollen')
  save = interact(save, 'int_wg_suedstollen_reparieren')
  save = visit(save, 'wg_prismenknoten')
  save = interact(save, 'int_wg_stempel_einsetzen')
  save = visit(save, 'kb_werkhof')
  save = interact(save, 'int_kb_prismenstab_bauen')
  return interact(save, 'int_kb_prismenoeffner_bauen')
}

const orders: Region[][] = [
  ['B', 'K', 'S'], ['B', 'S', 'K'], ['K', 'B', 'S'],
  ['K', 'S', 'B'], ['S', 'B', 'K'], ['S', 'K', 'B']
]

describe('Phase 4: offene erste Hälfte', () => {
  it('liefert 39 fertige Orte und hält nur die zweite Kampagnenhälfte als Inventarlücke sichtbar', () => {
    const report = validateWorld(world, { allowIncomplete: true })
    expect(report.valid).toBe(true)
    expect(world.areas).toHaveLength(39)
    expect(world.passages).toHaveLength(56)
    expect(world.items).toHaveLength(47)
    expect(world.interactions).toHaveLength(52)
    expect(world.puzzles).toHaveLength(11)
    expect(world.enemies).toHaveLength(20)
    expect(world.encounters).toHaveLength(24)
    expect(report.contentGaps).toContain('Orte: 39 von 78 fehlen.')
  })

  it.each(orders)('bleibt in der Regionsreihenfolge %s → %s → %s vollständig lösbar', (...order) => {
    let save = preparedRing()
    const players: Record<Region, (current: GameSave) => GameSave> = { B: playLeaves, K: playDelta, S: playYard }
    for (const region of order) save = players[region](save)
    save = finishConnectors(save)

    expect(save.player.inventory).toMatchObject({
      item_quest_blaetterstempel: 1,
      item_quest_deltastempel: 1,
      item_quest_werftstempel: 1,
      item_quest_prismenoeffner: 1,
      item_tool_kernhalter: 1,
      item_weapon_prismenstab: 1
    })
    expect(save.flags).toEqual(expect.arrayContaining(['stempelfassungen_geprueft', 'aussenregionen_geoeffnet']))
    expect(world.journal?.getMainGoal?.(save).title).toBe('Die Aussenregionen sind offen')
  })

  it('setzt mit Schwallstoss Nass und verstärkt danach den Blitzanteil sichtbar', () => {
    const weapon = world.items.find((item) => item.id === 'item_weapon_bootsspeer')!.weapon!
    const enemy = world.enemies.find((entry) => entry.id === 'enemy_bd_aststampfer')!
    const dry = resolvePlayerHit({ weapon, weaponName: 'Bootsspeer', enemy, roll: 4, statusEffects: world.statusEffects })
    const wet = resolvePlayerHit({ weapon, weaponName: 'Bootsspeer', enemy, roll: 4, enemyEffects: [{ id: 'nass', remainingEnemyTurns: 2 }], statusEffects: world.statusEffects })
    expect(wet.damage).toBeGreaterThan(dry.damage)
    expect(wet.text).toContain('schwach gegen Blitz')
  })

  it('unterbricht Aufladen und zieht Panzerbruch vor dem Wuchtschaden ab', () => {
    let save = preparedRing()
    save.player.inventory.item_weapon_spulenhammer = 1
    save.player.inventory.item_talisman_erdungsring = 1
    save.player.equippedWeaponId = 'item_weapon_spulenhammer'
    save.player.equippedTalismanId = 'item_talisman_erdungsring'
    save = visit(save, 'sw_blitzspeicher')
    save = act(save, { type: 'START_COMBAT', encounterId: 'enc_sw_spulenlaeufer' })
    save.activeCombat!.combatants[0].announcedMoveId = 'spule-aufladen-1'
    const life = save.player.life
    save = act(save, { type: 'USE_SKILL' })
    expect(save.player.life).toBe(life)
    expect(save.recentEvents.at(-1)?.text).toContain('verliert Aufladen')

    const weapon = world.items.find((item) => item.id === 'item_weapon_spulenhammer')!.weapon!
    const enemy = world.enemies.find((entry) => entry.id === 'enemy_sw_spulenlaeufer')!
    const hit = resolvePlayerHit({ weapon, weaponName: 'Spulenhammer', enemy, roll: 7 })
    expect(hit.text).toContain('− 1 Panzerung')
  })
})
