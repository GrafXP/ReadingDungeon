import type { ItemDefinition } from '../../domain/content'

export const kantaraPhase3Items: ItemDefinition[] = [
  {
    id: 'item_weapon_kurierklinge',
    name: 'Kurierklinge',
    kind: 'weapon',
    description: 'Eine leichte, verlässliche Klinge aus deinem beschrifteten Spind im Kurierhof.',
    weapon: { minDamage: 2, maxDamage: 4, damageType: 'physical', trait: 'Verlässliche Grundwaffe' }
  },
  {
    id: 'item_weapon_astbeil',
    name: 'Astbeil',
    kind: 'weapon',
    description: 'Briks Werkzeug für überwachsene Seilwege. Sein Kapphieb trennt eine angekündigte Aufladung.',
    weapon: {
      minDamage: 2,
      maxDamage: 6,
      damageType: 'physical',
      trait: 'Breite Schneide für Ranken und gespannte Seile',
      skill: {
        id: 'kapphieb',
        name: 'Kapphieb',
        description: 'Unterbricht die angekündigte Bewegung; danach klingt die Kunst zwei Runden ab.',
        cooldown: 2,
        effect: { kind: 'interrupt' }
      }
    }
  },
  {
    id: 'item_armor_kurierwams',
    name: 'Kurierwams',
    kind: 'armor',
    description: 'Ein bewegliches Wams mit verstärkten Nähten.',
    armor: { slot: 'body', defense: 1 }
  },
  {
    id: 'item_armor_rindenpanzer',
    name: 'Rindenpanzer',
    kind: 'armor',
    description: 'Geschichtete Rinde schützt stärker als das Kurierwams und halbiert Eisschaden.',
    armor: { slot: 'body', defense: 2, protectsFrom: ['ice'] }
  },
  {
    id: 'item_mat_astholz',
    name: 'Astholz',
    kind: 'quest',
    description: 'Tragfähiger Verschnitt aus Inas beschriftetem Korb. Wird für Werkzeuge und Brückenseile gebraucht.'
  },
  {
    id: 'item_mat_rankenseil',
    name: 'Rankenseil',
    kind: 'quest',
    description: 'Eine alte, lose Ranke, die laut Ernteschild als Seil verwendet werden darf.'
  },
  {
    id: 'item_mat_blaetterharz',
    name: 'Blätterharz',
    kind: 'quest',
    description: 'Klares Harz von einer ausgewachsenen Fruchtranke.'
  },
  {
    id: 'item_quest_uebungsstempel',
    name: 'Übungsstempel',
    kind: 'quest',
    description: 'Dein nicht registrierter Stempel für die sicheren Übungswege des Kurierhofs.'
  },
  {
    id: 'item_quest_medizinkiste',
    name: 'Medikamentenkiste',
    kind: 'quest',
    description: 'Eine Hilfslieferung mit Wellenzeichen für das Wassertor.'
  },
  {
    id: 'item_quest_blaetterstempel',
    name: 'Blätterstempel',
    kind: 'quest',
    description: 'Der geprüfte Freigabestempel der Kronenstation.'
  },
  {
    id: 'item_shard_kesselbrueck',
    name: 'Resonanzsplitter Kesselbrück',
    kind: 'quest',
    description: 'Ein singender Splitter aus einem Nest falscher Etiketten über den Dächern.'
  },
  {
    id: 'item_shard_blaetterdaecher',
    name: 'Resonanzsplitter Blätterdächer',
    kind: 'quest',
    description: 'Ein Splitter aus der ausgewogenen Obstlieferung.'
  },
  {
    id: 'item_marke_01',
    name: 'Marke «Erste Dachpost»',
    kind: 'quest',
    description: 'Eine alte Liefermarke aus der Zeit, bevor das Wechselwerk die Wege sortierte.'
  },
  {
    id: 'item_marke_02',
    name: 'Marke «Zwei Birnenkisten»',
    kind: 'quest',
    description: 'Inas alte Marke für einen genau ausgewogenen Seiltransport.'
  },
  {
    id: 'item_consume_grundproviant',
    name: 'Grundproviant',
    kind: 'healing',
    description: 'Erneuerbarer Reiseproviant von einem sicheren Rastplatz.',
    healing: { lifeRestored: 5 }
  },
  {
    id: 'item_consume_klarwasser',
    name: 'Klarwasser',
    kind: 'healing',
    description: 'Klares Wasser gegen Benebelung und Versengung.',
    healing: { lifeRestored: 3, clearsEffectIds: ['benebelt', 'versengt'] }
  },
  {
    id: 'item_consume_kuehlkompresse',
    name: 'Kühlkompresse',
    kind: 'healing',
    description: 'Eine kühle Auflage, die Versengung beendet.',
    healing: { lifeRestored: 2, clearsEffectIds: ['versengt'] }
  },
  {
    id: 'item_consume_obstbrot',
    name: 'Obstbrot',
    kind: 'healing',
    description: 'Kräftiges Brot von der Obstterrasse.',
    healing: { lifeRestored: 8 }
  },
  {
    id: 'item_tool_etikettenlupe',
    name: 'Etikettenlupe',
    kind: 'tool',
    description: 'Klicks ausklappbare Lupe macht kleine Warnwörter und Frachtzeichen deutlich lesbar.'
  },
  {
    id: 'item_tool_werkhofbuch',
    name: 'Werkhofbuch',
    kind: 'tool',
    description: 'Briks Verzeichnis zeigt nur geprüfte Rezepte, ihre Quellen und den Ausrüstungsvergleich.'
  }
]
