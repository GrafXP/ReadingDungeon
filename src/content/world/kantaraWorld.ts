import type { WorldDefinition } from '../../domain/content'
import { kantaraInventory } from './kantaraInventory'
import { KANTARA_STATUS_EFFECTS } from '../../engine/statusEffects'

/**
 * Phase 2's deliberately small Kantara foundation. Later content phases fill
 * this module from the inventory contract in STORY_BIBLE_V2.md; no Talora
 * content is used as a fallback for a missing entry.
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
  statusEffects: KANTARA_STATUS_EFFECTS,
  puzzles: [{
    id: 'puz_kb_uebungsetiketten',
    kind: 'pairing',
    areaId: 'kb_sortierhalle',
    completion: {
      label: 'Ordne die Übungspakete zu',
      description: 'Prüfe die drei Etiketten und bestätige die Zuordnung.',
      resultText: 'Alle drei Pakete stehen beim richtigen Ziel. Klick speichert die Leseregel: erst prüfen, dann handeln.',
      effects: [{ kind: 'setFlag', flag: 'uebungsetiketten_geloest' }]
    },
    title: 'Die drei Übungsetiketten',
    hint: 'Lies bei jedem Paket Ziel, Inhalt und Warnzeichen.',
    hints: [
      'Vergleiche zuerst die Merkmale auf den drei Zetteln.',
      'Das Warnzeichen verrät, welches Fach oder Ziel sicher ist.',
      'Beeren gehören ins Kühlfach, die Spule in die Werftkiste und die Medizin zum Wassertor.'
    ],
    controls: [],
    pairing: {
      left: [
        { id: 'beeren', label: 'Beerenpaket · kühl halten' },
        { id: 'spule', label: 'Ersatzspule · trocken halten' },
        { id: 'medizin', label: 'Medizinkiste · Wellenzeichen' }
      ],
      right: [
        { id: 'kuehlfach', label: 'Kühlfach' },
        { id: 'werftkiste', label: 'Werftkiste' },
        { id: 'wassertor', label: 'Wassertor' }
      ],
      solution: { beeren: 'kuehlfach', spule: 'werftkiste', medizin: 'wassertor' }
    }
  }],
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
    },
    {
      id: 'kb_sortierhalle',
      name: 'Sortierhalle',
      regionId: 'kesselbrueck',
      regionName: 'Kesselbrück',
      safe: false,
      mapPosition: { x: 610, y: 420 },
      firstDescription: 'Drei Übungszettel liegen offen auf dem Sortierpult: Beeren müssen kühl bleiben, eine Ersatzspule muss trocken in die Werftkiste und die Medizin mit Wellenzeichen gehört zum Wassertor.',
      revisitDescription: 'Die drei Übungsetiketten liegen weiterhin vollständig lesbar auf dem Sortierpult.',
      inspectText: 'Klick fährt jede Zeile ab. Ziel, Inhalt und Warnzeichen sind sichtbar, bevor du das erste Paket zuordnest.'
    }
  ],
  passages: [{
    id: 'v001',
    fromAreaId: 'kb_kurierhof',
    toAreaId: 'kb_sortierhalle',
    labelFrom: 'Gehe zu Merals Übungsauftrag',
    labelTo: 'Kehre in den Kurierhof zurück'
  }],
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
    },
    {
      id: 'item_consume_klarwasser', name: 'Klarwasser', kind: 'healing',
      description: 'Klares Wasser gegen Benebelung und Versengung.',
      healing: { lifeRestored: 3, clearsEffectIds: ['benebelt', 'versengt'] }
    },
    {
      id: 'item_consume_kuehlkompresse', name: 'Kühlkompresse', kind: 'healing',
      description: 'Eine kühle Auflage, die Versengung beendet.',
      healing: { lifeRestored: 2, clearsEffectIds: ['versengt'] }
    }
  ],
  interactions: [],
  enemies: [],
  encounters: []
}
