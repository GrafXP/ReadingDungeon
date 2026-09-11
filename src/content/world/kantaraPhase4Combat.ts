import type { EncounterDefinition, EnemyDefinition, Requirement } from '../../domain/content'

const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })
const equipped = (slot: 'weapon' | 'talisman', itemId: string): Requirement => ({ kind: 'equipped', slot, itemId })
const all = (...requirements: Requirement[]): Requirement => ({ kind: 'all', requirements })

export const kantaraPhase4Enemies: EnemyDefinition[] = [
  {
    id: 'enemy_kd_schlammspringer', name: 'Schlammspringer', kind: 'normal', maxLife: 9, defense: 0,
    tags: ['animal', 'water'], weakTo: ['ice', 'lightning'],
    movesByPhase: { 1: [
      { id: 'schlammspritzer', name: 'Schlammspritzer', telegraph: 'Der Springer scharrt eine dunkle Wasserlache zusammen.', icon: '≈', damage: 2, kind: 'normal' },
      { id: 'ufersprung', name: 'Ufersprung', telegraph: 'Zwei nasse Hinterbeine drücken sich vom Ufer ab.', icon: '↟', damage: 4, kind: 'heavy' }
    ] }
  },
  {
    id: 'enemy_kd_schieberkrabbe', name: 'Schieberkrabbe', kind: 'normal', maxLife: 10, defense: 2,
    tags: ['machine', 'water'], weakTo: ['lightning'], resistantTo: ['physical'],
    movesByPhase: { 1: [
      { id: 'krabbendeckung', name: 'Geschlossene Schale', telegraph: 'Die Krabbe schiebt beide Panzerhälften fest zusammen.', icon: '▣', damage: 0, kind: 'shield' },
      { id: 'krabbenhebezug', name: 'Hebezug', telegraph: 'Der Seitenhebel hebt die Schale; hinter der Markierung ist Platz für Deckung.', icon: '↥', damage: 4, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true, defendOutcomeText: 'Du gehst hinter der Markierung in Deckung. Der Hebezug trifft nichts.', vulnerableText: 'Die angehobene Schale bleibt für einen Zug offen.' },
      { id: 'zangenschlag', name: 'Zangenschlag', telegraph: 'Die rechte Zange klappt mit einem klaren Metalllaut auf.', icon: '⌁', damage: 3, kind: 'normal' }
    ] }
  },
  {
    id: 'enemy_kd_frachtbiber', name: 'Frachtbiber', kind: 'normal', maxLife: 11, defense: 1,
    tags: ['animal', 'cargo', 'water'], weakTo: ['ice'],
    movesByPhase: { 1: [
      { id: 'paketschub', name: 'Paketschub', telegraph: 'Der Biber drückt sein nasses Paket am Ufer entlang.', icon: '▣', damage: 3, kind: 'normal' },
      { id: 'doppelpaddel', name: 'Doppelpaddel', telegraph: 'Der breite Schwanz holt zweimal über dem Wasser aus.', icon: '≈', damage: 5, kind: 'heavy' }
    ] }
  },
  {
    id: 'enemy_kd_schottknacker', name: 'Schottknacker', kind: 'boss', maxLife: 16, defense: 2,
    tags: ['machine', 'guardian', 'water'], weakTo: ['lightning'], resistantTo: ['physical'], phaseTwoAtLife: 8,
    movesByPhase: {
      1: [
        { id: 'schottdeckung-1', name: 'Schottdeckung', telegraph: 'Die schwere Stirnplatte deckt das ganze Gehäuse.', icon: '▣', damage: 0, kind: 'shield' },
        { id: 'hebezug-1', name: 'Hebezug', telegraph: 'Der markierte Seitenhebel hebt die Deckung. Jetzt hinter Bos Linie verteidigen.', icon: '↥', damage: 6, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true, defendOutcomeText: 'Du bleibst hinter Bos Linie. Der Hebezug geht vorbei.', vulnerableText: 'Die Stirnplatte steht für einen Zug offen.' },
        { id: 'schotthieb-1', name: 'Schotthieb', telegraph: 'Der linke Schieber holt geradlinig aus.', icon: '◆', damage: 3, kind: 'normal' }
      ],
      2: [
        { id: 'hebezug-2', name: 'Doppelter Hebezug', telegraph: 'Zwei Hebelzeichen blinken; die Deckung hebt sich weiter als zuvor.', icon: '↥', damage: 7, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true, defendOutcomeText: 'Du wartest beide Hebezeichen in Deckung ab.', vulnerableText: 'Beide Panzerschichten stehen offen.' },
        { id: 'schottdeckung-2', name: 'Tiefe Schottdeckung', telegraph: 'Die Stirnplatte sinkt über beide Schieber.', icon: '▣', damage: 0, kind: 'shield' },
        { id: 'schotthieb-2', name: 'Kurzer Schotthieb', telegraph: 'Nur der rechte Schieber zuckt nach vorn.', icon: '◆', damage: 4, kind: 'normal' }
      ]
    }
  },
  {
    id: 'enemy_kd_deltarad', name: 'Deltarad', kind: 'boss', maxLife: 18, defense: 2,
    tags: ['machine', 'guardian', 'water'], weakTo: ['lightning', 'ice'], resistantTo: ['physical'], phaseTwoAtLife: 9,
    movesByPhase: {
      1: [
        { id: 'rad-oeffnen-1', name: 'Rad öffnen', telegraph: 'Die Schaufeln klappen auseinander. Jetzt kann Schwallstoss das Rad nass festsetzen.', icon: '◎', damage: 0, kind: 'shield' },
        { id: 'schaufelschlag-1', name: 'Schaufelschlag', telegraph: 'Eine einzelne Schaufel steigt über die markierte Uferlinie.', icon: '◆', damage: 4, kind: 'normal' },
        { id: 'flutstoss-1', name: 'Flutstoss', telegraph: 'Wasser sammelt sich hinter den offenen Schaufeln.', icon: '≈', damage: 6, kind: 'heavy' }
      ],
      2: [
        { id: 'rad-oeffnen-2', name: 'Rad weit öffnen', telegraph: 'Alle Schaufeln öffnen sich. Die Schwallmarke leuchtet erneut.', icon: '◎', damage: 0, kind: 'shield' },
        { id: 'flutstoss-2', name: 'Doppelter Flutstoss', telegraph: 'Zwei Wasserlinien steigen hinter dem Rad.', icon: '≈', damage: 7, kind: 'heavy' },
        { id: 'schaufelschlag-2', name: 'Kurzer Schaufelschlag', telegraph: 'Die untere Schaufel schwenkt in einem kurzen Bogen.', icon: '◆', damage: 4, kind: 'normal' }
      ]
    }
  },

  {
    id: 'enemy_sw_funkenmotte', name: 'Funkenmotte', kind: 'normal', maxLife: 8, defense: 0,
    tags: ['animal', 'airborne'], weakTo: ['ice'], resistantTo: ['lightning'],
    movesByPhase: { 1: [
      { id: 'funkenstaub', name: 'Funkenstaub', telegraph: 'Kleine blaue Funken sammeln sich an beiden Flügeln.', icon: 'ϟ', damage: 3, kind: 'normal', damageType: 'lightning' },
      { id: 'lampenflug', name: 'Lampenflug', telegraph: 'Die Motte kreist eng um die höchste Lampe.', icon: '⌃', damage: 4, kind: 'heavy' }
    ] }
  },
  {
    id: 'enemy_sw_windklammer', name: 'Windklammer', kind: 'normal', maxLife: 10, defense: 1,
    tags: ['machine', 'wind'], weakTo: ['physical'], resistantTo: ['lightning'],
    movesByPhase: { 1: [
      { id: 'boeenstoss', name: 'Böenstoss', telegraph: 'Die Klammer richtet ihre breite Segelfläche gegen dich.', icon: '↝', damage: 4, kind: 'normal' },
      { id: 'verhaken', name: 'Verhaken', telegraph: 'Der Bodenhaken senkt sich und nimmt der Klammer den Windschutz.', icon: '⌁', damage: 2, kind: 'guard', vulnerableAfterDefend: true }
    ] }
  },
  {
    id: 'enemy_sw_drachenwaechter', name: 'Drachenwächter', kind: 'normal', maxLife: 10, defense: 0,
    tags: ['machine', 'airborne'], weakTo: ['ice'], resistantTo: ['physical'],
    movesByPhase: { 1: [
      { id: 'segelhieb', name: 'Segelhieb', telegraph: 'Das linke Segel kippt gegen den Wind.', icon: '↝', damage: 3, kind: 'normal' },
      { id: 'steigflug', name: 'Steigflug', telegraph: 'Die Halteline spannt sich bis zum markierten Bodenring.', icon: '⌃', damage: 4, kind: 'heavy' }
    ] }
  },
  {
    id: 'enemy_sw_spulenlaeufer', name: 'Spulenläufer', kind: 'boss', maxLife: 15, defense: 2,
    tags: ['machine', 'guardian', 'charged'], weakTo: ['ice'], resistantTo: ['lightning'], phaseTwoAtLife: 7,
    movesByPhase: {
      1: [
        { id: 'spulenstoss-1', name: 'Spulenstoss', telegraph: 'Die vordere Spule kippt in einer geraden Linie.', icon: '◆', damage: 3, kind: 'normal' },
        { id: 'spule-aufladen-1', name: 'Aufladen', telegraph: 'Das Summen steigt. Kurzschluss unterbricht den starken Ladestoss.', icon: 'ϟ', damage: 7, kind: 'charge', damageType: 'lightning' },
        { id: 'entladung-1', name: 'Restentladung', telegraph: 'Nur wenige Funken bleiben an der geerdeten Schiene.', icon: 'ϟ', damage: 3, kind: 'normal', damageType: 'lightning' }
      ],
      2: [
        { id: 'spule-aufladen-2', name: 'Doppelt aufladen', telegraph: 'Zwei Summtöne steigen gleichzeitig. Kurzschluss trennt beide.', icon: 'ϟ', damage: 8, kind: 'charge', damageType: 'lightning' },
        { id: 'entladung-2', name: 'Kurze Entladung', telegraph: 'Die Erdung führt den grössten Teil der Ladung ab.', icon: 'ϟ', damage: 4, kind: 'normal', damageType: 'lightning' },
        { id: 'spulenstoss-2', name: 'Kurzer Spulenstoss', telegraph: 'Der kleine Seitenkern fährt aus.', icon: '◆', damage: 3, kind: 'normal' }
      ]
    }
  },
  {
    id: 'enemy_sw_wolkenspule', name: 'Wolkenspule', kind: 'boss', maxLife: 12, defense: 2,
    tags: ['machine', 'guardian', 'charged'], weakTo: ['ice'], resistantTo: ['physical', 'lightning'], phaseTwoAtLife: 6,
    movesByPhase: {
      1: [
        { id: 'wolken-aufladen-1', name: 'Aufladen', telegraph: 'Das steigende Summen läuft über drei Ringe. Kurzschluss kann es trennen.', icon: 'ϟ', damage: 7, kind: 'charge', damageType: 'lightning' },
        { id: 'windschlag-1', name: 'Windschlag', telegraph: 'Die Wolkenhaube zieht sich zu einer Seite zusammen.', icon: '↝', damage: 3, kind: 'normal' },
        { id: 'wolkenschild-1', name: 'Wolkenschild', telegraph: 'Das Gehäuse schliesst sich; nur Panzerbruch erreicht die innere Fuge.', icon: '▣', damage: 0, kind: 'shield' }
      ],
      2: [
        { id: 'wolkenschild-2', name: 'Verstärktes Gehäuse', telegraph: 'Drei Panzerlinien schliessen sich vor dem Kern.', icon: '▣', damage: 0, kind: 'shield' },
        { id: 'wolken-aufladen-2', name: 'Wolkenaufladung', telegraph: 'Der Ton steigt bis zur roten Warnkerbe. Jetzt Kurzschluss benutzen.', icon: 'ϟ', damage: 8, kind: 'charge', damageType: 'lightning' },
        { id: 'wolkenentladung', name: 'Wolkenentladung', telegraph: 'Die verbleibende Ladung läuft über die geerdete Kranstrebe.', icon: 'ϟ', damage: 4, kind: 'normal', damageType: 'lightning' }
      ]
    }
  },

  {
    id: 'enemy_wg_gleislaus', name: 'Gleislaus', kind: 'normal', maxLife: 8, defense: 0,
    tags: ['machine', 'small'], weakTo: ['physical'],
    movesByPhase: { 1: [
      { id: 'schienenknipsen', name: 'Schienenknipsen', telegraph: 'Zwei kleine Zangen setzen an derselben Stellstange an.', icon: '⌁', damage: 2, kind: 'normal' },
      { id: 'geradeauslauf', name: 'Geradeauslauf', telegraph: 'Die gestellte Weiche lässt nur die mittlere Schiene frei.', icon: '→', damage: 4, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true }
    ] }
  },
  {
    id: 'enemy_wg_frachtschieber', name: 'Frachtschieber', kind: 'normal', maxLife: 11, defense: 2,
    tags: ['machine', 'cargo'], weakTo: ['lightning'], resistantTo: ['physical'],
    movesByPhase: { 1: [
      { id: 'stirnplatte', name: 'Stirnplatte', telegraph: 'Die breite Platte deckt den vorderen Antrieb.', icon: '▣', damage: 0, kind: 'shield' },
      { id: 'seitenhebel', name: 'Seitenhebel', telegraph: 'Der beschriftete Hebel hebt die Stirnplatte für einen Zug.', icon: '↥', damage: 3, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true },
      { id: 'kistenschub-wg', name: 'Kistenschub', telegraph: 'Eine einzelne Frachtkiste rückt auf der Mittellinie vor.', icon: '▣', damage: 4, kind: 'normal' }
    ] }
  },
  {
    id: 'enemy_wg_sortierlaeufer', name: 'Sortierläufer', kind: 'normal', maxLife: 12, defense: 1,
    tags: ['machine', 'cargo'], weakTo: ['light'], resistantTo: ['physical'],
    movesByPhase: { 1: [
      { id: 'etikettwechsel', name: 'Etikettwechsel', telegraph: 'Das sichtbare Frachtsymbol wechselt zum hellen Prismenzeichen.', icon: '▱', damage: 0, kind: 'guard' },
      { id: 'sortierstoss', name: 'Sortierstoss', telegraph: 'Der Läufer richtet sein leuchtendes Etikett nach vorn.', icon: '◆', damage: 5, kind: 'heavy' }
    ] }
  }
]

export const kantaraPhase4Encounters: EncounterDefinition[] = [
  { id: 'enc_kd_schlammsprung', areaId: 'kd_rohrinsel', enemyIds: ['enemy_kd_schlammspringer'], label: 'Vertreibe den Schlammspringer', description: 'Die nasse Spur verrät seine Schwächen gegen Eis und Blitz.', fleeAreaId: 'kd_hausboothafen', victoryText: 'Der Schlammspringer hüpft in den freien Seitenarm. Das Rohrbecken ist ruhig.', rewardEffects: [] },
  { id: 'enc_kd_schieberkrabbe', areaId: 'kd_schleusensteg', enemyIds: ['enemy_kd_schieberkrabbe'], label: 'Öffne die Schieberkrabbe', description: 'Warte den Hebezug ab und nutze die geöffnete Schale.', fleeAreaId: 'kd_hausboothafen', victoryText: 'Die Schieberkrabbe klappt ihre Zangen ein und gibt den Wartungssteg frei.', rewardEffects: [] },
  { id: 'enc_kd_frachtbiber', areaId: 'kd_schilfkanal', enemyIds: ['enemy_kd_frachtbiber'], label: 'Löse das Paket des Frachtbibers', description: 'Bos Ufernotiz erklärt den gebremsten zweiten Anlauf.', fleeAreaId: 'kd_hausboothafen', victoryText: 'Das falsch zugestellte Paket löst sich. Darunter klingt der Resonanzsplitter Kanaldelta.', rewardEffects: [{ kind: 'addItem', itemId: 'item_shard_kanaldelta', quantity: 1 }] },
  {
    id: 'enc_kd_schottknacker', areaId: 'kd_schieberkai', enemyIds: ['enemy_kd_schottknacker'], label: 'Stoppe den Schottknacker',
    description: 'Verteidige beim Hebezug und triff die offene Deckung mit dem Bootsspeer.', fleeAreaId: 'kd_hausboothafen',
    requiredGear: equipped('weapon', 'item_weapon_bootsspeer'), gearWarning: 'Baue im Werkhof den Bootsspeer und rüste ihn aus. Die Blitzspitze nutzt die nasse Maschine.',
    victoryText: 'Der Schottknacker stellt seine Stirnplatte senkrecht und hält die Fährschieber offen. Der Weg zum Radwehr ist frei.',
    rewardEffects: [{ kind: 'setFlag', flag: 'schottknacker_geoeffnet' }]
  },
  { id: 'enc_kd_rohrschwarm', areaId: 'kd_rohrinsel', enemyIds: ['enemy_kd_schieberkrabbe'], label: 'Räume den nassen Rohrschwarm', description: 'Das Ventil hält die Panzerhälften nass und die Blitzschwäche sichtbar.', fleeAreaId: 'kd_hausboothafen', requiredGear: flag('rohrventil_geoeffnet'), gearWarning: 'Öffne zuerst das Rohrventil mit Bos Pegelstab.', victoryText: 'Die letzte nasse Krabbe klappt sich zusammen. Die Wasserleitung bleibt offen.', rewardEffects: [] },
  {
    id: 'enc_kd_deltarad', areaId: 'kd_radwehr', enemyIds: ['enemy_kd_deltarad'], label: 'Stoppe das Deltarad',
    description: 'Lass die Schaufeln öffnen, setze Schwallstoss ein und triff das nasse Rad mit Blitz.', fleeAreaId: 'kd_hausboothafen',
    requiredGear: all(equipped('weapon', 'item_weapon_bootsspeer'), flag('deltarad_regel_gelesen')), gearWarning: 'Rüste den Bootsspeer aus und lies zuerst die vollständige Radtafel.',
    victoryText: 'Der Schwall hält die offenen Schaufeln fest. Das Deltarad stoppt und gibt den Stationsweg frei.',
    rewardEffects: [{ kind: 'setFlag', flag: 'deltarad_abgeschaltet' }]
  },

  { id: 'enc_sw_funkenmotten', areaId: 'sw_windhof', enemyIds: ['enemy_sw_funkenmotte'], label: 'Lösche die Funkenmotten', description: 'Der kalte Löschkasten erklärt ihre Eisschwäche.', fleeAreaId: 'sw_drachenwerkstatt', victoryText: 'Die Funkenmotten landen im kalten Kasten. Der Windhof bleibt frei.', rewardEffects: [] },
  { id: 'enc_sw_windklammer', areaId: 'sw_warnmast', enemyIds: ['enemy_sw_windklammer'], label: 'Löse die Windklammer', description: 'Triff sie, wenn der Bodenhaken ihr den Windschutz nimmt.', fleeAreaId: 'sw_drachenwerkstatt', victoryText: 'Die Windklammer löst sich vom Mast. Der Fahnenplan bleibt unbeschädigt.', rewardEffects: [] },
  { id: 'enc_sw_drachenwaechter', areaId: 'sw_gleitersteg', enemyIds: ['enemy_sw_drachenwaechter'], label: 'Sichere den Drachenwächter', description: 'Der Flugplan zeigt die gespannte Leine beim Steigflug.', fleeAreaId: 'sw_drachenwerkstatt', victoryText: 'Der Drachenwächter landet an seiner sicheren Leine. Der Gleiterplan bleibt frei.', rewardEffects: [] },
  {
    id: 'enc_sw_spulenlaeufer', areaId: 'sw_blitzspeicher', enemyIds: ['enemy_sw_spulenlaeufer'], label: 'Stoppe den Spulenläufer',
    description: 'Unterbrich das steigende Summen mit Kurzschluss; der Erdungsring halbiert Blitz.', fleeAreaId: 'sw_drachenwerkstatt',
    requiredGear: all(equipped('weapon', 'item_weapon_spulenhammer'), equipped('talisman', 'item_talisman_erdungsring')),
    gearWarning: 'Baue den Spulenhammer, rüste ihn aus und lege Rikas Erdungsring als Talisman an.',
    victoryText: 'Der Spulenläufer fällt still in die geerdete Führung. Der Kranweg ist frei und der Speicher bleibt kontrollierbar.',
    rewardEffects: [{ kind: 'setFlag', flag: 'spulenlaeufer_gestoppt' }]
  },
  { id: 'enc_sw_klammergang', areaId: 'sw_spulengasse', enemyIds: ['enemy_sw_windklammer'], label: 'Öffne den Klammergang', description: 'Erdungs- und Verhakenschild nennen Schutz und Trefferfenster.', fleeAreaId: 'sw_drachenwerkstatt', victoryText: 'Die Klammer hängt sicher am Bodenring. Der Gang bleibt offen.', rewardEffects: [] },
  {
    id: 'enc_sw_wolkenspule', areaId: 'sw_werftkran', enemyIds: ['enemy_sw_wolkenspule'], label: 'Schalte die Wolkenspule ab',
    description: 'Unterbrich Aufladung mit Kurzschluss und überwinde die Panzerung mit dem Spulenhammer.', fleeAreaId: 'sw_drachenwerkstatt',
    requiredGear: all(equipped('weapon', 'item_weapon_spulenhammer'), flag('speicherplan_gelesen')), gearWarning: 'Rüste den Spulenhammer aus und lies den Speicherplan vor dem Kranweg.',
    victoryText: 'Kurzschluss trennt die Ladung, der Hammer öffnet das Gehäuse. Die Wolkenspule wechselt in sicheren Stationsbetrieb.',
    rewardEffects: [{ kind: 'setFlag', flag: 'wolkenspule_abgeschaltet' }]
  },

  { id: 'enc_wg_gleislaus', areaId: 'wg_kreuzweiche', enemyIds: ['enemy_wg_gleislaus'], label: 'Fange die Gleislaus', description: 'Die gestellte Weiche zwingt sie auf eine gerade Linie.', fleeAreaId: 'wg_bergungslager', victoryText: 'Die Gleislaus klappt sich in einen leeren Frachtkorb. Das Weichenfeld bleibt frei.', rewardEffects: [] },
  { id: 'enc_wg_frachtschieber', areaId: 'wg_suedstollen', enemyIds: ['enemy_wg_frachtschieber'], label: 'Öffne den Frachtschieber', description: 'Verteidige beim Seitenhebel und triff die geöffnete Stirnplatte.', fleeAreaId: 'wg_bergungslager', victoryText: 'Der Frachtschieber parkt gerade an der Tunnelwand. Die Pumpenleitung bleibt frei.', rewardEffects: [] },
  { id: 'enc_wg_sortierlaeufer_nord', areaId: 'wg_nordstollen', enemyIds: ['enemy_wg_sortierlaeufer'], label: 'Prüfe den nördlichen Sortierläufer', description: 'Sein sichtbares Frachtsymbol nennt das wirksame Element.', fleeAreaId: 'wg_bergungslager', requiredGear: flag('aussenregionen_geoeffnet'), gearWarning: 'Dieser optionale Wiederbesuch beginnt erst nach dem Prismenöffner.', victoryText: 'Das richtige Element löst das falsche Etikett. Der Nordstollen bleibt beleuchtet.', rewardEffects: [] },
  { id: 'enc_wg_sortierlaeufer_sued', areaId: 'wg_suedstollen', enemyIds: ['enemy_wg_sortierlaeufer'], label: 'Prüfe den südlichen Sortierläufer', description: 'Sein sichtbares Frachtsymbol nennt das wirksame Element.', fleeAreaId: 'wg_bergungslager', requiredGear: flag('aussenregionen_geoeffnet'), gearWarning: 'Dieser optionale Wiederbesuch beginnt erst nach dem Prismenöffner.', victoryText: 'Das richtige Element löst das falsche Etikett. Der Südstollen bleibt trocken.', rewardEffects: [] }
]
