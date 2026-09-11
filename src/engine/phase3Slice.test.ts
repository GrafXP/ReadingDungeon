import { describe, expect, it } from 'vitest'
import { kantaraWorld as world } from '../content/world/kantaraWorld'
import { createNewGame, type GameSave } from '../domain/game'
import { getAvailableActions } from './actions'
import { getCombatView } from './combat'
import { reduceGame } from './reducer'
import { validateWorld } from './worldValidator'

function act(save: GameSave, action: Parameters<typeof reduceGame>[1]) {
  const next = reduceGame(save, action, world)
  expect(next, `Aktion ${action.type} sollte den Zustand ändern`).not.toBe(save)
  return next
}

function inspect(save: GameSave) {
  return act(save, { type: 'INSPECT', areaId: save.currentAreaId })
}

function move(save: GameSave, passageId: string, toAreaId: string) {
  return act(save, { type: 'MOVE', passageId, toAreaId })
}

function interact(save: GameSave, interactionId: string, type: 'TAKE_ITEM' | 'COMPLETE_INTERACTION' = 'COMPLETE_INTERACTION') {
  return act(save, { type, interactionId })
}

function puzzleInput(save: GameSave, puzzleId: string, values: Array<[string, string | number]>) {
  for (const [controlId, value] of values) save = act(save, { type: 'PUZZLE_INPUT', puzzleId, controlId, value })
  return save
}

function winCombat(save: GameSave, encounterId: string): GameSave {
  save = act(save, { type: 'START_COMBAT', encounterId })
  for (let turn = 0; save.activeCombat && save.player.life > 0 && turn < 100; turn += 1) {
    const view = getCombatView(save, world)!
    if (view.move.defendNegates) save = act(save, { type: 'DEFEND' })
    else if (view.move.kind === 'charge' && save.activeCombat!.skillCooldown === 0) save = act(save, { type: 'USE_SKILL' })
    else if (save.player.life <= 6 && (save.player.inventory.item_consume_grundproviant ?? 0) > 0) save = act(save, { type: 'USE_ITEM', itemId: 'item_consume_grundproviant' })
    else save = act(save, { type: 'ATTACK' })
  }
  expect(save.player.life).toBeGreaterThan(0)
  expect(save.activeCombat).toBeNull()
  expect(save.defeatedEncounterIds).toContain(encounterId)
  return save
}

function preparedAt(areaId: string): GameSave {
  const save = createNewGame('Mira', world)
  save.currentAreaId = areaId
  save.previousAreaId = 'bd_kronengarten'
  save.lastSanctuaryId = 'bd_kronengarten'
  save.visitedAreaIds.push('bd_kronengarten', areaId)
  save.flags.push(`area_untersucht:${areaId}`, 'rammwarnung_gelesen')
  save.player.inventory.item_weapon_kurierklinge = 1
  save.player.inventory.item_armor_kurierwams = 1
  save.player.equippedWeaponId = 'item_weapon_kurierklinge'
  save.player.equippedArmorId = 'item_armor_kurierwams'
  return save
}

describe('Phase 3: Kesselbrück und Blätterdächer', () => {
  it('liefert den vollständigen 16-Orte-Vertikalschnitt und hält spätere Inventarlücken sichtbar', () => {
    const report = validateWorld(world, { allowIncomplete: true })
    expect(report.valid).toBe(true)
    expect(world.areas).toHaveLength(39)
    expect(world.areas.every((area) => area.firstDescription.length > 100 && area.revisitDescription.length > 60 && area.variants?.length)).toBe(true)
    expect(world.puzzles?.slice(0, 4).map((puzzle) => puzzle.kind)).toEqual(['pairing', 'pairing', 'reading', 'weighing'])
    expect(world.enemies.slice(0, 7)).toHaveLength(7)
    expect(world.encounters.slice(0, 8)).toHaveLength(8)
    expect(report.contentGaps).toContain('Orte: 39 von 78 fehlen.')
  })

  it('spielt den Pflichtweg vom neuen Spiel bis zum ersten Freigabestempel', () => {
    let save = createNewGame('Mira', world)
    save.rngState = 1

    save = inspect(save)
    save = interact(save, 'int_kb_klick_aufklappen', 'TAKE_ITEM')
    save = interact(save, 'int_kb_grundausruestung', 'TAKE_ITEM')
    expect(save.player).toMatchObject({ equippedWeaponId: 'item_weapon_kurierklinge', equippedArmorId: 'item_armor_kurierwams' })

    save = move(save, 'v001', 'kb_sortierhalle')
    save = inspect(save)
    save = puzzleInput(save, 'puz_kb_uebungsetiketten', [['beeren', 'kuehlfach'], ['spule', 'werftkiste'], ['medizin', 'wassertor']])
    save = act(save, { type: 'COMPLETE_PUZZLE', puzzleId: 'puz_kb_uebungsetiketten' })
    save = move(save, 'v001', 'kb_kurierhof')
    save = interact(save, 'int_kb_auftrag_annehmen', 'TAKE_ITEM')
    save = move(save, 'v006', 'kb_wassertor')
    save = inspect(save)
    save = winCombat(save, 'enc_kb_rollkiste')
    save = interact(save, 'int_kb_medizin_abgeben')
    save = move(save, 'v006', 'kb_kurierhof')

    save = move(save, 'v003', 'kb_tauschmarkt')
    save = inspect(save)
    save = move(save, 'v096', 'bd_kronengarten')
    save = inspect(save)
    save = puzzleInput(save, 'puz_bd_pflanzenschilder', [['jungtrieb', 'schattenbeet'], ['tragwurzel', 'quellrinne'], ['fruchtranke', 'sonnenseil']])
    save = interact(save, 'int_bd_fenn_fragen')

    save = move(save, 'v010', 'bd_quellast')
    save = inspect(save)
    save = puzzleInput(save, 'puz_bd_quellzeile', [['klemme', 1], ['rinne', 2], ['ast', 1]])
    save = interact(save, 'int_bd_quellventil_oeffnen')
    save = move(save, 'v010', 'bd_kronengarten')
    save = interact(save, 'int_bd_rankenseil_ernten', 'TAKE_ITEM')

    save = move(save, 'v009', 'bd_seilmarkt')
    save = inspect(save)
    save = interact(save, 'int_bd_ina_helfen')
    save = move(save, 'v012', 'bd_brueckenwerk')
    save = inspect(save)
    save = interact(save, 'int_bd_astholz_nehmen', 'TAKE_ITEM')

    save = move(save, 'v012', 'bd_seilmarkt')
    save = move(save, 'v009', 'bd_kronengarten')
    save = move(save, 'v096', 'kb_tauschmarkt')
    save = move(save, 'v003', 'kb_kurierhof')
    save = move(save, 'v002', 'kb_werkhof')
    save = inspect(save)
    expect(save.player.inventory.item_tool_werkhofbuch).toBe(1)
    save = interact(save, 'int_kb_astbeil_bauen')
    save = act(save, { type: 'EQUIP_WEAPON', itemId: 'item_weapon_astbeil' })

    save = move(save, 'v002', 'kb_kurierhof')
    save = move(save, 'v003', 'kb_tauschmarkt')
    save = move(save, 'v096', 'bd_kronengarten')
    save = move(save, 'v011', 'bd_rankentor')
    save = inspect(save)
    save = interact(save, 'int_bd_rammwarnung_lesen')
    save = winCombat(save, 'enc_bd_aststampfer')
    save = move(save, 'v011', 'bd_kronengarten')
    save = act(save, { type: 'REST' })

    save = move(save, 'v011', 'bd_rankentor')
    save = move(save, 'v016', 'bd_wipfelsteg')
    save = inspect(save)
    save = move(save, 'v017', 'bd_brueckenwerk')
    save = interact(save, 'int_bd_bruecke_reparieren')
    save = move(save, 'v018', 'bd_kranplatz')
    save = inspect(save)
    save = winCombat(save, 'enc_bd_kronenheber')
    expect(save.journal.some((event) => event.text.includes('Kapphieb'))).toBe(true)

    save = move(save, 'v020', 'bd_kronenstation')
    save = inspect(save)
    save = interact(save, 'int_bd_stempel_praegen')

    expect(save.player.inventory.item_quest_blaetterstempel).toBe(1)
    expect(save.flags).toContain('blaetterdaecher_befreit')
    expect(save.unlockedPassageIds).toEqual(expect.arrayContaining(['v008', 'v014', 'v018']))
    expect(world.journal?.getMainGoal?.(save).title).toBe('Erkunde den offenen ersten Ring')
  })

  it('erneuert besuchte Materialquellen erst nach einer Rast', () => {
    let save = preparedAt('bd_kronengarten')
    save.flags.push('quellventil_geoeffnet')
    save = interact(save, 'int_bd_rankenseil_ernten', 'TAKE_ITEM')
    expect(getAvailableActions(save, world).some((action) => action.id === 'interaction:int_bd_rankenseil_ernten')).toBe(false)
    save = act(save, { type: 'REST' })
    expect(getAvailableActions(save, world).some((action) => action.id === 'interaction:int_bd_rankenseil_ernten')).toBe(true)
    expect(save.player.inventory.item_mat_rankenseil).toBe(2)
  })

  it('behält Funde bei Flucht und Rettung und lässt den Rückweg offen', () => {
    const prepared = preparedAt('bd_rankentor')
    prepared.player.inventory.item_mat_blaetterharz = 2
    const fighting = act(prepared, { type: 'START_COMBAT', encounterId: 'enc_bd_aststampfer' })
    const fled = act(fighting, { type: 'FLEE' })
    expect(fled.currentAreaId).toBe('bd_kronengarten')
    expect(fled.player.inventory.item_mat_blaetterharz).toBe(2)
    expect(fled.defeatedEncounterIds).not.toContain('enc_bd_aststampfer')

    let doomed = preparedAt('bd_rankentor')
    doomed.player.life = 1
    doomed = act(doomed, { type: 'START_COMBAT', encounterId: 'enc_bd_aststampfer' })
    doomed = act(doomed, { type: 'ATTACK' })
    expect(doomed.player.life).toBe(0)
    const rescued = act(doomed, { type: 'RESPAWN' })
    expect(rescued.currentAreaId).toBe('bd_kronengarten')
    expect(rescued.player.life).toBe(rescued.player.maxLife)
    expect(rescued.flags).toContain('rammwarnung_gelesen')
  })

  it('wechselt beim Kronenheber sichtbar in Phase zwei und unterbricht Aufladen mit Kapphieb', () => {
    let save = preparedAt('bd_kranplatz')
    save.player.inventory.item_weapon_astbeil = 1
    save.player.equippedWeaponId = 'item_weapon_astbeil'
    save = act(save, { type: 'START_COMBAT', encounterId: 'enc_bd_kronenheber' })
    save.activeCombat!.combatants[0].life = 7
    save = act(save, { type: 'DEFEND' })
    save = act(save, { type: 'ATTACK' })
    expect(save.activeCombat).toMatchObject({ combatants: [{ phase: 2, announcedMoveId: 'aufladen' }] })
    const life = save.player.life
    save = act(save, { type: 'USE_SKILL' })
    expect(save.player.life).toBe(life)
    expect(save.activeCombat).toMatchObject({ skillCooldown: 2, combatants: [{ announcedMoveId: 'kronenzug' }] })
    expect(save.recentEvents.at(-1)?.text).toContain('verliert Aufladen')
  })
})
