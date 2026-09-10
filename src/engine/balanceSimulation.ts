import type { WorldDefinition } from '../domain/content'
import { createNewGame, type GameSave } from '../domain/game'
import { getCombatView } from './combat'
import { reduceGame } from './reducer'
import { requirementItemIds } from './requirements'

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
    const fresh = createNewGame('Testkind', world)
    const inventory = Object.fromEntries(world.items.map((item) => [item.id, item.kind === 'healing' ? 3 : 1]))
    const requiredItems = requirementItemIds(encounter.requiredGear)
    const requiredWeapon = world.items.find((item) => requiredItems.includes(item.id) && item.kind === 'weapon')
    const requiredBody = world.items.find((item) => requiredItems.includes(item.id) && item.armor?.slot === 'body')
    const requiredTalisman = world.items.find((item) => requiredItems.includes(item.id) && item.armor?.slot === 'talisman')
    const certainlyReachableWeaponIds = new Set([
      ...Object.keys(world.start.inventory),
      ...requiredItems
    ])
    const usefulWeapons = world.items.filter((item) => item.weapon && certainlyReachableWeaponIds.has(item.id))
    const weakestUsefulWeapon = usefulWeapons.sort((a, b) => {
      const aPower = a.weapon!.minDamage + (a.weapon!.elemental?.amount ?? 0)
      const bPower = b.weapon!.minDamage + (b.weapon!.elemental?.amount ?? 0)
      return aPower - bPower
    })[0]
    let save: GameSave = {
      ...fresh,
      currentAreaId: encounter.areaId,
      visitedAreaIds: [...new Set([...fresh.visitedAreaIds, encounter.areaId])],
      rngState: seed,
      player: {
        ...fresh.player,
        equippedWeaponId: requiredWeapon?.id ?? weakestUsefulWeapon?.id ?? fresh.player.equippedWeaponId,
        equippedArmorId: requiredBody?.id ?? fresh.player.equippedArmorId,
        equippedTalismanId: requiredTalisman?.id ?? fresh.player.equippedTalismanId,
        inventory
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
      if (combat.awaitingFinalAction) {
        save = reduceGame(save, { type: 'COMPLETE_FINAL_ACTION' }, world)
        continue
      }
      const view = getCombatView(save, world)
      if (!view) break
      if (view.move.kind === 'heavy') {
        save = reduceGame(save, { type: 'DEFEND' }, world)
      } else if (world.items.find((item) => item.id === save.player.equippedWeaponId)?.weapon?.skill && combat.skillCooldown === 0) {
        save = reduceGame(save, { type: 'USE_SKILL' }, world)
      } else if (save.player.life <= 8) {
        const healing = world.items.find((item) => item.healing && (save.player.inventory[item.id] ?? 0) > 0)
        save = healing ? reduceGame(save, { type: 'USE_ITEM', itemId: healing.id }, world) : reduceGame(save, { type: 'ATTACK' }, world)
      } else if (view.combatant.stance === 'guarded' || (view.enemy.airborne && view.combatant.stance !== 'vulnerable')) {
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
