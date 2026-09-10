import { describe, expect, it } from 'vitest'
import type { EnemyDefinition, ItemDefinition } from '../domain/content'
import { resolveEnemyHit, resolvePlayerHit } from './damage'
import { KANTARA_STATUS_EFFECTS } from './statusEffects'

const weapon: NonNullable<ItemDefinition['weapon']> = {
  minDamage: 4,
  maxDamage: 4,
  damageType: 'physical',
  elemental: { choices: ['fire', 'ice', 'lightning'], amount: 3 },
  trait: 'Testwaffe'
}

function enemy(patch: Partial<EnemyDefinition> = {}): EnemyDefinition {
  return {
    id: 'testgegner', name: 'Testgegner', kind: 'normal', maxLife: 20, defense: 2, tags: [],
    movesByPhase: { 1: [{ id: 'hieb', name: 'Hieb', telegraph: 'Holt aus.', icon: '!', damage: 8, kind: 'normal', damageType: 'fire' }] },
    ...patch
  }
}

describe('sichtbare Trefferrechnung', () => {
  it('rechnet Panzerung, Element und Schwäche in der festgelegten Reihenfolge', () => {
    const hit = resolvePlayerHit({ weapon, weaponName: 'Prüfstab', enemy: enemy({ weakTo: ['fire'] }), roll: 4, weaponMode: 'fire' })
    expect(hit.damage).toBe(8)
    expect(hit.parts).toEqual([
      { type: 'physical', base: 2, result: 2, relationship: 'normal' },
      { type: 'fire', base: 3, result: 6, relationship: 'weak' }
    ])
    expect(hit.text).toContain('4 Wucht − 2 Panzerung + 3 Feuer + 3 (Testgegner ist schwach gegen Feuer) = 8 Schaden')
  })

  it('wendet Widerstand, Immunität und den Mindestschaden pro Treffer an', () => {
    expect(resolvePlayerHit({ weapon: { ...weapon, elemental: undefined }, weaponName: 'Klinge', enemy: enemy({ defense: 9, resistantTo: ['physical'] }), roll: 4 }).damage).toBe(1)
    expect(resolvePlayerHit({ weapon, weaponName: 'Stab', enemy: enemy({ immuneTo: ['physical', 'ice'] }), roll: 4, weaponMode: 'ice' }).damage).toBe(0)
  })

  it('liest den gespeicherten Modus und die Zustandskette nass plus Blitz', () => {
    const hit = resolvePlayerHit({
      weapon,
      weaponName: 'Prismenstab',
      enemy: enemy(),
      roll: 4,
      weaponMode: 'lightning',
      enemyEffects: [{ id: 'nass', remainingEnemyTurns: 3 }],
      statusEffects: KANTARA_STATUS_EFFECTS
    })
    expect(hit.parts[1]).toMatchObject({ type: 'lightning', result: 6, relationship: 'weak' })
    expect(hit.damage).toBe(8)
  })

  it('wendet Betäubung, offenen Riss und Benebelung aus der Zustandstabelle an', () => {
    const hit = resolvePlayerHit({
      weapon: { ...weapon, elemental: undefined }, weaponName: 'Klinge', enemy: enemy({ defense: 4 }), roll: 4,
      enemyEffects: [{ id: 'betaeubt', remainingEnemyTurns: 1 }, { id: 'offener_riss', remainingEnemyTurns: 1 }],
      playerEffects: [{ id: 'benebelt', remainingEnemyTurns: 3 }], statusEffects: KANTARA_STATUS_EFFECTS
    })
    expect(hit.damage).toBe(5)
    expect(hit.text).toContain('+ 2 durch Zustand − 1 durch Zustand = 5 Schaden')
  })

  it('stapelt denselben Schutz nicht und lässt Immunität vorgehen', () => {
    const move = enemy().movesByPhase[1][0]
    const protectedHit = resolveEnemyHit({
      enemyName: 'Glutwalze', move, defending: true,
      armor: { name: 'Wams', definition: { slot: 'body', defense: 1, protectsFrom: ['fire'] } },
      talisman: { name: 'Scherbe', definition: { slot: 'talisman', defense: 0, protectsFrom: ['fire'] } }
    })
    expect(protectedHit.damage).toBe(1)
    expect(protectedHit.text).toContain('8 Feuer → Verteidigung 4 → Wams halbiert auf 2 → − 1 Panzerung = 1 Schaden')

    const immuneHit = resolveEnemyHit({
      enemyName: 'Glutwalze', move, defending: false,
      armor: { name: 'Ofenmantel', definition: { slot: 'body', defense: 1, immuneTo: ['fire'] } }
    })
    expect(immuneHit.damage).toBe(0)
    expect(immuneHit.text).toContain('Ofenmantel hält Feuer vollständig ab')
  })
})
