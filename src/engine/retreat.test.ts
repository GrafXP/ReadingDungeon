import { describe, expect, it } from 'vitest'
import { campaignWorld as world } from '../content/world/campaignWorld'
import { createNewGame } from '../domain/game'
import { createSaveExport, parseSaveImport } from '../storage/validation'
import { getAvailableActions } from './actions'
import { reduceGame } from './reducer'

describe('Rückzug und Kampfvorbereitung', () => {
  it('kehrt auch nach Neuladen über den tatsächlich betretenen Weg zurück', () => {
    let save = createNewGame('Mira', world)
    save.currentAreaId = 'korallengrotte'
    save.visitedAreaIds.push('korallengrotte')
    save = reduceGame(save, { type: 'MOVE', passageId: 'p31', toAreaId: 'gezeitentempel' }, world)
    save = reduceGame(save, { type: 'START_COMBAT', encounterId: 'begegnung_wasserwaechter' }, world)
    save = parseSaveImport(createSaveExport(save, world), world)
    const escaped = reduceGame(save, { type: 'FLEE' }, world)
    expect(escaped.currentAreaId).toBe('korallengrotte')
    expect(escaped.visitedAreaIds).not.toContain('versunkene_bibliothek')
    expect(escaped.player.life).toBe(save.player.life)
    expect(escaped.rngState).toBe(save.rngState)
    expect(escaped.deliveredDialogueIds).toContain('area_intro:gezeitentempel')
    expect(() => createSaveExport(escaped, world)).not.toThrow()
  })

  it('verwendet bei einer alten, nicht angrenzenden Rückkehrangabe den definierten Ausgang', () => {
    let save = createNewGame('Mira', world)
    save.currentAreaId = 'perlenbecken'
    save.previousAreaId = 'sonnenwacht'
    save.visitedAreaIds.push('perlenbecken')
    save.player.inventory.morgenklinge = 1
    save.player.equippedWeaponId = 'morgenklinge'
    save = reduceGame(save, { type: 'START_COMBAT', encounterId: 'boss_marea' }, world)
    expect(reduceGame(save, { type: 'FLEE' }, world).currentAreaId).toBe('gezeitentempel')
  })

  it('beginnt ohne ausgerüstete Waffe keinen unspeicherbaren Kampf', () => {
    const save = createNewGame('Mira', world)
    save.currentAreaId = 'bergfuss'
    save.visitedAreaIds.push('bergfuss')
    save.flags.push('area_untersucht:bergfuss')
    save.player.equippedWeaponId = null
    expect(getAvailableActions(save, world).find((action) => action.id === 'combat:begegnung_kupferkaefer')).toMatchObject({ disabled: true })
    expect(reduceGame(save, { type: 'START_COMBAT', encounterId: 'begegnung_kupferkaefer' }, world)).toBe(save)
  })

  it('weist einen manipulierten Boss-Rückweg beim Import zurück', () => {
    let save = createNewGame('Mira', world)
    save.currentAreaId = 'dornenkrone'
    save.visitedAreaIds.push('dornenkrone')
    save.player.inventory.morgenklinge = 1
    save.player.equippedWeaponId = 'morgenklinge'
    save = reduceGame(save, { type: 'START_COMBAT', encounterId: 'boss_arbor' }, world)
    save = reduceGame(save, { type: 'ATTACK' }, world)
    expect(save.activeCombat!.canFlee).toBe(false)
    expect(() => createSaveExport(save, world)).not.toThrow()
    save.activeCombat!.canFlee = true
    expect(() => parseSaveImport(JSON.stringify(save), world)).toThrow()
  })
})
