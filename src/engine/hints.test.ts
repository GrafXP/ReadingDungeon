import { describe, expect, it } from 'vitest'
import { campaignWorld as world } from '../content/world/campaignWorld'
import { createNewGame } from '../domain/game'
import { createSaveExport, parseSaveImport } from '../storage/validation'
import { getHintLevel } from './hints'
import { reduceGame } from './reducer'
import { getKnownAreaIds, getQuestViews } from './selectors'

describe('Freiwillige Hinweise', () => {
  it('enthüllt erst auf Stufe drei genau den genannten Ort und behält unbesuchte Nachbarn verborgen', () => {
    let save = createNewGame('Mira')
    expect(getKnownAreaIds(save, world)).not.toContain('kristallmine')
    expect(reduceGame(save, { type: 'SHOW_HINT', questId: 'windlied', level: 3 }, world)).toBe(save)
    for (const level of [1, 2]) save = reduceGame(save, { type: 'SHOW_HINT', questId: 'windlied', level }, world)
    expect(getKnownAreaIds(save, world)).not.toContain('kristallmine')
    save = reduceGame(save, { type: 'SHOW_HINT', questId: 'windlied', level: 3 }, world)
    expect(getKnownAreaIds(save, world)).toContain('kristallmine')
    expect(getKnownAreaIds(save, world)).not.toContain('lorenwerk')
    expect(save.visitedAreaIds).toEqual(['sonnenwacht'])
    const loaded = parseSaveImport(createSaveExport(save))
    expect(getHintLevel(loaded, getQuestViews(loaded).find((quest) => quest.id === 'windlied')!)).toBe(3)
    expect(reduceGame(loaded, { type: 'SHOW_HINT', questId: 'windlied', level: 3 }, world)).toBe(loaded)
  })

  it('beginnt für den nächsten gesuchten Gegenstand mit einem neuen freiwilligen Hinweis', () => {
    let save = createNewGame('Mira')
    for (const level of [1, 2, 3]) save = reduceGame(save, { type: 'SHOW_HINT', questId: 'windlied', level }, world)
    save.player.inventory.silberpfeife = 1
    const nextQuest = getQuestViews(save).find((quest) => quest.id === 'windlied')!
    expect(nextQuest.hintAreaIds).toEqual(['spinnenhain'])
    expect(getHintLevel(save, nextQuest)).toBe(0)
    expect(getKnownAreaIds(save, world)).not.toContain('spinnenhain')
  })

  it('lässt während eines Kampfes Gegner, Lebenspunkte und Zufallszustand unverändert', () => {
    let save = createNewGame('Mira')
    save.currentAreaId = 'bergfuss'
    save.visitedAreaIds.push('bergfuss')
    save = reduceGame(save, { type: 'START_COMBAT', encounterId: 'begegnung_kupferkaefer' }, world)
    const hinted = reduceGame(save, { type: 'SHOW_HINT', questId: 'windlied', level: 1 }, world)
    expect(hinted.activeCombat).toEqual(save.activeCombat)
    expect(hinted.player).toEqual(save.player)
    expect(hinted.rngState).toBe(save.rngState)
    expect(() => createSaveExport(hinted)).not.toThrow()
  })

  it('weist unbekannte, erledigte und ungültige Hinweisanfragen zurück', () => {
    const save = createNewGame('Mira')
    for (const level of [0, -1, 1.5, NaN, 4]) expect(reduceGame(save, { type: 'SHOW_HINT', questId: 'windlied', level }, world)).toBe(save)
    expect(reduceGame(save, { type: 'SHOW_HINT', questId: 'unbekannt', level: 1 }, world)).toBe(save)
    save.flags.push('windlied_erhalten')
    expect(reduceGame(save, { type: 'SHOW_HINT', questId: 'windlied', level: 1 }, world)).toBe(save)
  })
})
