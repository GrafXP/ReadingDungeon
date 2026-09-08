import { describe, expect, it } from 'vitest'
import { phase2World } from '../content/world'
import { createNewGame, type GameSave } from '../domain/game'
import type { GameAction } from './actions'
import { getAvailableActions } from './actions'
import { reduceGame } from './reducer'
import { getKnownAreaIds, getQuestViews } from './selectors'

function play(save: GameSave, ...actions: GameAction[]): GameSave {
  return actions.reduce((current, action) => reduceGame(current, action, phase2World), save)
}

describe('Erkundungs-Reducer', () => {
  it('reist in beide Richtungen und entdeckt angrenzende Orte', () => {
    const start = createNewGame('Mira')
    const market = reduceGame(start, { type: 'MOVE', passageId: 'p02', toAreaId: 'alter_markt' }, phase2World)

    expect(market.currentAreaId).toBe('alter_markt')
    expect(market.previousAreaId).toBe('sonnenwacht')
    expect(market.visitedAreaIds).toContain('alter_markt')
    expect(getKnownAreaIds(market, phase2World)).not.toEqual(expect.arrayContaining(['garten_der_namen', 'bogenbruecke']))

    const inspectedMarket = reduceGame(market, { type: 'INSPECT', areaId: 'alter_markt' }, phase2World)
    expect(getKnownAreaIds(inspectedMarket, phase2World)).toEqual(expect.arrayContaining(['garten_der_namen', 'bogenbruecke']))

    const home = reduceGame(inspectedMarket, { type: 'MOVE', passageId: 'p02', toAreaId: 'sonnenwacht' }, phase2World)
    expect(home.currentAreaId).toBe('sonnenwacht')
  })

  it('zeigt beim ersten Besuch nur Untersuchen und gibt danach alle Ortsaktionen frei', () => {
    const start = createNewGame('Mira')

    expect(getAvailableActions(start, phase2World)).toEqual([
      expect.objectContaining({ id: 'inspect:sonnenwacht', kind: 'inspect', disabled: false })
    ])

    const inspected = reduceGame(start, { type: 'INSPECT', areaId: 'sonnenwacht' }, phase2World)
    const openActions = getAvailableActions(inspected, phase2World)
    expect(openActions.some((action) => action.kind === 'move')).toBe(true)
    expect(openActions.some((action) => action.id === 'rest:sonnenwacht')).toBe(true)

    const market = reduceGame(inspected, { type: 'MOVE', passageId: 'p02', toAreaId: 'alter_markt' }, phase2World)
    expect(getAvailableActions(market, phase2World).map((action) => action.id)).toEqual(['inspect:alter_markt'])

    const inspectedMarket = reduceGame(market, { type: 'INSPECT', areaId: 'alter_markt' }, phase2World)
    const returned = reduceGame(inspectedMarket, { type: 'MOVE', passageId: 'p02', toAreaId: 'sonnenwacht' }, phase2World)
    expect(getAvailableActions(returned, phase2World).some((action) => action.kind === 'move')).toBe(true)
  })

  it('ändert bei einer gesperrten oder ungültigen Aktion weder Zustand noch Runde', () => {
    const atLibrary = play(
      createNewGame('Noah'),
      { type: 'MOVE', passageId: 'p01', toAreaId: 'drei_wege_platz' },
      { type: 'MOVE', passageId: 'p10', toAreaId: 'kuestenpfad' },
      { type: 'MOVE', passageId: 'p24', toAreaId: 'muschelhafen' },
      { type: 'MOVE', passageId: 'p26', toAreaId: 'versunkene_bibliothek' }
    )

    const blocked = reduceGame(atLibrary, { type: 'COMPLETE_INTERACTION', interactionId: 'archiv_oeffnen' }, phase2World)
    const impossibleMove = reduceGame(atLibrary, { type: 'MOVE', passageId: 'p02', toAreaId: 'alter_markt' }, phase2World)

    expect(blocked).toBe(atLibrary)
    expect(impossibleMove).toBe(atLibrary)
    expect(blocked.turn).toBe(atLibrary.turn)
  })

  it('zeigt blockierte Aktionen samt konkretem Grund', () => {
    const atGarden = play(
      createNewGame('Lina'),
      { type: 'MOVE', passageId: 'p02', toAreaId: 'alter_markt' },
      { type: 'MOVE', passageId: 'p04', toAreaId: 'garten_der_namen' },
      { type: 'INSPECT', areaId: 'garten_der_namen' }
    )
    const action = getAvailableActions(atGarden, phase2World).find((entry) => entry.id === 'interaction:symbolsteine_ordnen')

    expect(action?.disabled).toBe(true)
    expect(action?.blockedReason).toContain('Löse zuerst das Rätsel')
  })

  it('spielt Schlüssel-, Werkzeug-, Truhen- und Abkürzungskette bis zum Ziel', () => {
    const finished = play(
      createNewGame('Ari'),
      { type: 'MOVE', passageId: 'p02', toAreaId: 'alter_markt' },
      { type: 'TAKE_ITEM', interactionId: 'hebelstange_fund' },
      { type: 'OPEN_CHEST', interactionId: 'truhe_markt_interaktion' },
      { type: 'MOVE', passageId: 'p04', toAreaId: 'garten_der_namen' },
      { type: 'INSPECT', areaId: 'garten_der_namen' },
      { type: 'PUZZLE_INPUT', puzzleId: 'symbolsteine', controlId: 'sequence', value: 2 },
      { type: 'PUZZLE_INPUT', puzzleId: 'symbolsteine', controlId: 'sequence', value: 3 },
      { type: 'PUZZLE_INPUT', puzzleId: 'symbolsteine', controlId: 'sequence', value: 0 },
      { type: 'PUZZLE_INPUT', puzzleId: 'symbolsteine', controlId: 'sequence', value: 1 },
      { type: 'COMPLETE_INTERACTION', interactionId: 'symbolsteine_ordnen' },
      { type: 'MOVE', passageId: 'p04', toAreaId: 'alter_markt' },
      { type: 'MOVE', passageId: 'p02', toAreaId: 'sonnenwacht' },
      { type: 'MOVE', passageId: 'p01', toAreaId: 'drei_wege_platz' },
      { type: 'MOVE', passageId: 'p10', toAreaId: 'kuestenpfad' },
      { type: 'MOVE', passageId: 'p24', toAreaId: 'muschelhafen' },
      { type: 'MOVE', passageId: 'p25', toAreaId: 'ueberfluteter_markt' },
      { type: 'COMPLETE_INTERACTION', interactionId: 'marktstand_anheben' },
      { type: 'MOVE', passageId: 'p28', toAreaId: 'versunkene_bibliothek' },
      { type: 'COMPLETE_INTERACTION', interactionId: 'archiv_oeffnen' },
      { type: 'MOVE', passageId: 'p28', toAreaId: 'ueberfluteter_markt' },
      { type: 'MOVE', passageId: 'p25', toAreaId: 'muschelhafen' },
      { type: 'OPEN_CHEST', interactionId: 'truhe_hafenspeer_interaktion' },
      { type: 'MOVE', passageId: 'p26', toAreaId: 'versunkene_bibliothek' },
      { type: 'MOVE', passageId: 'p32', toAreaId: 'gezeitentempel' },
      { type: 'COMPLETE_INTERACTION', interactionId: 'phase2_abschluss' }
    )

    expect(finished.currentAreaId).toBe('gezeitentempel')
    expect(finished.openedChestIds).toEqual(expect.arrayContaining(['truhe_markt', 'truhe_hafenspeer']))
    expect(finished.player.inventory).toMatchObject({
      hebelstange: 1,
      archivschluessel: 1,
      waldsalbe: 1,
      hafenspeer: 1,
      schleusenrad: 1,
      sonnenspiegel: 1
    })
    expect(finished.flags).toEqual(expect.arrayContaining(['schleusenrad_geborgen', 'archiv_geoeffnet']))
    expect(getQuestViews(finished)[0].current).toBe(true)
    expect(getQuestViews(finished)[0].title).toContain('Sonnenfunken')
  })

  it('macht einmalige Funde nicht mehrfach verfügbar', () => {
    const atMarket = play(
      createNewGame('Sam'),
      { type: 'MOVE', passageId: 'p02', toAreaId: 'alter_markt' },
      { type: 'OPEN_CHEST', interactionId: 'truhe_markt_interaktion' }
    )
    const repeated = reduceGame(atMarket, { type: 'OPEN_CHEST', interactionId: 'truhe_markt_interaktion' }, phase2World)

    expect(repeated).toBe(atMarket)
    expect(repeated.player.inventory.waldsalbe).toBe(1)
  })

  it('heilt atomar, verbraucht genau ein Mittel und heilt nie über das Maximum', () => {
    const injured = createNewGame('Jo')
    injured.player.life = 17

    const healed = reduceGame(injured, { type: 'USE_ITEM', itemId: 'apfelbrot' }, phase2World)

    expect(healed.player.life).toBe(20)
    expect(healed.player.inventory.apfelbrot).toBe(2)
    expect(healed.recentEvents.at(-1)?.text).toContain('3 Lebenspunkte')

    const atFullLife = reduceGame(healed, { type: 'USE_ITEM', itemId: 'apfelbrot' }, phase2World)
    expect(atFullLife).toBe(healed)
    expect(atFullLife.player.inventory.apfelbrot).toBe(2)

    const withSalve: GameSave = {
      ...injured,
      player: { ...injured.player, life: 10, inventory: { ...injured.player.inventory, waldsalbe: 1 } }
    }
    const salveUsed = reduceGame(withSalve, { type: 'USE_ITEM', itemId: 'waldsalbe' }, phase2World)
    expect(salveUsed.player.life).toBe(18)
    expect(salveUsed.player.inventory).not.toHaveProperty('waldsalbe')
  })

  it('kann nur eine tatsächlich gefundene Waffe ausserhalb eines Kampfes ausrüsten', () => {
    const start = createNewGame('Lou')
    expect(reduceGame(start, { type: 'EQUIP_WEAPON', itemId: 'hafenspeer' }, phase2World)).toBe(start)

    const withSpear: GameSave = {
      ...start,
      player: { ...start.player, inventory: { ...start.player.inventory, hafenspeer: 1 } }
    }
    const equipped = reduceGame(withSpear, { type: 'EQUIP_WEAPON', itemId: 'hafenspeer' }, phase2World)

    expect(equipped.player.equippedWeaponId).toBe('hafenspeer')
    expect(equipped.player.inventory.hafenspeer).toBe(1)
    expect(reduceGame(equipped, { type: 'EQUIP_WEAPON', itemId: 'hafenspeer' }, phase2World)).toBe(equipped)

    const inCombat: GameSave = {
      ...withSpear,
      activeCombat: {
        encounterId: 'test', enemyLife: 4, enemyMaxLife: 4, phase: 1, announcedMoveId: 'angriff',
        round: 1, enemyStance: 'normal', entryMode: 'normal', canFlee: true,
        pendingSealItemId: null, placedSealItemIds: [], awaitingFinalPromise: false, effects: []
      }
    }
    expect(reduceGame(inCombat, { type: 'EQUIP_WEAPON', itemId: 'hafenspeer' }, phase2World)).toBe(inCombat)
  })

  it('vergibt auch den Inhalt der Hafentruhe nur einmal', () => {
    const atHarbor: GameSave = {
      ...createNewGame('Feli'),
      currentAreaId: 'muschelhafen',
      visitedAreaIds: ['sonnenwacht', 'muschelhafen'],
      flags: ['schleusenrad_geborgen']
    }
    const opened = reduceGame(atHarbor, { type: 'OPEN_CHEST', interactionId: 'truhe_hafenspeer_interaktion' }, phase2World)
    const repeated = reduceGame(opened, { type: 'OPEN_CHEST', interactionId: 'truhe_hafenspeer_interaktion' }, phase2World)

    expect(opened.player.inventory.hafenspeer).toBe(1)
    expect(opened.openedChestIds).toContain('truhe_hafenspeer')
    expect(repeated).toBe(opened)
  })

  it('erweckt die Morgenklinge über drei Gaben und verbraucht jede Gabe genau einmal', () => {
    const initial = createNewGame('Tali')
    const atTemple: GameSave = {
      ...initial,
      currentAreaId: 'morgen_tempel',
      visitedAreaIds: ['sonnenwacht', 'morgen_tempel'],
      player: {
        ...initial.player,
        inventory: {
          ...initial.player.inventory,
          sonnenspiegel: 1,
          schleusenrad: 1,
          sonnenfunke: 1,
          quelltraene: 1,
          windlied: 1
        }
      }
    }
    const awakened = play(
      atTemple,
      { type: 'COMPLETE_INTERACTION', interactionId: 'morgenklinge_ziehen' }
    )

    expect(awakened.player.inventory).toMatchObject({ sonnenspiegel: 1, schleusenrad: 1, morgenklinge: 1 })
    expect(awakened.player.inventory).not.toHaveProperty('sonnenfunke')
    expect(awakened.player.inventory).not.toHaveProperty('quelltraene')
    expect(awakened.player.inventory).not.toHaveProperty('windlied')
    expect(awakened.flags).toContain('morgenklinge_erweckt')
    expect(reduceGame(awakened, { type: 'COMPLETE_INTERACTION', interactionId: 'morgenklinge_ziehen' }, phase2World)).toBe(awakened)
  })
})
