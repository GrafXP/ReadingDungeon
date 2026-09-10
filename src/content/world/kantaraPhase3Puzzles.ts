import type { PuzzleDefinition } from '../../domain/content'

export const kantaraPhase3Puzzles: PuzzleDefinition[] = [
  {
    id: 'puz_kb_uebungsetiketten',
    kind: 'pairing',
    areaId: 'kb_sortierhalle',
    completion: {
      label: 'Bestätige die Übungszustellung',
      description: 'Prüfe Ziel, Inhalt und Warnzeichen ein letztes Mal.',
      resultText: 'Alle drei Pakete stehen beim richtigen Ziel. Klick speichert die Leseregel: erst prüfen, dann handeln. Im selben Moment bebt die Halle, und falsche Fracht rollt aus dem Wechselwerk zurück.',
      effects: [
        { kind: 'setFlag', flag: 'uebungsetiketten_geloest' },
        { kind: 'discoverClue', clueId: 'regel_etiketten_pruefen' }
      ]
    },
    title: 'Die drei Übungsetiketten',
    hint: 'Lies bei jedem Paket Ziel, Inhalt und Warnzeichen.',
    hints: [
      'Vergleiche zuerst die drei Merkmale auf jedem Zettel.',
      'Das Warnzeichen verrät, welches Fach oder Ziel sicher ist.',
      'Frostbeeren gehören ins Kühlfach, die Spule in die Werftkiste und die Medizin zum Wassertor.'
    ],
    controls: [],
    pairing: {
      left: [
        { id: 'beeren', label: 'Frostbeeren · kühl halten' },
        { id: 'spule', label: 'Ersatzspule · trocken halten' },
        { id: 'medizin', label: 'Medikamentenkiste · Wellenzeichen' }
      ],
      right: [
        { id: 'kuehlfach', label: 'Kühlfach' },
        { id: 'werftkiste', label: 'Werftkiste' },
        { id: 'wassertor', label: 'Wassertor' }
      ],
      solution: { beeren: 'kuehlfach', spule: 'werftkiste', medizin: 'wassertor' }
    }
  },
  {
    id: 'puz_bd_pflanzenschilder',
    kind: 'pairing',
    areaId: 'bd_kronengarten',
    interactionId: 'int_bd_fenn_fragen',
    title: 'Fenns Pflanzenschilder',
    hint: 'Vergleiche Blattkante, Stamm und Wasserbedarf statt nur die Farbe.',
    hints: [
      'Jede Rankenart gehört an einen anderen Platz.',
      'Der Jungtrieb braucht Schatten; die Tragwurzel braucht Wasser.',
      'Jungtrieb–Schattenbeet, Tragwurzel–Quellrinne, Fruchtranke–Sonnenseil.'
    ],
    controls: [],
    pairing: {
      left: [
        { id: 'jungtrieb', label: 'Jungtrieb · glatte Kante · heller Stamm' },
        { id: 'tragwurzel', label: 'Tragwurzel · breite Kante · dunkler Stamm' },
        { id: 'fruchtranke', label: 'Fruchtranke · gezackte Kante · Fruchtansatz' }
      ],
      right: [
        { id: 'schattenbeet', label: 'Schattenbeet' },
        { id: 'quellrinne', label: 'Quellrinne' },
        { id: 'sonnenseil', label: 'Sonnenseil' }
      ],
      solution: { jungtrieb: 'schattenbeet', tragwurzel: 'quellrinne', fruchtranke: 'sonnenseil' }
    }
  },
  {
    id: 'puz_bd_quellzeile',
    kind: 'reading',
    areaId: 'bd_quellast',
    interactionId: 'int_bd_quellventil_oeffnen',
    title: 'Der vollständige Rohrbericht',
    hint: 'Markiere die drei Richtungswörter in ihrer Reihenfolge.',
    hints: [
      'Lies den Bericht noch einmal von «erst» bis «zuletzt».',
      'Gesucht sind Klemme, Rinne und Zielast.',
      'Wähle blau – Mitte – Garten.'
    ],
    controls: [],
    reading: {
      sourceTitle: 'Wartungsbericht am Quellrohr',
      sourceText: 'Erst blaue Klemme öffnen, dann Wasser durch die mittlere Rinne leiten, zuletzt den Gartenast wählen. Die rote Klemme führt zum Kran, die obere Rinne zurück in den Speicher.',
      prompts: [
        { id: 'klemme', label: 'Erst welche Klemme?', options: ['rote', 'blaue', 'gelbe'], solution: 1 },
        { id: 'rinne', label: 'Dann welche Rinne?', options: ['obere', 'untere', 'mittlere'], solution: 2 },
        { id: 'ast', label: 'Zuletzt welcher Ast?', options: ['Kranast', 'Gartenast', 'Marktast'], solution: 1 }
      ]
    }
  },
  {
    id: 'puz_bd_obstwaage',
    kind: 'weighing',
    areaId: 'bd_obstterrasse',
    completion: {
      label: 'Bestätige die ausgewogene Lieferung',
      description: 'Eine grosse Apfelkiste muss genau zwei kleinen Birnenkisten entsprechen.',
      resultText: 'Der Balken steht waagrecht. Unter der nun richtigen Ablage findest du Inas alte Liefermarke und einen singenden Resonanzsplitter. Der zurückgeschnittene Rankengang zum Kranplatz ist frei.',
      effects: [
        { kind: 'setFlag', flag: 'obstwaage_geloest' },
        { kind: 'addItem', itemId: 'item_marke_02', quantity: 1 },
        { kind: 'addItem', itemId: 'item_shard_blaetterdaecher', quantity: 1 },
        { kind: 'unlockPassage', passageId: 'v019' }
      ]
    },
    title: 'Inas Obstwaage',
    hint: 'Die Lieferliste vergleicht eine grosse Kiste mit zwei kleinen.',
    hints: [
      'Lege gleiche Gesamtgewichte auf beide Seiten.',
      'Die Apfelkiste wiegt zwei Einheiten; jede Birnenkiste eine.',
      'Links: Apfelkiste. Rechts: beide Birnenkisten.'
    ],
    controls: [],
    weighing: {
      leftLabel: 'Linke Schale',
      rightLabel: 'Rechte Schale',
      items: [
        { id: 'apfel', label: 'Grosse Apfelkiste', weight: 2 },
        { id: 'birne1', label: 'Kleine Birnenkiste A', weight: 1 },
        { id: 'birne2', label: 'Kleine Birnenkiste B', weight: 1 }
      ],
      solution: { apfel: 'left', birne1: 'right', birne2: 'right' }
    }
  }
]
