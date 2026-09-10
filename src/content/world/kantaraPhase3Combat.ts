import type { EncounterDefinition, EnemyDefinition } from '../../domain/content'

export const kantaraPhase3Enemies: EnemyDefinition[] = [
  {
    id: 'enemy_kb_etikettenkrabbler',
    name: 'Etikettenkrabbler',
    kind: 'normal',
    maxLife: 7,
    defense: 0,
    tags: ['machine', 'small'],
    weakTo: ['physical'],
    movesByPhase: {
      1: [
        { id: 'zettelwurf', name: 'Zettelwurf', telegraph: 'Der Krabbler hebt ein Bündel loser Etiketten.', icon: '▱', damage: 2, kind: 'normal' },
        { id: 'klammergriff', name: 'Klammergriff', telegraph: 'Zwei Klammerbeine öffnen sich gut sichtbar.', icon: '⌁', damage: 3, kind: 'heavy' }
      ]
    }
  },
  {
    id: 'enemy_kb_frachtkiste',
    name: 'Rollende Frachtkiste',
    kind: 'normal',
    maxLife: 10,
    defense: 1,
    tags: ['machine', 'cargo'],
    weakTo: ['physical'],
    resistantTo: ['lightning'],
    movesByPhase: {
      1: [
        {
          id: 'anrollen',
          name: 'Anrollen',
          telegraph: 'Die Rollen rattern laut; die Kiste fährt gleich geradeaus.',
          icon: '▣',
          damage: 6,
          kind: 'heavy',
          defendNegates: true,
          vulnerableAfterDefend: true,
          defendOutcomeText: 'Du gehst beim Rattern in Deckung. Die Rollkiste fährt vorbei und trifft nichts.',
          vulnerableText: 'Ihr offener Deckel bleibt für einen Zug im Torrahmen hängen.'
        },
        { id: 'kistenschub', name: 'Kistenschub', telegraph: 'Die Kiste richtet ihre gepolsterte Seite auf dich.', icon: '◆', damage: 3, kind: 'normal' }
      ]
    }
  },
  {
    id: 'enemy_bd_rankenhuepfer',
    name: 'Rankenhüpfer',
    kind: 'normal',
    maxLife: 8,
    defense: 0,
    tags: ['plant', 'small'],
    weakTo: ['fire'],
    movesByPhase: {
      1: [
        { id: 'blattschnippen', name: 'Blattschnippen', telegraph: 'Zwei trockene Blätter spannen sich nach hinten.', icon: '❧', damage: 2, kind: 'normal' },
        { id: 'rankensprung', name: 'Rankensprung', telegraph: 'Die Ranke zieht sich für einen hohen Sprung zusammen.', icon: '⌁', damage: 4, kind: 'heavy' }
      ]
    }
  },
  {
    id: 'enemy_bd_seilspinne',
    name: 'Seilspinne',
    kind: 'normal',
    maxLife: 9,
    defense: 1,
    tags: ['machine', 'rope'],
    weakTo: ['light'],
    resistantTo: ['physical'],
    movesByPhase: {
      1: [
        { id: 'knotenwurf', name: 'Knotenwurf', telegraph: 'Die Spinne wickelt ein loses Seil um zwei Beine.', icon: '⌘', damage: 3, kind: 'normal' },
        { id: 'seilzug', name: 'Seilzug', telegraph: 'Das gespannte Zugseil vibriert vor dem Ruck.', icon: '↝', damage: 5, kind: 'heavy' }
      ]
    }
  },
  {
    id: 'enemy_bd_kistenkauz',
    name: 'Kistenkauz',
    kind: 'normal',
    maxLife: 8,
    defense: 0,
    tags: ['animal', 'cargo'],
    weakTo: ['lightning'],
    movesByPhase: {
      1: [
        { id: 'fluegelschlag', name: 'Flügelschlag', telegraph: 'Der Kauz breitet seine gepolsterten Flügel aus.', icon: '⌃', damage: 2, kind: 'normal' },
        { id: 'kistenstoss', name: 'Kistenstoss', telegraph: 'Er faltet die Flügel und stösst seine nasse Kiste vor.', icon: '▣', damage: 4, kind: 'heavy' }
      ]
    }
  },
  {
    id: 'enemy_bd_aststampfer',
    name: 'Aststampfer',
    kind: 'boss',
    maxLife: 14,
    defense: 1,
    tags: ['machine', 'plant', 'guardian'],
    weakTo: ['fire'],
    resistantTo: ['physical'],
    phaseTwoAtLife: 7,
    movesByPhase: {
      1: [
        { id: 'rindenstoss-1', name: 'Rindenstoss', telegraph: 'Der Stampfer schiebt einen gepolsterten Ast nach vorn.', icon: '◆', damage: 3, kind: 'normal' },
        {
          id: 'rammstoss-1',
          name: 'Rammstoss',
          telegraph: 'Ein tiefes Knarren kündigt den geraden Rammstoss an.',
          icon: '▰',
          damage: 7,
          kind: 'heavy',
          defendNegates: true,
          vulnerableAfterDefend: true,
          defendOutcomeText: 'Du erkennst das tiefe Knarren und gehst in Deckung. Der Rammstoss trifft das Rankentor statt dich.',
          vulnerableText: 'Im verkeilten Ast öffnet sich ein sichtbarer Riss.'
        }
      ],
      2: [
        {
          id: 'rammstoss-2',
          name: 'Doppelter Rammstoss',
          telegraph: 'Zwei tiefe Knarrlaute kündigen den schnelleren Rammstoss an.',
          icon: '▰',
          damage: 8,
          kind: 'heavy',
          defendNegates: true,
          vulnerableAfterDefend: true,
          defendOutcomeText: 'Du bleibst in Deckung, bis beide Knarrlaute vorbei sind. Der Aststampfer verkeilt sich erneut.',
          vulnerableText: 'Der offene Riss reicht nun durch beide Rindenlagen.'
        },
        { id: 'rindenstoss-2', name: 'Kurzer Rindenstoss', telegraph: 'Der Stampfer hebt nur den kurzen Seitenast.', icon: '◆', damage: 4, kind: 'normal' }
      ]
    }
  },
  {
    id: 'enemy_bd_kronenheber',
    name: 'Kronenheber',
    kind: 'boss',
    maxLife: 12,
    defense: 1,
    tags: ['machine', 'crane', 'guardian'],
    weakTo: ['fire'],
    resistantTo: ['physical'],
    phaseTwoAtLife: 6,
    movesByPhase: {
      1: [
        {
          id: 'ansturm',
          name: 'Ansturm',
          telegraph: 'Die Hauptklammer sinkt tief und zeigt den geraden Ansturm an.',
          icon: '▰',
          damage: 7,
          kind: 'heavy',
          defendNegates: true,
          vulnerableAfterDefend: true,
          defendOutcomeText: 'Du gehst hinter dem Kranpfeiler in Deckung. Der Ansturm läuft am Pfeiler aus.',
          vulnerableText: 'Die Hauptklammer steht einen Zug lang offen.'
        },
        { id: 'klammerhieb', name: 'Klammerhieb', telegraph: 'Die Seitenklammer holt in einem kurzen Bogen aus.', icon: '⌁', damage: 4, kind: 'normal' }
      ],
      2: [
        { id: 'aufladen', name: 'Aufladen', telegraph: 'Das Summen steigt; alle Stationsseile spannen sich für den Kronenzug.', icon: 'ϟ', damage: 6, kind: 'charge' },
        { id: 'kronenzug', name: 'Kronenzug', telegraph: 'Das geladene Hauptseil leuchtet und zieht alle Klammern zusammen.', icon: '↟', damage: 3, kind: 'heavy' }
      ]
    }
  }
]

export const kantaraPhase3Encounters: EncounterDefinition[] = [
  {
    id: 'enc_kb_rollkiste',
    areaId: 'kb_wassertor',
    enemyIds: ['enemy_kb_frachtkiste'],
    label: 'Bremse die rollende Frachtkiste',
    description: 'Lies ihr Rattern, verteidige beim Anrollen und nutze das offene Trefferfenster.',
    fleeAreaId: 'kb_kurierhof',
    victoryText: 'Die Rollkiste steht gebremst neben der Annahmestelle. Die Medizin kann sicher abgegeben werden.',
    rewardEffects: [{ kind: 'setFlag', flag: 'rollkiste_gebremst' }]
  },
  {
    id: 'enc_kb_etikettennest',
    areaId: 'kb_dachsteg',
    enemyIds: ['enemy_kb_etikettenkrabbler'],
    label: 'Räume das Etikettennest',
    description: 'Löse die losen Klebezettel und berge den klingenden Splitter.',
    fleeAreaId: 'kb_kurierhof',
    victoryText: 'Die Metallbeine klappen ein. Zwischen den gelösten Etiketten findest du den Resonanzsplitter Kesselbrück.',
    rewardEffects: [
      { kind: 'setFlag', flag: 'etikettennest_geraeumt' },
      { kind: 'addItem', itemId: 'item_shard_kesselbrueck', quantity: 1 }
    ]
  },
  {
    id: 'enc_bd_rankenhuepfer',
    areaId: 'bd_quellast',
    enemyIds: ['enemy_bd_rankenhuepfer'],
    label: 'Löse den Rankenhüpfer vom Rohr',
    description: 'Trenne nur die trockene Ranke; der junge Trieb bleibt am Quellast.',
    fleeAreaId: 'bd_kronengarten',
    victoryText: 'Der trockene Hüpfer löst sich vom Rohr. Der junge Trieb richtet sich unbeschädigt auf.',
    rewardEffects: []
  },
  {
    id: 'enc_bd_seilspinne',
    areaId: 'bd_seilmarkt',
    enemyIds: ['enemy_bd_seilspinne'],
    label: 'Entwirre die Seilspinne',
    description: 'Folge Inas Ring- und Kerbzeichen durch den falschen Knoten.',
    fleeAreaId: 'bd_kronengarten',
    victoryText: 'Die acht Seilbeine fallen als sauber sortierte Halteseile auf den Marktstand.',
    rewardEffects: []
  },
  {
    id: 'enc_bd_kistenkauz',
    areaId: 'bd_obstterrasse',
    enemyIds: ['enemy_bd_kistenkauz'],
    label: 'Vertreibe den Kistenkauz',
    description: 'Achte auf Flügelfalten und Kistenstoss; die Waage bleibt frei erreichbar.',
    fleeAreaId: 'bd_kronengarten',
    victoryText: 'Der Kauz setzt sich auf einen freien Ast. Die Lieferkisten bleiben auf ihren Waagschalen.',
    rewardEffects: []
  },
  {
    id: 'enc_bd_aststampfer',
    areaId: 'bd_rankentor',
    enemyIds: ['enemy_bd_aststampfer'],
    label: 'Stoppe den Aststampfer',
    description: 'Beim tiefen Knarren verteidigen; danach den offenen Riss treffen.',
    fleeAreaId: 'bd_kronengarten',
    requiredGear: { kind: 'flag', flag: 'rammwarnung_gelesen' },
    gearWarning: 'Lies zuerst die vollständige Rammwarnung am Rankentor.',
    victoryText: 'Der Aststampfer löst seine Frachtklammern. Fenn stellt ihn als friedlichen Lastenzieher neu ein; der Weg zum Wipfelsteg ist frei.',
    rewardEffects: [{ kind: 'setFlag', flag: 'aststampfer_beruhigt' }]
  },
  {
    id: 'enc_bd_kranranker',
    areaId: 'bd_wipfelsteg',
    enemyIds: ['enemy_bd_rankenhuepfer'],
    label: 'Löse den Kranranker',
    description: 'Die Tafel zeigt hier erstmals Aufladung und Kapphieb nebeneinander.',
    fleeAreaId: 'bd_kronengarten',
    victoryText: 'Die Kranranke gibt das gespannte Halteseil frei. Der Rundweg bleibt offen.',
    rewardEffects: [{ kind: 'setFlag', flag: 'kranranker_gestoppt' }]
  },
  {
    id: 'enc_bd_kronenheber',
    areaId: 'bd_kranplatz',
    enemyIds: ['enemy_bd_kronenheber'],
    label: 'Schalte den Kronenheber ab',
    description: 'Phase eins: Ansturm verteidigen. Phase zwei: Aufladen mit Kapphieb unterbrechen.',
    fleeAreaId: 'bd_kronengarten',
    requiredGear: { kind: 'equipped', slot: 'weapon', itemId: 'item_weapon_astbeil' },
    gearWarning: 'Baue bei Brik das Astbeil und rüste es aus. Sein Kapphieb unterbricht die Aufladung.',
    victoryText: 'Der Kronenheber öffnet alle Klammern und wechselt in den sicheren Hebebetrieb. Die Stationsbrücke ist frei.',
    rewardEffects: [{ kind: 'setFlag', flag: 'kronenheber_abgeschaltet' }]
  }
]
