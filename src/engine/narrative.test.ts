import { describe, expect, it } from 'vitest'
import { campaignWorld as world } from '../content/world/campaignWorld'
import { createNewGame } from '../domain/game'
import { createSaveExport, parseSaveImport } from '../storage/validation'
import { getAvailableActions } from './actions'
import { reduceGame } from './reducer'
import { getAreaDescription, getAreaInspectText, getMainGoal, getQuestViews } from './selectors'

describe('Erzählung und Aufgaben folgen dem tatsächlichen Fortschritt', () => {
  it.each([
    ['knorzwolf_heilbeet', 'alte_baumschule', 'knorzwolf_beruhigt', 'waldsalbe', 1],
    ['pfuetzenhopser_seitenstand', 'ueberfluteter_markt', 'pfuetzenhopser_besiegt', 'apfelbrot', 2],
    ['tintenqualle_quellfach', 'korallengrotte', 'tintenqualle_besiegt', 'quellwasser', 1],
    ['gewittergeist_balkon', 'himmelswerft', 'gewittergeist_geloest', 'kuehlende_limonade', 1]
  ] as const)('macht den bewachten optionalen Fund %s einmalig zugänglich', (interactionId, areaId, flag, itemId, quantity) => {
    const save = createNewGame('Mira')
    save.currentAreaId = areaId
    save.visitedAreaIds.push(areaId)
    const action = { type: 'TAKE_ITEM', interactionId } as const
    expect(reduceGame(save, action, world)).toBe(save)
    save.flags.push(flag)
    const claimed = reduceGame(save, action, world)
    expect(claimed.player.inventory[itemId]).toBe((save.player.inventory[itemId] ?? 0) + quantity)
    expect(reduceGame(claimed, action, world)).toBe(claimed)
    expect(() => createSaveExport(claimed)).not.toThrow()
  })

  it('verspricht bei einem blossen Wiederbesuch keine erledigten Reparaturen oder Funde', () => {
    const save = createNewGame('Mira')
    save.deliveredDialogueIds = ['area_intro:mooslichtung', 'area_intro:gluehgarten', 'area_intro:foersterhaus', 'area_intro:spinnenhain']
    const description = (id: string) => getAreaDescription(save, world.areas.find((area) => area.id === id)!)
    expect(description('mooslichtung')).toContain('warten noch reife Goldbeeren')
    expect(description('gluehgarten')).toContain('Schattenmotten kreisen weiter')
    expect(description('foersterhaus')).toContain('braucht noch Hilfe')
    expect(description('spinnenhain')).toContain('hält das Kletterseil')
  })

  it('ändert Ort und Untersuchung sofort nach der Reparatur, auch vor einem ersten Besuch', () => {
    const save = createNewGame('Mira')
    const grotto = world.areas.find((area) => area.id === 'korallengrotte')!
    expect(getAreaDescription(save, grotto)).toContain('trübe Quelle')
    save.flags.push('schleuse_repariert')
    expect(getAreaDescription(save, grotto)).toContain('Sauberes Wasser')
    expect(getAreaInspectText(save, grotto)).toContain('Namen sichtbar')
    save.flags.push('quelltraene_erhalten')
    expect(getAreaDescription(save, grotto)).toContain('Menschen aus dem Hafen erzählen')
  })

  it('lässt Tempel und Tor nach dem Finale nicht wieder geschlossen oder bewaffnet erscheinen', () => {
    const save = createNewGame('Mira')
    save.flags.push('morgenklinge_erweckt', 'endtor_offen', 'raugrim_verbannt')
    expect(getAreaDescription(save, world.areas.find((area) => area.id === 'morgen_tempel')!)).toContain('sind leer')
    expect(getAreaInspectText(save, world.areas.find((area) => area.id === 'tor_der_sechs_zeichen')!)).toContain('bleibt offen')
    expect(getAreaInspectText(save, world.areas.find((area) => area.id === 'weltenkammer')!)).toContain('Notiz ist erreichbar')
  })

  it('holt fehlende Erinnerungen in Reihenfolge nach und speichert sie ohne Wiederholung', () => {
    let save = createNewGame('Mira')
    save.flags.push('sonnenfunke_erhalten', 'quelltraene_erhalten', 'windlied_erhalten')
    save = reduceGame(save, { type: 'INSPECT', areaId: 'sonnenwacht' }, world)
    expect(save.deliveredDialogueIds).toEqual(['erinnerung_alva', 'erinnerung_waechter', 'erinnerung_kuno'])
    const text = save.recentEvents.at(-1)!.text
    expect(text.indexOf('Alva!')).toBeLessThan(text.indexOf('Die Wächter halfen'))
    expect(text.indexOf('Die Wächter halfen')).toBeLessThan(text.indexOf('Ich war ihr Begleiter'))
    save = parseSaveImport(createSaveExport(save))
    save = reduceGame(save, { type: 'INSPECT', areaId: 'sonnenwacht' }, world)
    expect(save.recentEvents.at(-1)!.text).not.toContain('Ich war ihr Begleiter')
    expect(save.journal.filter((event) => event.text.includes('Ich war ihr Begleiter'))).toHaveLength(1)
  })

  it('weist nach dem dritten Wächter zum Tor und behält offene Nachspielaufgaben', () => {
    const save = createNewGame('Mira')
    expect(getMainGoal(save).title).toBe('Suche den Tempel der Morgenklinge')
    save.player.inventory.morgenklinge = 1
    save.flags.push('arbor_befreit', 'marea_befreit', 'voltaro_befreit')
    expect(getMainGoal(save).title).toBe('Öffne das Tor der sechs Zeichen')
    save.flags.push('raugrim_verbannt')
    save.discoveredClueIds = ['karte_mut', 'karte_arbor', 'karte_marea', 'karte_voltaro', 'karte_kompass', 'karte_rueckgabe']
    const quests = getQuestViews(save)
    expect(quests.find((quest) => quest.id === 'karte_zusammensetzen')).toMatchObject({ current: true, done: false })
    expect(quests.filter((quest) => ['vogelhaus', 'spielzeugboot', 'windrad'].includes(quest.id))).toHaveLength(3)
    expect(quests.find((quest) => quest.id === 'kinder')?.done).toBe(false)
  })

  it('verrät zu Beginn keine Schlussaktionen und nennt fehlende Zwischenschritte', () => {
    const save = createNewGame('Mira')
    expect(getAvailableActions(save, world).some((action) => action.id === 'interaction:tessa_vollstaendige_karte')).toBe(false)
    save.player.inventory.sonnenspiegel = 1
    expect(getQuestViews(save).find((quest) => quest.id === 'sonnenfunke')?.hint).toContain('Mooslichtung')
    save.player.inventory.goldbeeren = 1
    expect(getQuestViews(save).find((quest) => quest.id === 'sonnenfunke')?.hint).toContain('Schattenmotten')
    save.flags.push('schattenmotten_besiegt')
    expect(getQuestViews(save).find((quest) => quest.id === 'sonnenfunke')?.hint).toContain('Presse im Glühgarten')
    save.player.inventory.silberpfeife = 1
    save.player.inventory.kletterseil = 1
    expect(getQuestViews(save).find((quest) => quest.id === 'windlied')?.hint).toContain('dein Kletterseil')
  })
})
