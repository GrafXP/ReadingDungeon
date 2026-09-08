import { describe, expect, it } from 'vitest'
import { campaignWorld as world } from '../content/world/campaignWorld'
import { createNewGame, type GameSave } from '../domain/game'
import { createSaveExport, parseSaveImport } from '../storage/validation'
import { getAvailableActions, isInteractionComplete, otherEnd, type GameAction } from './actions'
import { getCombatView } from './combat'
import { reduceGame } from './reducer'
import { evaluateRequirement } from './requirements'

const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]

class Journey {
  save: GameSave = { ...createNewGame('Reisekind'), rngState: 1 }

  act(action: GameAction) {
    const next = reduceGame(this.save, action, world)
    expect(next, JSON.stringify(action)).not.toBe(this.save)
    // Every intermediate state, including defeat, puzzle inputs and seal pauses,
    // must survive the same export/import validation as a real browser save.
    this.save = parseSaveImport(createSaveExport(next))
  }

  travel(destination: string) {
    const queue: { id: string; path: GameAction[] }[] = [{ id: this.save.currentAreaId, path: [] }]
    const seen = new Set<string>()
    for (const entry of queue) {
      if (entry.id === destination) {
        entry.path.forEach((action) => this.act(action))
        expect(this.save.currentAreaId).toBe(destination)
        return
      }
      if (seen.has(entry.id)) continue
      seen.add(entry.id)
      for (const passage of world.passages) {
        const to = otherEnd(passage, entry.id)
        if (to && !seen.has(to) && (evaluateRequirement(passage.requirement, this.save).met || this.save.unlockedPassageIds.includes(passage.id))) queue.push({ id: to, path: [...entry.path, { type: 'MOVE', passageId: passage.id, toAreaId: to }] })
      }
    }
    throw new Error(`No legal route to ${destination}`)
  }

  interact(id: string) {
    const interaction = world.interactions.find((entry) => entry.id === id)!
    if (isInteractionComplete(interaction, this.save)) return
    this.travel(interaction.areaId)
    this.act({ type: 'INSPECT', areaId: this.save.currentAreaId })
    const puzzle = world.puzzles?.find((entry) => entry.interactionId === id)
    if (puzzle) {
      // Close gates first to respect the two-open-gates safety constraint.
      for (const control of [...puzzle.controls].sort((a, b) => a.solution - b.solution)) {
        const current = this.save.puzzleStates[puzzle.id]?.values[control.id] ?? control.initial
        if (current !== control.solution) this.act({ type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId: control.id, value: control.solution })
      }
      for (const value of puzzle.sequence?.solution ?? []) this.act({ type: 'PUZZLE_INPUT', puzzleId: puzzle.id, controlId: 'sequence', value })
    }
    expect(getAvailableActions(this.save, world).find((action) => action.id === `interaction:${id}`)?.disabled, id).toBe(false)
    this.act({ type: interaction.actionType, interactionId: id })
    expect(isInteractionComplete(interaction, this.save)).toBe(true)
  }

  fight(id: string) {
    if (this.save.defeatedEncounterIds.includes(id)) return
    const encounter = world.encounters.find((entry) => entry.id === id)!
    this.travel(id === 'boss_raugrim' ? 'rand_der_nacht' : 'sonnenwacht')
    if (this.save.player.life < this.save.player.maxLife || (this.save.player.inventory.apfelbrot ?? 0) < 3) this.act({ type: 'REST' })
    this.travel(encounter.areaId)
    this.act({ type: 'START_COMBAT', encounterId: id })
    for (let turn = 0; this.save.activeCombat && turn < 100; turn++) {
      expect(this.save.player.life, `${id} turn ${turn}`).toBeGreaterThan(0)
      const combat = this.save.activeCombat
      const view = getCombatView(this.save, world)!
      if (combat.pendingSealItemId) this.act({ type: 'PLACE_SEAL', itemId: combat.pendingSealItemId })
      else if (combat.awaitingFinalPromise) this.act({ type: 'SPEAK_PROMISE' })
      else if (view.move.kind === 'heavy') this.act({ type: 'DEFEND' })
      else if (this.save.player.life <= 8 && (this.save.player.inventory.apfelbrot ?? 0) > 0) this.act({ type: 'USE_ITEM', itemId: 'apfelbrot' })
      else if (combat.enemyStance === 'guarded' || (view.enemy.airborne && combat.enemyStance !== 'vulnerable')) this.act({ type: 'DEFEND' })
      else this.act({ type: 'ATTACK' })
    }
    expect(this.save.defeatedEncounterIds, id).toContain(id)
  }

  gift(index: number) {
    if (index === 0) {
      this.interact('symbolsteine_ordnen')
      this.interact('archiv_oeffnen')
      this.interact('goldbeeren_pfluecken')
      this.fight('begegnung_schattenmotten')
      this.interact('leuchtoel_pressen')
      this.interact('sonnenfunke_entfachen')
    } else if (index === 1) {
      this.interact('hebelstange_fund')
      this.interact('marktstand_anheben')
      this.interact('mondmoos_sammeln')
      this.interact('schleuse_reparieren')
      this.interact('quelltraene_schoepfen')
    } else {
      this.interact('werkzeugkammer_oeffnen')
      this.fight('begegnung_netzkrabbler')
      this.interact('kletterseil_bergen')
      this.interact('sturmfeder_bergen')
      this.interact('windlied_spielen')
    }
  }
}

describe('vollständige Reise mit echten Wegen, Kämpfen und Speicherprüfung', () => {
  for (const giftOrder of orders) for (const guardianOrder of orders) {
    it(`Gaben ${giftOrder.join('→')}, Wächter ${guardianOrder.join('→')}`, () => {
      const journey = new Journey()
      // Every early guardian approach is reachable and has a safe retreat.
      for (const id of ['boss_arbor', 'boss_marea', 'boss_voltaro']) {
        journey.travel(world.encounters.find((entry) => entry.id === id)!.areaId)
        journey.act({ type: 'START_COMBAT', encounterId: id })
        journey.act({ type: 'FLEE' })
      }
      for (const [position, index] of giftOrder.entries()) {
        journey.gift(index)
        expect(journey.save.deliveredDialogueIds.filter((id) => id.startsWith('erinnerung_'))).toEqual(
          ['erinnerung_alva', 'erinnerung_waechter', 'erinnerung_kuno'].slice(0, position + 1)
        )
      }
      journey.interact('morgenklinge_ziehen')
      journey.act({ type: 'EQUIP_WEAPON', itemId: 'morgenklinge' })
      for (const index of guardianOrder) journey.fight(['boss_arbor', 'boss_marea', 'boss_voltaro'][index])
      journey.interact('endtor_oeffnen')
      journey.fight('boss_raugrim')
      expect(journey.save.flags).toContain('raugrim_verbannt')
      expect(journey.save.player.equippedWeaponId).toBe('reiseschwert')
      expect(journey.save.player.inventory.morgenklinge).toBeUndefined()
      // Every optional encounter and interaction remains available after the finale.
      for (const encounter of world.encounters) journey.fight(encounter.id)
      for (const interaction of world.interactions) journey.interact(interaction.id)
      for (const area of world.areas) journey.travel(area.id)
      expect(journey.save.visitedAreaIds).toHaveLength(41)
      expect(journey.save.discoveredClueIds.filter((id) => id.startsWith('karte_'))).toHaveLength(6)
    }, 15_000)
  }
})
