import type { Requirement } from '../domain/content'
import type { GameSave } from '../domain/game'

export interface RequirementResult {
  met: boolean
  missing: string[]
}

export function evaluateRequirement(requirement: Requirement | undefined, save: GameSave): RequirementResult {
  if (!requirement) return { met: true, missing: [] }

  switch (requirement.kind) {
    case 'item': {
      const quantity = requirement.quantity ?? 1
      return (save.player.inventory[requirement.itemId] ?? 0) >= quantity
        ? { met: true, missing: [] }
        : { met: false, missing: [`Gegenstand:${requirement.itemId}`] }
    }
    case 'flag':
      return save.flags.includes(requirement.flag)
        ? { met: true, missing: [] }
        : { met: false, missing: [`Fortschritt:${requirement.flag}`] }
    case 'clue':
      return save.discoveredClueIds.includes(requirement.clueId)
        ? { met: true, missing: [] }
        : { met: false, missing: [`Hinweis:${requirement.clueId}`] }
    case 'all': {
      const results = requirement.requirements.map((entry) => evaluateRequirement(entry, save))
      return {
        met: results.every((entry) => entry.met),
        missing: results.flatMap((entry) => entry.missing)
      }
    }
    case 'any': {
      const results = requirement.requirements.map((entry) => evaluateRequirement(entry, save))
      return results.some((entry) => entry.met)
        ? { met: true, missing: [] }
        : { met: false, missing: results.flatMap((entry) => entry.missing) }
    }
  }
}

export function requirementItemIds(requirement: Requirement | undefined): string[] {
  if (!requirement) return []
  if (requirement.kind === 'item') return [requirement.itemId]
  if (requirement.kind === 'flag' || requirement.kind === 'clue') return []
  return requirement.requirements.flatMap(requirementItemIds)
}
