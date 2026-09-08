import { describe, expect, it } from 'vitest'
import { campaignWorld } from '../content/world/campaignWorld'
import { createNewGame } from '../domain/game'
import { getMapAreaProgress } from './mapProgress'

describe('map progress', () => {
  it('distinguishes unexplored, unfinished and clear locations', () => {
    const save = createNewGame('Mira')

    expect(getMapAreaProgress(save, campaignWorld, 'alter_markt').state).toBe('new')
    expect(getMapAreaProgress(save, campaignWorld, 'sonnenwacht')).toMatchObject({
      state: 'open',
      unfinishedCount: 1,
      open: [{ label: 'Ort untersuchen' }]
    })

    save.flags.push('area_untersucht:sonnenwacht')
    expect(getMapAreaProgress(save, campaignWorld, 'sonnenwacht')).toMatchObject({
      state: 'clear',
      unfinishedCount: 0
    })
  })

  it('keeps the reason for a visited location that is waiting on an item', () => {
    const save = createNewGame('Mira')
    save.visitedAreaIds.push('tor_der_sechs_zeichen')
    save.flags.push('area_untersucht:tor_der_sechs_zeichen')

    const progress = getMapAreaProgress(save, campaignWorld, 'tor_der_sechs_zeichen')
    expect(progress.state).toBe('blocked')
    expect(progress.blocked).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Zeige Klinge und Siegel', detail: expect.stringContaining('Wächtersiegel') })
    ]))
  })
})
