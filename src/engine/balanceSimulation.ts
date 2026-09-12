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
  remainingEnemyLife?: number
  announcedMoveId?: string
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
    const regionId = encounter.areaId.slice(0, 2)
    const hasReachedOuterWorld = /^(fi|fs|lm|rn)_/.test(encounter.areaId)
    const outerWeapon = hasReachedOuterWorld ? world.items.find((item) => item.id === 'item_weapon_alvas_klinge') : undefined
    const suggestedBodyId: Record<string, string> = {
      ww: 'item_armor_rindenpanzer', sk: 'item_armor_muschelharnisch', fi: 'item_armor_feuermantel',
      fs: 'item_armor_waermewams', lm: 'item_armor_schattenumhang', rn: 'item_armor_schattenumhang'
    }
    const suggestedTalismanId: Record<string, string> = { dh: 'item_talisman_erdungsring', rn: 'item_talisman_waechterzeichen' }
    const suggestedBody = world.items.find((item) => item.id === suggestedBodyId[regionId])
    const suggestedTalisman = world.items.find((item) => item.id === suggestedTalismanId[regionId])
    const certainlyReachableWeaponIds = new Set([
      ...Object.keys(world.start.inventory),
      ...requiredItems,
      ...(hasReachedOuterWorld ? ['item_weapon_alvas_klinge'] : [])
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
        equippedWeaponId: requiredWeapon?.id ?? outerWeapon?.id ?? weakestUsefulWeapon?.id ?? fresh.player.equippedWeaponId,
        equippedArmorId: requiredBody?.id ?? suggestedBody?.id ?? fresh.player.equippedArmorId,
        equippedTalismanId: requiredTalisman?.id ?? suggestedTalisman?.id ?? fresh.player.equippedTalismanId,
        inventory,
        weaponElementModes: Object.fromEntries(world.items.flatMap((item) => {
          if (!item.weapon?.elemental || !('choices' in item.weapon.elemental)) return []
          const firstEnemy = world.enemies.find((enemy) => enemy.id === encounter.enemyIds[0])
          const usefulMode = item.weapon.elemental.choices.find((choice) => firstEnemy?.weakTo?.includes(choice))
          return [[item.id, usefulMode ?? item.weapon.elemental.choices[0]]]
        }))
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
      const weaponItem = world.items.find((item) => item.id === save.player.equippedWeaponId)
      const skill = weaponItem?.weapon?.skill
      const canUseSkill = Boolean(skill && combat.skillCooldown === 0)
      const inflictedEffectId = skill?.effect.kind === 'inflict' ? skill.effect.effectId : null
      const groundingSkill = Boolean(inflictedEffectId && world.statusEffects?.some((effect) => (
        effect.id === inflictedEffectId && effect.modifiers?.groundsEnemy
      )))
      const enemyGrounded = view.combatant.effects.some((effect) => world.statusEffects?.some((definition) => (
        definition.id === effect.id && definition.modifiers?.groundsEnemy
      )))
      if (view.move.kind === 'heavy') {
        save = reduceGame(save, { type: 'DEFEND' }, world)
      } else if (view.move.kind === 'charge') {
        save = skill?.effect.kind === 'interrupt'
          ? canUseSkill ? reduceGame(save, { type: 'USE_SKILL' }, world) : reduceGame(save, { type: 'DEFEND' }, world)
          : canUseSkill ? reduceGame(save, { type: 'USE_SKILL' }, world) : reduceGame(save, { type: 'ATTACK' }, world)
      } else if (view.move.kind === 'heal') {
        save = canUseSkill
          ? reduceGame(save, { type: 'USE_SKILL' }, world)
          : reduceGame(save, { type: 'ATTACK' }, world)
      } else if (view.combatant.stance === 'guarded') {
        save = reduceGame(save, { type: 'DEFEND' }, world)
      } else if (save.player.life <= 8) {
        const healing = world.items.find((item) => item.healing && (save.player.inventory[item.id] ?? 0) > 0)
        save = healing ? reduceGame(save, { type: 'USE_ITEM', itemId: healing.id }, world) : reduceGame(save, { type: 'ATTACK' }, world)
      } else if (view.enemy.airborne && !enemyGrounded && view.combatant.stance !== 'vulnerable') {
        save = canUseSkill && groundingSkill
          ? reduceGame(save, { type: 'USE_SKILL' }, world)
          : reduceGame(save, { type: 'DEFEND' }, world)
      } else if (canUseSkill && skill?.effect.kind !== 'interrupt') {
        save = reduceGame(save, { type: 'USE_SKILL' }, world)
      } else {
        save = reduceGame(save, { type: 'ATTACK' }, world)
      }
    }

    return {
      encounterId: encounter.id,
      won: save.defeatedEncounterIds.includes(encounter.id),
      turns,
      remainingLife: save.player.life,
      remainingEnemyLife: save.activeCombat?.combatants[save.activeCombat.targetIndex]?.life,
      announcedMoveId: save.activeCombat?.combatants[save.activeCombat.targetIndex]?.announcedMoveId
    }
  })
}
