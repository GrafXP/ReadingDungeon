import type { DamageType, WorldDefinition } from './content'

export const SAVE_SCHEMA_VERSION = 6
export const CONTENT_VERSION = 7

/** Upper bound so a very long run cannot grow the save without limit. */
export const JOURNAL_LIMIT = 1000

export type CampaignId = string
export type AreaId = string
export type ItemId = string
export type ChestId = string
export type EncounterId = string
export type PassageId = string
export type QuestStepId = string
export type ClueId = string
export type DialogueId = string
export type PuzzleId = string
export type GameFlag = string

export interface PuzzleState {
  kind: string
  values: Record<string, string | number | boolean>
}

export interface ActiveEffect {
  id: string
  remainingEnemyTurns: number
}

export interface Combatant {
  enemyId: string
  life: number
  maxLife: number
  phase: number
  announcedMoveId: string
  stance: 'normal' | 'guarded' | 'vulnerable'
  effects: ActiveEffect[]
}

export interface CombatState {
  encounterId: EncounterId
  combatants: Combatant[]
  targetIndex: number
  round: number
  canFlee: boolean
  playerEffects: ActiveEffect[]
  skillCooldown: number
  pendingSealItemId: ItemId | null
  placedSealItemIds: ItemId[]
  awaitingFinalAction: boolean
}

export interface GameEvent {
  id: string
  text: string
  turn: number
}

export interface GameSave {
  schemaVersion: number
  contentVersion: number
  campaignId: CampaignId
  runId: string
  playerName: string
  currentAreaId: AreaId
  previousAreaId: AreaId | null
  player: {
    life: number
    maxLife: number
    equippedWeaponId: ItemId | null
    equippedArmorId: ItemId | null
    equippedTalismanId: ItemId | null
    weaponElementModes: Partial<Record<ItemId, DamageType>>
    inventory: Record<ItemId, number>
  }
  visitedAreaIds: AreaId[]
  openedChestIds: ChestId[]
  defeatedEncounterIds: EncounterId[]
  unlockedPassageIds: PassageId[]
  completedQuestSteps: QuestStepId[]
  discoveredClueIds: ClueId[]
  deliveredDialogueIds: DialogueId[]
  studiedEnemyIds: string[]
  metEnemyIds: string[]
  puzzleStates: Record<PuzzleId, PuzzleState>
  flags: GameFlag[]
  lastSanctuaryId: AreaId
  activeCombat: CombatState | null
  /** The last few events, used for the inline "Letzte Ereignisse" list. */
  recentEvents: GameEvent[]
  /** The whole run's events, shown on the Tagebuch screen. */
  journal: GameEvent[]
  rngState: number
  turn: number
}

function newRunId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `run-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function startText(template: string, playerName: string): string {
  return template.replaceAll('{playerName}', playerName)
}

export function createNewGame(playerName: string, world: WorldDefinition): GameSave {
  const name = playerName.trim() || 'Abenteurerin'
  const firstEvent: GameEvent = {
    id: 'adventure-started',
    text: startText(world.start.eventText, name),
    turn: 0
  }

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    campaignId: world.campaignId,
    runId: newRunId(),
    playerName: name,
    currentAreaId: world.start.areaId,
    previousAreaId: null,
    player: {
      life: world.start.maxLife,
      maxLife: world.start.maxLife,
      equippedWeaponId: world.start.equippedWeaponId,
      equippedArmorId: world.start.equippedArmorId,
      equippedTalismanId: world.start.equippedTalismanId,
      weaponElementModes: { ...world.start.weaponElementModes },
      inventory: { ...world.start.inventory }
    },
    visitedAreaIds: [world.start.areaId],
    openedChestIds: [],
    defeatedEncounterIds: [],
    unlockedPassageIds: [],
    completedQuestSteps: [],
    discoveredClueIds: [],
    deliveredDialogueIds: [],
    studiedEnemyIds: [],
    metEnemyIds: [],
    puzzleStates: {},
    flags: [],
    lastSanctuaryId: world.start.areaId,
    activeCombat: null,
    recentEvents: [firstEvent],
    journal: [firstEvent],
    rngState: Math.floor(Math.random() * 2_147_483_647) || 1,
    turn: 0
  }
}
