import type { DamageType, StatusEffectDefinition, WorldDefinition } from '../domain/content'
import type { ActiveEffect } from '../domain/game'

const wards = (['physical', 'fire', 'ice', 'lightning', 'light', 'shadow'] as DamageType[]).map((type): StatusEffectDefinition => ({
  id: `schutz:${type}`,
  name: `${type === 'physical' ? 'Wucht' : type === 'fire' ? 'Feuer' : type === 'ice' ? 'Eis' : type === 'lightning' ? 'Blitz' : type === 'light' ? 'Licht' : 'Dämmer'}schutz`,
  icon: '◈',
  description: 'Halbiert den nächsten passenden Treffer.',
  target: 'player',
  modifiers: { protectsFrom: [type], damageMultiplier: 0.5 },
  maximumDuration: 3
}))

export const KANTARA_STATUS_EFFECTS: StatusEffectDefinition[] = [
  { id: 'brennt', name: 'Brennt', icon: '✹', description: 'Verliert drei Runden lang je 2 Leben.', target: 'enemy', perTurn: { damage: 2, damageType: 'fire' }, maximumDuration: 3 },
  { id: 'gefroren', name: 'Gefroren', icon: '❄', description: 'Überspringt die nächste Bewegung.', target: 'enemy', modifiers: { skipEnemyTurn: true }, maximumDuration: 1 },
  { id: 'betaeubt', name: 'Betäubt', icon: '✦', description: 'Hat eine Runde lang keine Panzerung.', target: 'enemy', modifiers: { enemyDefenseDelta: -999 }, maximumDuration: 1 },
  { id: 'nass', name: 'Nass', icon: '≈', description: 'Ist zusätzlich schwach gegen Blitz und Eis.', target: 'enemy', modifiers: { addWeakness: ['lightning', 'ice'] }, maximumDuration: 3 },
  { id: 'verwurzelt', name: 'Verwurzelt', icon: '⌁', description: 'Kann nicht fliegen oder ausweichen.', target: 'enemy', modifiers: { groundsEnemy: true }, maximumDuration: 2 },
  { id: 'offener_riss', name: 'Offener Riss', icon: '◇', description: 'Angriffe verursachen 2 Schaden mehr.', target: 'enemy', modifiers: { enemyStance: 'vulnerable', damageTakenDelta: 2 }, maximumDuration: 2 },
  { id: 'benebelt', name: 'Benebelt', icon: '◐', description: 'Angriffe verursachen 1 Schaden weniger.', target: 'player', modifiers: { playerAttackDelta: -1 }, clearedByItemIds: ['item_consume_klarwasser'], maximumDuration: 3 },
  { id: 'versengt', name: 'Versengt', icon: '♨', description: 'Verliert drei Runden lang je 1 Leben.', target: 'player', perTurn: { damage: 1, damageType: 'fire' }, clearedByItemIds: ['item_consume_kuehlkompresse', 'item_consume_klarwasser'], maximumDuration: 3 },
  ...wards
]

export function getStatusDefinition(world: WorldDefinition, id: string): StatusEffectDefinition | undefined {
  return world.statusEffects?.find((definition) => definition.id === id)
}

export function addStatusEffect(effects: ActiveEffect[], definition: StatusEffectDefinition, duration: number): ActiveEffect[] {
  const limitedDuration = Math.min(Math.max(1, duration), definition.maximumDuration ?? duration)
  return [...effects.filter((effect) => effect.id !== definition.id), { id: definition.id, remainingEnemyTurns: limitedDuration }]
}

export function tickStatusEffects(effects: ActiveEffect[]): ActiveEffect[] {
  return effects
    .map((effect) => ({ ...effect, remainingEnemyTurns: effect.remainingEnemyTurns - 1 }))
    .filter((effect) => effect.remainingEnemyTurns > 0)
}

export function statusDamage(effects: ActiveEffect[], world: WorldDefinition): { damage: number; labels: string[] } {
  const active = effects.flatMap((effect) => {
    const definition = getStatusDefinition(world, effect.id)
    return definition?.perTurn ? [definition] : []
  })
  return {
    damage: active.reduce((sum, definition) => sum + (definition.perTurn?.damage ?? 0), 0),
    labels: active.map((definition) => `${definition.name} verursacht ${definition.perTurn!.damage} Schaden`)
  }
}

export function hasStatusModifier(
  effects: ActiveEffect[],
  world: WorldDefinition,
  predicate: (definition: StatusEffectDefinition) => boolean
): boolean {
  return effects.some((effect) => {
    const definition = getStatusDefinition(world, effect.id)
    return Boolean(definition && predicate(definition))
  })
}
