import type {
  AreaId,
  CampaignId,
  ChestId,
  ClueId,
  EncounterId,
  GameFlag,
  GameSave,
  ItemId,
  PassageId
} from './game'

export type RegionId = string
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'light' | 'shadow'
export type GearSlot = 'body' | 'talisman'

export interface RegionDefinition {
  id: RegionId
  name: string
}

export interface MapPosition {
  x: number
  y: number
}

export interface RestockDefinition {
  itemId: ItemId
  quantity: number
}

export interface CampaignStartDefinition {
  areaId: AreaId
  maxLife: number
  inventory: Record<ItemId, number>
  equippedWeaponId: ItemId | null
  equippedArmorId: ItemId | null
  equippedTalismanId: ItemId | null
  weaponElementModes?: Partial<Record<ItemId, DamageType>>
  eventText: string
  sanctuaryRestocks?: RestockDefinition[]
}

export interface CampaignPresentation {
  eyebrow: string
  title: string
  subtitle: string
  fallbackPlaceName: string
  emptyQuestTitle: string
  emptyQuestDescription: string
  introduction?: {
    eyebrow: string
    title: string
    lead: string
    story: string[]
    basics: { title: string; text: string }[]
    firstStep: string
  }
}

export interface ContentInventoryDefinition {
  areas: readonly AreaId[]
  passages: readonly PassageId[]
  items: readonly ItemId[]
  interactions: readonly string[]
  puzzles: readonly string[]
  enemies: readonly string[]
  encounters: readonly EncounterId[]
}

export interface QuestViewDefinition {
  id: string
  title: string
  description: string
  done: boolean
  current: boolean
  hint: string
  hintAreaIds?: string[]
}

export interface MainGoalDefinition {
  title: string
  description: string
}

export type ReminderStatus = 'missing' | 'ready' | 'done'

export interface ReminderStepDefinition {
  id: string
  label: string
  detail: string
  status: ReminderStatus
  areaId?: AreaId
}

export interface ReminderGroupDefinition {
  id: string
  title: string
  description: string
  steps: ReminderStepDefinition[]
}

export interface CampaignJournalDefinition {
  getQuestViews?(save: GameSave): QuestViewDefinition[]
  getMainGoal?(save: GameSave): MainGoalDefinition
  getReminderGroups?(save: GameSave): ReminderGroupDefinition[]
  hintSteps?: Record<string, [string, string]>
  cardNotes?: Record<string, string>
}

export interface RuleCardDefinition {
  id: string
  title: string
  description: string
  requirement: Requirement
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
  firstVisitRestocks?: RestockDefinition[]
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
  guardEncounterId?: EncounterId
}

export type ItemKind = 'weapon' | 'armor' | 'healing' | 'key' | 'tool' | 'quest'

export interface WeaponSkill {
  id: string
  name: string
  description: string
  cooldown: number
  effect:
    | { kind: 'burst'; bonusDamage: number; damageType: DamageType }
    | { kind: 'inflict'; effectId: string; duration: number }
    | { kind: 'interrupt' }
    | { kind: 'ward'; effectId: string; duration: number }
    | { kind: 'sweep' }
}

export interface ArmorDefinition {
  slot: GearSlot
  defense: number
  protectsFrom?: DamageType[]
  immuneTo?: DamageType[]
  penalty?: { kind: 'noFlee' | 'slowSkill'; text: string }
}

export interface ItemDefinition {
  id: ItemId
  name: string
  description: string
  kind: ItemKind
  weapon?: {
    minDamage: number
    maxDamage: number
    damageType: DamageType
    elemental?:
      | { type: DamageType; amount: number }
      | { choices: DamageType[]; amount: number }
    trait: string
    armorPiercing?: number
    bonusAgainstTag?: { tag: string; amount: number }
    skill?: WeaponSkill
  }
  armor?: ArmorDefinition
  healing?: {
    lifeRestored: number
    extraEffect?: string
    combatEffect?: { id: string; duration: number }
    clearsEffectIds?: string[]
  }
}

export type Requirement =
  | { kind: 'item'; itemId: ItemId; quantity?: number }
  | { kind: 'equipped'; slot: GearSlot | 'weapon'; itemId: ItemId }
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
  | { kind: 'equipItem'; itemId: ItemId }

export interface InteractionDefinition {
  id: string
  areaId: AreaId
  actionType: InteractionActionType
  label: string
  description: string
  resultText: string
  requirement?: Requirement
  visibilityRequirement?: Requirement
  completedWhen?: Requirement
  blockedText?: string
  effects: InteractionEffect[]
  chestId?: ChestId
  /** Makes a harvested source available again after the next rest. */
  restockAfterRest?: boolean
}

export type EnemyMoveKind = 'normal' | 'heavy' | 'guard' | 'charge' | 'shield' | 'heal'

export interface EnemyMoveDefinition {
  id: string
  name: string
  telegraph: string
  icon: string
  damage: number
  healAmount?: number
  kind: EnemyMoveKind
  defendNegates?: boolean
  vulnerableAfterDefend?: boolean
  defendOutcomeText?: string
  vulnerableText?: string
  damageType?: DamageType
  inflictedEffect?: { id: string; duration: number; text?: string }
}

export interface StatusEffectDefinition {
  id: string
  name: string
  icon: string
  description: string
  target: 'player' | 'enemy'
  perTurn?: { damage: number; damageType: DamageType }
  modifiers?: {
    playerAttackDelta?: number
    enemyDefenseDelta?: number
    skipEnemyTurn?: boolean
    addWeakness?: DamageType[]
    enemyStance?: 'normal' | 'guarded' | 'vulnerable'
    damageTakenDelta?: number
    groundsEnemy?: boolean
    protectsFrom?: DamageType[]
    damageMultiplier?: number
  }
  clearedByItemIds?: ItemId[]
  maximumDuration?: number
}

export interface EnemyDefinition {
  id: string
  name: string
  kind: 'normal' | 'boss'
  maxLife: number
  defense: number
  tags: string[]
  weakTo?: DamageType[]
  resistantTo?: DamageType[]
  immuneTo?: DamageType[]
  stealth?: boolean
  airborne?: boolean
  phaseTwoAtLife?: number
  phaseThresholds?: Record<number, number>
  phaseSealItemIds?: Record<number, ItemId>
  sealPlacementText?: Record<number, string>
  finalSealText?: string
  finalAction?: { prompt: string; label: string; spokenText: string }
  movesByPhase: Record<number, EnemyMoveDefinition[]>
}

export interface EncounterDefinition {
  id: EncounterId
  areaId: AreaId
  enemyIds: string[]
  label: string
  description: string
  fleeAreaId: AreaId
  victoryText: string
  rewardEffects: InteractionEffect[]
  requiredGear?: Requirement
  gearWarning?: string
}

export interface WorldDefinition {
  campaignId: CampaignId
  presentation: CampaignPresentation
  contentInventory?: ContentInventoryDefinition
  regions: RegionDefinition[]
  start: CampaignStartDefinition
  completionRequirement: Requirement
  mapRevealRequirement?: Requirement
  statusEffects?: StatusEffectDefinition[]
  journal?: CampaignJournalDefinition
  ruleCards?: RuleCardDefinition[]
  storyBeats?: { id: string; requirement: Requirement; text: string }[]
  puzzles?: PuzzleDefinition[]
  areas: AreaDefinition[]
  passages: PassageDefinition[]
  items: ItemDefinition[]
  interactions: InteractionDefinition[]
  enemies: EnemyDefinition[]
  encounters: EncounterDefinition[]
}

export interface PuzzleDefinition {
  id: string
  kind?: 'controls' | 'sequence' | 'pairing' | 'ordering' | 'grid' | 'reading' | 'weighing'
  areaId: AreaId
  interactionId?: string
  completion?: {
    label: string
    description: string
    resultText: string
    effects: InteractionEffect[]
  }
  title: string
  hint: string
  hints?: [string, string, string]
  controls: { id: string; label: string; options: string[]; initial: number; solution: number }[]
  sequence?: { options: string[]; solution: number[] }
  pairing?: {
    left: { id: string; label: string }[]
    right: { id: string; label: string }[]
    solution: Record<string, string>
  }
  ordering?: {
    items: { id: string; label: string }[]
    solution: string[]
  }
  grid?: {
    width: number
    height: number
    start: number
    goal: number
    blocked?: number[]
    solution: number[]
  }
  reading?: {
    sourceTitle: string
    sourceText: string
    prompts: { id: string; label: string; options: string[]; solution: number }[]
  }
  weighing?: {
    leftLabel: string
    rightLabel: string
    items: { id: string; label: string; weight: number }[]
    solution: Record<string, 'left' | 'right' | 'off'>
  }
  maxOpenControls?: number
}
