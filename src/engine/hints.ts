import type { QuestViewDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'

export function hintId(quest: QuestViewDefinition, level: number): string {
  return `hinweis:${quest.id}:${quest.hintAreaIds?.join('+') ?? 'ziel'}:${level}`
}

export function getHintLevel(save: GameSave, quest: QuestViewDefinition): number {
  return [3, 2, 1].find((level) => save.deliveredDialogueIds.includes(hintId(quest, level))) ?? 0
}

export function getHintTexts(quest: QuestViewDefinition, hintSteps: Record<string, [string, string]> = {}): [string, string, string] {
  const opening = hintSteps[quest.id] ?? ['Sieh dir die Aufgabe noch einmal in Ruhe an.', 'Achte auf Hinweise an den Orten und auf Gegenstände, die du schon bei dir hast.']
  return [opening[0], opening[1], quest.hint]
}
