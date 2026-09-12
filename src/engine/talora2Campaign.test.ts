import { describe, expect, it } from 'vitest'
import { talora2World as world } from '../content/world/talora2World'
import { createNewGame, type GameSave } from '../domain/game'
import { getAvailableActions } from './actions'
import { simulateCampaignBalance } from './balanceSimulation'
import { getCombatView } from './combat'
import { evaluateRequirement } from './requirements'
import { reduceGame } from './reducer'
import { validateWorld } from './worldValidator'

function act(save: GameSave, action: Parameters<typeof reduceGame>[1]): GameSave {
  const next = reduceGame(save, action, world)
  expect(next, `${action.type} sollte den Spielstand ändern`).not.toBe(save)
  return next
}

function inspect(save: GameSave): GameSave {
  return act(save, { type: 'INSPECT', areaId: save.currentAreaId })
}

function move(save: GameSave, passageId: string, toAreaId: string): GameSave {
  return act(save, { type: 'MOVE', passageId, toAreaId })
}

function winFight(save: GameSave, encounterId: string): GameSave {
  save = act(save, { type: 'START_COMBAT', encounterId })
  for (let turn = 0; save.activeCombat && save.player.life > 0 && turn < 50; turn += 1) {
    const view = getCombatView(save, world)!
    if (view.move.kind === 'heavy' || view.move.kind === 'shield' || view.move.kind === 'guard') save = act(save, { type: 'DEFEND' })
    else save = act(save, { type: 'ATTACK' })
  }
  expect(save.activeCombat).toBeNull()
  expect(save.player.life).toBeGreaterThan(0)
  expect(save.defeatedEncounterIds).toContain(encounterId)
  return save
}

describe('Talora II', () => {
  it('liefert den vollständigen V3-Umfang ohne Inhaltslücken', () => {
    const report = validateWorld(world)
    expect(report.errors).toEqual([])
    expect(report.contentGaps).toEqual([])
    expect(report.completionReachable).toBe(true)
    expect(world).toMatchObject({ campaignId: 'talora2' })
    expect(world.areas).toHaveLength(78)
    expect(world.passages).toHaveLength(108)
    expect(world.items.filter((item) => item.kind === 'weapon')).toHaveLength(12)
    expect(world.items.filter((item) => item.armor)).toHaveLength(11)
    expect(world.enemies).toHaveLength(39)
    expect(world.encounters).toHaveLength(48)
    expect(world.puzzles).toHaveLength(18)
    expect(world.passages.filter((passage) => passage.guardEncounterId && !passage.fromAreaId.startsWith('rn_'))).toHaveLength(12)
    const discoveredNotes = new Set([
      ...world.interactions.flatMap((interaction) => interaction.effects),
      ...world.encounters.flatMap((encounter) => encounter.rewardEffects)
    ].flatMap((effect) => effect.kind === 'discoverClue' ? [effect.clueId] : []))
    expect(Object.keys(world.journal?.cardNotes ?? {}).every((id) => discoveredNotes.has(id))).toBe(true)
  })

  it('öffnet zuerst drei alte und später drei neue Regionen, ohne frühere Wege zu schliessen', () => {
    const initial = createNewGame('Mira', world)
    const prologue = { ...initial, flags: [...initial.flags, 'prolog_abgeschlossen'] }
    for (const id of ['v096', 'v097', 'v098']) {
      expect(evaluateRequirement(world.passages.find((passage) => passage.id === id)?.requirement, prologue).met).toBe(true)
    }
    for (const id of ['v102', 'v103', 'v104']) {
      expect(evaluateRequirement(world.passages.find((passage) => passage.id === id)?.requirement, prologue).met).toBe(false)
    }

    const nearComplete = {
      ...prologue,
      flags: [...prologue.flags, 'arbors_schatten_zurueck', 'mareas_schatten_zurueck', 'voltaros_schatten_zurueck']
    }
    for (const id of ['v096', 'v097', 'v098', 'v102', 'v103', 'v104']) {
      expect(evaluateRequirement(world.passages.find((passage) => passage.id === id)?.requirement, nearComplete).met).toBe(true)
    }
    expect(evaluateRequirement(world.passages.find((passage) => passage.id === 'v105')?.requirement, nearComplete).met).toBe(false)

    const outerComplete = {
      ...nearComplete,
      flags: [...nearComplete.flags, 'feuervogel_gerettet', 'sternenschatten_gerettet', 'laternenfuchs_gerettet']
    }
    expect(evaluateRequirement(world.passages.find((passage) => passage.id === 'v105')?.requirement, outerComplete).met).toBe(true)
  })

  it('spielt den Prolog in klarer Reihenfolge bis zu den drei offenen Wegen', () => {
    let save = createNewGame('Mira', world)
    save = inspect(save)
    save = act(save, { type: 'COMPLETE_INTERACTION', interactionId: 'int_sm_tessa_sprechen' })
    save = move(save, 'v001', 'sm_festplatz')
    save = inspect(save)
    save = winFight(save, 'enc_sm_schattenzipfel')
    save = move(save, 'v001', 'sm_sonnenwacht')
    save = move(save, 'v002', 'sm_kartenstube')
    save = inspect(save)
    save = act(save, { type: 'PUZZLE_INPUT', puzzleId: 'puz_sm_schattenkarte', controlId: 'huf', value: 'blatt' })
    save = act(save, { type: 'PUZZLE_INPUT', puzzleId: 'puz_sm_schattenkarte', controlId: 'wasser', value: 'welle' })
    save = act(save, { type: 'PUZZLE_INPUT', puzzleId: 'puz_sm_schattenkarte', controlId: 'feder', value: 'fluegel' })
    save = act(save, { type: 'COMPLETE_INTERACTION', interactionId: 'int_sm_schattenkarte_abschliessen' })
    save = move(save, 'v002', 'sm_sonnenwacht')
    save = move(save, 'v003', 'sm_drei_wege_platz')
    save = inspect(save)

    expect(save.flags).toEqual(expect.arrayContaining(['tessa_gesprochen', 'schattenzipfel_beruhigt', 'prolog_abgeschlossen']))
    const openDestinations = getAvailableActions(save, world)
      .filter((action) => action.kind === 'move' && !action.disabled)
      .map((action) => action.gameAction.type === 'MOVE' ? action.gameAction.toAreaId : '')
    expect(openDestinations).toContain('ww_foersterhaus')
  })

  it('liefert die ungeprüften Duo-Kandidaten als sichere Einzelkämpfe aus', () => {
    expect(world.encounters.find((entry) => entry.id === 'enc_vp_wegeduo')?.enemyIds).toEqual(['enemy_vp_echohueter'])
    expect(world.encounters.find((entry) => entry.id === 'enc_fi_ascheflug')?.enemyIds).toEqual(['enemy_fi_glasfluegler'])
    expect(world.encounters.find((entry) => entry.id === 'enc_rn_echozwilling')?.enemyIds).toEqual(['enemy_rn_echo_links'])
  })

  it.each([1, 42, 999_983])('hält alle 48 Kämpfe mit der erklärten Grundstrategie für Startwert %s gewinnbar', (seed) => {
    const results = simulateCampaignBalance(world, seed)
    expect(results).toHaveLength(48)
    expect(results.filter((entry) => !entry.won)).toEqual([])
    expect(Math.max(...results.map((entry) => entry.turns))).toBeLessThan(80)
  })
})
