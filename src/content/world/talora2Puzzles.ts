import type { PuzzleDefinition } from '../../domain/content'

const interactionId = (puzzleId: string) => `int_${puzzleId.slice(4)}_abschliessen`

export const talora2Puzzles: PuzzleDefinition[] = [
  {
    id: 'puz_sm_schattenkarte', kind: 'pairing', areaId: 'sm_kartenstube', interactionId: interactionId('puz_sm_schattenkarte'),
    title: 'Alvas Schattenkarte', hint: 'Verbinde jede Spur mit dem Zeichen, das zu ihr passt.', hints: ['Ein Huf gehört in den Wald.', 'Wasser gehört zur Welle.', 'Huf–Blatt, Wasser–Welle, Feder–Flügel.'], controls: [],
    pairing: { left: [{ id: 'huf', label: 'Hufspur' }, { id: 'wasser', label: 'Wasserspur' }, { id: 'feder', label: 'Feder' }], right: [{ id: 'blatt', label: 'Blatt' }, { id: 'welle', label: 'Welle' }, { id: 'fluegel', label: 'Flügel' }], solution: { huf: 'blatt', wasser: 'welle', feder: 'fluegel' } }
  },
  {
    id: 'puz_ww_tierpfade', kind: 'pairing', areaId: 'ww_mooslichtung', interactionId: interactionId('puz_ww_tierpfade'),
    title: 'Die drei Tierpfade', hint: 'Die Spuren und die Verstecke stehen auf Lios Tafel.', hints: ['Der Hase sucht einen Bau.', 'Der Igel schläft im Laub.', 'Hase–Moosbau, Igel–Laubhaufen, Reh–Farnweg.'], controls: [],
    pairing: { left: [{ id: 'hase', label: 'Hase' }, { id: 'igel', label: 'Igel' }, { id: 'reh', label: 'Reh' }], right: [{ id: 'moosbau', label: 'Moosbau' }, { id: 'laub', label: 'Laubhaufen' }, { id: 'farn', label: 'Farnweg' }], solution: { hase: 'moosbau', igel: 'laub', reh: 'farn' } }
  },
  {
    id: 'puz_ww_glasblueten', kind: 'ordering', areaId: 'ww_gluehgarten', interactionId: interactionId('puz_ww_glasblueten'),
    title: 'Licht für den Wipfel', hint: 'Lio schrieb: vom schwächsten Licht zum stärksten.', hints: ['Beginne mit der dunkelsten Blüte.', 'Die hellste Blüte kommt zuletzt.', 'Dunkel, mittel, hell.'], controls: [],
    ordering: { items: [{ id: 'dunkel', label: 'Dunkelste Blüte' }, { id: 'mittel', label: 'Mittlere Blüte' }, { id: 'hell', label: 'Hellste Blüte' }], solution: ['dunkel', 'mittel', 'hell'] }
  },
  {
    id: 'puz_ww_wurzelbruecke', kind: 'grid', areaId: 'ww_wurzelbruecke', interactionId: interactionId('puz_ww_wurzelbruecke'),
    title: 'Der feste Wurzelweg', hint: 'Gehe vom Blattzeichen unten links zum Zeichen oben rechts.', hints: ['Die erste Wurzel führt nach oben.', 'In der Mitte geht es einmal rechts.', '12–8–9–5–6–2–3.'], controls: [],
    grid: { width: 4, height: 4, start: 12, goal: 3, blocked: [0, 1, 4, 7, 10, 11, 13, 14, 15], solution: [12, 8, 9, 5, 6, 2, 3] }
  },
  {
    id: 'puz_sk_hafenlichter', kind: 'ordering', areaId: 'sk_muschelhafen', interactionId: interactionId('puz_sk_hafenlichter'),
    title: 'Nelas Hafenlichter', hint: 'Das Wasser steigt von niedrig nach hoch.', hints: ['Ebbe ist am niedrigsten.', 'Flut ist am höchsten.', 'Ebbe, Mitte, Flut.'], controls: [],
    ordering: { items: [{ id: 'ebbe', label: 'Ebbe' }, { id: 'mitte', label: 'Mitte' }, { id: 'flut', label: 'Flut' }], solution: ['ebbe', 'mitte', 'flut'] }
  },
  {
    id: 'puz_sk_schleuse', kind: 'controls', areaId: 'sk_schleusensteg', interactionId: interactionId('puz_sk_schleuse'),
    title: 'Die drei Schleusentore', hint: 'Vorne viel Wasser, in der Mitte wenig, am Ende keines.', hints: ['Der Zulauf muss ganz offen sein.', 'Die Mitte bleibt halb offen.', 'Zulauf 2, Mitte 1, Ablauf 0.'],
    controls: [
      { id: 'zulauf', label: 'Zulauf', options: ['Zu', 'Halb', 'Offen'], initial: 0, solution: 2 },
      { id: 'mitte', label: 'Mitte', options: ['Zu', 'Halb', 'Offen'], initial: 0, solution: 1 },
      { id: 'ablauf', label: 'Ablauf', options: ['Zu', 'Halb', 'Offen'], initial: 1, solution: 0 }
    ]
  },
  {
    id: 'puz_sk_leuchtturm', kind: 'sequence', areaId: 'sk_alter_leuchtturm', interactionId: interactionId('puz_sk_leuchtturm'),
    title: 'Der echte Schattenweg', hint: 'Die Inschrift beginnt am Himmel und endet im Hafen.', hints: ['Zuerst kommt die Sonne.', 'Das Boot kommt zuletzt.', 'Sonne, Welle, Boot.'], controls: [],
    sequence: { options: ['Sonne', 'Welle', 'Boot'], solution: [0, 1, 2] }
  },
  {
    id: 'puz_dh_warnfahnen', kind: 'ordering', areaId: 'dh_warnmast', interactionId: interactionId('puz_dh_warnfahnen'),
    title: 'Tavis Warnfahnen', hint: 'Die Masttafel zeigt rund, lang, spitz.', hints: ['Rund bedeutet Kreis.', 'Spitz bedeutet Dreieck.', 'Kreis, Streifen, Dreieck.'], controls: [],
    ordering: { items: [{ id: 'kreis', label: 'Kreis' }, { id: 'streifen', label: 'Streifen' }, { id: 'dreieck', label: 'Dreieck' }], solution: ['kreis', 'streifen', 'dreieck'] }
  },
  {
    id: 'puz_dh_windruf', kind: 'sequence', areaId: 'dh_spulengasse', interactionId: interactionId('puz_dh_windruf'),
    title: 'Der Windruf', hint: 'Die Tafel sagt: Erst hören, dann gehen, dann rufen.', hints: ['Hören passt zur Glocke.', 'Rufen passt zum Klatschen.', 'Glocke, Schritt, Klatschen.'], controls: [],
    sequence: { options: ['Glocke', 'Schritt', 'Klatschen'], solution: [0, 1, 2] }
  },
  {
    id: 'puz_dh_gleiter', kind: 'weighing', areaId: 'dh_wolkenbruecke', interactionId: interactionId('puz_dh_gleiter'),
    title: 'Der gerade Gleiter', hint: 'Links und rechts brauchen gleich viel Gewicht. Das Werkzeug bleibt unten.', hints: ['Segel und Korb sind gleich schwer.', 'Lege eines auf jede Seite.', 'Segel links, Korb rechts, Werkzeug unten.'], controls: [],
    weighing: { leftLabel: 'Linke Seite', rightLabel: 'Rechte Seite', items: [{ id: 'segel', label: 'Segel', weight: 2 }, { id: 'korb', label: 'Korb', weight: 2 }, { id: 'werkzeug', label: 'Werkzeug', weight: 1 }], solution: { segel: 'left', korb: 'right', werkzeug: 'off' } }
  },
  {
    id: 'puz_vp_wegkreuz', kind: 'grid', areaId: 'vp_wegkreuz', interactionId: interactionId('puz_vp_wegkreuz'),
    title: 'Alvas heller Weg', hint: 'Verbinde Blatt, Welle und Flügel auf den hellen Steinen.', hints: ['Gehe zuerst nach rechts.', 'Dann führt der Weg nach unten.', '0–1–5–9–10–11–15.'], controls: [],
    grid: { width: 4, height: 4, start: 0, goal: 15, blocked: [2, 3, 4, 6, 7, 8, 12, 13, 14], solution: [0, 1, 5, 9, 10, 11, 15] }
  },
  {
    id: 'puz_fi_mantelrezept', kind: 'reading', areaId: 'fi_suppenkueche', interactionId: interactionId('puz_fi_mantelrezept'),
    title: 'Das Rezept an der Wand', hint: 'Lies den ganzen kurzen Satz.', hints: ['Gesucht sind Zahl, Art und warmer Gegenstand.', 'Die Fasern sind hell.', 'Zwei, helle, Glutschale.'], controls: [],
    reading: { sourceTitle: 'Nimas Mantelrezept', sourceText: 'Zwei helle Fasern halten eine Glutschale sicher.', prompts: [
      { id: 'zahl', label: 'Wie viele Fasern?', options: ['Eine', 'Zwei', 'Drei'], solution: 1 },
      { id: 'art', label: 'Welche Fasern?', options: ['Dunkle', 'Helle', 'Nasse'], solution: 1 },
      { id: 'kern', label: 'Was kommt dazu?', options: ['Kaltperle', 'Glutschale', 'Astholz'], solution: 1 }
    ] }
  },
  {
    id: 'puz_fi_nestwaage', kind: 'weighing', areaId: 'fi_waagehaus', interactionId: interactionId('puz_fi_nestwaage'),
    title: 'Wärme für beide Nestseiten', hint: 'Beide Seiten brauchen vier Wärmepunkte.', hints: ['Die grosse Schale gibt vier.', 'Zwei kleine Schalen geben zusammen vier.', 'Gross links, beide kleinen rechts.'], controls: [],
    weighing: { leftLabel: 'Linke Nestseite', rightLabel: 'Rechte Nestseite', items: [{ id: 'gross', label: 'Grosse Schale', weight: 4 }, { id: 'klein_a', label: 'Kleine Schale A', weight: 2 }, { id: 'klein_b', label: 'Kleine Schale B', weight: 2 }], solution: { gross: 'left', klein_a: 'right', klein_b: 'right' } }
  },
  {
    id: 'puz_fs_elis_sterntext', kind: 'reading', areaId: 'fs_sternarchiv', interactionId: interactionId('puz_fs_elis_sterntext'),
    title: 'Elis Sternbeobachtung', hint: 'Farbe, Zeit und Seite stehen im Bericht.', hints: ['Der Stern ist blau.', 'Eli sah ihn morgens links.', 'Blau, morgens, links.'], controls: [],
    reading: { sourceTitle: 'Elis Bericht', sourceText: 'Der blaue Stern steht morgens links über dem See.', prompts: [
      { id: 'farbe', label: 'Welche Farbe?', options: ['Rot', 'Blau', 'Gold'], solution: 1 },
      { id: 'zeit', label: 'Wann?', options: ['Morgens', 'Mittags', 'Abends'], solution: 0 },
      { id: 'seite', label: 'Wo?', options: ['Links', 'Mitte', 'Rechts'], solution: 0 }
    ] }
  },
  {
    id: 'puz_fs_spiegel', kind: 'controls', areaId: 'fs_spiegelhof', interactionId: interactionId('puz_fs_spiegel'),
    title: 'Die drei Sternspiegel', hint: 'Elis Karte nennt eins, drei, zwei.', hints: ['Links steht auf eins.', 'In der Mitte steht die höchste Zahl.', 'Links 1, Mitte 3, rechts 2.'],
    controls: [
      { id: 'links', label: 'Linker Spiegel', options: ['0', '1', '2', '3'], initial: 0, solution: 1 },
      { id: 'mitte', label: 'Mittlerer Spiegel', options: ['0', '1', '2', '3'], initial: 0, solution: 3 },
      { id: 'rechts', label: 'Rechter Spiegel', options: ['0', '1', '2', '3'], initial: 0, solution: 2 }
    ]
  },
  {
    id: 'puz_lm_fuchsspuren', kind: 'pairing', areaId: 'lm_schilfpfad', interactionId: interactionId('puz_lm_fuchsspuren'),
    title: 'Die echte Fuchsspur', hint: 'Pavo hat Pfote, Bauch und falsche Kerbe gezeichnet.', hints: ['Der Fuchs hat kleine Pfoten.', 'Der Molch hinterlässt eine Schleifspur.', 'Pfote–Fuchs, Schleifspur–Molch, Doppelkerbe–falscher Schatten.'], controls: [],
    pairing: { left: [{ id: 'pfote', label: 'Kleine Pfote' }, { id: 'schleif', label: 'Schleifspur' }, { id: 'doppel', label: 'Doppelkerbe' }], right: [{ id: 'fuchs', label: 'Fuchs' }, { id: 'molch', label: 'Molch' }, { id: 'falsch', label: 'Falscher Schatten' }], solution: { pfote: 'fuchs', schleif: 'molch', doppel: 'falsch' } }
  },
  {
    id: 'puz_lm_lichtweg', kind: 'grid', areaId: 'lm_nebelsteg', interactionId: interactionId('puz_lm_lichtweg'),
    title: 'Der Lichtweg im Nebel', hint: 'Folge Ring, Kerbe und Doppelstrich bis zum Licht.', hints: ['Beginne unten links und gehe nach rechts.', 'In der Mitte geht der Weg nach oben.', '12–13–9–10–6–2–3.'], controls: [],
    grid: { width: 4, height: 4, start: 12, goal: 3, blocked: [0, 1, 4, 5, 7, 8, 11, 14, 15], solution: [12, 13, 9, 10, 6, 2, 3] }
  },
  {
    id: 'puz_rn_schatten_heimrufen', kind: 'pairing', areaId: 'rn_weltenkammer', interactionId: interactionId('puz_rn_schatten_heimrufen'),
    title: 'Ruf die Schatten heim', hint: 'Jeder Schatten erinnert sich an eine gemeinsame gute Sache.', hints: ['Arbor denkt an Wege, Marea an Geschichten, Voltaro an den Himmel.', 'Feuervogel, Eli und Fuchs erinnern sich an Nest, Beobachtung und Spur.', 'Kuno gehört zum gemeinsamen Weg.'], controls: [],
    pairing: {
      left: [{ id: 'arbor', label: 'Arbor' }, { id: 'marea', label: 'Marea' }, { id: 'voltaro', label: 'Voltaro' }, { id: 'vogel', label: 'Feuervogel' }, { id: 'eli', label: 'Eli' }, { id: 'fuchs', label: 'Laternenfuchs' }, { id: 'kuno', label: 'Kuno' }],
      right: [{ id: 'wald', label: 'Offene Waldwege' }, { id: 'geschichten', label: 'Reisende Geschichten' }, { id: 'himmel', label: 'Freier Himmel' }, { id: 'nest', label: 'Warmes Nest' }, { id: 'beobachtung', label: 'Gehörte Beobachtung' }, { id: 'spur', label: 'Echte Spur' }, { id: 'weg', label: 'Gemeinsamer Weg' }],
      solution: { arbor: 'wald', marea: 'geschichten', voltaro: 'himmel', vogel: 'nest', eli: 'beobachtung', fuchs: 'spur', kuno: 'weg' }
    }
  }
]
