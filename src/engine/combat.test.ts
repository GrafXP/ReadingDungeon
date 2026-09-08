import { describe, expect, it } from 'vitest'
import { phase2World } from '../content/world'
import { createNewGame, type GameSave } from '../domain/game'
import { getAvailableActions } from './actions'
import { reduceGame } from './reducer'
import { getCombatView } from './combat'
import { migrateAndValidateGameSave } from '../storage/validation'

function begin(encounterId: string, weaponId = 'reiseschwert'): GameSave {
  const encounter = phase2World.encounters.find((entry) => entry.id === encounterId)!
  const start = createNewGame('Mira')
  const placed: GameSave = {
    ...start,
    currentAreaId: encounter.areaId,
    visitedAreaIds: [...new Set([...start.visitedAreaIds, encounter.areaId])],
    rngState: 1,
    player: {
      ...start.player,
      equippedWeaponId: weaponId,
      inventory: { ...start.player.inventory, [weaponId]: 1 }
    }
  }
  return reduceGame(placed, { type: 'START_COMBAT', encounterId }, phase2World)
}

describe('Kampfsystem', () => {
  it('speichert eine Niederlage genau beim Phasenwechsel und lässt Rettung zu', () => {
    const fighting = begin('boss_marea', 'morgenklinge')
    const endangered = { ...fighting, player: { ...fighting.player, life: 1 }, activeCombat: { ...fighting.activeCombat!, enemyLife: 13 } }
    const lost = reduceGame(endangered, { type: 'ATTACK' }, phase2World)
    expect(lost.player.life).toBe(0)
    expect(getCombatView(lost, phase2World)).not.toBeNull()
    const loaded = migrateAndValidateGameSave(lost)
    expect(reduceGame(loaded, { type: 'RESPAWN' }, phase2World).player.life).toBe(20)
  })

  it('schützt Voltaro in der Luft und öffnet nach abgewehrtem Sturzflug ein Trefferfenster', () => {
    const flying = begin('boss_voltaro', 'morgenklinge')
    expect(reduceGame(flying, { type: 'ATTACK' }, phase2World).activeCombat?.enemyLife).toBe(24)
    const grounded = reduceGame(flying, { type: 'DEFEND' }, phase2World)
    expect(grounded.activeCombat?.enemyStance).toBe('vulnerable')
    expect(reduceGame(grounded, { type: 'ATTACK' }, phase2World).activeCombat?.enemyLife).toBeLessThan(24)
  })

  it('behält Blitzschutz neben einem neuen Trefferfenster und zählt seine Dauer genau', () => {
    const fighting = begin('boss_voltaro', 'morgenklinge')
    fighting.activeCombat!.effects = [{ id: 'blitzschutz', remainingEnemyTurns: 3 }]
    const defended = reduceGame(fighting, { type: 'DEFEND' }, phase2World)
    expect(defended.activeCombat?.effects).toEqual(expect.arrayContaining([{ id: 'blitzschutz', remainingEnemyTurns: 2 }, { id: 'offener_riss', remainingEnemyTurns: 1 }]))
    const hit = reduceGame(defended, { type: 'ATTACK' }, phase2World)
    expect(hit.activeCombat?.effects).toEqual([{ id: 'blitzschutz', remainingEnemyTurns: 1 }])
    const protectedHit = reduceGame(hit, { type: 'DEFEND' }, phase2World)
    expect(protectedHit.player.life).toBe(hit.player.life - 1)
    expect(protectedHit.activeCombat?.effects).toEqual([])
  })

  it('verwendet Quellwasser auch bei vollem Leben gegen Grauschleier', () => {
    const fighting = begin('begegnung_pfuetzenhopser')
    fighting.player.inventory.quellwasser = 1
    fighting.activeCombat!.effects = [{ id: 'grauschleier', remainingEnemyTurns: 1 }]
    const used = reduceGame(fighting, { type: 'USE_ITEM', itemId: 'quellwasser' }, phase2World)
    expect(used.player.inventory.quellwasser).toBeUndefined()
    expect(used.activeCombat?.effects).toEqual([])
    expect(used.activeCombat?.round).toBe(2)
  })
  it('startet beide normalen Begegnungen mit sichtbarem, gespeichertem Gegnerzug', () => {
    const puddle = begin('begegnung_pfuetzenhopser')
    const guard = begin('begegnung_wasserwaechter')

    expect(puddle.activeCombat).toMatchObject({ enemyLife: 8, announcedMoveId: 'spritzer', round: 1, entryMode: 'normal' })
    expect(guard.activeCombat).toMatchObject({ enemyLife: 12, announcedMoveId: 'wasserhieb', round: 1, entryMode: 'normal' })
  })

  it('würfelt nur den Schaden reproduzierbar und nutzt den Wasserbonus des Hafenspeers', () => {
    const sword = reduceGame(begin('begegnung_pfuetzenhopser'), { type: 'ATTACK' }, phase2World)
    const spear = reduceGame(begin('begegnung_pfuetzenhopser', 'hafenspeer'), { type: 'ATTACK' }, phase2World)

    expect(sword.activeCombat?.enemyLife).toBe(5)
    expect(spear.activeCombat?.enemyLife).toBe(3)
    expect(sword.player.life).toBe(18)
    expect(spear.player.life).toBe(18)

    const reloaded = JSON.parse(JSON.stringify(begin('begegnung_pfuetzenhopser'))) as GameSave
    expect(reduceGame(reloaded, { type: 'ATTACK' }, phase2World)).toEqual(
      reduceGame(JSON.parse(JSON.stringify(reloaded)), { type: 'ATTACK' }, phase2World)
    )
  })

  it('lässt ungültige Aktionen weder Runde noch Zufallszustand verändern', () => {
    const fighting = begin('begegnung_pfuetzenhopser')
    const invalid = reduceGame(fighting, { type: 'MOVE', passageId: 'p24', toAreaId: 'muschelhafen' }, phase2World)

    expect(invalid).toBe(fighting)
    expect(invalid.rngState).toBe(1)
    expect(invalid.activeCombat?.round).toBe(1)
  })

  it('kündigt den schweren Sprung an und öffnet durch Verteidigen ein Trefferfenster', () => {
    const afterAttack = reduceGame(begin('begegnung_pfuetzenhopser'), { type: 'ATTACK' }, phase2World)
    expect(afterAttack.activeCombat?.announcedMoveId).toBe('weiter_sprung')
    const lifeBefore = afterAttack.player.life

    const defended = reduceGame(afterAttack, { type: 'DEFEND' }, phase2World)
    expect(defended.player.life).toBe(lifeBefore)
    expect(defended.activeCombat).toMatchObject({ enemyStance: 'vulnerable', announcedMoveId: 'spritzer' })
    expect(defended.recentEvents.at(-1)?.text).toContain('Trefferfenster')
  })

  it('lässt einen besiegten Gegner nicht mehr handeln und vergibt den Sieg nur einmal', () => {
    const fighting = begin('begegnung_pfuetzenhopser')
    const almostWon: GameSave = { ...fighting, activeCombat: { ...fighting.activeCombat!, enemyLife: 1 } }
    const won = reduceGame(almostWon, { type: 'ATTACK' }, phase2World)

    expect(won.activeCombat).toBeNull()
    expect(won.player.life).toBe(20)
    expect(won.defeatedEncounterIds).toEqual(['begegnung_pfuetzenhopser'])
    expect(won.flags).toContain('pfuetzenhopser_besiegt')
    expect(reduceGame(won, { type: 'START_COMBAT', encounterId: 'begegnung_pfuetzenhopser' }, phase2World)).toBe(won)
  })

  it('setzt eine normale Begegnung bei der Flucht zurück', () => {
    const fled = reduceGame(begin('begegnung_pfuetzenhopser'), { type: 'FLEE' }, phase2World)

    expect(fled.currentAreaId).toBe('muschelhafen')
    expect(fled.activeCombat).toBeNull()
    expect(fled.defeatedEncounterIds).not.toContain('begegnung_pfuetzenhopser')
  })

  it('erklärt den frühen Bosskontakt und garantiert den Rückzug ohne Gegentreffer', () => {
    const early = begin('boss_marea')
    expect(early.activeCombat?.entryMode).toBe('early-boss')
    const blockedHit = reduceGame(early, { type: 'ATTACK' }, phase2World)

    expect(blockedHit.activeCombat?.enemyLife).toBe(24)
    expect(blockedHit.recentEvents.at(-1)?.text).toContain('0 Schaden')
    const lifeBeforeFleeing = blockedHit.player.life
    const fled = reduceGame(blockedHit, { type: 'FLEE' }, phase2World)
    expect(fled.currentAreaId).toBe('gezeitentempel')
    expect(fled.player.life).toBe(lifeBeforeFleeing)
    expect(fled.activeCombat).toBeNull()
  })

  it('bietet die gefundene, aber nicht ausgerüstete Morgenklinge im Vorraum direkt an', () => {
    const initial = createNewGame('Nia')
    const save: GameSave = {
      ...initial,
      currentAreaId: 'gezeitentempel',
      visitedAreaIds: ['sonnenwacht', 'gezeitentempel'],
      flags: ['area_untersucht:gezeitentempel'],
      player: {
        ...initial.player,
        inventory: { reiseschwert: 1, morgenklinge: 1 }
      }
    }

    const action = getAvailableActions(save, phase2World).find((entry) => entry.id === 'equip:morgenklinge')
    expect(action?.label).toBe('Rüste die Morgenklinge aus')
    expect(action?.gameAction).toEqual({ type: 'EQUIP_WEAPON', itemId: 'morgenklinge' })
  })

  it('schliesst beim vorbereiteten Boss nach dem ersten wirksamen Treffer den Rückweg', () => {
    const prepared = begin('boss_marea', 'morgenklinge')
    expect(prepared.activeCombat?.entryMode).toBe('prepared-boss')
    const hit = reduceGame(prepared, { type: 'ATTACK' }, phase2World)

    expect(hit.activeCombat?.enemyLife).toBeLessThan(24)
    expect(hit.activeCombat?.canFlee).toBe(false)
    expect(reduceGame(hit, { type: 'FLEE' }, phase2World)).toBe(hit)
  })

  it('wechselt Marea an der Lebensgrenze in Phase zwei', () => {
    const prepared = begin('boss_marea', 'morgenklinge')
    const nearThreshold: GameSave = { ...prepared, activeCombat: { ...prepared.activeCombat!, enemyLife: 13 } }
    const phaseTwo = reduceGame(nearThreshold, { type: 'ATTACK' }, phase2World)

    expect(phaseTwo.activeCombat?.phase).toBe(2)
    expect(phaseTwo.activeCombat?.announcedMoveId).toBe('kleine_wellen')
  })

  it('verbraucht im Kampf genau ein Heilmittel und lässt den Gegner einmal handeln', () => {
    const fighting = begin('begegnung_pfuetzenhopser')
    const injured: GameSave = { ...fighting, player: { ...fighting.player, life: 10 } }
    const used = reduceGame(injured, { type: 'USE_ITEM', itemId: 'apfelbrot' }, phase2World)

    expect(used.player.life).toBe(13)
    expect(used.player.inventory.apfelbrot).toBe(2)
    expect(used.activeCombat?.round).toBe(2)
  })

  it('rettet ohne Fundverlust, heilt vollständig und ergänzt nur den Grundproviant', () => {
    const fighting = begin('begegnung_pfuetzenhopser')
    const endangered: GameSave = {
      ...fighting,
      openedChestIds: ['truhe_markt'],
      flags: ['wichtiger_fund'],
      player: {
        ...fighting.player,
        life: 1,
        inventory: { ...fighting.player.inventory, apfelbrot: 1, waldsalbe: 1 }
      }
    }
    const defeated = reduceGame(endangered, { type: 'ATTACK' }, phase2World)
    expect(defeated.player.life).toBe(0)

    const rescued = reduceGame(defeated, { type: 'RESPAWN' }, phase2World)
    expect(rescued.currentAreaId).toBe('sonnenwacht')
    expect(rescued.player.life).toBe(20)
    expect(rescued.player.inventory).toMatchObject({ apfelbrot: 3, waldsalbe: 1 })
    expect(rescued.openedChestIds).toEqual(['truhe_markt'])
    expect(rescued.flags).toEqual(['wichtiger_fund'])
    expect(rescued.activeCombat).toBeNull()
  })

  it('befreit Marea, vergibt das Siegel und öffnet den Bootspfad', () => {
    const prepared = begin('boss_marea', 'morgenklinge')
    const almostWon: GameSave = {
      ...prepared,
      activeCombat: { ...prepared.activeCombat!, enemyLife: 1, phase: 2, announcedMoveId: 'kleine_wellen' }
    }
    const won = reduceGame(almostWon, { type: 'ATTACK' }, phase2World)

    expect(won.activeCombat).toBeNull()
    expect(won.flags).toContain('marea_befreit')
    expect(won.player.inventory.gezeitensiegel).toBe(1)
    expect(won.unlockedPassageIds).toContain('p34')
  })
})
