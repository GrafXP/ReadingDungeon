import type { ReminderGroupDefinition, ReminderStatus, WorldDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'

export type { ReminderStatus }

export function getReminderGroups(save: GameSave, world: WorldDefinition): ReminderGroupDefinition[] {
  return world.journal?.getReminderGroups?.(save) ?? []
}
