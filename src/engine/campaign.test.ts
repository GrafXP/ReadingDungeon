import { describe, expect, it } from 'vitest'
import { phase2World } from '../content/world'
import { createNewGame, type GameSave } from '../domain/game'
import type { GameAction } from './actions'
import { reduceGame } from './reducer'

function at(save: GameSave, areaId: string): GameSave {
  return {
    ...save,
    currentAreaId: areaId,
    visitedAreaIds: [...new Set([...save.visitedAreaIds, areaId])]
  }
}

function act(save: GameSave, action: GameAction): GameSave {
  return reduceGame(save, action, phase2World)
}

function solve(save: GameSave, id: string): GameSave {
  const puzzle = phase2World.puzzles!.find((entry) => entry.id === id)!
  for (const control of [...puzzle.controls].sort((a, b) => a.solution - b.solution)) save = act(save, { type: 'PUZZLE_INPUT', puzzleId: id, controlId: control.id, value: control.solution })
  for (const value of puzzle.sequence?.solution ?? []) save = act(save, { type: 'PUZZLE_INPUT', puzzleId: id, controlId: 'sequence', value })
  return save
}

function winEncounter(save: GameSave, encounterId: string): GameSave {
  const encounter = phase2World.encounters.find((entry) => entry.id === encounterId)!
  const started = act(at(save, encounter.areaId), { type: 'START_COMBAT', encounterId })
  const enemy = phase2World.enemies.find((entry) => entry.id === encounter.enemyId)!
  const phase = enemy.phaseTwoAtLife ? 2 : 1
  const announcedMoveId = enemy.movesByPhase[phase][0].id
  return act({ ...started, activeCombat: { ...started.activeCombat!, enemyLife: 1, phase, announcedMoveId, enemyStance: 'vulnerable', effects: [{ id: 'offener_riss', remainingEnemyTurns: 1 }] } }, { type: 'ATTACK' })
}

describe('Kampagnen-Übergänge mit vorbereiteten Testzuständen', () => {
  it('löst alle drei Gabenketten unabhängig und erweckt danach die Morgenklinge', () => {
    let save = createNewGame('Tala')

    // Windlied zuerst
    save = act(at(save, 'kristallmine'), { type: 'INSPECT', areaId: 'kristallmine' })
    save = solve(save, 'echo')
    save = act(save, { type: 'COMPLETE_INTERACTION', interactionId: 'werkzeugkammer_oeffnen' })
    save = winEncounter(save, 'begegnung_netzkrabbler')
    save = act(at(save, 'spinnenhain'), { type: 'TAKE_ITEM', interactionId: 'kletterseil_bergen' })
    save = act(at(save, 'wolkenbruecke'), { type: 'TAKE_ITEM', interactionId: 'sturmfeder_bergen' })
    save = act(at(save, 'windorgel'), { type: 'INSPECT', areaId: 'windorgel' })
    save = solve(save, 'windorgel')
    save = act(save, { type: 'COMPLETE_INTERACTION', interactionId: 'windlied_spielen' })
    expect(save.player.inventory.windlied).toBe(1)
    expect(save.flags).toContain('windlied_erhalten')

    // Quellträne als zweite Gabe
    save = act(at(save, 'alter_markt'), { type: 'TAKE_ITEM', interactionId: 'hebelstange_fund' })
    save = act(at(save, 'ueberfluteter_markt'), { type: 'COMPLETE_INTERACTION', interactionId: 'marktstand_anheben' })
    save = act(at(save, 'alte_baumschule'), { type: 'INSPECT', areaId: 'alte_baumschule' })
    save = act(save, { type: 'TAKE_ITEM', interactionId: 'mondmoos_sammeln' })
    save = act(at(save, 'schleusenhaus'), { type: 'INSPECT', areaId: 'schleusenhaus' })
    save = solve(save, 'schleuse')
    save = act(save, { type: 'COMPLETE_INTERACTION', interactionId: 'schleuse_reparieren' })
    save = act(at(save, 'korallengrotte'), { type: 'COMPLETE_INTERACTION', interactionId: 'quelltraene_schoepfen' })
    expect(save.player.inventory.quelltraene).toBe(1)
    expect(save.unlockedPassageIds).toEqual(expect.arrayContaining(['p48', 'p49']))

    // Sonnenfunke zuletzt
    save = act(at(save, 'garten_der_namen'), { type: 'INSPECT', areaId: 'garten_der_namen' })
    save = solve(save, 'symbolsteine')
    save = act(save, { type: 'COMPLETE_INTERACTION', interactionId: 'symbolsteine_ordnen' })
    save = act(at(save, 'versunkene_bibliothek'), { type: 'COMPLETE_INTERACTION', interactionId: 'archiv_oeffnen' })
    save = act(at(save, 'mooslichtung'), { type: 'INSPECT', areaId: 'mooslichtung' })
    save = act(save, { type: 'TAKE_ITEM', interactionId: 'goldbeeren_pfluecken' })
    save = winEncounter(save, 'begegnung_schattenmotten')
    save = act(at(save, 'gluehgarten'), { type: 'COMPLETE_INTERACTION', interactionId: 'leuchtoel_pressen' })
    save = act(at(save, 'alter_leuchtturm'), { type: 'INSPECT', areaId: 'alter_leuchtturm' })
    save = solve(save, 'spiegel')
    save = act(save, { type: 'COMPLETE_INTERACTION', interactionId: 'sonnenfunke_entfachen' })
    expect(save.player.inventory.sonnenfunke).toBe(1)

    save = act(at(save, 'morgen_tempel'), { type: 'COMPLETE_INTERACTION', interactionId: 'morgenklinge_ziehen' })
    expect(save.player.inventory.morgenklinge).toBe(1)
    expect(save.player.inventory).not.toHaveProperty('sonnenfunke')
    expect(save.player.inventory).not.toHaveProperty('quelltraene')
    expect(save.player.inventory).not.toHaveProperty('windlied')
  })

  it('befreit die Wächter in beliebiger Reihenfolge und öffnet das Endtor dauerhaft', () => {
    const initial = createNewGame('Nuri')
    let save: GameSave = {
      ...initial,
      player: { ...initial.player, equippedWeaponId: 'morgenklinge', inventory: { ...initial.player.inventory, morgenklinge: 1 } }
    }

    save = winEncounter(save, 'boss_voltaro')
    save = winEncounter(save, 'boss_arbor')
    save = winEncounter(save, 'boss_marea')

    expect(save.flags).toEqual(expect.arrayContaining(['voltaro_befreit', 'arbor_befreit', 'marea_befreit']))
    expect(save.player.inventory).toMatchObject({ wurzelsiegel: 1, gezeitensiegel: 1, himmelssiegel: 1 })
    save = act(at(save, 'tor_der_sechs_zeichen'), { type: 'COMPLETE_INTERACTION', interactionId: 'endtor_oeffnen' })
    expect(save.flags).toContain('endtor_offen')
    expect(save.unlockedPassageIds).toContain('p52')
    expect(save.player.inventory).toMatchObject({ morgenklinge: 1, wurzelsiegel: 1, gezeitensiegel: 1, himmelssiegel: 1 })
  })

  it('setzt im Finale drei gespeicherte Siegellichter und gewinnt erst mit dem Versprechen', () => {
    const initial = createNewGame('Ari')
    let save: GameSave = {
      ...initial,
      currentAreaId: 'weltenkammer',
      visitedAreaIds: ['sonnenwacht', 'rand_der_nacht', 'weltenkammer'],
      lastSanctuaryId: 'rand_der_nacht',
      player: {
        ...initial.player,
        equippedWeaponId: 'morgenklinge',
        inventory: { ...initial.player.inventory, morgenklinge: 1, wurzelsiegel: 1, gezeitensiegel: 1, himmelssiegel: 1 }
      }
    }
    save = act(save, { type: 'START_COMBAT', encounterId: 'boss_raugrim' })

    save = act({ ...save, activeCombat: { ...save.activeCombat!, enemyLife: 25, phase: 1, announcedMoveId: 'grauer_hieb' } }, { type: 'ATTACK' })
    expect(save.activeCombat?.pendingSealItemId).toBe('wurzelsiegel')
    save = act(save, { type: 'PLACE_SEAL', itemId: 'wurzelsiegel' })
    expect(save.activeCombat).toMatchObject({ phase: 2, placedSealItemIds: ['wurzelsiegel'] })

    save = act({ ...save, activeCombat: { ...save.activeCombat!, enemyLife: 13, announcedMoveId: 'falsches_bild' } }, { type: 'ATTACK' })
    expect(save.activeCombat?.pendingSealItemId).toBe('gezeitensiegel')
    save = act(save, { type: 'PLACE_SEAL', itemId: 'gezeitensiegel' })

    save = act({ ...save, activeCombat: { ...save.activeCombat!, enemyLife: 1, announcedMoveId: 'fluegelschlag' } }, { type: 'ATTACK' })
    expect(save.activeCombat?.pendingSealItemId).toBe('himmelssiegel')
    save = act(save, { type: 'PLACE_SEAL', itemId: 'himmelssiegel' })
    expect(save.activeCombat).toMatchObject({ awaitingFinalPromise: true, placedSealItemIds: ['wurzelsiegel', 'gezeitensiegel', 'himmelssiegel'] })
    expect(save.flags).not.toContain('raugrim_verbannt')

    save = act(save, { type: 'SPEAK_PROMISE' })
    expect(save.activeCombat).toBeNull()
    expect(save.flags).toEqual(expect.arrayContaining(['raugrim_verbannt', 'phase5_abgeschlossen']))
    expect(save.player.inventory).not.toHaveProperty('morgenklinge')
    expect(save.player.inventory).not.toHaveProperty('wurzelsiegel')
    expect(save.player.inventory).not.toHaveProperty('gezeitensiegel')
    expect(save.player.inventory).not.toHaveProperty('himmelssiegel')
    expect(save.player.equippedWeaponId).toBe('reiseschwert')
  })

  it('behält nach einer Finalniederlage die echten Siegel, setzt aber ihre Kampflichter zurück', () => {
    const initial = createNewGame('Mio')
    const fighting: GameSave = {
      ...initial,
      currentAreaId: 'weltenkammer',
      visitedAreaIds: ['sonnenwacht', 'rand_der_nacht', 'weltenkammer'],
      lastSanctuaryId: 'rand_der_nacht',
      player: {
        ...initial.player,
        life: 1,
        equippedWeaponId: 'morgenklinge',
        inventory: { ...initial.player.inventory, morgenklinge: 1, wurzelsiegel: 1, gezeitensiegel: 1, himmelssiegel: 1 }
      }
    }
    let save = act(fighting, { type: 'START_COMBAT', encounterId: 'boss_raugrim' })
    save = {
      ...save,
      player: { ...save.player, life: 1 },
      activeCombat: { ...save.activeCombat!, phase: 2, announcedMoveId: 'falsches_bild', placedSealItemIds: ['wurzelsiegel'] }
    }
    save = act(save, { type: 'ATTACK' })
    expect(save.player.life).toBe(0)
    save = act(save, { type: 'RESPAWN' })

    expect(save.currentAreaId).toBe('rand_der_nacht')
    expect(save.activeCombat).toBeNull()
    expect(save.player.inventory).toMatchObject({ morgenklinge: 1, wurzelsiegel: 1, gezeitensiegel: 1, himmelssiegel: 1 })
  })

  it('rastet sicher, heilt und ergänzt nur den Grundproviant', () => {
    const initial = createNewGame('Jo')
    const tired: GameSave = { ...initial, player: { ...initial.player, life: 4, inventory: { ...initial.player.inventory, apfelbrot: 1, waldsalbe: 1 } } }
    const rested = act(tired, { type: 'REST' })

    expect(rested.player.life).toBe(20)
    expect(rested.player.inventory).toMatchObject({ apfelbrot: 3, waldsalbe: 1 })
  })
})
