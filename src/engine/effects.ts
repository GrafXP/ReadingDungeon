import type { InteractionEffect, WorldDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

export function applyEffect(save: GameSave, effect: InteractionEffect, world: WorldDefinition): GameSave {
  switch (effect.kind) {
    case 'addItem':
      return {
        ...save,
        player: {
          ...save.player,
          inventory: {
            ...save.player.inventory,
            [effect.itemId]: (save.player.inventory[effect.itemId] ?? 0) + effect.quantity
          }
        }
      }
    case 'removeItem': {
      const quantity = save.player.inventory[effect.itemId] ?? 0
      const remaining = Math.max(0, quantity - effect.quantity)
      const inventory = { ...save.player.inventory }
      if (remaining === 0) delete inventory[effect.itemId]
      else inventory[effect.itemId] = remaining
      const equippedWeaponId = remaining === 0 && save.player.equippedWeaponId === effect.itemId
        ? world.start.equippedWeaponId && (inventory[world.start.equippedWeaponId] ?? 0) > 0 ? world.start.equippedWeaponId : null
        : save.player.equippedWeaponId
      const equippedArmorId = remaining === 0 && save.player.equippedArmorId === effect.itemId ? null : save.player.equippedArmorId
      const equippedTalismanId = remaining === 0 && save.player.equippedTalismanId === effect.itemId ? null : save.player.equippedTalismanId
      return { ...save, player: { ...save.player, inventory, equippedWeaponId, equippedArmorId, equippedTalismanId } }
    }
    case 'setFlag':
      return { ...save, flags: unique([...save.flags, effect.flag]) }
    case 'discoverClue':
      return { ...save, discoveredClueIds: unique([...save.discoveredClueIds, effect.clueId]) }
    case 'unlockPassage':
      return { ...save, unlockedPassageIds: unique([...save.unlockedPassageIds, effect.passageId]) }
    case 'equipItem': {
      if ((save.player.inventory[effect.itemId] ?? 0) < 1) return save
      const item = world.items.find((entry) => entry.id === effect.itemId)
      if (item?.kind === 'weapon' && item.weapon) {
        return { ...save, player: { ...save.player, equippedWeaponId: item.id } }
      }
      if (item?.kind === 'armor' && item.armor?.slot === 'body') {
        return { ...save, player: { ...save.player, equippedArmorId: item.id } }
      }
      if (item?.kind === 'armor' && item.armor?.slot === 'talisman') {
        return { ...save, player: { ...save.player, equippedTalismanId: item.id } }
      }
      return save
    }
  }
}
