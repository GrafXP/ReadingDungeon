import { describe, expect, it } from 'vitest'
import { talora2World } from '../content/world'
import { addStatusEffect, statusDamage, TALORA_STATUS_EFFECTS, tickStatusEffects } from './statusEffects'

describe('Talora-Zustände', () => {
  it.each(TALORA_STATUS_EFFECTS)('begrenzt und zählt $id ohne negative Restwerte', (definition) => {
    const duration = definition.maximumDuration ?? 1
    let effects = addStatusEffect([], definition, 99)
    expect(effects).toEqual([{ id: definition.id, remainingEnemyTurns: duration }])
    for (let turn = 0; turn < duration; turn++) effects = tickStatusEffects(effects)
    expect(effects).toEqual([])
  })

  it('berechnet Rundenschaden getrennt von einem Treffer', () => {
    expect(statusDamage([
      { id: 'brennt', remainingEnemyTurns: 2 },
      { id: 'nass', remainingEnemyTurns: 2 }
    ], talora2World)).toEqual({ damage: 2, labels: ['Brennt verursacht 2 Schaden'] })
    expect(statusDamage([{ id: 'versengt', remainingEnemyTurns: 1 }], talora2World).damage).toBe(1)
  })

  it('nennt für benebelt und versengt die vorgesehenen Gegenmittel', () => {
    expect(TALORA_STATUS_EFFECTS.find((effect) => effect.id === 'benebelt')?.clearedByItemIds).toEqual(['item_consume_klarwasser'])
    expect(TALORA_STATUS_EFFECTS.find((effect) => effect.id === 'versengt')?.clearedByItemIds).toEqual(['item_consume_kuehlkompresse', 'item_consume_klarwasser'])
  })
})
