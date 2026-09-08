import type { EncounterDefinition, EnemyDefinition, EnemyMoveDefinition, WorldDefinition } from '../domain/content'
import type { CombatState, GameSave } from '../domain/game'
import { applyEffect } from './effects'
import { evaluateRequirement } from './requirements'
import { otherEnd } from './actions'

export interface CombatView {
  encounter: EncounterDefinition
  enemy: EnemyDefinition
  move: EnemyMoveDefinition
}

export interface CombatTransition {
  save: GameSave
  text: string
  key: string
}

export function getCombatView(save: GameSave, world: WorldDefinition): CombatView | null {
  const combat = save.activeCombat
  if (!combat) return null
  const encounter = world.encounters.find((entry) => entry.id === combat.encounterId)
  const enemy = encounter ? world.enemies.find((entry) => entry.id === encounter.enemyId) : undefined
  const move = enemy?.movesByPhase[combat.phase]?.find((entry) => entry.id === combat.announcedMoveId)
  return encounter && enemy && move ? { encounter, enemy, move } : null
}

function initialMove(enemy: EnemyDefinition, phase = 1): EnemyMoveDefinition | undefined {
  return enemy.movesByPhase[phase]?.[0]
}

function nextMove(enemy: EnemyDefinition, phase: number, previousPhase: number, moveId: string): EnemyMoveDefinition | undefined {
  const moves = enemy.movesByPhase[phase]
  if (!moves?.length) return undefined
  if (phase !== previousPhase) return moves[0]
  return moves[(moves.findIndex((move) => move.id === moveId) + 1) % moves.length]
}

function nextRandom(seed: number): number {
  const normalized = seed > 0 ? seed : 1
  return (normalized * 48_271) % 2_147_483_647
}

function rollDamage(seed: number, minimum: number, maximum: number): { value: number; state: number } {
  const state = nextRandom(seed)
  return { value: minimum + (state % (maximum - minimum + 1)), state }
}

function enemyPhase(enemy: EnemyDefinition, life: number): number {
  if (enemy.phaseThresholds) {
    return Object.entries(enemy.phaseThresholds)
      .map(([phase, threshold]) => ({ phase: Number(phase), threshold }))
      .filter((entry) => life <= entry.threshold)
      .reduce((highest, entry) => Math.max(highest, entry.phase), 1)
  }
  return enemy.phaseTwoAtLife !== undefined && life <= enemy.phaseTwoAtLife ? 2 : 1
}

function stanceFor(move: EnemyMoveDefinition, effects: CombatState['effects']): CombatState['enemyStance'] {
  if (effects.some((effect) => effect.id === 'offener_riss')) return 'vulnerable'
  return move.kind === 'guard' ? 'guarded' : 'normal'
}

export function startCombat(save: GameSave, encounterId: string, world: WorldDefinition): CombatTransition | null {
  if (save.activeCombat || save.player.life === 0 || save.defeatedEncounterIds.includes(encounterId)) return null
  const weapon = world.items.find((item) => item.id === save.player.equippedWeaponId)
  if (!weapon?.weapon || (save.player.inventory[weapon.id] ?? 0) < 1) return null
  const encounter = world.encounters.find((entry) => entry.id === encounterId && entry.areaId === save.currentAreaId)
  const enemy = encounter ? world.enemies.find((entry) => entry.id === encounter.enemyId) : undefined
  const move = enemy ? initialMove(enemy) : undefined
  if (!encounter || !enemy || !move) return null

  if (enemy.phaseSealItemIds && Object.values(enemy.phaseSealItemIds).some((id) => (save.player.inventory[id] ?? 0) < 1)) return null
  const prepared = enemy.kind === 'boss' && save.player.equippedWeaponId === 'morgenklinge' && (save.player.inventory.morgenklinge ?? 0) > 0
  const entryMode: CombatState['entryMode'] = enemy.kind !== 'boss' ? 'normal' : prepared ? 'prepared-boss' : 'early-boss'
  const warning = entryMode === 'early-boss'
    ? `Der Grauschleier schützt ${enemy.name}. Ohne die ausgerüstete Morgenklinge kann kein Angriff den Schatten verletzen. Zieh dich zurück, solange du den Weg kennst.`
    : `${enemy.name} stellt sich dir entgegen. Achte auf die angekündigte Bewegung.`

  return {
    save: {
      ...save,
      activeCombat: {
        encounterId,
        enemyLife: enemy.maxLife,
        enemyMaxLife: enemy.maxLife,
        phase: 1,
        announcedMoveId: move.id,
        round: 1,
        enemyStance: stanceFor(move, []),
        entryMode,
        canFlee: true,
        pendingSealItemId: null,
        placedSealItemIds: [],
        awaitingFinalPromise: false,
        effects: []
      }
    },
    text: warning,
    key: `combat-start:${encounterId}`
  }
}

function resolveEnemyTurn(
  save: GameSave,
  enemy: EnemyDefinition,
  move: EnemyMoveDefinition,
  defending: boolean,
  prefix: string
): CombatTransition {
  const combat = save.activeCombat!
  let damage = move.damage
  let outcome: string
  let effects = combat.effects.map((effect) => ({ ...effect, remainingEnemyTurns: effect.remainingEnemyTurns - 1 }))
    .filter((effect) => effect.remainingEnemyTurns > 0)
  const lightningProtected = move.damageType === 'lightning' && combat.effects.some((effect) => effect.id === 'blitzschutz')

  if (move.kind === 'guard') {
    damage = 0
    outcome = `${enemy.name} schützt sich mit ${move.name}.`
  } else if (defending && move.defendNegates) {
    damage = 0
    outcome = enemy.id === 'marea'
      ? `Du erkennst ${move.name} rechtzeitig, weichst aus und lenkst ${enemy.name} gegen eine Säule.`
      : `Du erkennst ${move.name} rechtzeitig und bringst ${enemy.name} aus dem Gleichgewicht.`
    if (move.vulnerableAfterDefend) {
      effects = [...effects.filter((effect) => effect.id !== 'offener_riss'), { id: 'offener_riss', remainingEnemyTurns: combat.phase === 2 ? 2 : 1 }]
      outcome += enemy.id === 'marea' ? ' Ein leuchtender Riss liegt offen.' : ' Ein kurzes Trefferfenster öffnet sich.'
    }
  } else {
    damage = defending ? Math.ceil(damage / 2) : damage
    if (lightningProtected && damage > 0) {
      damage = Math.ceil(damage / 2)
      effects = effects.filter((effect) => effect.id !== 'blitzschutz')
    }
    outcome = defending
      ? `Du fängst ${move.name} ab und verlierst nur ${damage} Leben.`
      : `${move.name} trifft dich. Du verlierst ${damage} Leben.`
    if (lightningProtected && damage > 0) outcome += ' Die kühlende Limonade schwächt den Blitz.'
  }

  if (damage > 0 && !defending && move.inflictedEffect) {
    effects = [...effects.filter((effect) => effect.id !== move.inflictedEffect!.id), {
      id: move.inflictedEffect.id, remainingEnemyTurns: move.inflictedEffect.duration
    }]
    outcome += ' Grauschleier schwächt deinen nächsten Angriff. Quellwasser kann ihn lösen.'
  }

  const life = Math.max(0, save.player.life - damage)
  const phase = enemy.phaseSealItemIds ? combat.phase : enemyPhase(enemy, combat.enemyLife)
  const moveAfter = nextMove(enemy, phase, combat.phase, move.id)
  const resolved: GameSave = {
    ...save,
    player: { ...save.player, life },
    activeCombat: {
      ...combat, phase, announcedMoveId: moveAfter?.id ?? move.id,
      round: combat.round + 1, enemyStance: stanceFor(moveAfter ?? move, effects), effects
    }
  }
  if (life === 0) {
    return {
      save: resolved,
      text: `${prefix} ${outcome} Kuno ruft nach Hilfe. Du brauchst eine Rettung zum letzten sicheren Ort.`,
      key: `combat-defeat:${combat.encounterId}`
    }
  }

  return {
    save: resolved,
    text: `${prefix} ${outcome}`,
    key: `combat-round:${combat.encounterId}:${combat.round}`
  }
}

export function attack(save: GameSave, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  if (!view || save.player.life === 0 || save.activeCombat?.pendingSealItemId || save.activeCombat?.awaitingFinalPromise) return null
  const { encounter, enemy, move } = view
  const combat = save.activeCombat!
  const weapon = world.items.find((entry) => entry.id === save.player.equippedWeaponId)?.weapon
  if (!weapon || (save.player.inventory[save.player.equippedWeaponId!] ?? 0) < 1) return null

  const roll = rollDamage(save.rngState, weapon.minDamage, weapon.maxDamage)
  const shadowBlocked = Boolean(enemy.shadowArmor && save.player.equippedWeaponId !== 'morgenklinge')
  const guarded = combat.enemyStance === 'guarded' || (enemy.airborne && combat.enemyStance !== 'vulnerable')
  const tagBonus = weapon.bonusAgainstTag && enemy.tags.includes(weapon.bonusAgainstTag.tag) ? weapon.bonusAgainstTag.amount : 0
  const effectiveDefense = Math.max(0, enemy.defense - (weapon.armorPiercing ?? 0))
  const crackBonus = combat.enemyStance === 'vulnerable' ? 2 : 0
  const weakened = combat.effects.some((effect) => effect.id === 'grauschleier') ? 1 : 0
  const boundary = enemy.phaseThresholds?.[combat.phase + 1] ?? 0
  const dealt = shadowBlocked || guarded ? 0 : Math.min(combat.enemyLife - boundary, Math.max(1, roll.value + tagBonus + crackBonus - effectiveDefense - weakened))
  const enemyLife = Math.max(0, combat.enemyLife - dealt)
  const hitText = shadowBlocked
    ? `Dein Angriff richtet 0 Schaden an. Der Grauschleier um ${enemy.name} schliesst sich sofort – nur die ausgerüstete Morgenklinge kann ihn durchdringen.`
    : guarded
      ? `Dein Angriff richtet 0 Schaden an. ${enemy.name} ist ${enemy.airborne ? 'in der Luft unerreichbar. Verteidige dich gegen den Sturzflug, um ein Trefferfenster zu öffnen' : 'vollständig geschützt'}.`
      : `Du triffst ${enemy.name} mit ${dealt} Schaden${crackBonus ? ' durch den offenen Riss' : ''}.`
  let attacked: GameSave = {
    ...save,
    rngState: roll.state,
    activeCombat: {
      ...combat,
      enemyLife,
      canFlee: combat.entryMode === 'prepared-boss' && dealt > 0 ? false : combat.canFlee
    }
  }

  const sealForPhase = enemy.phaseSealItemIds?.[combat.phase]
  const nextThreshold = enemy.phaseThresholds?.[combat.phase + 1]
  const phaseBoundaryReached = sealForPhase && (enemyLife === 0 || (nextThreshold !== undefined && enemyLife <= nextThreshold))
  if (phaseBoundaryReached) {
    attacked = {
      ...attacked,
      activeCombat: {
        ...attacked.activeCombat!,
        enemyLife: nextThreshold === undefined ? 0 : Math.max(nextThreshold, enemyLife),
        phase: combat.phase,
        pendingSealItemId: sealForPhase
      }
    }
    const sealName = world.items.find((entry) => entry.id === sealForPhase)?.name ?? sealForPhase
    return {
      save: attacked,
      text: `${hitText} Ein Riss im Schatten bleibt offen. Jetzt antwortet das ${sealName}.`,
      key: `combat-seal-ready:${encounter.id}:${combat.phase}`
    }
  }

  if (enemyLife === 0) {
    attacked = {
      ...attacked,
      activeCombat: null,
      defeatedEncounterIds: [...new Set([...attacked.defeatedEncounterIds, encounter.id])]
    }
    for (const effect of encounter.rewardEffects) attacked = applyEffect(attacked, effect)
    return {
      save: attacked,
      text: `${hitText} ${encounter.victoryText}`,
      key: `combat-victory:${encounter.id}`
    }
  }

  return resolveEnemyTurn(attacked, enemy, move, false, hitText)
}

export function defend(save: GameSave, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  if (!view || save.player.life === 0 || save.activeCombat?.pendingSealItemId || save.activeCombat?.awaitingFinalPromise) return null
  return resolveEnemyTurn(save, view.enemy, view.move, true, 'Du gehst in Deckung.')
}

export function useCombatItem(save: GameSave, itemId: string, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  const item = world.items.find((entry) => entry.id === itemId)
  const quantity = save.player.inventory[itemId] ?? 0
  const clearsEffect = itemId === 'quellwasser' && save.activeCombat?.effects.some((effect) => effect.id === 'grauschleier')
  if (!view || save.player.life === 0 || save.activeCombat?.pendingSealItemId || save.activeCombat?.awaitingFinalPromise || item?.kind !== 'healing' || !item.healing || quantity < 1 || (save.player.life >= save.player.maxLife && !item.healing.combatEffect && !clearsEffect)) return null

  const restored = Math.min(item.healing.lifeRestored, save.player.maxLife - save.player.life)
  const inventory = { ...save.player.inventory }
  if (quantity === 1) delete inventory[itemId]
  else inventory[itemId] = quantity - 1
  let effects = item.id === 'quellwasser'
    ? save.activeCombat!.effects.filter((effect) => effect.id !== 'grauschleier')
    : save.activeCombat!.effects
  if (item.healing.combatEffect) {
    effects = [
      ...effects.filter((effect) => effect.id !== item.healing!.combatEffect!.id),
      { id: item.healing.combatEffect.id, remainingEnemyTurns: item.healing.combatEffect.duration }
    ]
  }
  const used: GameSave = {
    ...save,
    player: { ...save.player, life: save.player.life + restored, inventory },
    activeCombat: { ...save.activeCombat!, effects }
  }
  return resolveEnemyTurn(used, view.enemy, view.move, false, `Du benutzt ${item.name} und erhältst ${restored} Leben zurück.`)
}

export function placeSeal(save: GameSave, itemId: string, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  const combat = save.activeCombat
  if (!view || save.player.life === 0 || !combat?.pendingSealItemId || combat.pendingSealItemId !== itemId || view.enemy.phaseSealItemIds?.[combat.phase] !== itemId || combat.placedSealItemIds.includes(itemId) || (save.player.inventory[itemId] ?? 0) < 1) return null

  const placedSealItemIds = [...new Set([...combat.placedSealItemIds, itemId])]
  if (combat.enemyLife === 0) {
    return {
      save: {
        ...save,
        activeCombat: { ...combat, pendingSealItemId: null, placedSealItemIds, awaitingFinalPromise: true }
      },
      text: 'Das Himmelssiegel ruft Wind durch die Kammer. Raugrim kann nicht mehr in die Schattenlücken fliehen. Jetzt fehlt nur Alvas Versprechen.',
      key: `combat-seal:${combat.encounterId}:${itemId}`
    }
  }

  const phase = combat.phase + 1
  const move = initialMove(view.enemy, phase)
  if (!move) return null
  return {
    save: {
      ...save,
      activeCombat: {
        ...combat,
        phase,
        announcedMoveId: move.id,
        pendingSealItemId: null,
        placedSealItemIds,
        enemyStance: stanceFor(move, combat.effects)
      }
    },
    text: itemId === 'wurzelsiegel'
      ? 'Du setzt das Wurzelsiegel. Wurzeln aus Licht halten den verschwindenden Boden zusammen.'
      : 'Du setzt das Gezeitensiegel. Klares Wasser spiegelt Raugrims wirkliche Form.',
    key: `combat-seal:${combat.encounterId}:${itemId}`
  }
}

export function speakPromise(save: GameSave, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  const combat = save.activeCombat
  const seals = view?.enemy.phaseSealItemIds ? Object.values(view.enemy.phaseSealItemIds) : []
  if (!view || save.player.life === 0 || !combat?.awaitingFinalPromise || combat.enemyLife !== 0 || seals.length !== 3 || combat.placedSealItemIds.length !== 3 || seals.some((id) => !combat.placedSealItemIds.includes(id) || (save.player.inventory[id] ?? 0) < 1)) return null

  let won: GameSave = {
    ...save,
    activeCombat: null,
    defeatedEncounterIds: [...new Set([...save.defeatedEncounterIds, view.encounter.id])]
  }
  for (const effect of view.encounter.rewardEffects) won = applyEffect(won, effect)
  return {
    save: won,
    text: `Du sprichst: «Finde den Weg. Kehre zurück. Geh nicht allein.» ${view.encounter.victoryText}`,
    key: `combat-victory:${view.encounter.id}`
  }
}

export function flee(save: GameSave, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  const combat = save.activeCombat
  if (!view || !combat?.canFlee || save.player.life === 0) return null
  const returnPassage = world.passages.find((passage) => otherEnd(passage, save.currentAreaId) === save.previousAreaId &&
    (evaluateRequirement(passage.requirement, save).met || save.unlockedPassageIds.includes(passage.id)))
  const destinationId = returnPassage && save.previousAreaId && save.visitedAreaIds.includes(save.previousAreaId)
    ? save.previousAreaId : view.encounter.fleeAreaId
  const destination = world.areas.find((entry) => entry.id === destinationId)
  if (!destination) return null
  return {
    save: {
      ...save,
      currentAreaId: destination.id,
      previousAreaId: save.currentAreaId,
      visitedAreaIds: [...new Set([...save.visitedAreaIds, destination.id])],
      deliveredDialogueIds: [...new Set([...save.deliveredDialogueIds, `area_intro:${save.currentAreaId}`])],
      lastSanctuaryId: destination.safe && evaluateRequirement(destination.sanctuaryRequirement, save).met ? destination.id : save.lastSanctuaryId,
      activeCombat: null
    },
    text: combat.entryMode === 'early-boss'
      ? 'Du ziehst dich rechtzeitig zurück. Kuno markiert den sicheren Weg zur Morgenklinge.'
      : `Du löst dich vom Kampf und erreichst ${destination.name}.`,
    key: `combat-flee:${combat.encounterId}`
  }
}

export function respawn(save: GameSave, world: WorldDefinition): CombatTransition | null {
  if (save.player.life !== 0 || !save.activeCombat) return null
  const sanctuary = world.areas.find((entry) => entry.id === save.lastSanctuaryId)
  if (!sanctuary) return null
  return {
    save: {
      ...save,
      currentAreaId: sanctuary.id,
      previousAreaId: save.currentAreaId,
      visitedAreaIds: [...new Set([...save.visitedAreaIds, sanctuary.id])],
      deliveredDialogueIds: [...new Set([...save.deliveredDialogueIds, `area_intro:${save.currentAreaId}`])],
      player: {
        ...save.player,
        life: save.player.maxLife,
        inventory: { ...save.player.inventory, apfelbrot: Math.max(3, save.player.inventory.apfelbrot ?? 0) }
      },
      activeCombat: null
    },
    text: `Helfer bringen dich nach ${sanctuary.name}. Deine Funde bleiben bei dir, und du erhältst frisches Apfelbrot.`,
    key: `combat-respawn:${save.activeCombat.encounterId}`
  }
}
