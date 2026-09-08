export const SAVE_SCHEMA_VERSION = 5
export const CONTENT_VERSION = 5

/** Upper bound so a very long run cannot grow the save without limit. */
export const JOURNAL_LIMIT = 1000

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

export interface CombatState {
  encounterId: EncounterId
  enemyLife: number
  enemyMaxLife: number
  phase: number
  announcedMoveId: string
  round: number
  enemyStance: 'normal' | 'guarded' | 'vulnerable'
  entryMode: 'normal' | 'early-boss' | 'prepared-boss'
  canFlee: boolean
  pendingSealItemId: ItemId | null
  placedSealItemIds: ItemId[]
  awaitingFinalPromise: boolean
  effects: Array<{
    id: string
    remainingEnemyTurns: number
  }>
}

export interface GameEvent {
  id: string
  text: string
  turn: number
}

export interface GameSave {
  schemaVersion: number
  contentVersion: number
  runId: string
  playerName: string
  currentAreaId: AreaId
  previousAreaId: AreaId | null
  player: {
    life: number
    maxLife: number
    equippedWeaponId: ItemId | null
    inventory: Record<ItemId, number>
  }
  visitedAreaIds: AreaId[]
  openedChestIds: ChestId[]
  defeatedEncounterIds: EncounterId[]
  unlockedPassageIds: PassageId[]
  completedQuestSteps: QuestStepId[]
  discoveredClueIds: ClueId[]
  deliveredDialogueIds: DialogueId[]
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

export function createNewGame(playerName: string): GameSave {
  const name = playerName.trim() || 'Abenteurerin'
  const firstEvent: GameEvent = { id: 'adventure-started', text: `${name}, Tessa gibt dir ein Reiseschwert, eine Laterne und drei Apfelbrote. «Die Wachen schützen die Menschen hier. Du kennst unsere Karten und kannst Kuno hören. Schau mit ihm im Tempel am Drei-Wege-Platz nach. Wenn eine Gefahr zu gross ist, kehrst du zu mir zurück.»`, turn: 0 }

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    contentVersion: CONTENT_VERSION,
    runId: newRunId(),
    playerName: name,
    currentAreaId: 'sonnenwacht',
    previousAreaId: null,
    player: {
      life: 20,
      maxLife: 20,
      equippedWeaponId: 'reiseschwert',
      inventory: {
        reiseschwert: 1,
        laterne: 1,
        apfelbrot: 3
      }
    },
    visitedAreaIds: ['sonnenwacht'],
    openedChestIds: [],
    defeatedEncounterIds: [],
    unlockedPassageIds: [],
    completedQuestSteps: [],
    discoveredClueIds: [],
    deliveredDialogueIds: [],
    puzzleStates: {},
    flags: [],
    lastSanctuaryId: 'sonnenwacht',
    activeCombat: null,
    recentEvents: [firstEvent],
    journal: [firstEvent],
    rngState: Math.floor(Math.random() * 2_147_483_647) || 1,
    turn: 0
  }
}
