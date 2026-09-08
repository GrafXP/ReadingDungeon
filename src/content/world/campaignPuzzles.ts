import type { PuzzleDefinition } from '../../domain/content'

export const campaignPuzzles: PuzzleDefinition[] = [
  {
    id: 'symbolsteine', areaId: 'garten_der_namen', interactionId: 'symbolsteine_ordnen',
    title: 'Die vier Symbolsteine', hint: 'Zuerst weht der Wind. Dann kommt Licht, danach Wasser. Zuletzt wächst das Blatt.', controls: [],
    sequence: { options: ['Wasser', 'Wachstum', 'Wind', 'Licht'], solution: [2, 3, 0, 1] }
  },
  {
    id: 'spiegel', areaId: 'alter_leuchtturm', interactionId: 'sonnenfunke_entfachen',
    title: 'Der Weg des Lichts', hint: 'Der erste Spiegel lenkt Licht nach rechts. Der zweite nach oben. Der dritte nach links zur Sonnenlinse.',
    controls: ['Erster Spiegel', 'Zweiter Spiegel', 'Dritter Spiegel'].map((label, index) => ({
      id: `spiegel${index}`, label, options: ['Links', 'Oben', 'Rechts'], initial: 0, solution: [2, 1, 0][index]
    }))
  },
  {
    id: 'schleuse', areaId: 'schleusenhaus', interactionId: 'schleuse_reparieren',
    title: 'Die drei Wassertore', hint: 'Öffne Zulauf und Quelltor, schliesse den Ablauf. Höchstens zwei Tore dürfen offen sein. Zum Abschluss brauchst du Rad und Mondmoos.',
    controls: ['Zulauf', 'Quelltor', 'Ablauf'].map((label, index) => ({
      id: `tor${index}`, label, options: ['Geschlossen', 'Offen'], initial: [1, 0, 1][index], solution: [1, 1, 0][index]
    })), maxOpenControls: 2
  },
  {
    id: 'echo', areaId: 'kristallmine', interactionId: 'werkzeugkammer_oeffnen',
    title: 'Das Echoschloss', hint: 'Die Kristalle zeigen: Glocke – Schritt – Klatschen. Du kannst die Folge beliebig oft versuchen; Hören ist nicht nötig.', controls: [],
    sequence: { options: ['Klatschen', 'Glocke', 'Schritt'], solution: [1, 2, 0] }
  },
  {
    id: 'windorgel', areaId: 'windorgel', interactionId: 'windlied_spielen',
    title: 'Flügel und Klangtasten', hint: 'Die Markierungen zeigen: links nach oben, Mitte nach rechts, rechts nach links. Spiele danach Kreis – Stern – Welle. Pfeife und Feder werden erst beim Abschluss eingesetzt.',
    controls: ['Linker Flügel', 'Mittlerer Flügel', 'Rechter Flügel'].map((label, index) => ({
      id: `fluegel${index}`, label, options: ['Links', 'Oben', 'Rechts'], initial: 0, solution: [1, 2, 0][index]
    })), sequence: { options: ['Stern', 'Welle', 'Kreis'], solution: [2, 0, 1] }
  }
]
