import { describe, expect, it } from 'vitest'
import { createNewGame } from '../domain/game'
import { getReminderGroups } from './reminders'

function findStep(save: ReturnType<typeof createNewGame>, id: string) {
  return getReminderGroups(save).flatMap((group) => group.steps).find((step) => step.id === id)
}

describe('reminders', () => {
  it('starts with the temple and reveals the three ingredient lists after visiting it', () => {
    const save = createNewGame('Mira')
    expect(findStep(save, 'morgen_tempel')).toMatchObject({ status: 'missing', areaId: 'morgen_tempel' })

    save.visitedAreaIds.push('morgen_tempel')
    expect(getReminderGroups(save).map((group) => group.id)).toEqual(['sonnenfunke', 'quelltraene', 'windlied', 'morgenklinge'])
    expect(findStep(save, 'mondmoos')).toMatchObject({
      label: 'Mondmoos',
      status: 'missing',
      areaId: 'alte_baumschule'
    })
  })

  it('keeps a consumed ingredient marked as complete', () => {
    const save = createNewGame('Mira')
    save.visitedAreaIds.push('morgen_tempel')
    save.player.inventory.mondmoos = 1
    expect(findStep(save, 'mondmoos')?.status).toBe('ready')

    delete save.player.inventory.mondmoos
    save.flags.push('schleuse_repariert')
    expect(findStep(save, 'mondmoos')?.status).toBe('done')
  })

  it('switches from ingredients to guardian seals after the Morgenklinge awakens', () => {
    const save = createNewGame('Mira')
    save.flags.push('morgenklinge_erweckt')
    save.player.inventory.morgenklinge = 1

    expect(getReminderGroups(save)).toEqual([
      expect.objectContaining({
        id: 'waechter',
        steps: expect.arrayContaining([expect.objectContaining({ id: 'arbor', status: 'missing' })])
      })
    ])
  })

  it('keeps the return to the temple visible after all three gifts are collected', () => {
    const save = createNewGame('Mira')
    save.visitedAreaIds.push('morgen_tempel')
    for (const itemId of ['sonnenfunke', 'quelltraene', 'windlied']) save.player.inventory[itemId] = 1
    save.flags.push('sonnenfunke_erhalten', 'quelltraene_erhalten', 'windlied_erhalten')

    expect(getReminderGroups(save)).toEqual([
      expect.objectContaining({
        id: 'morgenklinge',
        steps: expect.arrayContaining([expect.objectContaining({ id: 'morgenklinge_erwecken', status: 'ready', areaId: 'morgen_tempel' })])
      })
    ])
  })
})
