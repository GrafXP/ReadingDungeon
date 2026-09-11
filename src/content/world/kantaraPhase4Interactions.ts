import type { InteractionDefinition, Requirement } from '../../domain/content'

const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })
const item = (itemId: string, quantity = 1): Requirement => ({ kind: 'item', itemId, quantity })
const all = (...requirements: Requirement[]): Requirement => ({ kind: 'all', requirements })
const any = (...requirements: Requirement[]): Requirement => ({ kind: 'any', requirements })

const threeStamps = all(
  item('item_quest_blaetterstempel'),
  item('item_quest_deltastempel'),
  item('item_quest_werftstempel')
)

export const kantaraPhase4Interactions: InteractionDefinition[] = [
  {
    id: 'int_kb_bootsspeer_bauen', areaId: 'kb_werkhof', actionType: 'COMPLETE_INTERACTION',
    label: 'Baue den Bootsspeer',
    description: 'Verbinde Schwemmholz, Wasserfaser und Suris einmaligen Spulendraht.',
    visibilityRequirement: flag('rezept_bootsspeer_bekannt'),
    requirement: all(item('item_tool_werkhofbuch'), item('item_mat_schwemmholz'), item('item_mat_wasserfaser'), item('item_mat_spulendraht')),
    completedWhen: item('item_weapon_bootsspeer'),
    blockedText: 'Benötigt 1 Schwemmholz, 1 Wasserfaser und 1 Spulendraht. Suris Materialtausch macht das Kanaldelta unabhängig von der Sturmwerft.',
    resultText: 'Brik bindet die Blitzspitze an das Schwemmholz. «Schwallstoss macht das Ziel nass; dann trifft der Blitzanteil zusätzlich stark.» Der Bootsspeer ist fertig.',
    effects: [
      { kind: 'removeItem', itemId: 'item_mat_schwemmholz', quantity: 1 },
      { kind: 'removeItem', itemId: 'item_mat_wasserfaser', quantity: 1 },
      { kind: 'removeItem', itemId: 'item_mat_spulendraht', quantity: 1 },
      { kind: 'addItem', itemId: 'item_weapon_bootsspeer', quantity: 1 },
      { kind: 'discoverClue', clueId: 'regel_nass' },
      { kind: 'discoverClue', clueId: 'regel_blitz' }
    ]
  },
  {
    id: 'int_kb_spulenhammer_bauen', areaId: 'kb_werkhof', actionType: 'COMPLETE_INTERACTION',
    label: 'Baue den Spulenhammer',
    description: 'Brik braucht zwei Spulendrähte und einen Werkzeugstahl für Kurzschluss und Panzerbruch.',
    visibilityRequirement: flag('rezept_spulenhammer_bekannt'),
    requirement: all(item('item_tool_werkhofbuch'), item('item_mat_spulendraht', 2), item('item_mat_werkzeugstahl')),
    completedWhen: item('item_weapon_spulenhammer'),
    blockedText: 'Benötigt 2 Spulendraht aus der geerdeten Gasse und 1 Werkzeugstahl aus dem frei erreichbaren Speicherfach.',
    resultText: 'Der Spulenhammer ist fertig. Seine Kante zieht einen Punkt von der Panzerung ab; Kurzschluss unterbricht die angekündigte Aufladung.',
    effects: [
      { kind: 'removeItem', itemId: 'item_mat_spulendraht', quantity: 2 },
      { kind: 'removeItem', itemId: 'item_mat_werkzeugstahl', quantity: 1 },
      { kind: 'addItem', itemId: 'item_weapon_spulenhammer', quantity: 1 },
      { kind: 'discoverClue', clueId: 'regel_panzerbruch' },
      { kind: 'discoverClue', clueId: 'regel_unterbrechen' }
    ]
  },
  {
    id: 'int_kb_glassaebel_bauen', areaId: 'kb_werkhof', actionType: 'COMPLETE_INTERACTION',
    label: 'Baue den Glassäbel', description: 'Briks erstes Stempelrezept verbindet Astholz, Blätterharz und Werkzeugstahl.',
    visibilityRequirement: any(item('item_quest_blaetterstempel'), item('item_quest_deltastempel'), item('item_quest_werftstempel')),
    requirement: all(item('item_tool_werkhofbuch'), item('item_mat_astholz'), item('item_mat_blaetterharz'), item('item_mat_werkzeugstahl')),
    completedWhen: item('item_weapon_glassaebel'), blockedText: 'Benötigt 1 Astholz, 1 Blätterharz und 1 Werkzeugstahl.',
    resultText: 'Brik setzt die breite, verlässliche Klinge zusammen. Der Glassäbel verursacht vier bis sechs Wuchtschaden.',
    effects: [
      { kind: 'removeItem', itemId: 'item_mat_astholz', quantity: 1 },
      { kind: 'removeItem', itemId: 'item_mat_blaetterharz', quantity: 1 },
      { kind: 'removeItem', itemId: 'item_mat_werkzeugstahl', quantity: 1 },
      { kind: 'addItem', itemId: 'item_weapon_glassaebel', quantity: 1 }
    ]
  },
  {
    id: 'int_kb_prismenstab_bauen', areaId: 'kb_werkhof', actionType: 'COMPLETE_INTERACTION',
    label: 'Baue den Prismenstab', description: 'Die drei Freigabestempel bleiben erhalten und richten Feuer, Eis und Licht aus.',
    visibilityRequirement: threeStamps, requirement: all(item('item_tool_werkhofbuch'), threeStamps),
    completedWhen: item('item_weapon_prismenstab'), blockedText: 'Blätter-, Delta- und Werftstempel müssen gemeinsam im Inventar liegen.',
    resultText: 'Brik richtet drei Prismenfassungen aus. Der Stab kann an jedem Rastplatz zwischen Feuer, Eis und Licht wechseln; alle drei Stempel bleiben bei dir.',
    effects: [{ kind: 'addItem', itemId: 'item_weapon_prismenstab', quantity: 1 }]
  },
  {
    id: 'int_kb_blitzhammer_bauen', areaId: 'kb_werkhof', actionType: 'COMPLETE_INTERACTION',
    label: 'Baue den Blitzhammer', description: 'Verbinde zwei Spulendrähte und Werkzeugstahl nach dem geerdeten Speicherplan.',
    visibilityRequirement: flag('pfaehle_geerdet'),
    requirement: all(item('item_tool_werkhofbuch'), item('item_mat_spulendraht', 2), item('item_mat_werkzeugstahl')),
    completedWhen: item('item_weapon_blitzhammer'), blockedText: 'Benötigt 2 Spulendraht und 1 Werkzeugstahl.',
    resultText: 'Die geerdete Spule sitzt fest im Hammer. Seine Entladung trifft nasse Ziele mit dem vollen Blitzvorteil.',
    effects: [
      { kind: 'removeItem', itemId: 'item_mat_spulendraht', quantity: 2 },
      { kind: 'removeItem', itemId: 'item_mat_werkzeugstahl', quantity: 1 },
      { kind: 'addItem', itemId: 'item_weapon_blitzhammer', quantity: 1 }
    ]
  },
  {
    id: 'int_kb_schottharnisch_bauen', areaId: 'kb_werkhof', actionType: 'COMPLETE_INTERACTION',
    label: 'Baue den Schottharnisch', description: 'Zwei Schottnieten und ein Segeltuch ergeben Panzerung 2 mit Blitzschutz.',
    visibilityRequirement: flag('schottknacker_geoeffnet'),
    requirement: all(item('item_tool_werkhofbuch'), item('item_mat_schottniete', 2), item('item_mat_segeltuch')),
    completedWhen: item('item_armor_schottharnisch'), blockedText: 'Benötigt 2 Schottnieten und 1 Segeltuch.',
    resultText: 'Der Schottharnisch sitzt beweglich über dem Segeltuch. Er bietet Panzerung 2 und halbiert Blitzschaden.',
    effects: [
      { kind: 'removeItem', itemId: 'item_mat_schottniete', quantity: 2 },
      { kind: 'removeItem', itemId: 'item_mat_segeltuch', quantity: 1 },
      { kind: 'addItem', itemId: 'item_armor_schottharnisch', quantity: 1 }
    ]
  },
  {
    id: 'int_kb_prismenoeffner_bauen', areaId: 'kb_werkhof', actionType: 'COMPLETE_INTERACTION',
    label: 'Setze den Prismenöffner ein', description: 'Brik prüft die drei zurückgegebenen Stempelzeilen; kein Stempel wird verbraucht.',
    visibilityRequirement: flag('stempelfassungen_geprueft'),
    requirement: all(item('item_tool_werkhofbuch'), threeStamps),
    completedWhen: item('item_quest_prismenoeffner'),
    blockedText: 'Prüfe zuerst alle drei Fassungen am Prismenknoten und bringe die Stempel zu Brik zurück.',
    resultText: 'Der Prismenöffner rastet in Klicks Rückgabekäfig ein. Feuer-, Eis- und Lichtleitung öffnen gleichzeitig; Brik gibt dir zusätzlich den dreifachen Kernhalter.',
    effects: [
      { kind: 'addItem', itemId: 'item_quest_prismenoeffner', quantity: 1 },
      { kind: 'addItem', itemId: 'item_tool_kernhalter', quantity: 1 },
      { kind: 'setFlag', flag: 'aussenregionen_geoeffnet' }
    ]
  },

  {
    id: 'int_kd_suri_fragen', areaId: 'kd_hausboothafen', actionType: 'COMPLETE_INTERACTION',
    label: 'Frage Suri nach den Anlegern', description: 'Ordne die drei Lieferkähne nach Tiefgang, Ladung und Zielzeichen.',
    completedWhen: flag('anlegerliste_geprueft'),
    resultText: 'Suri liest diesmal jede Zeile bis zum Ende. Metall fährt zu C, Kräuter zu A, Seile zu B. Bo übergibt dir den Pegelstab; Suri tauscht einmalig einen Spulendraht für den Bootsspeerplan.',
    effects: [
      { kind: 'setFlag', flag: 'anlegerliste_geprueft' },
      { kind: 'setFlag', flag: 'rezept_bootsspeer_bekannt' },
      { kind: 'addItem', itemId: 'item_tool_pegelstab', quantity: 1 },
      { kind: 'addItem', itemId: 'item_mat_spulendraht', quantity: 1 },
      { kind: 'discoverClue', clueId: 'regel_nass' },
      { kind: 'discoverClue', clueId: 'regel_blitz' }
    ]
  },
  {
    id: 'int_kd_bo_zuhoeren', areaId: 'kd_hausboothafen', actionType: 'COMPLETE_INTERACTION',
    label: 'Höre Bos Pegelregel an', description: 'Bo zeigt sichere Marken, Fliessrichtung und die ausgeschriebenen Pegelwörter.',
    completedWhen: flag('bo_pegelregel_gelesen'),
    resultText: 'Bo fährt mit dem Finger von «steigend» über die sichere Kerbe zu «fallend». Erst danach markiert er den trockenen Weg zum Schilfkanal.',
    effects: [{ kind: 'setFlag', flag: 'bo_pegelregel_gelesen' }]
  },
  {
    id: 'int_kd_schwemmholz_nehmen', areaId: 'kd_schilfkanal', actionType: 'TAKE_ITEM',
    label: 'Sammle trockenes Schwemmholz', description: 'Nimm zwei Stücke oberhalb von Bos sicherer Pegelkerbe.',
    resultText: 'Du nimmst zwei trockene Stücke Schwemmholz. Nach einer Rast treibt neues Holz zur markierten Insel.',
    effects: [{ kind: 'addItem', itemId: 'item_mat_schwemmholz', quantity: 2 }], restockAfterRest: true
  },
  {
    id: 'int_kd_wasserfaser_ernten', areaId: 'kd_schilfkanal', actionType: 'TAKE_ITEM',
    label: 'Ernte Wasserfaser', description: 'Nimm zwei Fasern am geflochtenen Ring unterhalb des Holzzeichens.',
    resultText: 'Du löst zwei zähe Wasserfasern. Nach einer Rast wächst genug sicheres Material nach.',
    effects: [{ kind: 'addItem', itemId: 'item_mat_wasserfaser', quantity: 2 }], restockAfterRest: true
  },
  {
    id: 'int_kd_rohrventil_oeffnen', areaId: 'kd_rohrinsel', actionType: 'COMPLETE_INTERACTION',
    label: 'Öffne das Rohrventil', description: 'Prüfe die Wellenkerbe mit Bos Pegelstab und leite Wasser zum Kai.',
    requirement: item('item_tool_pegelstab'), completedWhen: flag('rohrventil_geoeffnet'), blockedText: 'Löse Suris Anlegerliste und nimm Bos Pegelstab mit.',
    resultText: 'Der Pegelstab bestätigt die Wellenkerbe. Wasser füllt das Becken, setzt die Schiebermaschinen nass und öffnet die Leitung zum Kai.',
    effects: [
      { kind: 'setFlag', flag: 'rohrventil_geoeffnet' },
      { kind: 'discoverClue', clueId: 'regel_nass' },
      { kind: 'unlockPassage', passageId: 'v028' }
    ]
  },
  {
    id: 'int_kd_schottniete_loesen', areaId: 'kd_schieberkai', actionType: 'TAKE_ITEM',
    label: 'Löse Schottnieten', description: 'Nimm zwei Nieten aus dem geöffneten Ausschussfach des Schottknackers.',
    visibilityRequirement: flag('schottknacker_geoeffnet'),
    resultText: 'Du löst zwei Schottnieten an Bos Werkzeugmarke. Nach einer Rast stellt der sichere Schieber weitere Nieten bereit.',
    effects: [{ kind: 'addItem', itemId: 'item_mat_schottniete', quantity: 2 }], restockAfterRest: true
  },
  {
    id: 'int_kd_fischertreppe_reparieren', areaId: 'kd_fischertreppe', actionType: 'COMPLETE_INTERACTION',
    label: 'Repariere die Fischertreppe', description: 'Befestige ein Schwemmholz als Geländer für Bos trockenen Rundweg.',
    requirement: item('item_mat_schwemmholz'), completedWhen: flag('fischertreppe_repariert'), blockedText: 'Benötigt 1 Schwemmholz aus dem offenen Schilfkanal.',
    resultText: 'Das Schwemmholz sitzt fest an den weissen Fussmarken. Sobald der Schottknacker stillsteht, ist Bos Seitensteg zum Radwehr offen.',
    effects: [
      { kind: 'removeItem', itemId: 'item_mat_schwemmholz', quantity: 1 },
      { kind: 'setFlag', flag: 'fischertreppe_repariert' }
    ]
  },
  {
    id: 'int_kd_schwall_ausloesen', areaId: 'kd_radwehr', actionType: 'COMPLETE_INTERACTION',
    label: 'Lies den Schwallhebel', description: 'Prüfe die vollständige Kette für die geöffneten Schaufeln des Deltarads.',
    completedWhen: flag('deltarad_regel_gelesen'),
    resultText: 'Klick speichert: «Schaufeln öffnen lassen, Schwallstoss einsetzen, Nass erkennen, mit Blitz treffen.» Der Hebel bleibt während des Kampfes erreichbar.',
    effects: [
      { kind: 'setFlag', flag: 'deltarad_regel_gelesen' },
      { kind: 'discoverClue', clueId: 'regel_nass' },
      { kind: 'discoverClue', clueId: 'regel_blitz' }
    ]
  },
  {
    id: 'int_kd_grundproviant_nehmen', areaId: 'kd_hausboothafen', actionType: 'TAKE_ITEM',
    label: 'Nimm Fährproviant', description: 'Nimm einen Vorrat nach der Rückgabeliste des sicheren Hausboots.',
    resultText: 'Du nimmst einen Grundproviant. Die Hafenleute füllen den Kasten nach deiner nächsten Rast wieder auf.',
    effects: [{ kind: 'addItem', itemId: 'item_consume_grundproviant', quantity: 1 }], restockAfterRest: true
  },
  {
    id: 'int_kd_stempel_praegen', areaId: 'kd_deltastation', actionType: 'COMPLETE_INTERACTION',
    label: 'Präge den Deltastempel', description: 'Suri liest den Stationsbericht, Bo kontrolliert jede Pegelkerbe.',
    requirement: all(flag('anlegerliste_geprueft'), flag('rohrventil_geoeffnet'), flag('schottknacker_geoeffnet'), flag('deltarad_abgeschaltet')),
    completedWhen: item('item_quest_deltastempel'), blockedText: 'Anlegerliste, Rohrventil, Schottknacker und Deltarad müssen bestätigt sein.',
    resultText: 'Suri liest langsam jede Zeile, Bo setzt vier genaue Haken. Gemeinsam prägt ihr den Deltastempel; eine beschriftete Fährlinie öffnet den Südstollen.',
    effects: [
      { kind: 'addItem', itemId: 'item_quest_deltastempel', quantity: 1 },
      { kind: 'setFlag', flag: 'kanaldelta_befreit' }
    ]
  },

  {
    id: 'int_sw_rikas_warnreim', areaId: 'sw_drachenwerkstatt', actionType: 'COMPLETE_INTERACTION',
    label: 'Lerne Rikas Warnreim', description: 'Lies Reim und Klartext für Summen, Aufladung und Unterbrechung.',
    completedWhen: flag('rikas_warnregel_gelesen'),
    resultText: '«Steigt das Summen, Kunst benutzen.» Rika zeigt direkt darunter: Aufladen mit einer Waffenkunst unterbrechen. Klick speichert beide Fassungen.',
    effects: [
      { kind: 'setFlag', flag: 'rikas_warnregel_gelesen' },
      { kind: 'discoverClue', clueId: 'regel_aufladung' },
      { kind: 'discoverClue', clueId: 'regel_unterbrechen' }
    ]
  },
  {
    id: 'int_sw_jaro_fragen', areaId: 'sw_drachenwerkstatt', actionType: 'COMPLETE_INTERACTION',
    label: 'Frage Jaro nach Panzerbruch', description: 'Vergleiche seine Schnittzeichnung mit der ausgeschriebenen Rechnung.',
    completedWhen: flag('jaro_panzerbruch_erklaert'),
    resultText: 'Jaro nennt den Hammer versehentlich Zange, doch seine Zeichnung ist klar: Panzerung 3 minus Panzerbruch 1 ergibt Panzerung 2. Erst danach wird Wuchtschaden abgezogen.',
    effects: [
      { kind: 'setFlag', flag: 'jaro_panzerbruch_erklaert' },
      { kind: 'discoverClue', clueId: 'regel_panzerbruch' }
    ]
  },
  {
    id: 'int_sw_erdungsring_annehmen', areaId: 'sw_drachenwerkstatt', actionType: 'TAKE_ITEM',
    label: 'Nimm den Erdungsring', description: 'Rika erklärt Form, Blitzzeichen und halbierten passenden Schaden.',
    completedWhen: item('item_talisman_erdungsring'),
    resultText: 'Du nimmst den Erdungsring und ein einzelnes Erdungsband. Dreieck und Wort «Blitz» wiederholen die Farbe; beide halbieren einen passenden Blitztreffer nur einmal.',
    effects: [
      { kind: 'addItem', itemId: 'item_talisman_erdungsring', quantity: 1 },
      { kind: 'addItem', itemId: 'item_consume_erdungsband', quantity: 1 },
      { kind: 'discoverClue', clueId: 'regel_blitzschutz' }
    ]
  },
  {
    id: 'int_sw_segeltuch_bergen', areaId: 'sw_windhof', actionType: 'TAKE_ITEM',
    label: 'Berge Segeltuch', description: 'Nimm trockenes Tuch erst unter den gesetzten Warnfahnen.',
    visibilityRequirement: flag('warnfahnen_gesetzt'),
    resultText: 'Du nimmst ein geprüftes Segeltuch. Nach einer Rast liegt neues trockenes Tuch im markierten Kasten.',
    effects: [{ kind: 'addItem', itemId: 'item_mat_segeltuch', quantity: 1 }], restockAfterRest: true
  },
  {
    id: 'int_sw_spulendraht_wickeln', areaId: 'sw_spulengasse', actionType: 'TAKE_ITEM',
    label: 'Wickle entladenen Spulendraht', description: 'Nimm zwei Drahtrollen von der geprüften Pflichtspule.',
    visibilityRequirement: all(flag('pflichtspule_entladen'), flag('pfaehle_geerdet')),
    resultText: 'Du wickelst zwei sichere Spulendrähte. Nach einer Rast liefert die geerdete Gasse neues Material.',
    effects: [{ kind: 'addItem', itemId: 'item_mat_spulendraht', quantity: 2 }], restockAfterRest: true
  },
  {
    id: 'int_sw_stahl_bergen', areaId: 'sw_blitzspeicher', actionType: 'TAKE_ITEM',
    label: 'Berge Werkzeugstahl', description: 'Nimm zwei Stücke aus dem frei erreichbaren Ausschussfach vor dem Kranweg.',
    resultText: 'Du nimmst zwei Stücke Werkzeugstahl. Das Fach bleibt auf dem freien Rückweg und wird nach einer Rast neu gefüllt.',
    effects: [{ kind: 'addItem', itemId: 'item_mat_werkzeugstahl', quantity: 2 }], restockAfterRest: true
  },
  {
    id: 'int_sw_pfaehle_erden', areaId: 'sw_erdungsfeld', actionType: 'COMPLETE_INTERACTION',
    label: 'Erde die drei Pfähle', description: 'Verbinde Pfahl eins, zwei und drei mit Jaros Erdungsklemme.',
    requirement: item('item_tool_erdungsklemme'), completedWhen: flag('pfaehle_geerdet'), blockedText: 'Löse zuerst Jaros Spulenbauplan und nimm die Erdungsklemme.',
    resultText: 'Eins, zwei, drei: Alle Pfähle liegen an der Erdleitung. Ein markierter Rundweg zum Blitzspeicher und die sichere Drahtquelle sind offen.',
    effects: [
      { kind: 'setFlag', flag: 'pfaehle_geerdet' },
      { kind: 'unlockPassage', passageId: 'v041' }
    ]
  },
  {
    id: 'int_sw_gleiter_sichern', areaId: 'sw_gleitersteg', actionType: 'COMPLETE_INTERACTION',
    label: 'Sichere den Lastengleiter', description: 'Lege den vollständigen Kurs durch beide Halteseile.',
    completedWhen: flag('gleiterkurs_gesichert'),
    resultText: 'Der Lastengleiter folgt beiden Halteseilen bis zum Werftkran. In seinem Postfach liegen Rikas Drachenpost-Marke und ein Resonanzsplitter.',
    effects: [
      { kind: 'setFlag', flag: 'gleiterkurs_gesichert' },
      { kind: 'addItem', itemId: 'item_marke_04', quantity: 1 },
      { kind: 'addItem', itemId: 'item_shard_sturmwerft', quantity: 1 },
      { kind: 'unlockPassage', passageId: 'v042' }
    ]
  },
  {
    id: 'int_sw_speicherplan_lesen', areaId: 'sw_blitzspeicher', actionType: 'COMPLETE_INTERACTION',
    label: 'Lies den Speicherplan', description: 'Wiederhole Unterbrechen und Panzerbruch vor dem Kranweg.',
    completedWhen: flag('speicherplan_gelesen'),
    resultText: 'Klick speichert beide Zeilen: «Aufladen – Kurzschluss» und «Panzerung 3 – Panzerbruch 1». Der freie Rückweg zum Erdungsfeld bleibt markiert.',
    effects: [
      { kind: 'setFlag', flag: 'speicherplan_gelesen' },
      { kind: 'discoverClue', clueId: 'regel_unterbrechen' },
      { kind: 'discoverClue', clueId: 'regel_panzerbruch' }
    ]
  },
  {
    id: 'int_sw_stempel_praegen', areaId: 'sw_wolkenstation', actionType: 'COMPLETE_INTERACTION',
    label: 'Präge den Werftstempel', description: 'Rika liest Warnplan und Erdung, Jaro kontrolliert Speicher und Wolkenspule.',
    requirement: all(flag('warnfahnen_gesetzt'), flag('pflichtspule_entladen'), flag('pfaehle_geerdet'), flag('wolkenspule_abgeschaltet')),
    completedWhen: item('item_quest_werftstempel'), blockedText: 'Warnfahnen, Pflichtspule, Erdung und Wolkenspule müssen bestätigt sein.',
    resultText: 'Rika liest alle Warnzeichen, Jaro prüft die Bauteile. Gemeinsam prägt ihr den Werftstempel; das Spulengleis ins Bergungslager öffnet sich.',
    effects: [
      { kind: 'addItem', itemId: 'item_quest_werftstempel', quantity: 1 },
      { kind: 'setFlag', flag: 'sturmwerft_befreit' }
    ]
  },

  {
    id: 'int_wg_teamtafel_lesen', areaId: 'wg_bergungslager', actionType: 'COMPLETE_INTERACTION',
    label: 'Lies die Teamtafel', description: 'Vergleiche Wegnummer, Symbol und ausgeschriebenen Zielort.',
    completedWhen: flag('teamtafel_gelesen'),
    resultText: 'Klick liest: Blatt nach Norden, Welle nach Süden, Spule geradeaus. Jedes Symbol steht zusätzlich neben einem vollständigen Zielnamen.',
    effects: [{ kind: 'setFlag', flag: 'teamtafel_gelesen' }]
  },
  {
    id: 'int_wg_gleishaken_nehmen', areaId: 'wg_bergungslager', actionType: 'TAKE_ITEM',
    label: 'Nimm den Gleishaken', description: 'Lies die Sicherheitszeile und nimm das Bergungswerkzeug.',
    requirement: flag('teamtafel_gelesen'), completedWhen: item('item_tool_gleishaken'), blockedText: 'Lies zuerst Zielwort und Symbol auf der Teamtafel.',
    resultText: 'Der Bergungsleiter übergibt dir den Gleishaken. «Nur an markierten Stellringen ansetzen; nie eine unbekannte Weiche ziehen.»',
    effects: [{ kind: 'addItem', itemId: 'item_tool_gleishaken', quantity: 1 }]
  },
  {
    id: 'int_wg_bergungsproviant', areaId: 'wg_bergungslager', actionType: 'TAKE_ITEM',
    label: 'Nimm Bergungsproviant', description: 'Nimm einen Vorrat nach der offenen Versorgungsliste.',
    resultText: 'Du nimmst einen Grundproviant. Nach deiner nächsten Rast füllt das Bergungsteam die Kiste wieder auf.',
    effects: [{ kind: 'addItem', itemId: 'item_consume_grundproviant', quantity: 1 }], restockAfterRest: true
  },
  {
    id: 'int_wg_nordstollen_reparieren', areaId: 'wg_nordstollen', actionType: 'COMPLETE_INTERACTION',
    label: 'Repariere den Nordstollen', description: 'Setze den Gleishaken nur an Blatt- und Feuerziel ein.',
    requirement: item('item_tool_gleishaken'), completedWhen: flag('nordstollen_repariert'), blockedText: 'Nimm den Gleishaken nach der gelesenen Teamtafel.',
    resultText: 'Blätterdächer und Glascaldera bleiben eindeutig getrennt beschriftet. Der Nordstollen ist vorbereitet; du findest die alte Marke «Tunnelbrot».',
    effects: [
      { kind: 'setFlag', flag: 'nordstollen_repariert' },
      { kind: 'addItem', itemId: 'item_marke_05', quantity: 1 }
    ]
  },
  {
    id: 'int_wg_suedstollen_reparieren', areaId: 'wg_suedstollen', actionType: 'COMPLETE_INTERACTION',
    label: 'Lege den Südstollen trocken', description: 'Verbinde Wellenziel und Pumpenleitung mit dem Gleishaken.',
    requirement: item('item_tool_gleishaken'), completedWhen: flag('suedstollen_repariert'), blockedText: 'Nimm den Gleishaken nach der gelesenen Teamtafel.',
    resultText: 'Die Pumpe läuft. Kanaldelta und Laternenmoor bleiben ausgeschrieben; der Südstollen ist für die spätere Abkürzung vorbereitet.',
    effects: [{ kind: 'setFlag', flag: 'suedstollen_repariert' }]
  },
  {
    id: 'int_wg_spulenroute_markieren', areaId: 'wg_bergungslager', actionType: 'COMPLETE_INTERACTION',
    label: 'Markiere die Spulenroute', description: 'Übertrage Rikas Gleiterroute für den späteren Eisweg.',
    visibilityRequirement: item('item_quest_werftstempel'), requirement: flag('gleiterkurs_gesichert'),
    completedWhen: flag('spulenroute_markiert'), blockedText: 'Sichere zuerst Rikas vollständigen Gleiterkurs.',
    resultText: 'Spulenzeichen und Zielwort Frostobservatorium stehen nun nebeneinander. Die spätere Abkürzung bleibt bis zum Prismenöffner geschlossen.',
    effects: [{ kind: 'setFlag', flag: 'spulenroute_markiert' }]
  },
  {
    id: 'int_wg_stempel_einsetzen', areaId: 'wg_prismenknoten', actionType: 'COMPLETE_INTERACTION',
    label: 'Prüfe die drei Stempelfassungen', description: 'Setze Blätter-, Delta- und Werftstempel ein und nimm sie nach der Prüfung wieder mit.',
    requirement: threeStamps, completedWhen: flag('stempelfassungen_geprueft'), blockedText: 'Alle drei verschiedenen Freigabestempel müssen vorhanden sein.',
    resultText: 'Blatt, Welle und Spule leuchten nacheinander. Du nimmst alle Stempel wieder an dich; Klick druckt Briks Rückgabezettel für den Prismenöffner.',
    effects: [{ kind: 'setFlag', flag: 'stempelfassungen_geprueft' }]
  }
]
