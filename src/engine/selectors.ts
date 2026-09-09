import type { AreaDefinition, ItemDefinition, WorldDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'
import { otherEnd } from './actions'
import { evaluateRequirement } from './requirements'

export function getCurrentArea(save: GameSave, world: WorldDefinition): AreaDefinition {
  const area = world.areas.find((entry) => entry.id === save.currentAreaId)
  if (!area) throw new Error(`Unbekannter aktueller Ort: ${save.currentAreaId}`)
  return area
}

export function getAreaDescription(save: GameSave, area: AreaDefinition): string {
  const changed = area.variants?.find((variant) => evaluateRequirement(variant.requirement, save).met)
  if (changed) return changed.description
  return save.deliveredDialogueIds.includes(`area_intro:${area.id}`)
    ? area.revisitDescription
    : area.firstDescription
}

export function getAreaInspectText(save: GameSave, area: AreaDefinition): string {
  return area.variants?.find((variant) => evaluateRequirement(variant.requirement, save).met)?.inspectText ?? area.inspectText
}

export function getKnownAreaIds(save: GameSave, world: WorldDefinition): string[] {
  if (world.mapRevealRequirement && evaluateRequirement(world.mapRevealRequirement, save).met) return world.areas.map((area) => area.id)
  const known = new Set(save.visitedAreaIds)
  for (const area of world.areas) {
    if (save.discoveredClueIds.includes(`hinweis_ort:${area.id}`)) known.add(area.id)
  }
  for (const passage of world.passages) {
    if (save.flags.includes(`area_untersucht:${passage.fromAreaId}`)) known.add(passage.toAreaId)
    if (save.flags.includes(`area_untersucht:${passage.toAreaId}`)) known.add(passage.fromAreaId)
  }
  return [...known]
}

export function getInventoryItems(save: GameSave, world: WorldDefinition): Array<{ item: ItemDefinition; quantity: number }> {
  return Object.entries(save.player.inventory)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => ({ item: world.items.find((entry) => entry.id === id), quantity }))
    .filter((entry): entry is { item: ItemDefinition; quantity: number } => Boolean(entry.item))
}

export function getLastEventText(save: GameSave): string | null {
  return save.recentEvents.at(-1)?.text ?? null
}

export function getConnectedKnownAreas(save: GameSave, world: WorldDefinition, areaId: string) {
  const known = new Set(getKnownAreaIds(save, world))
  return world.passages
    .filter((passage) => otherEnd(passage, areaId) !== null)
    .map((passage) => world.areas.find((area) => area.id === otherEnd(passage, areaId)))
    .filter((area): area is AreaDefinition => Boolean(area && known.has(area.id)))
}
