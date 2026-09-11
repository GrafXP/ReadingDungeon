import type { PuzzleDefinition } from '../../domain/content'

export const kantaraPhase4Puzzles: PuzzleDefinition[] = [
  {
    id: 'puz_kd_schleusentore',
    kind: 'controls',
    areaId: 'kd_schleusensteg',
    title: 'Die drei Schleusentore',
    hint: 'Lies die Pfeile in Fliessrichtung, nicht von deinem Standort aus.',
    hints: [
      'Die Pegeltafel nennt für jedes Tor eine eigene Stellung.',
      'Oben bleibt geschlossen; nur am mittleren Tor leuchtet eine von zwei Lampen.',
      'Stelle oben zu, die Mitte halb und unten offen.'
    ],
    controls: [
      { id: 'oben', label: 'Oberes Tor', options: ['offen', 'halb', 'zu'], initial: 0, solution: 2 },
      { id: 'mitte', label: 'Mittleres Tor', options: ['offen', 'halb', 'zu'], initial: 0, solution: 1 },
      { id: 'unten', label: 'Unteres Tor', options: ['offen', 'halb', 'zu'], initial: 2, solution: 0 }
    ],
    completion: {
      label: 'Bestätige die Torstellungen',
      description: 'Folge der Fliessrichtung und öffne den inneren Kanal.',
      resultText: 'Oben zu, Mitte halb, unten offen: Der Wasserlauf folgt den Pfeilen. Die Schleuse zur Rohrinsel öffnet sich.',
      effects: [
        { kind: 'setFlag', flag: 'schleusentore_gestellt' },
        { kind: 'unlockPassage', passageId: 'v025' }
      ]
    }
  },
  {
    id: 'puz_kd_lieferkaehne',
    kind: 'pairing',
    areaId: 'kd_hausboothafen',
    interactionId: 'int_kd_suri_fragen',
    title: 'Suris Anlegerliste',
    hint: 'Vergleiche Tiefgang, Ladung und Zielzeichen vollständig.',
    hints: [
      'Jeder Kahn braucht einen anderen Anleger.',
      'Metall braucht den tiefsten Anleger C; Kräuter dürfen nur an den flachen Anleger A.',
      'Metall–C, Kräuter–A, Seile–B.'
    ],
    controls: [],
    pairing: {
      left: [
        { id: 'metall', label: 'Metallkahn · tiefer Rumpf · Zahnradzeichen' },
        { id: 'kraeuter', label: 'Kräuterkahn · flacher Rumpf · Blattzeichen' },
        { id: 'seile', label: 'Seilkahn · mittlerer Rumpf · Ringzeichen' }
      ],
      right: [
        { id: 'a', label: 'Anleger A · flach · Blattlager' },
        { id: 'b', label: 'Anleger B · mittel · Seilmarkt' },
        { id: 'c', label: 'Anleger C · tief · Metallkai' }
      ],
      solution: { metall: 'c', kraeuter: 'a', seile: 'b' }
    }
  },
  {
    id: 'puz_kd_pegelfolge',
    kind: 'ordering',
    areaId: 'kd_pegelhaus',
    title: 'Bos Pegelfolge',
    hint: 'Ordne nach Tageszeit, nicht nach der Höhe des Wassers.',
    hints: [
      'Bos Messblatt beginnt am Morgen und endet am Abend.',
      'Der höchste Wert vier gehört in die Mitte.',
      'Morgen 2, Mittag 4, Abend 3.'
    ],
    controls: [],
    ordering: {
      items: [
        { id: 'abend', label: 'Abend · Pegel 3' },
        { id: 'morgen', label: 'Morgen · Pegel 2' },
        { id: 'mittag', label: 'Mittag · Pegel 4' }
      ],
      solution: ['morgen', 'mittag', 'abend']
    },
    completion: {
      label: 'Übertrage die Pegelfolge',
      description: 'Stelle die Anzeige in Bos zeitlicher Reihenfolge ein.',
      resultText: 'Morgen 2, Mittag 4, Abend 3. Die Anzeige läuft wieder zuverlässig; hinter dem Messblatt liegt Bos Marke «Abendfähre».',
      effects: [
        { kind: 'setFlag', flag: 'pegelfolge_geordnet' },
        { kind: 'addItem', itemId: 'item_marke_03', quantity: 1 }
      ]
    }
  },
  {
    id: 'puz_sw_warnfahnen',
    kind: 'sequence',
    areaId: 'sw_warnmast',
    title: 'Rikas Warnfahnen',
    hint: 'Der Bauplan nennt Formen und Reihenfolge; die Farben sind nur Zusatz.',
    hints: [
      'Drei Formen werden von links nach rechts gesetzt.',
      'Der Kreis kommt vor dem Streifen, das Dreieck zuletzt.',
      'Kreis – Streifen – Dreieck.'
    ],
    controls: [],
    sequence: { options: ['Kreis', 'Streifen', 'Dreieck'], solution: [0, 1, 2] },
    completion: {
      label: 'Setze den Warnfahnensatz',
      description: 'Befestige die drei Formen in der gelesenen Reihenfolge.',
      resultText: 'Kreis, Streifen, Dreieck: Die Fahnen kündigen jede Böe sichtbar an. Der sichere Weg in die Spulengasse ist frei.',
      effects: [
        { kind: 'setFlag', flag: 'warnfahnen_gesetzt' },
        { kind: 'addItem', itemId: 'item_quest_warnfahnen', quantity: 1 },
        { kind: 'unlockPassage', passageId: 'v037' }
      ]
    }
  },
  {
    id: 'puz_sw_spulenbauplan',
    kind: 'reading',
    areaId: 'sw_spulengasse',
    title: 'Jaros Spulenbauplan',
    hint: 'Markiere die drei Tätigkeiten in der Reihenfolge des Wartungssatzes.',
    hints: [
      'Der vollständige Satz steht direkt über der Spule.',
      'Laden ist erst nach Erdung und Prüfung sicher.',
      'Erden – prüfen – laden.'
    ],
    controls: [],
    reading: {
      sourceTitle: 'Wartungssatz an der Pflichtspule',
      sourceText: 'Erden, prüfen, dann erst laden. Wer vor der Prüfung lädt, hört das steigende Summen zu spät. Eine Waffenkunst unterbricht die Aufladung.',
      prompts: [
        { id: 'erst', label: 'Was geschieht zuerst?', options: ['laden', 'erden', 'prüfen'], solution: 1 },
        { id: 'dann', label: 'Was geschieht danach?', options: ['prüfen', 'laden', 'erden'], solution: 0 },
        { id: 'zuletzt', label: 'Was geschieht zuletzt?', options: ['erden', 'laden', 'prüfen'], solution: 1 }
      ]
    },
    completion: {
      label: 'Entlade die Pflichtspule',
      description: 'Führe Erdung, Prüfung und Ladung in sicherer Reihenfolge aus.',
      resultText: 'Die Pflichtspule ist still. Du nimmst die beschriftete Erdungsklemme; Jaros Spulenhammerplan ist nun vollständig geprüft.',
      effects: [
        { kind: 'setFlag', flag: 'pflichtspule_entladen' },
        { kind: 'setFlag', flag: 'rezept_spulenhammer_bekannt' },
        { kind: 'addItem', itemId: 'item_tool_erdungsklemme', quantity: 1 },
        { kind: 'discoverClue', clueId: 'regel_aufladung' },
        { kind: 'discoverClue', clueId: 'regel_unterbrechen' },
        { kind: 'unlockPassage', passageId: 'v040' }
      ]
    }
  },
  {
    id: 'puz_sw_gleiterkurs',
    kind: 'grid',
    areaId: 'sw_gleitersteg',
    interactionId: 'int_sw_gleiter_sichern',
    title: 'Der sichere Gleiterkurs',
    hint: 'Folge dem markierten 4×4-Weg um die Gegenwindfelder.',
    hints: [
      'Der Weg darf nur waagrecht oder senkrecht wachsen.',
      'Die dunklen Gegenwindfelder sind gesperrt; beide Halteseile liegen auf der freien Randroute.',
      'Vom Start zweimal nach rechts, dreimal nach unten und einmal nach rechts zum Ziel.'
    ],
    controls: [],
    grid: {
      width: 4,
      height: 4,
      start: 0,
      goal: 15,
      blocked: [4, 5, 6, 10],
      solution: [0, 1, 2, 3, 7, 11, 15]
    }
  },
  {
    id: 'puz_wg_kreuzweiche',
    kind: 'grid',
    areaId: 'wg_kreuzweiche',
    title: 'Die Kreuzweiche',
    hint: 'Führe den markierten Wartungsweg von der Teamtafel zum Prismengleis.',
    hints: [
      'Blatt zeigt nach Norden, Welle nach Süden und Spule geradeaus.',
      'Der sichere Prüfweg umrundet das gesperrte Kreuzungsfeld.',
      'Vom Start nach rechts, zweimal nach unten, zweimal nach rechts und nach unten.'
    ],
    controls: [],
    grid: {
      width: 4,
      height: 4,
      start: 0,
      goal: 15,
      blocked: [2, 6, 7, 10],
      solution: [0, 1, 5, 9, 13, 14, 15]
    },
    completion: {
      label: 'Stelle die drei Zielweichen',
      description: 'Prüfe Blatt-, Wellen- und Spulenzeichen am sicheren Wartungsweg.',
      resultText: 'Blatt nach Norden, Welle nach Süden, Spule geradeaus. Nord- und Südstollen sind verbunden; die Mitte wartet auf drei Stempel.',
      effects: [
        { kind: 'setFlag', flag: 'kreuzweiche_gestellt' },
        { kind: 'unlockPassage', passageId: 'v048' },
        { kind: 'unlockPassage', passageId: 'v049' }
      ]
    }
  }
]
