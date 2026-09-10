import type { EncounterDefinition, EnemyDefinition, EnemyMoveDefinition, WorldDefinition } from '../domain/content'
import type { ActiveEffect, Combatant, CombatState, GameSave } from '../domain/game'
import { applyEffect } from './effects'
import { evaluateRequirement } from './requirements'
import { otherEnd } from './actions'
import { resolveEnemyHit, resolvePlayerHit } from './damage'
import { addStatusEffect, getStatusDefinition, hasStatusModifier, statusDamage, tickStatusEffects } from './statusEffects'

export interface CombatView {
  encounter: EncounterDefinition
  enemy: EnemyDefinition
  move: EnemyMoveDefinition
  combatant: Combatant
  targetIndex: number
}

export interface CombatTransition {
  save: GameSave
  text: string
  key: string
}

function activeCombatant(combat: CombatState): { combatant: Combatant; index: number } | null {
  const combatant = combat.combatants[combat.targetIndex]
  return combatant ? { combatant, index: combat.targetIndex } : null
}

function replaceCombatant(combat: CombatState, index: number, next: Combatant): CombatState {
  return { ...combat, combatants: combat.combatants.map((entry, entryIndex) => entryIndex === index ? next : entry) }
}

export function getCombatView(save: GameSave, world: WorldDefinition): CombatView | null {
  const combat = save.activeCombat
  if (!combat) return null
  const encounter = world.encounters.find((entry) => entry.id === combat.encounterId)
  const active = activeCombatant(combat)
  const enemy = active ? world.enemies.find((entry) => entry.id === active.combatant.enemyId) : undefined
  const move = active && enemy?.movesByPhase[active.combatant.phase]?.find((entry) => entry.id === active.combatant.announcedMoveId)
  return encounter && active && enemy && move
    ? { encounter, enemy, move, combatant: active.combatant, targetIndex: active.index }
    : null
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

function stanceFor(move: EnemyMoveDefinition, effects: ActiveEffect[], world: WorldDefinition): Combatant['stance'] {
  const effectStance = effects
    .map((effect) => world.statusEffects?.find((definition) => definition.id === effect.id)?.modifiers?.enemyStance)
    .find((stance) => stance !== undefined)
  if (effectStance) return effectStance
  return move.kind === 'guard' || move.kind === 'shield' ? 'guarded' : 'normal'
}

function vulnerabilityEffect(world: WorldDefinition, duration: number): ActiveEffect | null {
  const definition = world.statusEffects?.find((status) => status.target === 'enemy' && status.modifiers?.enemyStance === 'vulnerable')
  return definition ? { id: definition.id, remainingEnemyTurns: Math.min(duration, definition.maximumDuration ?? duration) } : null
}

function statusName(world: WorldDefinition, id: string): string {
  return world.statusEffects?.find((effect) => effect.id === id)?.name ?? id
}

export function startCombat(save: GameSave, encounterId: string, world: WorldDefinition): CombatTransition | null {
  if (save.campaignId !== world.campaignId || save.activeCombat || save.player.life === 0 || save.defeatedEncounterIds.includes(encounterId)) return null
  const weapon = world.items.find((item) => item.id === save.player.equippedWeaponId)
  if (!weapon?.weapon || (save.player.inventory[weapon.id] ?? 0) < 1) return null
  const encounter = world.encounters.find((entry) => entry.id === encounterId && entry.areaId === save.currentAreaId)
  if (!encounter || !evaluateRequirement(encounter.requiredGear, save).met) return null
  const enemies = encounter.enemyIds.map((id) => world.enemies.find((enemy) => enemy.id === id))
  if (enemies.some((enemy) => !enemy)) return null
  const resolvedEnemies = enemies as EnemyDefinition[]
  if (resolvedEnemies.some((enemy) => enemy.phaseSealItemIds && Object.values(enemy.phaseSealItemIds).some((id) => (save.player.inventory[id] ?? 0) < 1))) return null

  const combatants = resolvedEnemies.map((enemy): Combatant | null => {
    const move = initialMove(enemy)
    return move ? {
      enemyId: enemy.id,
      life: enemy.maxLife,
      maxLife: enemy.maxLife,
      phase: 1,
      announcedMoveId: move.id,
      stance: stanceFor(move, [], world),
      effects: []
    } : null
  })
  if (combatants.some((entry) => entry === null)) return null

  const equippedArmor = world.items.find((item) => item.id === save.player.equippedArmorId)?.armor
  return {
    save: {
      ...save,
      metEnemyIds: [...new Set([...save.metEnemyIds, ...encounter.enemyIds])],
      activeCombat: {
        encounterId,
        combatants: combatants as Combatant[],
        targetIndex: 0,
        round: 1,
        canFlee: equippedArmor?.penalty?.kind !== 'noFlee',
        playerEffects: [],
        skillCooldown: 0,
        pendingSealItemId: null,
        placedSealItemIds: [],
        awaitingFinalAction: false
      }
    },
    text: `${resolvedEnemies.map((enemy) => enemy.name).join(' und ')} ${resolvedEnemies.length === 1 ? 'stellt' : 'stellen'} sich dir entgegen. Achte auf die angekündigte Bewegung.`,
    key: `combat-start:${encounterId}`
  }
}

function resolveEnemyTurn(
  save: GameSave,
  enemy: EnemyDefinition,
  move: EnemyMoveDefinition,
  defending: boolean,
  prefix: string,
  world: WorldDefinition,
  interruptedText?: string
): CombatTransition {
  const combat = save.activeCombat!
  const active = activeCombatant(combat)!
  let damage = 0
  let outcome: string
  const playerOngoing = statusDamage(combat.playerEffects, world)
  const enemyOngoing = statusDamage(active.combatant.effects, world)
  let playerEffects = tickStatusEffects(combat.playerEffects)
  let enemyEffects = tickStatusEffects(active.combatant.effects)
  const damageType = move.damageType ?? 'physical'
  const protectiveEffect = combat.playerEffects.find((effect) => {
    const definition = world.statusEffects?.find((status) => status.id === effect.id)
    return definition?.target === 'player' && definition.modifiers?.protectsFrom?.includes(damageType)
  })
  const skippedByStatus = hasStatusModifier(active.combatant.effects, world, (definition) => Boolean(definition.modifiers?.skipEnemyTurn))
  const armorItem = world.items.find((item) => item.id === save.player.equippedArmorId && item.armor)
  const talismanItem = world.items.find((item) => item.id === save.player.equippedTalismanId && item.armor)
  let enemyLife = Math.max(0, active.combatant.life - enemyOngoing.damage)

  if (enemyLife === 0) {
    outcome = `${enemy.name} wird durch den Zustand besiegt, bevor die angekündigte Bewegung beginnt.`
  } else if (interruptedText || skippedByStatus) {
    outcome = interruptedText ?? `${enemy.name} ist ${statusName(world, active.combatant.effects.find((effect) => getStatusDefinition(world, effect.id)?.modifiers?.skipEnemyTurn)?.id ?? 'gefroren')} und setzt eine Bewegung aus.`
  } else if (move.kind === 'guard' || move.kind === 'shield') {
    outcome = `${enemy.name} schützt sich mit ${move.name}.`
  } else if (move.kind === 'heal') {
    const restored = Math.min(move.healAmount ?? move.damage, active.combatant.maxLife - enemyLife)
    enemyLife += restored
    outcome = `${enemy.name} nutzt ${move.name} und erhält ${restored} Leben zurück.`
  } else {
    const hit = resolveEnemyHit({
      enemyName: enemy.name,
      move,
      defending,
      armor: armorItem?.armor ? { name: armorItem.name, definition: armorItem.armor } : null,
      talisman: talismanItem?.armor ? { name: talismanItem.name, definition: talismanItem.armor } : null,
      ward: protectiveEffect ? {
        name: statusName(world, protectiveEffect.id),
        protectsFrom: getStatusDefinition(world, protectiveEffect.id)?.modifiers?.protectsFrom ?? []
      } : null
    })
    damage = hit.damage
    outcome = hit.text
    if (protectiveEffect && hit.protectedBy === statusName(world, protectiveEffect.id)) {
      playerEffects = playerEffects.filter((effect) => effect.id !== protectiveEffect.id)
    }
    if (defending && move.defendNegates && move.vulnerableAfterDefend) {
      const vulnerability = vulnerabilityEffect(world, active.combatant.phase === 2 ? 2 : 1)
      if (vulnerability) enemyEffects = [...enemyEffects.filter((effect) => effect.id !== vulnerability.id), vulnerability]
      outcome += ` ${move.vulnerableText ?? 'Ein kurzes Trefferfenster öffnet sich.'}`
    }
  }

  if (damage > 0 && !defending && move.inflictedEffect && !interruptedText && !skippedByStatus) {
    const definition = getStatusDefinition(world, move.inflictedEffect.id)
    playerEffects = definition
      ? addStatusEffect(playerEffects, definition, move.inflictedEffect.duration)
      : [...playerEffects.filter((effect) => effect.id !== move.inflictedEffect!.id), { id: move.inflictedEffect.id, remainingEnemyTurns: move.inflictedEffect.duration }]
    outcome += ` ${move.inflictedEffect.text ?? `${statusName(world, move.inflictedEffect.id)} wirkt jetzt.`}`
  }

  const ongoingText = [...enemyOngoing.labels, ...playerOngoing.labels]
  if (ongoingText.length) outcome += ` ${ongoingText.join('. ')}.`
  const life = Math.max(0, save.player.life - damage - playerOngoing.damage)
  const phase = enemy.phaseSealItemIds ? active.combatant.phase : enemyPhase(enemy, enemyLife)
  const moveAfter = nextMove(enemy, phase, active.combatant.phase, move.id)
  const nextCombatant: Combatant = {
    ...active.combatant,
    life: enemyLife,
    phase,
    announcedMoveId: moveAfter?.id ?? move.id,
    stance: stanceFor(moveAfter ?? move, enemyEffects, world),
    effects: enemyEffects
  }
  const resolvedCombat = replaceCombatant(combat, active.index, nextCombatant)
  const resolved: GameSave = {
    ...save,
    player: { ...save.player, life },
    activeCombat: {
      ...resolvedCombat,
      round: combat.round + 1,
      playerEffects,
      skillCooldown: Math.max(0, combat.skillCooldown - 1)
    }
  }
  if (enemyLife === 0 && !enemy.phaseSealItemIds) {
    const encounter = world.encounters.find((entry) => entry.id === combat.encounterId)
    if (encounter) {
      let won: GameSave = {
        ...resolved,
        activeCombat: null,
        defeatedEncounterIds: [...new Set([...resolved.defeatedEncounterIds, encounter.id])]
      }
      for (const effect of encounter.rewardEffects) won = applyEffect(won, effect, world)
      return { save: won, text: `${prefix} ${outcome} ${encounter.victoryText}`, key: `combat-victory:${encounter.id}` }
    }
  }
  if (life === 0) {
    return {
      save: resolved,
      text: `${prefix} ${outcome} Hilfe ist unterwegs. Du brauchst eine Rettung zum letzten sicheren Ort.`,
      key: `combat-defeat:${combat.encounterId}`
    }
  }

  return { save: resolved, text: `${prefix} ${outcome}`, key: `combat-round:${combat.encounterId}:${combat.round}` }
}

function attackWithBonus(
  save: GameSave,
  world: WorldDefinition,
  extraDamage?: { amount: number; type: import('../domain/content').DamageType },
  skillName?: string
): CombatTransition | null {
  const view = getCombatView(save, world)
  if (!view || save.player.life === 0 || save.activeCombat?.pendingSealItemId || save.activeCombat?.awaitingFinalAction) return null
  const { encounter, enemy, move, combatant, targetIndex } = view
  const combat = save.activeCombat!
  const weapon = world.items.find((entry) => entry.id === save.player.equippedWeaponId)?.weapon
  if (!weapon || (save.player.inventory[save.player.equippedWeaponId!] ?? 0) < 1) return null

  const roll = rollDamage(save.rngState, weapon.minDamage, weapon.maxDamage)
  const grounded = hasStatusModifier(combatant.effects, world, (definition) => Boolean(definition.modifiers?.groundsEnemy))
  const guarded = combatant.stance === 'guarded' || (enemy.airborne && !grounded && combatant.stance !== 'vulnerable')
  const weaponItem = world.items.find((entry) => entry.id === save.player.equippedWeaponId)!
  const hit = resolvePlayerHit({
    weapon,
    weaponName: skillName ?? weaponItem.name,
    enemy,
    roll: roll.value,
    weaponMode: save.player.weaponElementModes[weaponItem.id],
    enemyEffects: combatant.effects,
    playerEffects: combat.playerEffects,
    statusEffects: world.statusEffects,
    extraDamage,
    blocked: guarded
  })
  const boundary = enemy.phaseThresholds?.[combatant.phase + 1] ?? 0
  const dealt = Math.min(combatant.life - boundary, hit.damage)
  const enemyLife = Math.max(0, combatant.life - dealt)
  const hitText = dealt === hit.damage
    ? hit.text
    : `${hit.text} Davon treffen ${dealt} Schaden bis zur Phasengrenze.`
  const hitCombatant = { ...combatant, life: enemyLife }
  let attacked: GameSave = {
    ...save,
    rngState: roll.state,
    activeCombat: {
      ...replaceCombatant(combat, targetIndex, hitCombatant),
      canFlee: enemy.kind === 'boss' && dealt > 0 ? false : combat.canFlee
    }
  }

  const sealForPhase = enemy.phaseSealItemIds?.[combatant.phase]
  const nextThreshold = enemy.phaseThresholds?.[combatant.phase + 1]
  const phaseBoundaryReached = sealForPhase && (enemyLife === 0 || (nextThreshold !== undefined && enemyLife <= nextThreshold))
  if (phaseBoundaryReached) {
    const sealedCombatant = { ...hitCombatant, life: nextThreshold === undefined ? 0 : Math.max(nextThreshold, enemyLife) }
    attacked = {
      ...attacked,
      activeCombat: { ...replaceCombatant(attacked.activeCombat!, targetIndex, sealedCombatant), pendingSealItemId: sealForPhase }
    }
    const sealName = world.items.find((entry) => entry.id === sealForPhase)?.name ?? sealForPhase
    return { save: attacked, text: `${hitText} Ein Riss bleibt offen. Jetzt antwortet ${sealName}.`, key: `combat-seal-ready:${encounter.id}:${combatant.phase}` }
  }

  if (enemyLife === 0) {
    attacked = {
      ...attacked,
      activeCombat: null,
      defeatedEncounterIds: [...new Set([...attacked.defeatedEncounterIds, encounter.id])]
    }
    for (const effect of encounter.rewardEffects) attacked = applyEffect(attacked, effect, world)
    return { save: attacked, text: `${hitText} ${encounter.victoryText}`, key: `combat-victory:${encounter.id}` }
  }

  return resolveEnemyTurn(attacked, enemy, move, false, hitText, world)
}

export function attack(save: GameSave, world: WorldDefinition): CombatTransition | null {
  return attackWithBonus(save, world)
}

export function useWeaponSkill(save: GameSave, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  const combat = save.activeCombat
  const weaponItem = world.items.find((item) => item.id === save.player.equippedWeaponId)
  const skill = weaponItem?.weapon?.skill
  if (!view || !combat || !skill || combat.skillCooldown > 0 || save.player.life === 0 || combat.pendingSealItemId || combat.awaitingFinalAction) return null
  const armor = world.items.find((item) => item.id === save.player.equippedArmorId)?.armor
  const cooldown = skill.cooldown + (armor?.penalty?.kind === 'slowSkill' ? 1 : 0) + 1
  let prepared: GameSave = { ...save, activeCombat: { ...combat, skillCooldown: cooldown } }

  if (skill.effect.kind === 'burst') {
    return attackWithBonus(prepared, world, { amount: skill.effect.bonusDamage, type: skill.effect.damageType }, skill.name)
  }
  if (skill.effect.kind === 'sweep') return attackWithBonus(prepared, world, undefined, skill.name)
  if (skill.effect.kind === 'inflict') {
    const definition = getStatusDefinition(world, skill.effect.effectId)
    if (!definition || definition.target !== 'enemy') return null
    const affected = {
      ...view.combatant,
      effects: addStatusEffect(view.combatant.effects, definition, skill.effect.duration)
    }
    prepared = { ...prepared, activeCombat: replaceCombatant(prepared.activeCombat!, view.targetIndex, affected) }
    return resolveEnemyTurn(prepared, view.enemy, view.move, false, `${skill.name} setzt ${definition.name} ein.`, world)
  }
  if (skill.effect.kind === 'ward') {
    const definition = getStatusDefinition(world, skill.effect.effectId)
    if (!definition || definition.target !== 'player') return null
    prepared = {
      ...prepared,
      activeCombat: {
        ...prepared.activeCombat!,
        playerEffects: addStatusEffect(prepared.activeCombat!.playerEffects, definition, skill.effect.duration)
      }
    }
    return resolveEnemyTurn(prepared, view.enemy, view.move, false, `${skill.name} errichtet ${definition.name}.`, world)
  }
  return resolveEnemyTurn(prepared, view.enemy, view.move, false, `${skill.name} unterbricht die angekündigte Bewegung.`, world, `${view.enemy.name} verliert ${view.move.name}.`)
}

export function defend(save: GameSave, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  if (!view || save.player.life === 0 || save.activeCombat?.pendingSealItemId || save.activeCombat?.awaitingFinalAction) return null
  return resolveEnemyTurn(save, view.enemy, view.move, true, 'Du gehst in Deckung.', world)
}

export function useCombatItem(save: GameSave, itemId: string, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  const item = world.items.find((entry) => entry.id === itemId)
  const quantity = save.player.inventory[itemId] ?? 0
  const clearIds = item?.healing?.clearsEffectIds ?? []
  const clearsEffect = save.activeCombat?.playerEffects.some((effect) => clearIds.includes(effect.id)) ?? false
  if (!view || save.player.life === 0 || save.activeCombat?.pendingSealItemId || save.activeCombat?.awaitingFinalAction || item?.kind !== 'healing' || !item.healing || quantity < 1 || (save.player.life >= save.player.maxLife && !item.healing.combatEffect && !clearsEffect)) return null

  const restored = Math.min(item.healing.lifeRestored, save.player.maxLife - save.player.life)
  const inventory = { ...save.player.inventory }
  if (quantity === 1) delete inventory[itemId]
  else inventory[itemId] = quantity - 1
  let playerEffects = save.activeCombat!.playerEffects.filter((effect) => !clearIds.includes(effect.id))
  if (item.healing.combatEffect) {
    playerEffects = [
      ...playerEffects.filter((effect) => effect.id !== item.healing!.combatEffect!.id),
      { id: item.healing.combatEffect.id, remainingEnemyTurns: item.healing.combatEffect.duration }
    ]
  }
  const used: GameSave = {
    ...save,
    player: { ...save.player, life: save.player.life + restored, inventory },
    activeCombat: { ...save.activeCombat!, playerEffects }
  }
  return resolveEnemyTurn(used, view.enemy, view.move, false, `Du benutzt ${item.name} und erhältst ${restored} Leben zurück.`, world)
}

export function placeSeal(save: GameSave, itemId: string, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  const combat = save.activeCombat
  if (!view || save.player.life === 0 || !combat?.pendingSealItemId || combat.pendingSealItemId !== itemId || view.enemy.phaseSealItemIds?.[view.combatant.phase] !== itemId || combat.placedSealItemIds.includes(itemId) || (save.player.inventory[itemId] ?? 0) < 1) return null

  const placedSealItemIds = [...new Set([...combat.placedSealItemIds, itemId])]
  if (view.combatant.life === 0) {
    return {
      save: { ...save, activeCombat: { ...combat, pendingSealItemId: null, placedSealItemIds, awaitingFinalAction: true } },
      text: view.enemy.finalSealText ?? `Du setzt ${world.items.find((item) => item.id === itemId)?.name ?? itemId}. Die letzte sichere Aktion ist bereit.`,
      key: `combat-seal:${combat.encounterId}:${itemId}`
    }
  }

  const phase = view.combatant.phase + 1
  const move = initialMove(view.enemy, phase)
  if (!move) return null
  const nextCombatant: Combatant = { ...view.combatant, phase, announcedMoveId: move.id, stance: stanceFor(move, view.combatant.effects, world) }
  return {
    save: {
      ...save,
      activeCombat: { ...replaceCombatant(combat, view.targetIndex, nextCombatant), pendingSealItemId: null, placedSealItemIds }
    },
    text: view.enemy.sealPlacementText?.[view.combatant.phase] ?? `Du setzt ${world.items.find((item) => item.id === itemId)?.name ?? itemId}. Die nächste Phase beginnt.`,
    key: `combat-seal:${combat.encounterId}:${itemId}`
  }
}

export function completeFinalCombatAction(save: GameSave, world: WorldDefinition): CombatTransition | null {
  const view = getCombatView(save, world)
  const combat = save.activeCombat
  const seals = view?.enemy.phaseSealItemIds ? Object.values(view.enemy.phaseSealItemIds) : []
  if (!view || save.player.life === 0 || !combat?.awaitingFinalAction || view.combatant.life !== 0 || !view.enemy.finalAction || seals.length === 0 || combat.placedSealItemIds.length !== seals.length || seals.some((id) => !combat.placedSealItemIds.includes(id) || (save.player.inventory[id] ?? 0) < 1)) return null

  let won: GameSave = {
    ...save,
    activeCombat: null,
    defeatedEncounterIds: [...new Set([...save.defeatedEncounterIds, view.encounter.id])]
  }
  for (const effect of view.encounter.rewardEffects) won = applyEffect(won, effect, world)
  return { save: won, text: `${view.enemy.finalAction.spokenText} ${view.encounter.victoryText}`, key: `combat-victory:${view.encounter.id}` }
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
    text: `Du löst dich vom Kampf und erreichst ${destination.name}.`,
    key: `combat-flee:${combat.encounterId}`
  }
}

function restockedInventory(save: GameSave, world: WorldDefinition): Record<string, number> {
  const inventory = { ...save.player.inventory }
  for (const restock of world.start.sanctuaryRestocks ?? []) {
    inventory[restock.itemId] = Math.max(restock.quantity, inventory[restock.itemId] ?? 0)
  }
  return inventory
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
      player: { ...save.player, life: save.player.maxLife, inventory: restockedInventory(save, world) },
      activeCombat: null
    },
    text: `Helfer bringen dich nach ${sanctuary.name}. Deine Funde bleiben bei dir, und dein Grundvorrat wird ergänzt.`,
    key: `combat-respawn:${save.activeCombat.encounterId}`
  }
}
