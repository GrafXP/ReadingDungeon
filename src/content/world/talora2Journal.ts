import type { CampaignJournalDefinition, QuestViewDefinition, ReminderGroupDefinition, Requirement, RuleCardDefinition, WorldDefinition } from '../../domain/content'
import type { GameSave } from '../../domain/game'

const hasFlag = (save: GameSave, value: string) => save.flags.includes(value)
const hasItem = (save: GameSave, value: string) => (save.player.inventory[value] ?? 0) > 0
const won = (save: GameSave, value: string) => save.defeatedEncounterIds.includes(value)
const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })
const allFlags = (...values: string[]): Requirement => ({ kind: 'all', requirements: values.map(flag) })
const anyFlags = (...values: string[]): Requirement => ({ kind: 'any', requirements: values.map(flag) })
const atLeastTwo = (values: string[]): Requirement => ({ kind: 'any', requirements: [[0, 1], [0, 2], [1, 2]].map(([a, b]) => allFlags(values[a], values[b])) })

function quest(id: string, title: string, description: string, done: boolean, hint: string, hintAreaIds: string[]): QuestViewDefinition {
  return { id, title, description, done, current: !done, hint, hintAreaIds }
}

const nearFlags = ['arbors_schatten_zurueck', 'mareas_schatten_zurueck', 'voltaros_schatten_zurueck']
const outerFlags = ['feuervogel_gerettet', 'sternenschatten_gerettet', 'laternenfuchs_gerettet']

function prologueQuests(save: GameSave): QuestViewDefinition[] {
  return [
    quest('prolog_tessa', 'Prüfe deine Ausrüstung', 'Sprich in Sonnenwacht mit Tessa.', hasFlag(save, 'tessa_gesprochen'), 'Tessa steht am Herd in Sonnenwacht.', ['sm_sonnenwacht']),
    quest('prolog_fest', 'Folge Kunos Schatten', 'Gehe zum Festplatz und beruhige den Schattenzipfel.', hasFlag(save, 'schattenzipfel_beruhigt'), 'Beobachte den Schattenzipfel und greife mit dem Reiseschwert an. Beobachten kostet keinen Zug.', ['sm_festplatz']),
    quest('prolog_karte', 'Lies Alvas Karte', 'Ordne Huf, Wasser und Feder den drei Zeichen zu.', hasFlag(save, 'prolog_abgeschlossen'), 'Die Karte liegt in der Kartenstube.', ['sm_kartenstube'])
  ]
}

function nearQuests(save: GameSave): QuestViewDefinition[] {
  return [
    quest('ww_tiere', 'Waldtiere finden', 'Lies die drei Spuren auf der Mooslichtung.', hasFlag(save, 'tierpfade_gelesen'), 'Hase, Igel und Reh suchen verschiedene Plätze.', ['ww_mooslichtung']),
    quest('ww_licht', 'Licht zum Wipfel bringen', 'Richte die Glasblüten von dunkel nach hell aus.', hasFlag(save, 'glasblueten_ausgerichtet'), 'Der Glühgarten liegt neben Lios Haus.', ['ww_gluehgarten']),
    quest('ww_beil', 'Das Astbeil bauen', 'Sammle Astholz und Rankenseil. Bring beides zu Lio.', hasItem(save, 'item_weapon_astbeil'), 'Beide Teile liegen in der Alten Baumschule.', ['ww_alte_baumschule', 'ww_foersterhaus']),
    quest('ww_arbor', 'Arbors Schatten zurückrufen', 'Erreiche das Heiligtum über die Wurzelbrücke oder die Baumschule und hilf Arbor.', hasFlag(save, 'arbors_schatten_zurueck'), 'Rüste das Astbeil aus. Kapphieb stoppt die Ladung.', ['ww_wurzelheiligtum']),

    quest('sk_licht', 'Die Hafenlichter ordnen', 'Stelle Ebbe, Mitte und Flut richtig auf.', hasFlag(save, 'hafenlichter_geordnet'), 'Nelas Lichter stehen im Muschelhafen.', ['sk_muschelhafen']),
    quest('sk_wasser', 'Den Wasserweg öffnen', 'Richte die drei Schleusentore aus.', hasFlag(save, 'schleuse_geloest'), 'Vorne offen, Mitte halb, hinten zu.', ['sk_schleusensteg']),
    quest('sk_speer', 'Den Wellenspeer bauen', 'Sammle Holz und Wasserfaser. Bring beides zu Nela.', hasItem(save, 'item_weapon_wellenspeer'), 'Das Material treibt im Schilfkanal.', ['sk_schilfkanal', 'sk_muschelhafen']),
    quest('sk_marea', 'Mareas Schatten zurückrufen', 'Erreiche den Tempel über das Muscheltor oder die reparierte Treppe und hilf Marea.', hasFlag(save, 'mareas_schatten_zurueck'), 'Schwallstoss macht den Schatten nass. Blitz trifft dann stärker.', ['sk_gezeitentempel']),

    quest('dh_fahnen', 'Die Warnfahnen setzen', 'Ordne Kreis, Streifen und Dreieck.', hasFlag(save, 'warnfahnen_gesetzt'), 'Die Tafel hängt am Warnmast.', ['dh_warnmast']),
    quest('dh_ruf', 'Die Übungsladung stoppen', 'Spiele Glocke, Schritt und Klatschen.', hasFlag(save, 'windruf_geloest'), 'Die Zeichen stehen in der Spulengasse.', ['dh_spulengasse']),
    quest('dh_hammer', 'Den Donnerhammer bauen', 'Sammle Spulendraht und Werkzeugstahl. Bring beides zu Tavi.', hasItem(save, 'item_weapon_donnerhammer'), 'Draht liegt in der Gasse, Stahl in der Mine.', ['dh_spulengasse', 'dh_kristallmine', 'dh_kupferhof']),
    quest('dh_voltaro', 'Voltaros Schatten zurückrufen', 'Erreiche den Turm über den Gleiter oder am Kupferläufer vorbei. Hilf dort Voltaro.', hasFlag(save, 'voltaros_schatten_zurueck'), 'Verteidige den Sturzflug. Kurzschluss stoppt die Ladung.', ['dh_gewitterturm'])
  ]
}

function outerQuests(save: GameSave): QuestViewDefinition[] {
  return [
    quest('fi_rezept', 'Das Mantelrezept lesen', 'Lies Nimas kurzen Satz in der Suppenküche.', hasFlag(save, 'feuermantel_rezept'), 'Zwei helle Fasern halten eine Glutschale.', ['fi_suppenkueche']),
    quest('fi_mantel', 'Den Feuermantel nähen', 'Sammle zwei Ofenfasern und eine Glutschale.', hasItem(save, 'item_armor_feuermantel'), 'Nimm Nimas Zange im Gluthafen. Fasern wachsen am Ofenfaserhang, die Schale liegt im Glutschalenfeld.', ['fi_ofenfaserhang', 'fi_glutschalenfeld', 'fi_suppenkueche']),
    quest('fi_waage', 'Das Ei wärmen', 'Gib beiden Nestseiten vier Wärmepunkte.', hasFlag(save, 'nestwaage_geloest'), 'Eine grosse Schale wiegt so viel wie zwei kleine.', ['fi_waagehaus']),
    quest('fi_vogel', 'Den Feuervogel retten', 'Erreiche den Ofenring und besiege den Aschenbrüter hinter der Glutbrücke.', hasFlag(save, 'feuervogel_gerettet'), 'Trage den Feuermantel. Stelle Alvas Klinge auf Eis.', ['fi_kuehlrinne', 'fi_aschennest_vorraum']),

    quest('fs_text', 'Elis Beobachtung lesen', 'Ergänze Farbe, Zeit und Seite im Sternarchiv.', hasFlag(save, 'elis_sterntext_geloest'), 'Der ganze Satz steht auf Elis Pult.', ['fs_sternarchiv']),
    quest('fs_wams', 'Das Wärmewams nähen', 'Sammle zwei Firnfelle und eine Kaltperle.', hasItem(save, 'item_armor_waermewams'), 'Felle liegen am Firnufer, die Perle in der Grotte.', ['fs_firnufer', 'fs_kaltperlengrotte', 'fs_waermestube']),
    quest('fs_spiegel', 'Die Sternspiegel richten', 'Stelle links eins, Mitte drei und rechts zwei ein.', hasFlag(save, 'spiegel_ausgerichtet'), 'Elis Karte zeigt die drei Zahlen.', ['fs_spiegelhof']),
    quest('fs_stern', 'Die Sternenschatten retten', 'Öffne den Kuppelweg und stoppe den Sternenfresser.', hasFlag(save, 'sternenschatten_gerettet'), 'Trage das Wärmewams. Stelle Alvas Klinge auf Feuer.', ['fs_sternennest_vorraum']),

    quest('lm_spur', 'Die echte Fuchsspur finden', 'Ordne Pfote, Schleifspur und Doppelkerbe zu.', hasFlag(save, 'fuchsspur_geloest'), 'Die kleine Pfote gehört dem Fuchs.', ['lm_schilfpfad']),
    quest('lm_stab', 'Den Laternenstab bauen', 'Sammle Moorfaser und einen Laternenstein.', hasItem(save, 'item_weapon_laternenstab'), 'Luma hat einen Stein. Die Faser wächst im Torfgarten.', ['lm_laternenhaus', 'lm_torfgarten']),
    quest('lm_umhang', 'Den Schattenumhang nähen', 'Bring Moorfaser, Dunkelglas und Schwemmholz zu Luma.', hasItem(save, 'item_armor_schattenumhang'), 'Glas und Holz liegen am Schwarzteich.', ['lm_torfgarten', 'lm_schwarzteich', 'lm_laternenhaus']),
    quest('lm_fuchs', 'Den Laternenfuchs retten', 'Erreiche die Lichtinsel über den Nebelsteg oder den Blendengang. Besiege die Nachtlaterne.', hasFlag(save, 'laternenfuchs_gerettet'), 'Trage den Umhang. Der Laternenstab trifft die Schwäche der Nachtlaterne. Lichtnetz stoppt ihre Heilung.', ['lm_nebelsteg', 'lm_nachtpfad'])
  ]
}

function finalQuests(save: GameSave): QuestViewDefinition[] {
  return [
    quest('rn_hand', 'Die Sternentreppe öffnen', 'Lies die Griffe der Schattenhand und verteidige den schweren Zug.', won(save, 'enc_rn_schattenhand'), 'Der Kampf wartet am Rand der Nacht.', ['rn_rand_der_nacht']),
    quest('rn_panzer', 'Den Wandelpanzer durchqueren', 'Lies Feuer, Eis und Blitz. Warte auf eine offene Deckung und greife mit Licht an.', won(save, 'enc_rn_wandelpanzer'), 'Alvas Klinge kann am Rastplatz auf Licht gestellt werden.', ['rn_sternentreppe']),
    quest('rn_echo', 'Kunos Wahrheit hören', 'Hilf Kuno in der Halle der Echos.', won(save, 'enc_rn_echozwilling'), 'Ein Echo ahmt Kunos Stimme nach. Licht hilft gegen seine Schattenkraft.', ['rn_halle_der_echos']),
    quest('rn_raugrim', 'Raugrims Fäden trennen', 'Trenne die Fäden von Raugrims vier Gestalten.', hasFlag(save, 'raugrim_faeden_getrennt'), 'Licht löst die Fäden. Verteidige schwere Züge.', ['rn_weltenkammer']),
    quest('rn_heim', 'Die Schatten heimrufen', 'Ordne sieben Freunden ihre gute Erinnerung zu.', hasFlag(save, 'talora2_abgeschlossen'), 'Jeder Schatten kehrt wegen einer gemeinsam erlebten guten Sache zurück.', ['rn_weltenkammer'])
  ]
}

function getQuestViews(save: GameSave): QuestViewDefinition[] {
  if (!hasFlag(save, 'prolog_abgeschlossen')) return prologueQuests(save)
  if (!nearFlags.every((value) => hasFlag(save, value))) return nearQuests(save)
  if (!hasItem(save, 'item_weapon_alvas_klinge')) {
    return [
      quest('vp_weg', 'Alvas Zeichen verbinden', 'Lege am Wegkreuz den hellen Weg.', hasFlag(save, 'wegkreuz_geloest'), 'Das Weglager führt zum Wegkreuz.', ['vp_wegkreuz']),
      quest('vp_tor', 'Das Fernwegtor öffnen', 'Bring Blatt, Welle und Flügel zum Tor. Nimm dort Alvas Klinge.', hasItem(save, 'item_weapon_alvas_klinge'), 'Das Tor liegt hinter dem Wegkreuz.', ['vp_fernwegtor'])
    ]
  }
  if (!outerFlags.every((value) => hasFlag(save, value))) return outerQuests(save)
  return finalQuests(save)
}

function getMainGoal(save: GameSave) {
  if (hasFlag(save, 'talora2_abgeschlossen')) return { title: 'Feiere mit deinen Freunden', description: 'Alle Schatten sind zu Hause. Die offenen Wege bleiben erhalten.' }
  if (hasFlag(save, 'raugrim_faeden_getrennt')) return { title: 'Ruf die Schatten heim', description: 'Ordne in der Weltenkammer jedem Freund die gemeinsame Erinnerung zu.' }
  if (outerFlags.every((value) => hasFlag(save, value))) return { title: 'Hilf Kuno im Reich der Nacht', description: 'Gehe durch das Tor der sechs Zeichen zum Rand der Nacht. Raste dort und stelle Alvas Klinge auf Licht.' }
  if (hasItem(save, 'item_weapon_alvas_klinge')) return { title: 'Hilf auf drei neuen Wegen', description: 'Funkeninsel, Frostsee und Laternenmoor sind gleichzeitig offen.' }
  if (nearFlags.every((value) => hasFlag(save, value))) return { title: 'Öffne das Fernwegtor', description: 'Die Dornenkrone, das Perlenbecken und der Adlerhorst führen in die Verborgenen Wege. Nimm Alvas Klinge am Fernwegtor.' }
  if (hasFlag(save, 'prolog_abgeschlossen')) return { title: 'Ruf drei alte Freunde zurück', description: 'Hilf Arbor, Marea und Voltaro in beliebiger Reihenfolge.' }
  return { title: 'Folge Kunos Schatten', description: 'Sprich mit Tessa, hilf dem Schattenzipfel und lies danach Alvas Karte.' }
}

function status(save: GameSave, itemId: string, doneFlag?: string): 'missing' | 'ready' | 'done' {
  if (doneFlag && hasFlag(save, doneFlag)) return 'done'
  return hasItem(save, itemId) ? 'ready' : 'missing'
}

function getReminderGroups(save: GameSave): ReminderGroupDefinition[] {
  if (!hasFlag(save, 'prolog_abgeschlossen')) return []
  if (!nearFlags.every((value) => hasFlag(save, value))) return [{
    id: 'nahe_werkzeuge', title: 'Werkzeuge für die drei alten Freunde', description: 'Jede Region liefert ihre eigenen Teile.',
    steps: [
      { id: 'astbeil', label: 'Astbeil', detail: 'Astholz und Rankenseil aus der Alten Baumschule.', status: status(save, 'item_weapon_astbeil', 'arbors_schatten_zurueck'), areaId: 'ww_alte_baumschule' },
      { id: 'wellenspeer', label: 'Wellenspeer', detail: 'Schwemmholz und Wasserfaser aus dem Schilfkanal.', status: status(save, 'item_weapon_wellenspeer', 'mareas_schatten_zurueck'), areaId: 'sk_schilfkanal' },
      { id: 'donnerhammer', label: 'Donnerhammer', detail: 'Spulendraht und Werkzeugstahl.', status: status(save, 'item_weapon_donnerhammer', 'voltaros_schatten_zurueck'), areaId: 'dh_kristallmine' }
    ]
  }]
  if (!outerFlags.every((value) => hasFlag(save, value))) return [{
    id: 'aeusserer_schutz', title: 'Schutz für die neuen Wege', description: 'Zieh den Schutz vor dem schweren Kernweg an.',
    steps: [
      { id: 'feuermantel', label: 'Feuermantel', detail: 'Zwei Ofenfasern und eine Glutschale.', status: status(save, 'item_armor_feuermantel', 'feuervogel_gerettet'), areaId: 'fi_suppenkueche' },
      { id: 'waermewams', label: 'Wärmewams', detail: 'Zwei Firnfelle und eine Kaltperle.', status: status(save, 'item_armor_waermewams', 'sternenschatten_gerettet'), areaId: 'fs_waermestube' },
      { id: 'schattenumhang', label: 'Schattenumhang', detail: 'Moorfaser, Dunkelglas und Schwemmholz.', status: status(save, 'item_armor_schattenumhang', 'laternenfuchs_gerettet'), areaId: 'lm_laternenhaus' }
    ]
  }]
  return []
}

export const talora2Journal: CampaignJournalDefinition = {
  getQuestViews, getMainGoal, getReminderGroups,
  hintSteps: Object.fromEntries([
    ...prologueQuests({ flags: [], player: { inventory: {} } } as unknown as GameSave),
    ...nearQuests({ flags: [], player: { inventory: {} }, defeatedEncounterIds: [] } as unknown as GameSave),
    ...outerQuests({ flags: [], player: { inventory: {} }, defeatedEncounterIds: [] } as unknown as GameSave)
  ].map((entry) => [entry.id, [entry.hint, entry.description]])),
  cardNotes: {
    item_quest_kartenrand_wald: 'Alva ging mit Arbor durch den jungen Wisperwald.',
    item_quest_kartenrand_kueste: 'Marea erzählte Alva Geschichten von jedem Boot.',
    item_quest_kartenrand_hoehe: 'Voltaro trug Nachrichten, keine Waffen.',
    item_quest_kartenrand_funken: 'Ein Feuervogel wärmte Alvas kalte Hände.',
    item_quest_kartenrand_frost: 'Ein Kind fand den sicheren Weg unter den Sternen.',
    item_quest_kartenrand_moor: 'Ein kleiner Fuchs zeigte den echten Pfad.'
  }
}

export const talora2RuleCards: RuleCardDefinition[] = [
  { id: 'regel_beobachten', title: 'Beobachten', description: 'Beobachten kostet keinen Gegnerzug. Danach kennst du Züge, Schwächen und Schutz.', requirement: { kind: 'clue', clueId: 'regel_verteidigen' } },
  { id: 'regel_verteidigen', title: 'Verteidigen', description: 'Verteidigen wehrt schwere Züge ganz ab und öffnet die gegnerische Deckung. Bei normalen Zügen mindert es den Schaden.', requirement: { kind: 'clue', clueId: 'regel_verteidigen' } },
  { id: 'regel_flucht', title: 'Flucht und Rettung', description: 'Du behältst alle Funde. Bei Flucht gehst du meist zum vorigen Ort zurück. Eine Rettung bringt dich zum letzten Rastplatz. Bei Wegwächtern ist Flucht nur vor deinem ersten Treffer möglich.', requirement: { kind: 'clue', clueId: 'regel_flucht' } },
  { id: 'regel_waffenkunst', title: 'Waffenkunst', description: 'Jede Waffe kann etwas Besonderes. Danach braucht die Kunst einige Runden Pause.', requirement: anyFlags('prolog_abgeschlossen', 'tessa_gesprochen') },
  { id: 'regel_elemente', title: 'Elemente', description: 'Schwäche gibt drei Schaden dazu. Widerstand zieht drei ab. Immun bedeutet null.', requirement: flag('prolog_abgeschlossen') },
  { id: 'regel_nass', title: 'Nass', description: 'Nasse Gegner sind zusätzlich schwach gegen Eis und Blitz.', requirement: flag('wellenspeer_rezept') },
  { id: 'regel_aufladung', title: 'Aufladung', description: 'Eine Aufladung kann mit Kapphieb oder Kurzschluss unterbrochen werden.', requirement: anyFlags('glasblueten_ausgerichtet', 'warnfahnen_gesetzt') },
  { id: 'regel_ausruestung', title: 'Ausrüstung prüfen', description: 'Waffen und Schutz wechselst du ausserhalb eines Kampfes. Waffenmodi änderst du am Rastplatz.', requirement: flag('prolog_abgeschlossen') }
]

export const talora2StoryBeats: NonNullable<WorldDefinition['storyBeats']> = [
  { id: 'nahe_eins', requirement: anyFlags(...nearFlags), text: 'Kunos Schatten wartet am sicheren Rückweg. Er zeigt kurz auf den richtigen Pfad und läuft weiter. Kuno murmelt: «Ein Dieb kann offenbar gute Wege kennen.»' },
  { id: 'nahe_zwei', requirement: atLeastTwo(nearFlags), text: 'Auf Alvas Karte steht ein neuer Satz: «Er wird mich wieder vergessen.» Kuno liest ihn zweimal. Seine Nadel zittert.' },
  { id: 'nahe_drei', requirement: allFlags(...nearFlags), text: 'Arbor, Marea und Voltaro stehen am Fernwegtor. Kuno sagt: «Vielleicht läuft mein Schatten vor mir weg.» Drei neue Wege öffnen sich.' },
  { id: 'aussen_eins', requirement: anyFlags(...outerFlags), text: 'Kuno zeichnet nach, wie sein Schatten geholfen hat. «Raugrim befiehlt ihm nichts», sagt er. «Warum kommt er dann nicht zurück?»' },
  { id: 'aussen_zwei', requirement: atLeastTwo(outerFlags), text: 'Eine zweite Zeile erscheint: «Was, wenn die Erinnerung wieder fortgeht?» Kuno legt seine Nadel auf deine Hand. «Das ist meine Frage.»' },
  { id: 'aussen_drei', requirement: allFlags(...outerFlags), text: 'Kunos Schatten wartet am Tor. Kuno sagt: «Du darfst Abstand halten. Aber komm mit uns.» Der Schatten nickt. Die Sternentreppe erscheint.' },
  { id: 'raugrim_faeden', requirement: flag('raugrim_faeden_getrennt'), text: 'Raugrims geliehene Gestalt ist zerfallen, doch die Schatten sind noch nicht frei. Kuno tritt zu dir. «Ein Name und eine gute Erinnerung. Das ist stärker als sein Flüstern.»' },
  { id: 'talora2_ende', requirement: flag('talora2_abgeschlossen'), text: 'Kuno nimmt seinen Schatten zurück und sagt offen: «Ich habe Angst, euch wieder zu vergessen.» Tessa antwortet: «Dann erinnern wir uns gemeinsam.» Beim nächsten Lichterfest ritzt Kuno deinen Namen in seinen Messingdeckel.' }
]
