import type { ItemDefinition } from '../../domain/content'

/** Equipment, materials, progress items and tools introduced in Phase 4. */
export const kantaraPhase4Items: ItemDefinition[] = [
  {
    id: 'item_weapon_bootsspeer',
    name: 'Bootsspeer',
    kind: 'weapon',
    description: 'Suris vielseitiger Speer verbindet einen Wasserschwall mit einer Blitzspitze. Nasse Gegner werden vom Blitz besonders stark getroffen.',
    weapon: {
      minDamage: 3,
      maxDamage: 5,
      damageType: 'physical',
      elemental: { type: 'lightning', amount: 2 },
      trait: 'Blitzspitze für nasse Maschinen',
      skill: {
        id: 'schwallstoss',
        name: 'Schwallstoss',
        description: 'Setzt das Ziel drei Runden nass; danach klingt die Kunst zwei Runden ab.',
        cooldown: 2,
        effect: { kind: 'inflict', effectId: 'nass', duration: 3 }
      }
    }
  },
  {
    id: 'item_weapon_spulenhammer',
    name: 'Spulenhammer',
    kind: 'weapon',
    description: 'Jaros Werkzeughammer schlägt ungleichmässig, durchdringt aber einen Punkt Panzerung und kann eine Aufladung kurzschliessen.',
    weapon: {
      minDamage: 1,
      maxDamage: 7,
      damageType: 'physical',
      trait: 'Ein Punkt Panzerbruch',
      armorPiercing: 1,
      skill: {
        id: 'kurzschluss',
        name: 'Kurzschluss',
        description: 'Unterbricht die angekündigte Bewegung; danach klingt die Kunst zwei Runden ab.',
        cooldown: 2,
        effect: { kind: 'interrupt' }
      }
    }
  },
  {
    id: 'item_weapon_glassaebel',
    name: 'Glassäbel',
    kind: 'weapon',
    description: 'Eine ausgewogene Werkhofklinge mit hoher, verlässlicher Wuchtspanne.',
    weapon: { minDamage: 4, maxDamage: 6, damageType: 'physical', trait: 'Verlässliche Werkhofklinge' }
  },
  {
    id: 'item_weapon_prismenstab',
    name: 'Prismenstab',
    kind: 'weapon',
    description: 'Der Stab bündelt Feuer, Eis oder Licht. Sein Modus lässt sich nur an einem Rastplatz ändern.',
    weapon: {
      minDamage: 3,
      maxDamage: 5,
      damageType: 'physical',
      elemental: { choices: ['fire', 'ice', 'light'], amount: 2 },
      trait: 'Am Rastplatz zwischen Feuer, Eis und Licht umstellbar',
      skill: {
        id: 'prismenspur',
        name: 'Prismenspur',
        description: 'Bindet ein verborgenes oder fliegendes Ziel zwei Runden an eine sichtbare Lichtspur.',
        cooldown: 2,
        effect: { kind: 'inflict', effectId: 'verwurzelt', duration: 2 }
      }
    }
  },
  {
    id: 'item_weapon_blitzhammer',
    name: 'Blitzhammer',
    kind: 'weapon',
    description: 'Ein geerdeter Hammer mit kräftiger Blitzspule. Seine Entladung nutzt nasse Ziele besonders gut.',
    weapon: {
      minDamage: 2,
      maxDamage: 5,
      damageType: 'physical',
      elemental: { type: 'lightning', amount: 3 },
      trait: 'Starke Entladung gegen nasse Ziele',
      skill: { id: 'entladung', name: 'Entladung', description: 'Ein zusätzlicher Blitzschlag.', cooldown: 2, effect: { kind: 'burst', bonusDamage: 3, damageType: 'lightning' } }
    }
  },
  {
    id: 'item_armor_schottharnisch',
    name: 'Schottharnisch',
    kind: 'armor',
    description: 'Geschichtete Schottnieten schützen mit Panzerung 2 und halbieren Blitzschaden.',
    armor: { slot: 'body', defense: 2, protectsFrom: ['lightning'] }
  },
  {
    id: 'item_talisman_erdungsring',
    name: 'Erdungsring',
    kind: 'armor',
    description: 'Rikas Ring trägt Form und Blitzzeichen. Er halbiert Blitzschaden, ohne sich nur auf eine Farbe zu verlassen.',
    armor: { slot: 'talisman', defense: 0, protectsFrom: ['lightning'] }
  },
  { id: 'item_mat_schwemmholz', name: 'Schwemmholz', kind: 'quest', description: 'Trocken markiertes Holz aus dem Schilfkanal.' },
  { id: 'item_mat_schottniete', name: 'Schottniete', kind: 'quest', description: 'Eine wiederverwendbare Niete aus dem geöffneten Schottknacker.' },
  { id: 'item_mat_wasserfaser', name: 'Wasserfaser', kind: 'quest', description: 'Zähe Faser, die nur bei niedrigem Pegel sicher geerntet wird.' },
  { id: 'item_mat_spulendraht', name: 'Spulendraht', kind: 'quest', description: 'Entladener Kupferdraht für Speere, Hämmer und Speicher.' },
  { id: 'item_mat_segeltuch', name: 'Segeltuch', kind: 'quest', description: 'Trockenes, geprüftes Tuch aus der gesicherten Sturmwerft.' },
  { id: 'item_mat_werkzeugstahl', name: 'Werkzeugstahl', kind: 'quest', description: 'Stabiler Ausschussstahl aus dem geerdeten Blitzspeicher.' },
  { id: 'item_quest_deltastempel', name: 'Deltastempel', kind: 'quest', description: 'Der geprüfte Freigabestempel der Deltastation.' },
  { id: 'item_quest_werftstempel', name: 'Werftstempel', kind: 'quest', description: 'Der geprüfte Freigabestempel der Wolkenstation.' },
  { id: 'item_quest_prismenoeffner', name: 'Prismenöffner', kind: 'quest', description: 'Briks dreifacher Öffner gibt Feuer-, Eis- und Lichtweg gleichzeitig frei.' },
  { id: 'item_quest_warnfahnen', name: 'Warnfahnensatz', kind: 'quest', description: 'Kreis, Streifen und Dreieck in Rikas gelesener Warnreihenfolge.' },
  { id: 'item_shard_kanaldelta', name: 'Resonanzsplitter Kanaldelta', kind: 'quest', description: 'Ein singender Splitter aus dem gereinigten Schilfkanal.' },
  { id: 'item_shard_sturmwerft', name: 'Resonanzsplitter Sturmwerft', kind: 'quest', description: 'Ein singender Splitter aus dem gesicherten Gleiterkurs.' },
  { id: 'item_marke_03', name: 'Marke «Abendfähre»', kind: 'quest', description: 'Bos alte Marke für eine sorgfältig gelesene Nachtfahrt.' },
  { id: 'item_marke_04', name: 'Marke «Drachenpost»', kind: 'quest', description: 'Rikas Marke von ihrem ersten vollständigen Wetterbericht.' },
  { id: 'item_marke_05', name: 'Marke «Tunnelbrot»', kind: 'quest', description: 'Eine alte Versorgungsmarke der Bergungstrupps.' },
  {
    id: 'item_consume_erdungsband',
    name: 'Erdungsband',
    kind: 'healing',
    description: 'Ein einmaliger Blitzschutz aus der Drachenwerkstatt. Er halbiert den nächsten passenden Treffer.',
    healing: { lifeRestored: 1, combatEffect: { id: 'schutz:lightning', duration: 3 } }
  },
  { id: 'item_tool_pegelstab', name: 'Pegelstab', kind: 'tool', description: 'Bos beschrifteter Stab zeigt sichere Wasserstände und Rohrventile.' },
  { id: 'item_tool_erdungsklemme', name: 'Erdungsklemme', kind: 'tool', description: 'Eine nummerierte Klemme zum sicheren Entladen von Pfählen und Spulen.' },
  { id: 'item_tool_gleishaken', name: 'Gleishaken', kind: 'tool', description: 'Ein Bergungswerkzeug zum sicheren Stellen alter Frachtweichen.' },
  { id: 'item_tool_kernhalter', name: 'Dreifacher Kernhalter', kind: 'tool', description: 'Briks Halter bewahrt später drei Rückleitkerne getrennt und sicher auf.' }
]
