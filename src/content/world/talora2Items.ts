import type { ItemDefinition } from '../../domain/content'

export const talora2Items: ItemDefinition[] = [
  {
    id: 'item_weapon_reiseschwert', name: 'Reiseschwert', kind: 'weapon',
    description: 'Eine verlässliche Klinge. Ruhiger Hieb verursacht zwei zusätzliche Punkte Wuchtschaden.',
    weapon: { minDamage: 2, maxDamage: 4, damageType: 'physical', trait: 'Einfach und verlässlich.', skill: { id: 'skill_ruhiger_hieb', name: 'Ruhiger Hieb', description: '+2 Wucht.', cooldown: 3, effect: { kind: 'burst', bonusDamage: 2, damageType: 'physical' } } }
  },
  {
    id: 'item_weapon_astbeil', name: 'Astbeil', kind: 'weapon', description: 'Kappt Ranken und stoppt eine angekündigte Aufladung.',
    weapon: { minDamage: 2, maxDamage: 6, damageType: 'physical', trait: '+2 gegen Ranken.', bonusAgainstTag: { tag: 'ranken', amount: 2 }, skill: { id: 'skill_kapphieb', name: 'Kapphieb', description: 'Unterbricht eine Aufladung.', cooldown: 3, effect: { kind: 'interrupt' } } }
  },
  {
    id: 'item_weapon_wellenspeer', name: 'Wellenspeer', kind: 'weapon', description: 'Sein Schwall macht Gegner nass und damit schwach gegen Eis und Blitz.',
    weapon: { minDamage: 3, maxDamage: 5, damageType: 'physical', elemental: { type: 'lightning', amount: 2 }, trait: 'Trägt einen kleinen Blitz.', skill: { id: 'skill_schwallstoss', name: 'Schwallstoss', description: 'Macht den Gegner drei Runden nass.', cooldown: 3, effect: { kind: 'inflict', effectId: 'nass', duration: 3 } } }
  },
  {
    id: 'item_weapon_donnerhammer', name: 'Donnerhammer', kind: 'weapon', description: 'Ein schwerer Hammer, der einen Punkt Panzerung durchdringt.',
    weapon: { minDamage: 1, maxDamage: 7, damageType: 'physical', armorPiercing: 1, trait: 'Durchdringt einen Punkt Panzerung.', skill: { id: 'skill_kurzschluss', name: 'Kurzschluss', description: 'Unterbricht eine Aufladung.', cooldown: 3, effect: { kind: 'interrupt' } } }
  },
  {
    id: 'item_weapon_alvas_klinge', name: 'Alvas Klinge', kind: 'weapon', description: 'Am Rastplatz stellst du sie auf Feuer, Eis oder Licht.',
    weapon: { minDamage: 3, maxDamage: 5, damageType: 'physical', elemental: { choices: ['fire', 'ice', 'light'], amount: 2 }, trait: 'Wechselt am Rastplatz ihr Licht.', skill: { id: 'skill_lichtspur', name: 'Lichtspur', description: '+3 Lichtschaden. Trifft nur bei offener Deckung.', cooldown: 3, effect: { kind: 'burst', bonusDamage: 3, damageType: 'light' } } }
  },
  {
    id: 'item_weapon_glutsaebel', name: 'Glutsäbel', kind: 'weapon', description: 'Eine warme Klinge, deren Brandhieb weiterbrennt.',
    weapon: { minDamage: 3, maxDamage: 5, damageType: 'physical', elemental: { type: 'fire', amount: 3 }, trait: 'Trägt Feuer.', skill: { id: 'skill_brandhieb', name: 'Brandhieb', description: 'Der Gegner brennt drei Runden.', cooldown: 3, effect: { kind: 'inflict', effectId: 'brennt', duration: 3 } } }
  },
  {
    id: 'item_weapon_frostlanze', name: 'Frostlanze', kind: 'weapon', description: 'Eine kalte Lanze, die einen Gegner kurz einfriert.',
    weapon: { minDamage: 2, maxDamage: 6, damageType: 'physical', elemental: { type: 'ice', amount: 3 }, trait: 'Trägt Eis.', skill: { id: 'skill_frostgriff', name: 'Frostgriff', description: 'Der Gegner setzt eine Runde aus.', cooldown: 4, effect: { kind: 'inflict', effectId: 'gefroren', duration: 1 } } }
  },
  {
    id: 'item_weapon_laternenstab', name: 'Laternenstab', kind: 'weapon', description: 'Sein Licht trifft viele Schatten besonders stark. Das Netz hält fliegende Gegner am Boden.',
    weapon: { minDamage: 2, maxDamage: 4, damageType: 'physical', elemental: { type: 'light', amount: 2 }, trait: 'Trägt Licht gegen Schatten.', skill: { id: 'skill_lichtnetz', name: 'Lichtnetz', description: 'Hält den Gegner zwei Runden am Boden. Er kann weiterhin angreifen.', cooldown: 3, effect: { kind: 'inflict', effectId: 'verwurzelt', duration: 2 } } }
  },
  {
    id: 'item_weapon_mondstab', name: 'Mondstab', kind: 'weapon', description: 'Ein stiller Stab mit Schattenkraft. Mondschirm schützt vor einem Lichttreffer.',
    weapon: { minDamage: 2, maxDamage: 4, damageType: 'physical', elemental: { type: 'shadow', amount: 3 }, trait: 'Trägt Schattenkraft.', skill: { id: 'skill_mondschirm', name: 'Mondschirm', description: 'Halbiert den nächsten Lichttreffer innerhalb von zwei Runden.', cooldown: 3, effect: { kind: 'ward', effectId: 'schutz:light', duration: 2 } } }
  },
  {
    id: 'item_weapon_waechterbogen', name: 'Wächterbogen', kind: 'weapon', description: 'Trifft fliegende Gegner besonders gut.',
    weapon: { minDamage: 3, maxDamage: 6, damageType: 'physical', bonusAgainstTag: { tag: 'fliegend', amount: 2 }, trait: '+2 gegen fliegende Gegner.', skill: { id: 'skill_weitschuss', name: 'Weitschuss', description: '+3 Wucht.', cooldown: 3, effect: { kind: 'burst', bonusDamage: 3, damageType: 'physical' } } }
  },
  {
    id: 'item_weapon_sternenhammer', name: 'Sternenhammer', kind: 'weapon', description: 'Ein heller Hammer für starke Panzer.',
    weapon: { minDamage: 4, maxDamage: 6, damageType: 'physical', elemental: { type: 'light', amount: 2 }, armorPiercing: 1, trait: 'Trägt Licht und bricht Panzer.', skill: { id: 'skill_sternstoss', name: 'Sternstoss', description: '+4 Licht.', cooldown: 4, effect: { kind: 'burst', bonusDamage: 4, damageType: 'light' } } }
  },
  {
    id: 'item_weapon_wegklinge', name: 'Wegklinge', kind: 'weapon', description: 'Eine seltene Klinge mit fünf wählbaren Elementen. Ihr Wegkreis trifft den anvisierten Gegner.',
    weapon: { minDamage: 3, maxDamage: 6, damageType: 'physical', elemental: { choices: ['fire', 'ice', 'lightning', 'light', 'shadow'], amount: 3 }, trait: 'Wechselt am Rastplatz ihr Element.', skill: { id: 'skill_wegkreis', name: 'Wegkreis', description: 'Greift den anvisierten Gegner mit dem gewählten Element an.', cooldown: 4, effect: { kind: 'sweep' } } }
  },

  { id: 'item_armor_reisewams', name: 'Reisewams', kind: 'armor', description: 'Leicht und bequem. Es gibt einen Punkt Panzerung.', armor: { slot: 'body', defense: 1 } },
  { id: 'item_armor_rindenpanzer', name: 'Rindenpanzer', kind: 'armor', description: 'Zwei Punkte Panzerung und halber Eisschaden.', armor: { slot: 'body', defense: 2, protectsFrom: ['ice'] } },
  { id: 'item_armor_muschelharnisch', name: 'Muschelharnisch', kind: 'armor', description: 'Zwei Punkte Panzerung und halber Blitzschaden.', armor: { slot: 'body', defense: 2, protectsFrom: ['lightning'] } },
  { id: 'item_armor_feuermantel', name: 'Feuermantel', kind: 'armor', description: 'Ein Punkt Panzerung. Feuer kann dir nichts anhaben.', armor: { slot: 'body', defense: 1, immuneTo: ['fire'] } },
  { id: 'item_armor_waermewams', name: 'Wärmewams', kind: 'armor', description: 'Ein Punkt Panzerung. Eis kann dir nichts anhaben.', armor: { slot: 'body', defense: 1, immuneTo: ['ice'] } },
  { id: 'item_armor_schattenumhang', name: 'Schattenumhang', kind: 'armor', description: 'Zwei Punkte Panzerung und halber Schattenschaden. Waffenkünste laden langsamer.', armor: { slot: 'body', defense: 2, protectsFrom: ['shadow'], penalty: { kind: 'slowSkill', text: 'Waffenkunst braucht eine Runde länger.' } } },
  { id: 'item_talisman_erdungsring', name: 'Erdungsring', kind: 'armor', description: 'Halbiert Blitzschaden.', armor: { slot: 'talisman', defense: 0, protectsFrom: ['lightning'] } },
  { id: 'item_talisman_sonnenscherbe', name: 'Sonnenscherbe', kind: 'armor', description: 'Halbiert Feuerschaden.', armor: { slot: 'talisman', defense: 0, protectsFrom: ['fire'] } },
  { id: 'item_talisman_kaltperle', name: 'Kaltperle', kind: 'armor', description: 'Halbiert Eisschaden.', armor: { slot: 'talisman', defense: 0, protectsFrom: ['ice'] } },
  { id: 'item_talisman_laternenstein', name: 'Laternenstein', kind: 'armor', description: 'Halbiert Schattenschaden.', armor: { slot: 'talisman', defense: 0, protectsFrom: ['shadow'] } },
  { id: 'item_talisman_waechterzeichen', name: 'Wächterzeichen', kind: 'armor', description: 'Ein altes Schutzzeichen von Alvas Wegen. Es gibt einen Punkt Panzerung.', armor: { slot: 'talisman', defense: 1 } },

  { id: 'item_tool_laterne', name: 'Laterne', kind: 'tool', description: 'Ein warmes Licht für dunkle Wege.' },
  { id: 'item_tool_nimas_zange', name: 'Nimas Zange', kind: 'tool', description: 'Mit der langen Zange kannst du sichere Glutschalen aufnehmen.' },
  { id: 'item_consume_apfelbrot', name: 'Apfelbrot', kind: 'healing', description: 'Heilt 7 Leben. Rastplätze füllen deinen Vorrat auf.', healing: { lifeRestored: 7 } },
  { id: 'item_consume_klarwasser', name: 'Klarwasser', kind: 'healing', description: 'Heilt 4 Leben und vertreibt Nebel und Hitze.', healing: { lifeRestored: 4, clearsEffectIds: ['benebelt', 'versengt'] } },
  { id: 'item_consume_kuehlkompresse', name: 'Kühlkompresse', kind: 'healing', description: 'Heilt 3 Leben und entfernt den Zustand Versengt.', healing: { lifeRestored: 3, clearsEffectIds: ['versengt'] } },

  { id: 'item_mat_astholz', name: 'Astholz', kind: 'quest', description: 'Leichtes Holz aus dem Wisperwald.' },
  { id: 'item_mat_rankenseil', name: 'Rankenseil', kind: 'quest', description: 'Ein festes Seil aus alten Ranken.' },
  { id: 'item_mat_wasserfaser', name: 'Wasserfaser', kind: 'quest', description: 'Eine feste Faser aus dem Schilfkanal.' },
  { id: 'item_mat_schwemmholz', name: 'Schwemmholz', kind: 'quest', description: 'Glattes, trockenes Holz.' },
  { id: 'item_mat_spulendraht', name: 'Spulendraht', kind: 'quest', description: 'Draht aus einer entladenen Kupferspule.' },
  { id: 'item_mat_werkzeugstahl', name: 'Werkzeugstahl', kind: 'quest', description: 'Starker Stahl aus der Kristallmine.' },
  { id: 'item_mat_ofenfaser', name: 'Ofenfaser', kind: 'quest', description: 'Helle Faser, die Feuer abhält.' },
  { id: 'item_mat_glutschale', name: 'Glutschale', kind: 'quest', description: 'Eine sicher markierte Schale mit ruhiger Wärme.' },
  { id: 'item_mat_rotglas', name: 'Rotglas', kind: 'quest', description: 'Warmes Glas aus der gelüfteten Grotte.' },
  { id: 'item_mat_firnfell', name: 'Firnfell', kind: 'quest', description: 'Ein warmer Stoff, den Eli aus ausgekämmter Winterwolle gewebt hat.' },
  { id: 'item_mat_kaltperle', name: 'Rohe Kaltperle', kind: 'quest', description: 'Eine Perle, die Kälte speichert. Eli braucht sie für Wärmewams und Frostlanze.' },
  { id: 'item_mat_moorfaser', name: 'Moorfaser', kind: 'quest', description: 'Feste Faser von einer hell markierten Moorinsel.' },
  { id: 'item_mat_dunkelglas', name: 'Dunkelglas', kind: 'quest', description: 'Ruhiges Glas vom Schwarzteich.' },
  { id: 'item_mat_laternenstein', name: 'Roher Laternenstein', kind: 'quest', description: 'Ein kleiner Stein, der im Nebel leuchtet.' },
  { id: 'item_quest_kartenrand_wald', name: 'Kartenrand: Wald', kind: 'quest', description: 'Ein Stück von Alvas alter Karte.' },
  { id: 'item_quest_kartenrand_kueste', name: 'Kartenrand: Küste', kind: 'quest', description: 'Ein Stück von Alvas alter Karte.' },
  { id: 'item_quest_kartenrand_hoehe', name: 'Kartenrand: Höhe', kind: 'quest', description: 'Ein Stück von Alvas alter Karte.' },
  { id: 'item_quest_kartenrand_funken', name: 'Kartenrand: Funken', kind: 'quest', description: 'Ein Stück von Alvas alter Karte.' },
  { id: 'item_quest_kartenrand_frost', name: 'Kartenrand: Frost', kind: 'quest', description: 'Ein Stück von Alvas alter Karte.' },
  { id: 'item_quest_kartenrand_moor', name: 'Kartenrand: Moor', kind: 'quest', description: 'Ein Stück von Alvas alter Karte.' }
]
