import type { EnemyDefinition, WorldDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'
import { DAMAGE_TYPE_ICONS, DAMAGE_TYPE_LABELS } from './damage'

export interface EnemyKnowledge {
  met: boolean
  studied: boolean
  weaknesses: string
  resistances: string
  immunities: string
}

export function getEncounterEnemies(world: WorldDefinition): EnemyDefinition[] {
  const ids = new Set(world.encounters.flatMap((encounter) => encounter.enemyIds))
  return world.enemies.filter((enemy) => ids.has(enemy.id))
}

function damageList(types: EnemyDefinition['weakTo']): string {
  return types?.length
    ? types.map((type) => `${DAMAGE_TYPE_ICONS[type]} ${DAMAGE_TYPE_LABELS[type]}`).join(', ')
    : 'keine'
}

export function getEnemyKnowledge(save: GameSave, enemy: EnemyDefinition): EnemyKnowledge {
  const met = save.metEnemyIds.includes(enemy.id)
  const studied = save.studiedEnemyIds.includes(enemy.id)
  return {
    met,
    studied,
    weaknesses: studied ? damageList(enemy.weakTo) : 'unbekannt',
    resistances: studied ? damageList(enemy.resistantTo) : 'unbekannt',
    immunities: studied ? damageList(enemy.immuneTo) : 'unbekannt'
  }
}

export function getMetEnemies(save: GameSave, world: WorldDefinition): EnemyDefinition[] {
  return save.metEnemyIds.flatMap((id) => world.enemies.find((enemy) => enemy.id === id) ?? [])
}
