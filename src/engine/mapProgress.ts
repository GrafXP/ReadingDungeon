import type { WorldDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'
import { isInteractionComplete } from './actions'
import { isPuzzleSolved } from './puzzles'
import { evaluateRequirement } from './requirements'

export type MapAreaState = 'new' | 'open' | 'blocked' | 'clear'

export interface MapTaskView {
  label: string
  detail: string
}

export interface MapAreaProgress {
  areaId: string
  state: MapAreaState
  open: MapTaskView[]
  blocked: MapTaskView[]
  unfinishedCount: number
}

export function getMapAreaProgress(save: GameSave, world: WorldDefinition, areaId: string): MapAreaProgress {
  if (!save.visitedAreaIds.includes(areaId)) {
    return { areaId, state: 'new', open: [], blocked: [], unfinishedCount: 0 }
  }

  const open: MapTaskView[] = []
  const blocked: MapTaskView[] = []
  if (!save.flags.includes(`area_untersucht:${areaId}`)) {
    open.push({ label: 'Ort untersuchen', detail: 'Hier gibt es noch Spuren und Einzelheiten zu entdecken.' })
  }

  for (const interaction of world.interactions.filter((entry) => entry.areaId === areaId)) {
    if (!evaluateRequirement(interaction.visibilityRequirement, save).met || isInteractionComplete(interaction, save)) continue
    const requirement = evaluateRequirement(interaction.requirement, save)
    const puzzle = world.puzzles?.find((entry) => entry.interactionId === interaction.id)
    const puzzleSolved = !puzzle || isPuzzleSolved(save, puzzle)
    const task = {
      label: interaction.label,
      detail: !requirement.met
        ? interaction.blockedText ?? 'Dafür fehlt dir noch etwas.'
        : !puzzleSolved ? 'Löse zuerst das Rätsel an diesem Ort.' : interaction.description
    }
    if (requirement.met && puzzleSolved) open.push(task)
    else blocked.push(task)
  }

  for (const encounter of world.encounters.filter((entry) => entry.areaId === areaId && !save.defeatedEncounterIds.includes(entry.id))) {
    const enemies = encounter.enemyIds.map((id) => world.enemies.find((entry) => entry.id === id)).filter((enemy): enemy is NonNullable<typeof enemy> => Boolean(enemy))
    const weapon = world.items.find((item) => item.id === save.player.equippedWeaponId && item.weapon)
    const missingWeapon = !weapon || (save.player.inventory[weapon.id] ?? 0) < 1
    const missingSeals = enemies.some((enemy) => Boolean(enemy.phaseSealItemIds && Object.values(enemy.phaseSealItemIds).some((id) => (save.player.inventory[id] ?? 0) < 1)))
    const missingGear = !evaluateRequirement(encounter.requiredGear, save).met
    if (missingWeapon || missingSeals || missingGear) {
      blocked.push({
        label: encounter.label,
        detail: missingWeapon ? 'Rüste zuerst eine Waffe aus.' : missingGear ? encounter.gearWarning ?? 'Rüste zuerst den passenden Schutz aus.' : 'Für diesen Kampf fehlen wichtige Gegenstände.'
      })
    } else {
      open.push({ label: encounter.label, detail: encounter.description })
    }
  }

  return {
    areaId,
    state: open.length > 0 ? 'open' : blocked.length > 0 ? 'blocked' : 'clear',
    open,
    blocked,
    unfinishedCount: open.length + blocked.length
  }
}
