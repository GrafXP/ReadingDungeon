import type { WorldDefinition } from '../../domain/content'
import { kantaraInventory } from './kantaraInventory'

/**
 * Phase 1's deliberately small Kantara scaffold. Later content phases fill this
 * module from the inventory contract in STORY_BIBLE_V2.md; no Talora content is
 * used as a fallback for a missing entry.
 */
export const kantaraWorld: WorldDefinition = {
  campaignId: 'kantara',
  presentation: {
    eyebrow: 'Ein Abenteuer in Kantara',
    title: 'Kantara und das Grosse Wechselwerk',
    subtitle: 'Eine falsche Zustellung bringt das grosse Werk durcheinander. Lies genau, hilf den Regionen und leite ihre Kräfte zurück.',
    fallbackPlaceName: 'Kantara',
    emptyQuestTitle: 'Prüfe die Übungspakete',
    emptyQuestDescription: 'Untersuche zuerst den Kurierhof. Die vollständige Prologaufgabe folgt mit dem Kesselbrück-Vertikalschnitt.'
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
      item_weapon_kurierklinge: 1,
      item_armor_kurierwams: 1,
      item_quest_uebungsstempel: 1,
      item_consume_grundproviant: 3
    },
    equippedWeaponId: 'item_weapon_kurierklinge',
    equippedArmorId: 'item_armor_kurierwams',
    equippedTalismanId: null,
    eventText: '{playerName}, am Morgen des Tauschfests sortierst du im Kurierhof drei Übungspakete. Klick prüft jedes Etikett zweimal, während Meral den sicheren Lieferweg erklärt. Noch ahnt niemand, dass aus der Sortierhalle gleich die erste falsche Fracht zurückkehren wird.',
    sanctuaryRestocks: [{ itemId: 'item_consume_grundproviant', quantity: 3 }]
  },
  completionRequirement: { kind: 'flag', flag: 'kantara_abgeschlossen' },
  areas: [
    {
      id: 'kb_kurierhof',
      name: 'Kurierhof',
      regionId: 'kesselbrueck',
      regionName: 'Kesselbrück',
      safe: true,
      mapPosition: { x: 500, y: 420 },
      firstDescription: 'Unter gestreiften Marktsegeln warten drei Übungspakete auf ihre Zustellung. Auf jedem Etikett stehen Ziel, Inhalt und Warnzeichen. Meral hält die freie Rückkehrtafel bereit; der kleine Paketkäfer Klick fährt prüfend an den Zeilen entlang.',
      revisitDescription: 'Im Kurierhof stehen die Übungspakete weiter auf dem niedrigen Sortiertisch. Merals Rückkehrtafel und der Rastplatz bleiben frei zugänglich.',
      inspectText: 'Die drei Etiketten sind vollständig lesbar. Klick tippt auf die Zeilen: «Erst Ziel, dann Inhalt, dann Warnzeichen. Wenn etwas nicht zusammenpasst, fragen wir nach.»'
    }
  ],
  passages: [],
  items: [
    {
      id: 'item_weapon_kurierklinge', name: 'Kurierklinge', kind: 'weapon',
      description: 'Eine leichte, verlässliche Klinge aus dem Kurierhof.',
      weapon: { minDamage: 2, maxDamage: 4, damageType: 'physical', trait: 'Verlässliche Grundwaffe' }
    },
    {
      id: 'item_armor_kurierwams', name: 'Kurierwams', kind: 'armor',
      description: 'Ein bewegliches Wams mit verstärkten Nähten.',
      armor: { slot: 'body', defense: 1 }
    },
    {
      id: 'item_quest_uebungsstempel', name: 'Übungsstempel', kind: 'quest',
      description: 'Ein nicht registrierter Stempel für die Übungswege des Kurierhofs.'
    },
    {
      id: 'item_consume_grundproviant', name: 'Grundproviant', kind: 'healing',
      description: 'Erneuerbarer Reiseproviant von einem sicheren Rastplatz.',
      healing: { lifeRestored: 5 }
    }
  ],
  interactions: [],
  enemies: [],
  encounters: []
}
