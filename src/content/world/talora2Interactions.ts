import type { InteractionDefinition, InteractionEffect, Requirement } from '../../domain/content'

const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })
const item = (itemId: string, quantity = 1): Requirement => ({ kind: 'item', itemId, quantity })
const all = (...requirements: Requirement[]): Requirement => ({ kind: 'all', requirements })
const setFlag = (value: string): InteractionEffect => ({ kind: 'setFlag', flag: value })
const addItem = (itemId: string, quantity = 1): InteractionEffect => ({ kind: 'addItem', itemId, quantity })
const removeItem = (itemId: string, quantity = 1): InteractionEffect => ({ kind: 'removeItem', itemId, quantity })

function puzzleInteraction(
  id: string,
  areaId: string,
  label: string,
  resultText: string,
  effects: InteractionEffect[],
  requirement?: Requirement,
  blockedText?: string
): InteractionDefinition {
  return {
    id, areaId, actionType: 'COMPLETE_INTERACTION', label,
    description: 'Bestätige deine Lösung. Ein falscher Versuch verbraucht nichts.',
    resultText, effects, requirement, blockedText
  }
}

const puzzleInteractions: InteractionDefinition[] = [
  puzzleInteraction(
    'int_sm_schattenkarte_abschliessen', 'sm_kartenstube', 'Öffne Alvas drei Wege',
    'Die drei Zeichen leuchten. Kuno liest die Namen laut: «Arbor. Marea. Voltaro. Wir holen ihre Schatten zurück.»',
    [setFlag('schattenkarte_geloest'), setFlag('prolog_abgeschlossen')], flag('schattenzipfel_beruhigt'),
    'Hilf zuerst dem Schattenzipfel auf dem Festplatz.'
  ),
  puzzleInteraction('int_ww_tierpfade_abschliessen', 'ww_mooslichtung', 'Zeige Lio die Tierpfade', 'Hase, Igel und Reh finden ihre sicheren Plätze. Lio gibt den Weg zur Wurzelbrücke frei.', [setFlag('tierpfade_gelesen')]),
  puzzleInteraction('int_ww_glasblueten_abschliessen', 'ww_gluehgarten', 'Richte die Glasblüten aus', 'Das Licht wandert von Blüte zu Blüte. Die schwarzen Ranken ziehen sich vom Wipfelsteg zurück.', [setFlag('glasblueten_ausgerichtet')]),
  puzzleInteraction('int_ww_wurzelbruecke_abschliessen', 'ww_wurzelbruecke', 'Lege den festen Wurzelweg', 'Du markierst jeden festen Schritt. Arbor kann den Weg nun sicher zum Heiligtum gehen.', [setFlag('wurzelbruecke_repariert')]),
  puzzleInteraction('int_sk_hafenlichter_abschliessen', 'sk_muschelhafen', 'Zünde die Hafenlichter an', 'Ebbe, Mitte, Flut: Nela lächelt. «Jetzt sehen die Boote den Weg. Und ich kann dir den Wellenspeer bauen.»', [setFlag('hafenlichter_geordnet'), setFlag('wellenspeer_rezept')]),
  puzzleInteraction('int_sk_schleuse_abschliessen', 'sk_schleusensteg', 'Öffne den Wasserweg', 'Klares Wasser läuft durch den offenen Zulauf und das halbe Mitteltor in den Seitenkanal. Der Weg zur Quellinsel ist frei.', [setFlag('schleuse_geloest')]),
  puzzleInteraction('int_sk_leuchtturm_abschliessen', 'sk_alter_leuchtturm', 'Sende das richtige Licht', 'Sonne, Welle, Boot. Der echte Schattenweg bleibt hell, die falschen Wege verschwinden.', [setFlag('leuchtturm_ausgerichtet')]),
  puzzleInteraction('int_dh_warnfahnen_abschliessen', 'dh_warnmast', 'Setze Tavis Warnfahnen', 'Kreis, Streifen, Dreieck flattern am Mast. Alle sehen nun, wann eine Ladung kommt.', [setFlag('warnfahnen_gesetzt')]),
  puzzleInteraction('int_dh_windruf_abschliessen', 'dh_spulengasse', 'Rufe den Wind', 'Glocke, Schritt, Klatschen. Die Übungsladung sinkt, und der Weg zur Mine wird ruhig.', [setFlag('windruf_geloest')]),
  puzzleInteraction('int_dh_gleiter_abschliessen', 'dh_wolkenbruecke', 'Richte den Gleiter aus', 'Segel und Korb hängen gleich hoch. Der Gleiter trägt euch sicher zum Gewitterturm.', [setFlag('gleiter_ausgerichtet')]),
  puzzleInteraction('int_vp_wegkreuz_abschliessen', 'vp_wegkreuz', 'Lege Alvas hellen Weg', 'Die hellen Steine bilden einen durchgehenden Weg. Kunos Schatten hat daneben einen kleinen Pfeil gezeichnet.', [setFlag('wegkreuz_geloest')]),
  puzzleInteraction('int_fi_mantelrezept_abschliessen', 'fi_suppenkueche', 'Lies Nimas Mantelrezept', '«Zwei helle Fasern und eine Glutschale», liest Nima. «Mehr braucht ein sicherer Mantel nicht.»', [setFlag('feuermantel_rezept')]),
  puzzleInteraction('int_fi_nestwaage_abschliessen', 'fi_waagehaus', 'Wärme beide Nestseiten', 'Beide Seiten erhalten vier Wärmepunkte. Aus dem Ei kommt ein leises Piepsen.', [setFlag('nestwaage_geloest')]),
  puzzleInteraction('int_fs_elis_sterntext_abschliessen', 'fs_sternarchiv', 'Ergänze Elis Bericht', 'Der blaue Stern steht morgens links. Kuno schreibt jedes Wort ab und setzt Elis Namen darunter.', [setFlag('elis_sterntext_geloest')]),
  puzzleInteraction('int_fs_spiegel_abschliessen', 'fs_spiegelhof', 'Richte die Sternspiegel aus', 'Die drei Spiegel werfen einen blauen Stern auf das Eis. Der Reif schmilzt von den Gelenken.', [setFlag('spiegel_ausgerichtet')]),
  puzzleInteraction('int_lm_fuchsspuren_abschliessen', 'lm_schilfpfad', 'Markiere die echte Spur', 'Die kleinen Pfoten führen weiter. Pavo erkennt die Schleifspur und die falschen Doppelkerben.', [setFlag('fuchsspur_geloest')]),
  puzzleInteraction('int_lm_lichtweg_abschliessen', 'lm_nebelsteg', 'Lege den Lichtweg', 'Deine Markierungen verbinden die festen Planken. Ein sicherer Weg reicht bis zur Lichtinsel.', [setFlag('lichtweg_gelegt')]),
  puzzleInteraction(
    'int_rn_schatten_heimrufen_abschliessen', 'rn_weltenkammer', 'Ruf die sieben Schatten heim',
    'Du nennst jeden Namen und eine gute Erinnerung. Die Schatten kehren heim. Kuno nimmt seinen Schatten an die Hand. Ohne die fremden Fäden fällt Raugrim zurück ins Bannschloss.',
    [setFlag('talora2_abgeschlossen')], flag('raugrim_faeden_getrennt'), 'Trenne zuerst Raugrims Fäden.'
  )
]

export const talora2Interactions: InteractionDefinition[] = [
  ...puzzleInteractions,
  {
    id: 'int_sm_tessa_sprechen', areaId: 'sm_sonnenwacht', actionType: 'COMPLETE_INTERACTION', label: 'Sprich mit Tessa',
    description: 'Zeige Tessa deine Ausrüstung und frage nach dem Lichterfest.',
    resultText: 'Tessa prüft Reiseschwert, Wams, Laterne und drei Apfelbrote. «Alles da. Bleib bei Kuno. Heute braucht er einen Freund, keinen Helden.»',
    completedWhen: flag('tessa_gesprochen'), effects: [setFlag('tessa_gesprochen'), { kind: 'discoverClue', clueId: 'regel_verteidigen' }, { kind: 'discoverClue', clueId: 'regel_flucht' }]
  },
  {
    id: 'int_sm_alvas_klinge_zeigen', areaId: 'sm_morgen_tempel', actionType: 'COMPLETE_INTERACTION', label: 'Frage nach der Morgenklinge',
    description: 'Tessa erklärt, warum die alte Klinge im Bannschloss bleibt.',
    resultText: 'Die Morgenklinge bleibt bei Raugrims Schloss. «Die alte Klinge hält Raugrim weiter gefangen», sagt Tessa. «Wir holen Freunde nach Hause.»',
    completedWhen: flag('morgenklinge_besucht'), effects: [setFlag('morgenklinge_besucht')]
  },
  {
    id: 'int_sm_tempellicht', areaId: 'sm_tempelgarten', actionType: 'TAKE_ITEM', label: 'Nimm den losen Kartenrand',
    description: 'Ein Stück von Alvas Karte liegt unter der Bank.', resultText: 'Der Kartenrand zeigt einen Waldweg und zwei kleine Fussabdrücke.',
    completedWhen: item('item_quest_kartenrand_wald'), effects: [addItem('item_quest_kartenrand_wald'), { kind: 'discoverClue', clueId: 'item_quest_kartenrand_wald' }]
  },

  {
    id: 'int_ww_material', areaId: 'ww_alte_baumschule', actionType: 'TAKE_ITEM', label: 'Nimm Astholz und Rankenseil',
    description: 'Lio hat trockenes Holz und alte Ranken markiert.', resultText: 'Du nimmst Astholz und ein festes Rankenseil. Nach einer Rast liegt wieder genug bereit.',
    effects: [addItem('item_mat_astholz'), addItem('item_mat_rankenseil')], restockAfterRest: true
  },
  {
    id: 'int_ww_astbeil_bauen', areaId: 'ww_foersterhaus', actionType: 'COMPLETE_INTERACTION', label: 'Baue mit Lio das Astbeil',
    description: 'Du brauchst Astholz und ein Rankenseil.', resultText: 'Lio bindet die breite Klinge fest. «Kapphieb stoppt eine Aufladung. Nutze ihn, wenn der nächste Gegnerzug eine Aufladung ankündigt.»',
    requirement: all(item('item_mat_astholz'), item('item_mat_rankenseil')), completedWhen: item('item_weapon_astbeil'), blockedText: 'Astholz und Rankenseil liegen in der Alten Baumschule.',
    effects: [removeItem('item_mat_astholz'), removeItem('item_mat_rankenseil'), addItem('item_weapon_astbeil')]
  },

  {
    id: 'int_sk_material', areaId: 'sk_schilfkanal', actionType: 'TAKE_ITEM', label: 'Sammle Speermaterial',
    description: 'Nimm trockenes Schwemmholz und eine feste Wasserfaser.', resultText: 'Du findest ein gerades Holzstück und eine lange Faser. Nach einer Rast treibt neues Material an.',
    effects: [addItem('item_mat_schwemmholz'), addItem('item_mat_wasserfaser')], restockAfterRest: true
  },
  {
    id: 'int_sk_wellenspeer_bauen', areaId: 'sk_muschelhafen', actionType: 'COMPLETE_INTERACTION', label: 'Baue mit Nela den Wellenspeer',
    description: 'Nela braucht Schwemmholz und Wasserfaser.', resultText: 'Nela bindet die Faser um die Speerspitze. «Schwallstoss macht Gegner nass. Dann treffen Eis und Blitz besser.»',
    visibilityRequirement: flag('wellenspeer_rezept'), requirement: all(item('item_mat_schwemmholz'), item('item_mat_wasserfaser')), completedWhen: item('item_weapon_wellenspeer'), blockedText: 'Sammle Schwemmholz und Wasserfaser im Schilfkanal.',
    effects: [removeItem('item_mat_schwemmholz'), removeItem('item_mat_wasserfaser'), addItem('item_weapon_wellenspeer')]
  },
  {
    id: 'int_sk_treppe_reparieren', areaId: 'sk_fischertreppe', actionType: 'COMPLETE_INTERACTION', label: 'Befestige die lose Stufe',
    description: 'Ein Seil und ein Holzkeil liegen direkt daneben.', resultText: 'Die Stufe sitzt fest. Der trockene Weg zum Tempel ist wieder sicher.',
    completedWhen: flag('fischertreppe_repariert'), effects: [setFlag('fischertreppe_repariert')]
  },
  {
    id: 'int_sk_muschelharnisch', areaId: 'sk_muschelhafen', actionType: 'COMPLETE_INTERACTION', label: 'Baue den Muschelharnisch',
    description: 'Nela kann aus einer Wasserfaser einen blitzsicheren Harnisch binden.', resultText: 'Der Muschelharnisch sitzt fest. Er halbiert Blitzschaden.',
    requirement: item('item_mat_wasserfaser'), completedWhen: item('item_armor_muschelharnisch'), blockedText: 'Eine Wasserfaser wächst im Schilfkanal.',
    effects: [removeItem('item_mat_wasserfaser'), addItem('item_armor_muschelharnisch')]
  },

  {
    id: 'int_dh_spulendraht', areaId: 'dh_spulengasse', actionType: 'TAKE_ITEM', label: 'Nimm entladenen Spulendraht',
    description: 'Die ruhige Übungsspule ist kalt genug.', resultText: 'Du nimmst eine Rolle Spulendraht. Die Werkleute legen nach einer Rast neuen Draht bereit.',
    requirement: flag('windruf_geloest'), blockedText: 'Löse zuerst den Windruf hier in der Spulengasse.', effects: [addItem('item_mat_spulendraht')], restockAfterRest: true
  },
  {
    id: 'int_dh_werkzeugstahl', areaId: 'dh_kristallmine', actionType: 'TAKE_ITEM', label: 'Nimm Werkzeugstahl',
    description: 'Tavi hat sicheren Stahl mit einem Kreis markiert.', resultText: 'Der Werkzeugstahl ist schwer und glatt. Nach einer Rast liegt ein neues Stück bereit.',
    effects: [addItem('item_mat_werkzeugstahl')], restockAfterRest: true
  },
  {
    id: 'int_dh_donnerhammer_bauen', areaId: 'dh_kupferhof', actionType: 'COMPLETE_INTERACTION', label: 'Baue mit Tavi den Donnerhammer',
    description: 'Du brauchst Spulendraht und Werkzeugstahl.', resultText: 'Tavi wickelt den Draht um den Hammer. «Kurzschluss stoppt eine Ladung. Der schwere Kopf bricht Panzer.»',
    requirement: all(item('item_mat_spulendraht'), item('item_mat_werkzeugstahl')), completedWhen: item('item_weapon_donnerhammer'), blockedText: 'Spulendraht liegt in der Gasse, Werkzeugstahl in der Mine.',
    effects: [removeItem('item_mat_spulendraht'), removeItem('item_mat_werkzeugstahl'), addItem('item_weapon_donnerhammer')]
  },
  {
    id: 'int_dh_pfaehle_erden', areaId: 'dh_erdungsfeld', actionType: 'COMPLETE_INTERACTION', label: 'Erde die drei Pfähle',
    description: 'Verbinde die Pfähle vom kleinsten zum grössten Kreis.', resultText: 'Die Ladung fliesst ruhig in den Boden. Der Seitenweg zur Mine ist frei.',
    completedWhen: flag('pfahle_geerdet'), effects: [setFlag('pfahle_geerdet')]
  },

  {
    id: 'int_vp_alvas_klinge', areaId: 'vp_fernwegtor', actionType: 'TAKE_ITEM', label: 'Nimm Alvas Klinge',
    description: 'Tessa legt eine leichte Klinge vor die drei leuchtenden Zeichen.',
    resultText: 'Die Klinge leuchtet erst rot, dann blau, dann golden. Am Rastplatz kannst du Feuer, Eis oder Licht wählen.',
    visibilityRequirement: all(flag('arbors_schatten_zurueck'), flag('mareas_schatten_zurueck'), flag('voltaros_schatten_zurueck')),
    completedWhen: item('item_weapon_alvas_klinge'), effects: [addItem('item_weapon_alvas_klinge'), { kind: 'equipItem', itemId: 'item_weapon_alvas_klinge' }]
  },
  {
    id: 'int_vp_waechterbogen', areaId: 'vp_weglager', actionType: 'TAKE_ITEM', label: 'Öffne Tessas lange Truhe',
    description: 'Die Truhe öffnet sich für Blatt, Welle und Flügel.', resultText: 'In der Truhe liegt der Wächterbogen. Er trifft fliegende Gegner besonders gut.',
    requirement: all(...['arbors_schatten_zurueck', 'mareas_schatten_zurueck', 'voltaros_schatten_zurueck'].map(flag)), completedWhen: item('item_weapon_waechterbogen'),
    effects: [addItem('item_weapon_waechterbogen')]
  },

  {
    id: 'int_fi_zange', areaId: 'fi_gluthafen', actionType: 'TAKE_ITEM', label: 'Nimm Nimas lange Zange',
    description: 'Damit erreichst du die weiss markierten Glutschalen.', resultText: 'Nima drückt dir die kühle Zange in die Hand. «Nur die Schalen mit dem weissen Ring.»',
    completedWhen: flag('nimas_zange_erhalten'), effects: [addItem('item_tool_nimas_zange'), setFlag('nimas_zange_erhalten')]
  },
  {
    id: 'int_fi_ofenfasern', areaId: 'fi_ofenfaserhang', actionType: 'TAKE_ITEM', label: 'Sammle zwei helle Ofenfasern',
    description: 'Die hellen Fasern sind kühl und sicher.', resultText: 'Du nimmst zwei helle Fasern. Nach einer Rast sind neue gewachsen.',
    effects: [addItem('item_mat_ofenfaser', 2)], restockAfterRest: true
  },
  {
    id: 'int_fi_glutschale', areaId: 'fi_glutschalenfeld', actionType: 'TAKE_ITEM', label: 'Nimm eine sichere Glutschale',
    description: 'Greife mit Nimas Zange nach dem weissen Ring.', resultText: 'Die Zange hält die Schale sicher. Nach einer Rast ist eine neue Schale bereit.',
    requirement: item('item_tool_nimas_zange'), blockedText: 'Nimm zuerst Nimas lange Zange im Gluthafen.', effects: [addItem('item_mat_glutschale')], restockAfterRest: true
  },
  {
    id: 'int_fi_hitzeklappe', areaId: 'fi_glutschalenfeld', actionType: 'COMPLETE_INTERACTION', label: 'Öffne die Hitzeklappe',
    description: 'Der Griff liegt im kühlen Schatten.', resultText: 'Frische Luft strömt zur Rotglasgrotte.', completedWhen: flag('hitzeklappe_geoeffnet'), effects: [setFlag('hitzeklappe_geoeffnet')]
  },
  {
    id: 'int_fi_feuermantel', areaId: 'fi_suppenkueche', actionType: 'COMPLETE_INTERACTION', label: 'Nähe den Feuermantel',
    description: 'Du brauchst zwei Ofenfasern und eine Glutschale.', resultText: 'Nima näht die Fasern um die ruhige Wärme. Der Feuermantel hält Feuer ganz ab.',
    visibilityRequirement: flag('feuermantel_rezept'), requirement: all(item('item_mat_ofenfaser', 2), item('item_mat_glutschale')), completedWhen: item('item_armor_feuermantel'), blockedText: 'Sammle zwei helle Ofenfasern und eine sichere Glutschale.',
    effects: [removeItem('item_mat_ofenfaser', 2), removeItem('item_mat_glutschale'), addItem('item_armor_feuermantel')]
  },
  {
    id: 'int_fi_rotglas', areaId: 'fi_rotglasgrotte', actionType: 'TAKE_ITEM', label: 'Nimm Rotglas',
    description: 'Ein kühles Stück liegt neben der offenen Klappe.', resultText: 'Du nimmst das glatte Rotglas. Nach einer Rast ist ein neues Stück abgekühlt.',
    effects: [addItem('item_mat_rotglas'), setFlag('grotte_gelueftet')], restockAfterRest: true
  },
  {
    id: 'int_fi_glutsaebel', areaId: 'fi_suppenkueche', actionType: 'COMPLETE_INTERACTION', label: 'Baue den Glutsäbel',
    description: 'Nima braucht Rotglas für die warme Klinge.', resultText: 'Das Rotglas wird zu einer warmen Klinge. Brandhieb lässt Gegner weiterbrennen.',
    requirement: item('item_mat_rotglas'), completedWhen: item('item_weapon_glutsaebel'), blockedText: 'Rotglas liegt in der gelüfteten Grotte.',
    effects: [removeItem('item_mat_rotglas'), addItem('item_weapon_glutsaebel')]
  },
  {
    id: 'int_fi_kuehlrinne', areaId: 'fi_kuehlrinne', actionType: 'COMPLETE_INTERACTION', label: 'Öffne den Wasserschieber',
    description: 'Leite klares Wasser zum Ofenring.', resultText: 'Wasser läuft über den heissen Stein. Du kannst nun sicher zum Ofenring gehen.',
    completedWhen: flag('kuehlrinne_geoeffnet'), effects: [setFlag('kuehlrinne_geoeffnet')]
  },

  {
    id: 'int_fs_rezept', areaId: 'fs_waermestube', actionType: 'COMPLETE_INTERACTION', label: 'Lies das Wärmewams-Rezept',
    description: 'Zwei Firnfelle und eine Kaltperle halten die Kälte ab.', resultText: 'Eli liest den Plan mit dir. Zwei Felle kommen aussen hin, die Kaltperle in die Mitte.',
    completedWhen: flag('waermewams_rezept'), effects: [setFlag('waermewams_rezept')]
  },
  {
    id: 'int_fs_firnfell', areaId: 'fs_firnufer', actionType: 'TAKE_ITEM', label: 'Nimm zwei Firnfelle',
    description: 'Eli hat die Firnfelle aus ausgekämmter Winterwolle gewebt und zum Mitnehmen aufgehängt.', resultText: 'Du nimmst zwei Felle. Nach einer Rast hängen wieder trockene Felle bereit.',
    effects: [addItem('item_mat_firnfell', 2)], restockAfterRest: true
  },
  {
    id: 'int_fs_kaltperle', areaId: 'fs_kaltperlengrotte', actionType: 'TAKE_ITEM', label: 'Nimm eine rohe Kaltperle',
    description: 'Die Perle liegt im trockenen Teil der Grotte.', resultText: 'Die Perle sammelt Kälte und hält so das Innere des Wärmewamses warm. Nach einer Rast liegt eine neue am Rand.',
    effects: [addItem('item_mat_kaltperle')], restockAfterRest: true
  },
  {
    id: 'int_fs_waermewams', areaId: 'fs_waermestube', actionType: 'COMPLETE_INTERACTION', label: 'Nähe das Wärmewams',
    description: 'Du brauchst zwei Firnfelle und eine rohe Kaltperle.', resultText: 'Eli näht langsam mit. Das fertige Wams hält Eisschaden ganz ab.',
    visibilityRequirement: flag('waermewams_rezept'), requirement: all(item('item_mat_firnfell', 2), item('item_mat_kaltperle')), completedWhen: item('item_armor_waermewams'), blockedText: 'Zwei Firnfelle liegen am Ufer, eine Kaltperle in der Grotte.',
    effects: [removeItem('item_mat_firnfell', 2), removeItem('item_mat_kaltperle'), addItem('item_armor_waermewams')]
  },
  {
    id: 'int_fs_frostlanze', areaId: 'fs_waermestube', actionType: 'COMPLETE_INTERACTION', label: 'Baue die Frostlanze',
    description: 'Eine rohe Kaltperle kühlt die Lanzenspitze.', resultText: 'Die Frostlanze glitzert. Frostgriff lässt einen Gegner eine Runde aussetzen.',
    requirement: item('item_mat_kaltperle'), completedWhen: item('item_weapon_frostlanze'), blockedText: 'Eine Kaltperle liegt in der Grotte.',
    effects: [removeItem('item_mat_kaltperle'), addItem('item_weapon_frostlanze')]
  },
  {
    id: 'int_fs_kuppel_wams', areaId: 'fs_kuppelgang', actionType: 'COMPLETE_INTERACTION', label: 'Zieh das Wärmewams an',
    description: 'Der Kuppelweg ist zu kalt für andere Kleidung.', resultText: 'Du ziehst das Wärmewams an. Der kalte Wind kann dir nichts mehr anhaben.',
    requirement: item('item_armor_waermewams'), completedWhen: flag('kuppel_wams_geprueft'), blockedText: 'Nähe zuerst das Wärmewams in der Wärmestube.',
    effects: [{ kind: 'equipItem', itemId: 'item_armor_waermewams' }, setFlag('kuppel_wams_geprueft')]
  },

  {
    id: 'int_lm_blenden', areaId: 'lm_laternenhaus', actionType: 'COMPLETE_INTERACTION', label: 'Hilf Luma mit den Blenden',
    description: 'Luma zeigt dir die Halterungen. Setze mit ihr die kleine und die grosse Blende vor die Lampe.', resultText: 'Der Lichtweg trifft den Blendengang, ohne Pavo zu blenden.',
    completedWhen: flag('laternenblenden_geordnet'), effects: [setFlag('laternenblenden_geordnet')]
  },
  {
    id: 'int_lm_laternenstein', areaId: 'lm_laternenhaus', actionType: 'TAKE_ITEM', label: 'Nimm einen rohen Laternenstein',
    description: 'Luma gibt dir einen kleinen Stein für den Stab.', resultText: 'Der Stein leuchtet nur so hell wie nötig. Luma legt nach einer Rast einen neuen bereit.',
    effects: [addItem('item_mat_laternenstein')], restockAfterRest: true
  },
  {
    id: 'int_lm_moorfaser', areaId: 'lm_torfgarten', actionType: 'TAKE_ITEM', label: 'Sammle zwei Moorfasern',
    description: 'Nimm nur Fasern von den hell markierten Inseln.', resultText: 'Du nimmst zwei feste Fasern. Nach einer Rast sind neue gewachsen.',
    effects: [addItem('item_mat_moorfaser', 2)], restockAfterRest: true
  },
  {
    id: 'int_lm_teichmaterial', areaId: 'lm_schwarzteich', actionType: 'TAKE_ITEM', label: 'Sammle Dunkelglas und Schwemmholz',
    description: 'Beides liegt trocken am ruhigen Ufer.', resultText: 'Du nimmst Dunkelglas und ein Stück Schwemmholz. Nach einer Rast spült der Teich neues Material an.',
    effects: [addItem('item_mat_dunkelglas'), addItem('item_mat_schwemmholz'), setFlag('pfahlzeichen_gelesen')], restockAfterRest: true
  },
  {
    id: 'int_lm_laternenstab', areaId: 'lm_laternenhaus', actionType: 'COMPLETE_INTERACTION', label: 'Baue den Laternenstab',
    description: 'Luma braucht eine Moorfaser und einen Laternenstein.', resultText: 'Der Laternenstab trägt Lichtkraft. Sein Netz hält fliegende Gegner am Boden und stoppt ihre Aufladung oder Heilung.',
    requirement: all(item('item_mat_moorfaser'), item('item_mat_laternenstein')), completedWhen: item('item_weapon_laternenstab'), blockedText: 'Moorfaser wächst im Torfgarten. Einen Stein hat Luma.',
    effects: [removeItem('item_mat_moorfaser'), removeItem('item_mat_laternenstein'), addItem('item_weapon_laternenstab')]
  },
  {
    id: 'int_lm_schattenumhang', areaId: 'lm_laternenhaus', actionType: 'COMPLETE_INTERACTION', label: 'Nähe den Schattenumhang',
    description: 'Du brauchst Moorfaser, Dunkelglas und Schwemmholz.', resultText: 'Luma näht das Glas in den Saum. Der Umhang halbiert Schattenschaden, macht Waffenkünste aber langsamer.',
    requirement: all(item('item_mat_moorfaser'), item('item_mat_dunkelglas'), item('item_mat_schwemmholz')), completedWhen: item('item_armor_schattenumhang'), blockedText: 'Moorfaser wächst im Garten. Dunkelglas und Holz liegen am Schwarzteich.',
    effects: [removeItem('item_mat_moorfaser'), removeItem('item_mat_dunkelglas'), removeItem('item_mat_schwemmholz'), addItem('item_armor_schattenumhang')]
  },
  {
    id: 'int_lm_umhang_pruefen', areaId: 'lm_schattenwehr', actionType: 'COMPLETE_INTERACTION', label: 'Zieh den Schattenumhang an',
    description: 'Der Nachtpfad liegt hinter dichtem Schattennebel.', resultText: 'Du ziehst den Schattenumhang an. Der Nebel fühlt sich nur noch halb so schwer an.',
    requirement: item('item_armor_schattenumhang'), completedWhen: flag('nachtpfad_umhang_geprueft'), blockedText: 'Luma näht den Schattenumhang im Laternenhaus.',
    effects: [{ kind: 'equipItem', itemId: 'item_armor_schattenumhang' }, setFlag('nachtpfad_umhang_geprueft')]
  },

  {
    id: 'int_sm_wegklinge', areaId: 'sm_sonnenwacht', actionType: 'TAKE_ITEM', label: 'Nimm Tessas Wegklinge',
    description: 'Sechs gerettete Freunde haben ein Zeichen in die Klinge gesetzt.', resultText: 'Tessa gibt dir die Wegklinge. «Sie trägt alle Wege. Aber du entscheidest, welchen sie zeigt.»',
    visibilityRequirement: all(...[...['arbors_schatten_zurueck', 'mareas_schatten_zurueck', 'voltaros_schatten_zurueck'], ...['feuervogel_gerettet', 'sternenschatten_gerettet', 'laternenfuchs_gerettet']].map(flag)),
    completedWhen: item('item_weapon_wegklinge'), effects: [addItem('item_weapon_wegklinge')]
  },
  {
    id: 'int_rn_vorrat', areaId: 'rn_rand_der_nacht', actionType: 'TAKE_ITEM', label: 'Nimm Tessas Klarwasser',
    description: 'Eine Flasche steht neben dem letzten Rastlicht.', resultText: 'Klarwasser hilft gegen Nebel und Hitze. Nach einer Rast steht wieder eine Flasche bereit.',
    effects: [addItem('item_consume_klarwasser')], restockAfterRest: true
  }
]
