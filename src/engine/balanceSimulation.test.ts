import { describe, expect, it } from 'vitest'
import { phase2World } from '../content/world'
import { simulateCampaignBalance } from './balanceSimulation'

describe('Kampagnenbalance', () => {
  it('prüft jeden Gegner über 1000 verteilte Zufallszustände mit erneuerbarem Grundproviant', () => {
    for (let index = 1; index <= 1000; index++) {
      const seed = (index * 1_000_003) % 2_147_483_647 || 1
      const losses = simulateCampaignBalance(phase2World, seed).filter((result) => !result.won)
      expect(losses, `Startwert ${seed}`).toEqual([])
    }
  })
  it.each([1, 42, 999_983])('bleibt mit der erklärten Grundstrategie für Startwert %s gewinnbar', (seed) => {
    const results = simulateCampaignBalance(phase2World, seed)

    expect(results).toHaveLength(14)
    expect(results.filter((entry) => !entry.won)).toEqual([])
    expect(Math.max(...results.map((entry) => entry.turns))).toBeLessThan(80)
  })
})
