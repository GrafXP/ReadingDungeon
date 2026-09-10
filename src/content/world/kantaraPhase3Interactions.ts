import type { InteractionDefinition, Requirement } from '../../domain/content'

const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })
const item = (itemId: string, quantity = 1): Requirement => ({ kind: 'item', itemId, quantity })
const all = (...requirements: Requirement[]): Requirement => ({ kind: 'all', requirements })

export const kantaraPhase3Interactions: InteractionDefinition[] = [
  {
    id: 'int_kb_klick_aufklappen',
    areaId: 'kb_kurierhof',
    actionType: 'TAKE_ITEM',
    label: 'Klappe Klick auf',
    description: 'Öffne den beschrifteten Paketkäfer und nimm seine Etikettenlupe mit.',
    resultText: 'Sechs Messingbeine klappen aus. «Klick. Paketbegleiter bereit. Ohne Etikett kein Paket.» Mit seiner Lupe könnt ihr jedes Warnwort prüfen.',
    completedWhen: item('item_tool_etikettenlupe'),
    effects: [
      { kind: 'addItem', itemId: 'item_tool_etikettenlupe', quantity: 1 },
      { kind: 'discoverClue', clueId: 'regel_beobachten' }
    ]
  },
  {
    id: 'int_kb_auftrag_annehmen',
    areaId: 'kb_kurierhof',
    actionType: 'TAKE_ITEM',
    label: 'Nimm Merals Hilfsauftrag an',
    description: 'Meral nennt Ziel, Inhalt, Gefahr und den freien Rückweg der Medikamentenlieferung.',
    resultText: 'Meral übergibt dir die Medikamentenkiste. «Zum Wassertor, Wellenzeichen. Die Rollkiste rattert vor dem Anrollen: dann verteidigen. Flucht oder Rettung bringt dich mit allen Funden hierher zurück.»',
    requirement: all(flag('uebungsetiketten_geloest'), item('item_tool_etikettenlupe')),
    visibilityRequirement: flag('uebungsetiketten_geloest'),
    completedWhen: flag('medizin_erhalten'),
    blockedText: 'Klappe Klick auf, damit ihr Merals Lieferzettel gemeinsam prüfen könnt.',
    effects: [
      { kind: 'addItem', itemId: 'item_quest_medizinkiste', quantity: 1 },
      { kind: 'setFlag', flag: 'medizin_erhalten' },
      { kind: 'discoverClue', clueId: 'regel_zugankuendigung' },
      { kind: 'discoverClue', clueId: 'regel_verteidigen' },
      { kind: 'discoverClue', clueId: 'regel_flucht' }
    ]
  },
  {
    id: 'int_kb_grundausruestung',
    areaId: 'kb_kurierhof',
    actionType: 'TAKE_ITEM',
    label: 'Lege die Grundausrüstung an',
    description: 'Öffne deinen beschrifteten Spind mit Kurierklinge und Kurierwams.',
    resultText: 'Du legst Kurierwams und Kurierklinge an. Klick zeigt am Übungsziel die Rechnung: Wuchtwurf minus Panzerung, mindestens ein Schaden.',
    completedWhen: all(item('item_weapon_kurierklinge'), item('item_armor_kurierwams')),
    effects: [
      { kind: 'addItem', itemId: 'item_weapon_kurierklinge', quantity: 1 },
      { kind: 'addItem', itemId: 'item_armor_kurierwams', quantity: 1 },
      { kind: 'equipItem', itemId: 'item_weapon_kurierklinge' },
      { kind: 'equipItem', itemId: 'item_armor_kurierwams' },
      { kind: 'discoverClue', clueId: 'regel_trefferrechnung' },
      { kind: 'discoverClue', clueId: 'regel_koerperruestung' }
    ]
  },
  {
    id: 'int_kb_medizin_abgeben',
    areaId: 'kb_wassertor',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Gib die Medizin ab',
    description: 'Vergleiche Wellenzeichen und Empfänger, bevor du die Kiste übergibst.',
    resultText: 'Die Zeichen stimmen überein. Die Medizin erreicht das Notlager. Zurück im Kurierhof erklärt Meral: Blätterdächer, Kanaldelta und Sturmwerft brauchen gleichzeitig Hilfe; jeder Rückweg bleibt offen.',
    requirement: all(item('item_quest_medizinkiste'), flag('rollkiste_gebremst')),
    completedWhen: flag('medizin_geliefert'),
    blockedText: 'Bremse zuerst die rollende Frachtkiste; der Empfänger steht direkt dahinter.',
    effects: [
      { kind: 'removeItem', itemId: 'item_quest_medizinkiste', quantity: 1 },
      { kind: 'setFlag', flag: 'medizin_geliefert' }
    ]
  },
  {
    id: 'int_kb_sammelbefehl_lesen',
    areaId: 'kb_wechselwerk_vorplatz',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Lies den Sammelbefehl vollständig',
    description: 'Prüfe Kräfte, Wege und Freigabestelle gemeinsam mit Klick.',
    resultText: 'Der Befehl will Naturkräfte und Wege wie Fracht sammeln. Klick hält inne. «Das passt in keine sichere Kategorie. Wir fragen nach.» Meral trägt die drei nahen Regionsstationen als Hauptauftrag ein.',
    requirement: flag('medizin_geliefert'),
    completedWhen: flag('sammelbefehl_gelesen'),
    effects: [
      { kind: 'setFlag', flag: 'sammelbefehl_gelesen' },
      { kind: 'discoverClue', clueId: 'sammelbefehl' }
    ]
  },
  {
    id: 'int_kb_marktversorgung',
    areaId: 'kb_tauschmarkt',
    actionType: 'TAKE_ITEM',
    label: 'Durchsuche den Marktstand',
    description: 'Prüfe Notvorrat, alte Marke und das Leiterzeichen.',
    resultText: 'Du nimmst einen Grundproviant und die Marke «Erste Dachpost». Die Marktleiterin öffnet den Weg zum Dachsteg und erzählt von Zustellungen vor dem Wechselwerk.',
    completedWhen: flag('marktleiter_geoeffnet'),
    effects: [
      { kind: 'addItem', itemId: 'item_consume_grundproviant', quantity: 1 },
      { kind: 'addItem', itemId: 'item_marke_01', quantity: 1 },
      { kind: 'setFlag', flag: 'marktleiter_geoeffnet' }
    ]
  },
  {
    id: 'int_kb_astbeil_bauen',
    areaId: 'kb_werkhof',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Baue das Astbeil',
    description: 'Brik braucht ein Astholz und ein Rankenseil. Kapphieb unterbricht eine angekündigte Aufladung.',
    visibilityRequirement: flag('rezept_astbeil_bekannt'),
    requirement: all(item('item_tool_werkhofbuch'), item('item_mat_astholz'), item('item_mat_rankenseil')),
    completedWhen: item('item_weapon_astbeil'),
    blockedText: 'Benötigt 1 Astholz und 1 Rankenseil aus dem offenen Rundweg der Blätterdächer.',
    resultText: 'Brik verbindet Astholz und Rankenseil mit der breiten Werkzeugklinge. Das Astbeil ist fertig. «Kapphieb stoppt eine Aufladung, dann klingt er zwei Runden ab.»',
    effects: [
      { kind: 'removeItem', itemId: 'item_mat_astholz', quantity: 1 },
      { kind: 'removeItem', itemId: 'item_mat_rankenseil', quantity: 1 },
      { kind: 'addItem', itemId: 'item_weapon_astbeil', quantity: 1 },
      { kind: 'discoverClue', clueId: 'regel_waffenkunst' }
    ]
  },
  {
    id: 'int_kb_rindenpanzer_bauen',
    areaId: 'kb_werkhof',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Baue den Rindenpanzer',
    description: 'Der Vergleich zeigt Panzerung 2 und halbierten Eisschaden.',
    visibilityRequirement: flag('rezept_rindenpanzer_bekannt'),
    requirement: all(item('item_tool_werkhofbuch'), item('item_mat_astholz', 2), item('item_mat_rankenseil')),
    completedWhen: item('item_armor_rindenpanzer'),
    blockedText: 'Benötigt 2 Astholz und 1 Rankenseil. Die Quellen erneuern sich nach einer Rast.',
    resultText: 'Brik schichtet zwei Stücke Astholz über ein Rankenseil. Der Rindenpanzer ist fertig; im Vergleich zeigt er einen Punkt mehr Panzerung und halbierten Eisschaden.',
    effects: [
      { kind: 'removeItem', itemId: 'item_mat_astholz', quantity: 2 },
      { kind: 'removeItem', itemId: 'item_mat_rankenseil', quantity: 1 },
      { kind: 'addItem', itemId: 'item_armor_rindenpanzer', quantity: 1 }
    ]
  },
  {
    id: 'int_bd_fenn_fragen',
    areaId: 'bd_kronengarten',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Frage Fenn nach den Ranken',
    description: 'Ordne zuerst Jungtrieb, Tragwurzel und Fruchtranke den gelesenen Plätzen zu.',
    completedWhen: flag('pflanzentafel_gelesen'),
    resultText: 'Fenn bestätigt alle drei Schilder. Er zeichnet Quellplan, Astbeil und Rindenpanzer ins Werkhofbuch und gibt dir reifes Blätterharz. Junge Triebe bleiben unberührt.',
    effects: [
      { kind: 'setFlag', flag: 'pflanzentafel_gelesen' },
      { kind: 'setFlag', flag: 'rezept_astbeil_bekannt' },
      { kind: 'setFlag', flag: 'rezept_rindenpanzer_bekannt' },
      { kind: 'addItem', itemId: 'item_mat_blaetterharz', quantity: 1 },
      { kind: 'discoverClue', clueId: 'fenns_pflanzentafel' }
    ]
  },
  {
    id: 'int_bd_rankenseil_ernten',
    areaId: 'bd_kronengarten',
    actionType: 'TAKE_ITEM',
    label: 'Ernte alte Rankenseile',
    description: 'Nimm nur die zwei losen Ranken am Ernteschild; die jungen Triebe bleiben stehen.',
    visibilityRequirement: flag('quellventil_geoeffnet'),
    resultText: 'Du löst zwei alte Rankenseile an den breiten Ringzeichen. Nach einer Rast wächst genug tragfähiges Material für eine neue Ernte nach.',
    effects: [{ kind: 'addItem', itemId: 'item_mat_rankenseil', quantity: 2 }],
    restockAfterRest: true
  },
  {
    id: 'int_bd_astholz_nehmen',
    areaId: 'bd_brueckenwerk',
    actionType: 'TAKE_ITEM',
    label: 'Nimm Astholz',
    description: 'Nimm zwei tragfähige Stücke aus Inas beschriftetem Verschnittkorb.',
    resultText: 'Du nimmst zwei Stücke Astholz. Ina füllt den Verschnittkorb nach deiner nächsten Rast wieder auf.',
    effects: [{ kind: 'addItem', itemId: 'item_mat_astholz', quantity: 2 }],
    restockAfterRest: true
  },
  {
    id: 'int_bd_harz_sammeln',
    areaId: 'bd_quellast',
    actionType: 'TAKE_ITEM',
    label: 'Sammle Blätterharz',
    description: 'Nimm Harz nur von der markierten ausgewachsenen Fruchtranke.',
    visibilityRequirement: flag('pflanzentafel_gelesen'),
    resultText: 'Du sammelst klares Blätterharz. Die markierte Ranke bildet nach einer Rast neues Harz.',
    effects: [{ kind: 'addItem', itemId: 'item_mat_blaetterharz', quantity: 1 }],
    restockAfterRest: true
  },
  {
    id: 'int_bd_ina_helfen',
    areaId: 'bd_seilmarkt',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Hilf Ina beim Sichern',
    description: 'Lies Halteseil, Zugseil, Material und freien Rückweg auf ihrem Bauzettel.',
    resultText: 'Ihr sichert die Häuser. Ina markiert den Brückenauftrag: ein Astholz, ein Rankenseil, Halteseil. «Nichts wird verbaut, bevor der Knotenplan geprüft ist.»',
    completedWhen: flag('ina_brueckenauftrag'),
    effects: [{ kind: 'setFlag', flag: 'ina_brueckenauftrag' }]
  },
  {
    id: 'int_bd_bruecke_reparieren',
    areaId: 'bd_brueckenwerk',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Befestige das Brückenseil',
    description: 'Verbinde ein Astholz und ein Rankenseil nach Inas geprüftem Knotenplan.',
    visibilityRequirement: flag('ina_brueckenauftrag'),
    requirement: all(item('item_mat_astholz'), item('item_mat_rankenseil')),
    completedWhen: flag('brueckenseil_befestigt'),
    blockedText: 'Benötigt 1 Astholz und 1 Rankenseil; beide Quellen liegen im offenen Rundweg.',
    resultText: 'Das breite Ringzeichen liegt oben: ein Halteseil, keine Zugleine. Ina prüft den Knoten und öffnet die Brücke zum Kranplatz.',
    effects: [
      { kind: 'removeItem', itemId: 'item_mat_astholz', quantity: 1 },
      { kind: 'removeItem', itemId: 'item_mat_rankenseil', quantity: 1 },
      { kind: 'setFlag', flag: 'brueckenseil_befestigt' },
      { kind: 'unlockPassage', passageId: 'v018' }
    ]
  },
  {
    id: 'int_bd_quellventil_oeffnen',
    areaId: 'bd_quellast',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Öffne das Quellventil',
    description: 'Ergänze zuerst den Rohrbericht: Klemme, Rinne und Zielast.',
    completedWhen: flag('quellventil_geoeffnet'),
    resultText: 'Blaue Klemme, mittlere Rinne, Gartenast: Kühles Wasser erreicht die Wurzeln. Der Weg entlang der Wasserader zum Wipfelsteg ist offen.',
    effects: [
      { kind: 'setFlag', flag: 'quellventil_geoeffnet' },
      { kind: 'unlockPassage', passageId: 'v014' }
    ]
  },
  {
    id: 'int_bd_rammwarnung_lesen',
    areaId: 'bd_rankentor',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Lies die Rammwarnung',
    description: 'Prüfe Zugankündigung, Verteidigung und Trefferfenster vor dem Kampf.',
    resultText: 'Klick speichert: «Tiefes Knarren – Rammstoss – verteidigen. Danach zeigt ein offener Riss das Trefferfenster.» Der Gartenweg bleibt der sichere Rückweg.',
    completedWhen: flag('rammwarnung_gelesen'),
    effects: [
      { kind: 'setFlag', flag: 'rammwarnung_gelesen' },
      { kind: 'discoverClue', clueId: 'regel_offener_riss' }
    ]
  },
  {
    id: 'int_bd_obstbrot_nehmen',
    areaId: 'bd_obstterrasse',
    actionType: 'TAKE_ITEM',
    label: 'Packe Obstbrot ein',
    description: 'Nimm ein Brot aus dem geprüften Versorgungskorb.',
    visibilityRequirement: flag('obstwaage_geloest'),
    resultText: 'Du packst ein Obstbrot ein. Nach einer Rast füllen die Pflückenden den Korb wieder auf.',
    effects: [{ kind: 'addItem', itemId: 'item_consume_obstbrot', quantity: 1 }],
    restockAfterRest: true
  },
  {
    id: 'int_bd_stempel_praegen',
    areaId: 'bd_kronenstation',
    actionType: 'COMPLETE_INTERACTION',
    label: 'Präge den Blätterstempel',
    description: 'Fenn liest den Stationsbericht; Ina kontrolliert Presse und sicheren Rückweg.',
    requirement: all(flag('quellventil_geoeffnet'), flag('aststampfer_beruhigt'), flag('brueckenseil_befestigt'), flag('kronenheber_abgeschaltet')),
    completedWhen: item('item_quest_blaetterstempel'),
    blockedText: 'Quellleitung, Aststampfer, Brückenseil und Kronenheber müssen im Stationsbericht bestätigt sein.',
    resultText: 'Fenn liest jedes Prüffeld, Ina kontrolliert es, dann prägt ihr den Blätterstempel. In Kesselbrück öffnet Ina eine Dachabkürzung. Meral erkennt: Das Werk sammelt nicht nur Kisten, sondern auch Kräfte und Wege.',
    effects: [
      { kind: 'addItem', itemId: 'item_quest_blaetterstempel', quantity: 1 },
      { kind: 'setFlag', flag: 'blaetterdaecher_befreit' },
      { kind: 'unlockPassage', passageId: 'v008' }
    ]
  }
]
