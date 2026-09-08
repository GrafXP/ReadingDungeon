import type { WorldDefinition } from '../domain/content'
import { createNewGame, type GameSave } from '../domain/game'
import { getCombatView } from './combat'
import { reduceGame } from './reducer'

export interface BalanceResult {
  encounterId: string
  won: boolean
  turns: number
  remainingLife: number
}

/**
 * Runs a deterministic, readable combat policy: defend announced heavy moves,
 * attack otherwise, and use the renewable basic provision when life is low.
 * It is deliberately the same simple strategy the UI teaches children.
 */
export function simulateCampaignBalance(world: WorldDefinition, seed = 1): BalanceResult[] {
  return world.encounters.map((encounter) => {
    const enemy = world.enemies.find((entry) => entry.id === encounter.enemyId)!
    const fresh = createNewGame('Testkind')
    let save: GameSave = {
      ...fresh,
      currentAreaId: encounter.areaId,
      visitedAreaIds: [...new Set([...fresh.visitedAreaIds, encounter.areaId])],
      rngState: seed,
      player: {
        ...fresh.player,
        equippedWeaponId: enemy.kind === 'boss' ? 'morgenklinge' : 'reiseschwert',
        inventory: {
          ...fresh.player.inventory,
          morgenklinge: 1,
          wurzelsiegel: 1,
          gezeitensiegel: 1,
          himmelssiegel: 1
        }
      }
    }
    save = reduceGame(save, { type: 'START_COMBAT', encounterId: encounter.id }, world)

    let turns = 0
    while (save.activeCombat && save.player.life > 0 && turns < 80) {
      turns += 1
      const combat = save.activeCombat
      if (combat.pendingSealItemId) {
        save = reduceGame(save, { type: 'PLACE_SEAL', itemId: combat.pendingSealItemId }, world)
        continue
      }
      if (combat.awaitingFinalPromise) {
        save = reduceGame(save, { type: 'SPEAK_PROMISE' }, world)
        continue
      }
      const view = getCombatView(save, world)
      if (!view) break
      if (view.move.kind === 'heavy') {
        save = reduceGame(save, { type: 'DEFEND' }, world)
      } else if (save.player.life <= 8 && (save.player.inventory.apfelbrot ?? 0) > 0) {
        save = reduceGame(save, { type: 'USE_ITEM', itemId: 'apfelbrot' }, world)
      } else if (combat.enemyStance === 'guarded' || (view.enemy.airborne && combat.enemyStance !== 'vulnerable')) {
        save = reduceGame(save, { type: 'DEFEND' }, world)
      } else {
        save = reduceGame(save, { type: 'ATTACK' }, world)
      }
    }

    return {
      encounterId: encounter.id,
      won: save.defeatedEncounterIds.includes(encounter.id),
      turns,
      remainingLife: save.player.life
    }
  })
}
