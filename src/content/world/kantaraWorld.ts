import type { WorldDefinition } from '../../domain/content'
import { KANTARA_STATUS_EFFECTS } from '../../engine/statusEffects'
import { kantaraInventory } from './kantaraInventory'
import { kantaraPhase3Enemies, kantaraPhase3Encounters } from './kantaraPhase3Combat'
import { kantaraPhase3Interactions } from './kantaraPhase3Interactions'
import { kantaraPhase3Items } from './kantaraPhase3Items'
import { kantaraPhase3Journal, kantaraPhase3RuleCards, kantaraPhase3StoryBeats } from './kantaraPhase3Journal'
import { kantaraPhase3Areas, kantaraPhase3Passages } from './kantaraPhase3Places'
import { kantaraPhase3Puzzles } from './kantaraPhase3Puzzles'

/**
 * Active Kantara campaign. Phase 3 provides the complete Kesselbrück and
 * Blätterdächer vertical slice; later regions remain explicit inventory gaps.
 */
export const kantaraWorld: WorldDefinition = {
  campaignId: 'kantara',
  presentation: {
    eyebrow: 'Ein Abenteuer in Kantara',
    title: 'Kantara und das Grosse Wechselwerk',
    subtitle: 'Eine falsche Zustellung bringt das grosse Werk durcheinander. Lies genau, hilf den Regionen und leite ihre Kräfte zurück.',
    fallbackPlaceName: 'Kantara',
    emptyQuestTitle: 'Prüfe die Übungspakete',
    emptyQuestDescription: 'Untersuche den Kurierhof und beginne mit Merals sicherer Etikettenübung.',
    introduction: {
      eyebrow: 'Bevor du losgehst',
      title: 'Ein Auftrag für Kantara',
      lead: '{playerName}, heute beginnt dein erster eigener Weg als Kurierkind.',
      story: [
        'In Kantara verbindet das Grosse Wechselwerk neun sehr verschiedene Regionen. Es leitet Pakete, Nachrichten und die Kräfte der Natur an den richtigen Ort.',
        'Am Morgen des Tauschfests gerät etwas durcheinander: Lieferungen landen am falschen Ziel und sichere Wege verriegeln sich. Noch weiss niemand, welcher Auftrag den Fehler ausgelöst hat.',
        'Kuriermeisterin Meral bittet dich um Hilfe. Der kleine Paketkäfer Klick liest mit dir jedes Etikett. Gemeinsam prüft ihr Hinweise, helft den Menschen der Regionen und öffnet ihre Wege wieder.'
      ],
      basics: [
        { title: 'Lies und untersuche', text: 'Der Ortstext verrät dir, was wichtig ist. Erst nach dem Untersuchen werden Wege, Rätsel und Begegnungen sichtbar.' },
        { title: 'Bereite dich vor', text: 'Lege Ausrüstung ausserhalb eines Kampfes an. Beobachte Gefahren und achte auf ihre angekündigte nächste Bewegung.' },
        { title: 'Kehre sicher zurück', text: 'An Rastplätzen erholst du dich. Bei Flucht oder Rettung behältst du deine Funde und kannst es später erneut versuchen.' }
      ],
      firstStep: 'Beginne im Kurierhof: Klappe Klick auf, öffne deinen beschrifteten Spind und folge dann Merals Übungsauftrag.'
    }
  },
  contentInventory: kantaraInventory,
  regions: [
    { id: 'kesselbrueck', name: 'Kesselbrück' },
    { id: 'blaetterdaecher', name: 'Blätterdächer' },
    { id: 'kanaldelta', name: 'Kanaldelta' },
    { id: 'sturmwerft', name: 'Sturmwerft' },
    { id: 'wechselgaenge', name: 'Wechselgänge' },
    { id: 'glascaldera', name: 'Glascaldera' },
    { id: 'frostobservatorium', name: 'Frostobservatorium' },
    { id: 'laternenmoor', name: 'Laternenmoor' },
    { id: 'zentralwerk', name: 'Zentralwerk' }
  ],
  start: {
    areaId: 'kb_kurierhof',
    maxLife: 20,
    inventory: {
      item_quest_uebungsstempel: 1,
      item_consume_grundproviant: 3
    },
    equippedWeaponId: null,
    equippedArmorId: null,
    equippedTalismanId: null,
    eventText: '{playerName}, am Morgen des Tauschfests warten drei Übungspakete im Kurierhof. Meral hält den sicheren Weg frei. Neben deinem Spind liegt der zusammengefaltete Paketkäfer Klick.',
    sanctuaryRestocks: [{ itemId: 'item_consume_grundproviant', quantity: 3 }]
  },
  completionRequirement: { kind: 'flag', flag: 'kantara_abgeschlossen' },
  statusEffects: KANTARA_STATUS_EFFECTS,
  journal: kantaraPhase3Journal,
  ruleCards: kantaraPhase3RuleCards,
  storyBeats: kantaraPhase3StoryBeats,
  puzzles: kantaraPhase3Puzzles,
  areas: kantaraPhase3Areas,
  passages: kantaraPhase3Passages,
  items: kantaraPhase3Items,
  interactions: kantaraPhase3Interactions,
  enemies: kantaraPhase3Enemies,
  encounters: kantaraPhase3Encounters
}
