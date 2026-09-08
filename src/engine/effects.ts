import type { InteractionEffect } from '../domain/content'
import type { GameSave } from '../domain/game'

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

export function applyEffect(save: GameSave, effect: InteractionEffect): GameSave {
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
        ? (inventory.reiseschwert ?? 0) > 0 ? 'reiseschwert' : null
        : save.player.equippedWeaponId
      return { ...save, player: { ...save.player, inventory, equippedWeaponId } }
    }
    case 'setFlag':
      return { ...save, flags: unique([...save.flags, effect.flag]) }
    case 'discoverClue':
      return { ...save, discoveredClueIds: unique([...save.discoveredClueIds, effect.clueId]) }
    case 'unlockPassage':
      return { ...save, unlockedPassageIds: unique([...save.unlockedPassageIds, effect.passageId]) }
  }
}
