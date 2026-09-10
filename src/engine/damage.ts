import type {
  ArmorDefinition,
  DamageType,
  EnemyDefinition,
  EnemyMoveDefinition,
  ItemDefinition,
  StatusEffectDefinition
} from '../domain/content'
import type { ActiveEffect } from '../domain/game'

export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  physical: 'Wucht',
  fire: 'Feuer',
  ice: 'Eis',
  lightning: 'Blitz',
  light: 'Licht',
  shadow: 'Dämmer'
}

export const DAMAGE_TYPE_ICONS: Record<DamageType, string> = {
  physical: '◆',
  fire: '✹',
  ice: '❄',
  lightning: 'ϟ',
  light: '☀',
  shadow: '◐'
}

export interface DamagePart {
  type: DamageType
  base: number
  result: number
  relationship: 'normal' | 'weak' | 'resistant' | 'immune'
}

export interface PlayerHitInput {
  weapon: NonNullable<ItemDefinition['weapon']>
  weaponName: string
  enemy: EnemyDefinition
  roll: number
  weaponMode?: DamageType
  enemyEffects?: ActiveEffect[]
  playerEffects?: ActiveEffect[]
  statusEffects?: StatusEffectDefinition[]
  extraDamage?: { amount: number; type: DamageType }
  blocked?: boolean
}

export interface PlayerHitResult {
  damage: number
  text: string
  parts: DamagePart[]
  damageTypes: DamageType[]
}

function relationshipFor(type: DamageType, enemy: EnemyDefinition, addedWeaknesses: DamageType[]): DamagePart['relationship'] {
  if (enemy.immuneTo?.includes(type)) return 'immune'
  if (enemy.weakTo?.includes(type) || addedWeaknesses.includes(type)) return 'weak'
  if (enemy.resistantTo?.includes(type)) return 'resistant'
  return 'normal'
}

function applyRelationship(base: number, relationship: DamagePart['relationship']): number {
  if (relationship === 'immune') return 0
  if (relationship === 'weak') return base + 3
  if (relationship === 'resistant') return Math.max(0, base - 3)
  return base
}

function effectDefinitions(effects: ActiveEffect[], definitions: StatusEffectDefinition[]): StatusEffectDefinition[] {
  return effects.flatMap((effect) => definitions.find((definition) => definition.id === effect.id) ?? [])
}

function relationshipText(enemy: EnemyDefinition, part: DamagePart): string {
  const type = DAMAGE_TYPE_LABELS[part.type]
  if (part.relationship === 'weak') return ` + 3 (${enemy.name} ist schwach gegen ${type})`
  if (part.relationship === 'resistant') return ` − 3 (${enemy.name} widersteht ${type})`
  if (part.relationship === 'immune') return ` → 0 (${enemy.name} ist immun gegen ${type})`
  return ''
}

function elementalType(weapon: NonNullable<ItemDefinition['weapon']>, requested?: DamageType): DamageType | null {
  const elemental = weapon.elemental
  if (!elemental) return null
  if ('type' in elemental) return elemental.type
  return requested && elemental.choices.includes(requested) ? requested : elemental.choices[0] ?? null
}

export function resolvePlayerHit(input: PlayerHitInput): PlayerHitResult {
  const definitions = input.statusEffects ?? []
  const enemyDefinitions = effectDefinitions(input.enemyEffects ?? [], definitions)
  const playerDefinitions = effectDefinitions(input.playerEffects ?? [], definitions)
  const addedWeaknesses = enemyDefinitions.flatMap((definition) => definition.modifiers?.addWeakness ?? [])
  const defenseDelta = enemyDefinitions.reduce((sum, definition) => sum + (definition.modifiers?.enemyDefenseDelta ?? 0), 0)
  const effectiveDefense = Math.max(0, input.enemy.defense + defenseDelta - (input.weapon.armorPiercing ?? 0))
  const tagBonus = input.weapon.bonusAgainstTag && input.enemy.tags.includes(input.weapon.bonusAgainstTag.tag)
    ? input.weapon.bonusAgainstTag.amount
    : 0
  const baseAfterArmor = Math.max(0, input.roll + tagBonus - effectiveDefense)
  const parts: DamagePart[] = []
  const physicalRelationship = relationshipFor(input.weapon.damageType, input.enemy, addedWeaknesses)
  parts.push({
    type: input.weapon.damageType,
    base: baseAfterArmor,
    result: applyRelationship(baseAfterArmor, physicalRelationship),
    relationship: physicalRelationship
  })

  const selectedElement = elementalType(input.weapon, input.weaponMode)
  if (selectedElement && input.weapon.elemental) {
    const relationship = relationshipFor(selectedElement, input.enemy, addedWeaknesses)
    parts.push({
      type: selectedElement,
      base: input.weapon.elemental.amount,
      result: applyRelationship(input.weapon.elemental.amount, relationship),
      relationship
    })
  }
  if (input.extraDamage) {
    const relationship = relationshipFor(input.extraDamage.type, input.enemy, addedWeaknesses)
    parts.push({
      type: input.extraDamage.type,
      base: input.extraDamage.amount,
      result: applyRelationship(input.extraDamage.amount, relationship),
      relationship
    })
  }

  const damageTakenDelta = enemyDefinitions.reduce((sum, definition) => sum + (
    definition.modifiers?.damageTakenDelta ?? (definition.modifiers?.enemyStance === 'vulnerable' ? 2 : 0)
  ), 0)
  const playerAttackDelta = playerDefinitions.reduce((sum, definition) => sum + (definition.modifiers?.playerAttackDelta ?? 0), 0)
  const allImmune = parts.every((part) => part.relationship === 'immune')
  const rawTotal = parts.reduce((sum, part) => sum + part.result, 0) + damageTakenDelta + playerAttackDelta
  const damage = input.blocked ? 0 : allImmune ? 0 : Math.max(1, rawTotal)
  const baseType = DAMAGE_TYPE_LABELS[input.weapon.damageType]
  const terms = [`${input.roll}${tagBonus ? ` + ${tagBonus} Artbonus` : ''} ${baseType}`]
  if (effectiveDefense) terms.push(`− ${effectiveDefense} Panzerung`)
  if (parts[0].relationship !== 'normal') terms.push(relationshipText(input.enemy, parts[0]).trim())
  for (const part of parts.slice(1)) {
    terms.push(`+ ${part.base} ${DAMAGE_TYPE_LABELS[part.type]}${relationshipText(input.enemy, part)}`)
  }
  if (damageTakenDelta) terms.push(`${damageTakenDelta > 0 ? '+' : '−'} ${Math.abs(damageTakenDelta)} durch Zustand`)
  if (playerAttackDelta) terms.push(`${playerAttackDelta > 0 ? '+' : '−'} ${Math.abs(playerAttackDelta)} durch Zustand`)
  const calculation = terms.join(' ')
  const text = input.blocked
    ? `${input.weaponName}: ${calculation} = 0 Schaden. ${input.enemy.name} ist vollständig geschützt.`
    : `${input.weaponName}: ${calculation} = ${damage} Schaden.`
  return { damage, text, parts, damageTypes: [...new Set(parts.map((part) => part.type))] }
}

export interface EnemyHitInput {
  enemyName: string
  move: EnemyMoveDefinition
  defending: boolean
  armor?: { name: string; definition: ArmorDefinition } | null
  talisman?: { name: string; definition: ArmorDefinition } | null
  ward?: { name: string; protectsFrom: DamageType[] } | null
}

export interface EnemyHitResult {
  damage: number
  text: string
  protectedBy: string | null
}

export function resolveEnemyHit(input: EnemyHitInput): EnemyHitResult {
  const damageType = input.move.damageType ?? 'physical'
  const typeName = DAMAGE_TYPE_LABELS[damageType]
  const gear = [input.armor, input.talisman].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  if (input.defending && input.move.defendNegates) {
    return {
      damage: 0,
      protectedBy: 'Verteidigung',
      text: input.move.defendOutcomeText ?? `Du erkennst ${input.move.name} rechtzeitig und weichst dem ganzen Treffer aus.`
    }
  }
  const immune = gear.find((entry) => entry.definition.immuneTo?.includes(damageType))
  if (immune && input.move.damage > 0) {
    return {
      damage: 0,
      protectedBy: immune.name,
      text: `${input.enemyName} greift mit ${input.move.name} an: ${input.move.damage} ${typeName} → ${immune.name} 0 Schaden. ${immune.name} hält ${typeName} vollständig ab.`
    }
  }

  let damage = input.move.damage
  const steps = [`${input.move.damage} ${typeName}`]
  if (input.defending && damage > 0) {
    damage = Math.ceil(damage / 2)
    steps.push(`Verteidigung ${damage}`)
  }
  const gearProtection = gear.find((entry) => entry.definition.protectsFrom?.includes(damageType))
  const protection = gearProtection ?? (input.ward?.protectsFrom.includes(damageType)
    ? { name: input.ward.name, definition: { slot: 'talisman' as const, defense: 0, protectsFrom: input.ward.protectsFrom } }
    : undefined)
  if (protection && damage > 0) {
    damage = Math.ceil(damage / 2)
    steps.push(`${protection.name} halbiert auf ${damage}`)
  }
  const gearDefense = gear.reduce((sum, entry) => sum + entry.definition.defense, 0)
  if (gearDefense && damage > 0) {
    damage = Math.max(1, damage - gearDefense)
    steps.push(`− ${gearDefense} Panzerung`)
  }
  const text = `${input.enemyName} greift mit ${input.move.name} an: ${steps.join(' → ')} = ${damage} Schaden.`
  return { damage, text, protectedBy: protection?.name ?? null }
}
