import type { AreaId, ChestId, ClueId, EncounterId, GameFlag, ItemId, PassageId } from './game'

export type RegionId =
  | 'sonnenmark'
  | 'wisperwald'
  | 'spiegelkueste'
  | 'donnerhoehe'
  | 'verbindungswege'
  | 'jenseits_des_tors'

export interface MapPosition {
  x: number
  y: number
}

export interface AreaDefinition {
  id: AreaId
  name: string
  regionId: RegionId
  regionName: string
  safe: boolean
  sanctuaryRequirement?: Requirement
  mapPosition: MapPosition
  firstDescription: string
  revisitDescription: string
  inspectText: string
  /** First matching state takes precedence, including on a first visit. */
  variants?: { requirement: Requirement; description: string; inspectText?: string }[]
}

export interface PassageDefinition {
  id: PassageId
  fromAreaId: AreaId
  toAreaId: AreaId
  labelFrom: string
  labelTo: string
  requirement?: Requirement
  blockedText?: string
  shortcut?: boolean
}

export type ItemKind = 'weapon' | 'healing' | 'key' | 'tool' | 'quest'

export interface ItemDefinition {
  id: ItemId
  name: string
  description: string
  kind: ItemKind
  weapon?: {
    minDamage: number
    maxDamage: number
    trait: string
    armorPiercing?: number
    bonusAgainstTag?: { tag: string; amount: number }
  }
  healing?: {
    lifeRestored: number
    extraEffect?: string
    combatEffect?: { id: string; duration: number }
  }
}

export type Requirement =
  | { kind: 'item'; itemId: ItemId; quantity?: number }
  | { kind: 'flag'; flag: GameFlag }
  | { kind: 'clue'; clueId: ClueId }
  | { kind: 'all'; requirements: Requirement[] }
  | { kind: 'any'; requirements: Requirement[] }

export type InteractionActionType = 'TAKE_ITEM' | 'OPEN_CHEST' | 'COMPLETE_INTERACTION'

export type InteractionEffect =
  | { kind: 'addItem'; itemId: ItemId; quantity: number }
  | { kind: 'removeItem'; itemId: ItemId; quantity: number }
  | { kind: 'setFlag'; flag: GameFlag }
  | { kind: 'discoverClue'; clueId: ClueId }
  | { kind: 'unlockPassage'; passageId: PassageId }

export interface InteractionDefinition {
  id: string
  areaId: AreaId
  actionType: InteractionActionType
  label: string
  description: string
  resultText: string
  requirement?: Requirement
  visibilityRequirement?: Requirement
  blockedText?: string
  effects: InteractionEffect[]
  chestId?: ChestId
}

export type EnemyMoveKind = 'normal' | 'heavy' | 'guard'

export interface EnemyMoveDefinition {
  id: string
  name: string
  telegraph: string
  icon: string
  damage: number
  kind: EnemyMoveKind
  defendNegates?: boolean
  vulnerableAfterDefend?: boolean
  damageType?: 'lightning'
  inflictedEffect?: { id: string; duration: number }
}

export interface EnemyDefinition {
  id: string
  name: string
  kind: 'normal' | 'boss'
  maxLife: number
  defense: number
  tags: string[]
  shadowArmor?: boolean
  airborne?: boolean
  phaseTwoAtLife?: number
  phaseThresholds?: Record<number, number>
  phaseSealItemIds?: Record<number, ItemId>
  movesByPhase: Record<number, EnemyMoveDefinition[]>
}

export interface EncounterDefinition {
  id: EncounterId
  areaId: AreaId
  enemyId: string
  label: string
  description: string
  fleeAreaId: AreaId
  victoryText: string
  rewardEffects: InteractionEffect[]
}

export interface WorldDefinition {
  storyBeats?: { id: string; requirement: Requirement; text: string }[]
  puzzles?: PuzzleDefinition[]
  areas: AreaDefinition[]
  passages: PassageDefinition[]
  items: ItemDefinition[]
  interactions: InteractionDefinition[]
  enemies: EnemyDefinition[]
  encounters: EncounterDefinition[]
  startAreaId: AreaId
  sliceGoalFlag: GameFlag
}

export interface PuzzleDefinition {
  id: string
  areaId: AreaId
  interactionId: string
  title: string
  hint: string
  controls: { id: string; label: string; options: string[]; initial: number; solution: number }[]
  sequence?: { options: string[]; solution: number[] }
  maxOpenControls?: number
}
