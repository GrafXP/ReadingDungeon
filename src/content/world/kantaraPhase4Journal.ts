import type { CampaignJournalDefinition, QuestViewDefinition, RuleCardDefinition, WorldDefinition } from '../../domain/content'
import type { GameSave } from '../../domain/game'

const hasItem = (save: GameSave, itemId: string) => (save.player.inventory[itemId] ?? 0) > 0
const hasFlag = (save: GameSave, value: string) => save.flags.includes(value)
const defeated = (save: GameSave, encounterId: string) => save.defeatedEncounterIds.includes(encounterId)

function quest(
  id: string,
  title: string,
  description: string,
  done: boolean,
  current: boolean,
  hint: string,
  hintAreaIds: string[]
): QuestViewDefinition {
  return { id, title, description, done, current, hint, hintAreaIds }
}

function prologueQuests(save: GameSave): QuestViewDefinition[] {
  const labelsDone = hasFlag(save, 'uebungsetiketten_geloest')
  const medicineTaken = hasFlag(save, 'medizin_erhalten')
  const medicineDone = hasFlag(save, 'medizin_geliefert')
  return [
    quest('prolog_ausruestung', 'Bereite die Übung vor', 'Klappe Klick auf und nimm die Grundausrüstung aus deinem Spind.', hasItem(save, 'item_tool_etikettenlupe') && hasItem(save, 'item_weapon_kurierklinge'), !labelsDone, 'Untersuche den Kurierhof. Käferfach und Spind sind dort beschriftet.', ['kb_kurierhof']),
    quest('prolog_etiketten', 'Ordne die Übungspakete', 'Lies Ziel, Inhalt und Warnzeichen in der Sortierhalle.', labelsDone, !labelsDone, 'Frostbeeren brauchen Kälte, die Spule Trockenheit und die Medizin das Wellenzeichen.', ['kb_sortierhalle']),
    quest('prolog_medizin', 'Liefere die Medizin', medicineTaken ? 'Bringe die Medikamentenkiste zum Wassertor. Verteidige beim Rattern.' : 'Nimm nach der Etikettenübung Merals Hilfsauftrag an.', medicineDone, labelsDone, 'Meral wartet im Kurierhof; der Übungstunnel führt zum Wassertor.', [medicineTaken ? 'kb_wassertor' : 'kb_kurierhof'])
  ]
}

function leafQuests(save: GameSave): QuestViewDefinition[] {
  const read = hasFlag(save, 'pflanzentafel_gelesen')
  const water = hasFlag(save, 'quellventil_geoeffnet')
  const stampfer = defeated(save, 'enc_bd_aststampfer')
  const bridge = hasFlag(save, 'brueckenseil_befestigt')
  const axe = hasItem(save, 'item_weapon_astbeil')
  const lifter = defeated(save, 'enc_bd_kronenheber')
  const stamp = hasItem(save, 'item_quest_blaetterstempel')
  return [
    quest('blaetter_fenn', 'Lies Fenns Pflanzentafel', 'Ordne Jungtrieb, Tragwurzel und Fruchtranke.', read, !read, 'Die vollständige Pflanzentafel steht im Kronengarten.', ['bd_kronengarten']),
    quest('blaetter_quelle', 'Leite Wasser zum Garten', 'Ergänze den Rohrbericht und öffne das Quellventil.', water, read && !water, 'Am Quellast steht: blaue Klemme, mittlere Rinne, Gartenast.', ['bd_quellast']),
    quest('blaetter_stampfer', 'Öffne das Rankentor', 'Lies die Rammwarnung und verteidige beim tiefen Knarren.', stampfer, water && !stampfer, 'Ein verteidigter Rammstoss öffnet den Riss.', ['bd_rankentor']),
    quest('blaetter_bruecke', 'Baue den Weg zum Kranplatz', 'Hilf Ina und befestige Astholz und Rankenseil.', bridge, read && !bridge, 'Ina wartet am Seilmarkt; beide Materialien liegen im offenen Rundweg.', ['bd_seilmarkt', 'bd_brueckenwerk', 'bd_kronengarten']),
    quest('blaetter_astbeil', 'Baue das Astbeil', 'Bringe Astholz und Rankenseil zu Brik und rüste das Werkzeug aus.', axe, read && !axe, 'Brik arbeitet im Werkhof.', ['kb_werkhof']),
    quest('blaetter_kronenheber', 'Schalte den Kronenheber ab', 'Verteidige den Ansturm und unterbrich Aufladen mit Kapphieb.', lifter, axe && !lifter, 'Der Kronenheber wartet am Kranplatz.', ['bd_kranplatz']),
    quest('blaetter_stempel', 'Präge den Blätterstempel', 'Lass Fenn und Ina den Stationsbericht prüfen.', stamp, lifter && !stamp, 'Die Presse steht in der Kronenstation.', ['bd_kronenstation'])
  ]
}

function deltaQuests(save: GameSave): QuestViewDefinition[] {
  const docks = hasFlag(save, 'anlegerliste_geprueft')
  const water = hasFlag(save, 'rohrventil_geoeffnet')
  const spear = hasItem(save, 'item_weapon_bootsspeer')
  const gate = defeated(save, 'enc_kd_schottknacker')
  const wheel = defeated(save, 'enc_kd_deltarad')
  const stamp = hasItem(save, 'item_quest_deltastempel')
  return [
    quest('delta_anleger', 'Ordne Suris Lieferkähne', 'Lies Tiefgang, Ladung und Zielzeichen vollständig.', docks, !docks, 'Suri und Bo warten am Hausboothafen.', ['kd_hausboothafen']),
    quest('delta_ventil', 'Öffne den Wasserweg', 'Stelle die Schleusentore und prüfe das Rohrventil mit dem Pegelstab.', water, docks && !water, 'Oben zu, Mitte halb, unten offen; danach zur Rohrinsel.', ['kd_schleusensteg', 'kd_rohrinsel']),
    quest('delta_speer', 'Baue den Bootsspeer', 'Sammle Schwemmholz und Wasserfaser; Suris Tausch liefert den ersten Spulendraht.', spear, docks && !spear, 'Beide Naturmaterialien wachsen im Schilfkanal, Brik baut im Werkhof.', ['kd_schilfkanal', 'kb_werkhof']),
    quest('delta_schott', 'Öffne den Schieberkai', 'Verteidige beim Hebezug und triff den offenen Schottknacker.', gate, spear && water && !gate, 'Rüste den Bootsspeer aus. Der Rückweg am Kai bleibt frei.', ['kd_schieberkai']),
    quest('delta_rad', 'Stoppe das Deltarad', 'Lies die Radtafel, setze die offenen Schaufeln nass und nutze Blitz.', wheel, gate && !wheel, 'Schwallstoss und Blitzspitze gehören beide zum Bootsspeer.', ['kd_radwehr']),
    quest('delta_stempel', 'Präge den Deltastempel', 'Suri und Bo prüfen den vollständigen Stationsbericht.', stamp, wheel && !stamp, 'Die Freigabepresse steht in der Deltastation.', ['kd_deltastation'])
  ]
}

function yardQuests(save: GameSave): QuestViewDefinition[] {
  const rules = hasFlag(save, 'rikas_warnregel_gelesen') && hasFlag(save, 'jaro_panzerbruch_erklaert')
  const coil = hasFlag(save, 'pflichtspule_entladen')
  const grounded = hasFlag(save, 'pfaehle_geerdet')
  const hammer = hasItem(save, 'item_weapon_spulenhammer')
  const runner = defeated(save, 'enc_sw_spulenlaeufer')
  const cloud = defeated(save, 'enc_sw_wolkenspule')
  const stamp = hasItem(save, 'item_quest_werftstempel')
  return [
    quest('werft_regeln', 'Lies Rikas und Jaros Warnungen', 'Vergleiche Warnreim, Klartext und Panzerbruchrechnung.', rules, !rules, 'Beide Erklärungen liegen in der Drachenwerkstatt.', ['sw_drachenwerkstatt']),
    quest('werft_fahnen', 'Setze die Warnfahnen', 'Folge Rikas Formenfolge am Warnmast.', hasFlag(save, 'warnfahnen_gesetzt'), rules && !hasFlag(save, 'warnfahnen_gesetzt'), 'Kreis vor Streifen, Dreieck zuletzt.', ['sw_warnmast']),
    quest('werft_spule', 'Entlade die Pflichtspule', 'Lies Jaros Wartungssatz in der richtigen Reihenfolge.', coil, rules && !coil, 'Erden, prüfen, dann erst laden.', ['sw_spulengasse']),
    quest('werft_erdung', 'Erde die drei Pfähle', 'Nimm Erdungsklemme und Erdungsring und verbinde eins, zwei, drei.', grounded, coil && !grounded, 'Die Klemme kommt aus der gelösten Pflichtspule.', ['sw_erdungsfeld']),
    quest('werft_hammer', 'Baue den Spulenhammer', 'Sammle zwei Drähte und Werkzeugstahl; rüste Hammer und Erdungsring aus.', hammer, grounded && !hammer, 'Draht liegt in der geerdeten Gasse, Stahl vor dem Kranweg im Speicher.', ['sw_spulengasse', 'sw_blitzspeicher', 'kb_werkhof']),
    quest('werft_laeufer', 'Stoppe den Spulenläufer', 'Unterbrich Aufladen mit Kurzschluss.', runner, hammer && !runner, 'Der Läufer bewacht nur den Weg vom Blitzspeicher zum Kran.', ['sw_blitzspeicher']),
    quest('werft_wolkenspule', 'Schalte die Wolkenspule ab', 'Lies den Speicherplan, unterbrich die Ladung und nutze Panzerbruch.', cloud, runner && !cloud, 'Der Speicherplan liegt vor dem Werftkran.', ['sw_blitzspeicher', 'sw_werftkran']),
    quest('werft_stempel', 'Präge den Werftstempel', 'Rika und Jaro prüfen den Stationsbericht.', stamp, cloud && !stamp, 'Die Freigabepresse steht in der Wolkenstation.', ['sw_wolkenstation'])
  ]
}

function connectorQuests(save: GameSave): QuestViewDefinition[] {
  const stamps = ['item_quest_blaetterstempel', 'item_quest_deltastempel', 'item_quest_werftstempel'].filter((id) => hasItem(save, id)).length
  const switchDone = hasFlag(save, 'kreuzweiche_gestellt')
  const sockets = hasFlag(save, 'stempelfassungen_geprueft')
  const prism = hasItem(save, 'item_quest_prismenoeffner')
  return [
    quest('wechsel_tafel', 'Lies die Teamtafel', 'Ordne Blatt, Welle und Spule ihren ausgeschriebenen Wegen zu.', hasFlag(save, 'teamtafel_gelesen'), stamps > 0 && !hasFlag(save, 'teamtafel_gelesen'), 'Ein Stationsweg führt nach dem ersten Stempel ins Bergungslager.', ['wg_bergungslager']),
    quest('wechsel_weiche', 'Stelle die Kreuzweiche', 'Lege den sicheren Wartungsweg durch das 4×4-Feld.', switchDone, stamps > 0 && !switchDone, 'Die Kreuzweiche liegt direkt neben dem Bergungslager.', ['wg_kreuzweiche']),
    quest('wechsel_stempel', 'Prüfe drei Stempelfassungen', 'Bringe Blätter-, Delta- und Werftstempel gemeinsam zum Prismenknoten.', sockets, stamps === 3 && !sockets, 'Die mittlere Weiche öffnet sich mit allen drei Stempeln.', ['wg_prismenknoten']),
    quest('wechsel_prisma', 'Baue den Prismenöffner', 'Bringe Klicks Rückgabezettel zu Brik; die drei Stempel bleiben erhalten.', prism, sockets && !prism, 'Brik wartet im Werkhof und öffnet Feuer, Eis und Licht gleichzeitig.', ['kb_werkhof'])
  ]
}

function getQuestViews(save: GameSave): QuestViewDefinition[] {
  if (!hasFlag(save, 'medizin_geliefert')) return prologueQuests(save)
  return [...leafQuests(save), ...deltaQuests(save), ...yardQuests(save), ...connectorQuests(save)]
}

function getMainGoal(save: GameSave) {
  const stamps = ['item_quest_blaetterstempel', 'item_quest_deltastempel', 'item_quest_werftstempel'].filter((id) => hasItem(save, id)).length
  if (hasItem(save, 'item_quest_prismenoeffner')) return { title: 'Die Aussenregionen sind offen', description: 'Feuer-, Eis- und Lichtweg wurden gleichzeitig freigegeben. Die erste Kampagnenhälfte ist vollständig spielbar.' }
  if (hasFlag(save, 'stempelfassungen_geprueft')) return { title: 'Baue den Prismenöffner', description: 'Kehre mit Klicks Rückgabezettel und allen drei Stempeln zu Brik in den Werkhof zurück.' }
  if (stamps === 3) return { title: 'Öffne den Prismenknoten', description: 'Stelle die Kreuzweiche und prüfe Blätter-, Delta- und Werftfassung gemeinsam.' }
  if (hasFlag(save, 'medizin_geliefert')) return { title: 'Erkunde den offenen ersten Ring', description: `${stamps} von 3 Freigabestempeln sind geprüft. Blätterdächer, Kanaldelta und Sturmwerft können in jeder Reihenfolge gespielt werden.` }
  if (hasFlag(save, 'uebungsetiketten_geloest')) return { title: 'Bringe die Medizin zum Wassertor', description: 'Nimm Merals Auftrag an, lies die Rollkiste und halte den Rückweg offen.' }
  return { title: 'Prüfe die Übungspakete', description: 'Klappe Klick auf, nimm die Grundausrüstung und ordne die drei vollständigen Etiketten.' }
}

export const kantaraPhase4Journal: CampaignJournalDefinition = {
  getQuestViews,
  getMainGoal,
  hintSteps: {
    delta_anleger: ['Jeder Kahn nennt drei Merkmale.', 'Metall braucht den tiefsten, Kräuter den flachsten Anleger.'],
    delta_ventil: ['Lies die Flusspfeile, nicht deine Blickrichtung.', 'Oben zu, Mitte halb, unten offen; der Pegelstab kommt von Suri und Bo.'],
    delta_speer: ['Kanaldelta bleibt ohne Werftbesuch lösbar.', 'Suris Kähnerätsel gibt den ersten Draht; Holz und Faser wachsen im Schilfkanal.'],
    delta_schott: ['Die Deckung ist eine angekündigte Bewegung.', 'Beim Hebezug verteidigen und erst die offene Platte treffen.'],
    delta_rad: ['Die Radtafel nennt eine Zustandskette.', 'Offene Schaufeln mit Schwallstoss nass machen, danach Blitz nutzen.'],
    werft_spule: ['Drei Verben stehen im Wartungssatz.', 'Erden, prüfen, laden.'],
    werft_erdung: ['Die Pfähle sind nummeriert.', 'Nimm zuerst die Klemme aus der gelösten Pflichtspule.'],
    werft_hammer: ['Alle Materialien liegen vor dem ersten Pflichtboss.', 'Zwei Drähte aus der geerdeten Gasse, Stahl aus dem Speicherfach.'],
    werft_laeufer: ['Das steigende Summen ist der entscheidende Text.', 'Beim Zug Aufladen Kurzschluss benutzen.'],
    werft_wolkenspule: ['Der Speicherplan wiederholt zwei Regeln.', 'Aufladung unterbrechen; der Hammer zieht einen Punkt Panzerung ab.'],
    wechsel_stempel: ['Die Mitte braucht keine verbrauchten Schlüssel.', 'Alle drei Stempel bleiben im Inventar und müssen gleichzeitig vorhanden sein.'],
    wechsel_prisma: ['Der Öffner wird nicht im Tunnel gebaut.', 'Kehre nach der Fassungsprüfung zu Brik in den Werkhof zurück.']
  }
}

const flagRequirement = (value: string) => ({ kind: 'flag' as const, flag: value })
const clueRequirement = (clueId: string) => ({ kind: 'clue' as const, clueId })

export const kantaraPhase4RuleCards: RuleCardDefinition[] = [
  { id: 'regel_nass', title: 'Nass', description: 'Schwallstoss und markierte Wasserquellen setzen ein Ziel nass. Nasse Gegner sind zusätzlich schwach gegen Blitz und Eis.', requirement: clueRequirement('regel_nass') },
  { id: 'regel_blitz', title: 'Blitz', description: 'Blitz trifft Wasserwesen und nasse Maschinen besonders stark. Ein ausdrücklich genannter Blitzschutz halbiert passenden Gegnerschaden.', requirement: clueRequirement('regel_blitz') },
  { id: 'regel_schild', title: 'Deckung öffnen', description: 'Eine geschlossene Deckung weist Treffer ab. Warte den angekündigten Hebezug ab, verteidige und nutze danach das offene Trefferfenster.', requirement: flagRequirement('area_untersucht:kd_schieberkai') },
  { id: 'regel_unterbrechen', title: 'Aufladung unterbrechen', description: 'Steigendes Summen und der Zugname Aufladen warnen vor einem starken Treffer. Kapphieb oder Kurzschluss unterbrechen die angekündigte Bewegung.', requirement: clueRequirement('regel_unterbrechen') },
  { id: 'regel_panzerbruch', title: 'Panzerbruch', description: 'Panzerbruch wird zuerst von der gegnerischen Panzerung abgezogen. Erst danach berechnet das Spiel den Wuchtschaden; Elementanteile bleiben getrennt.', requirement: clueRequirement('regel_panzerbruch') },
  { id: 'regel_blitzschutz', title: 'Blitzschutz', description: 'Der Erdungsring halbiert Blitzschaden. Form, Zeichen und Wort wiederholen die Information, damit sie nicht nur über Farbe erkennbar ist.', requirement: clueRequirement('regel_blitzschutz') },
  { id: 'regel_schutz_stapeln', title: 'Schutz wird einmal berechnet', description: 'Mehrere passende Schutzquellen halbieren denselben Treffer nicht mehrfach. Panzerung wird danach als fester Wert abgezogen.', requirement: flagRequirement('area_untersucht:sw_erdungsfeld') }
]

export const kantaraPhase4StoryBeats: NonNullable<WorldDefinition['storyBeats']> = [
  {
    id: 'zweiter_freigabestempel',
    requirement: {
      kind: 'any',
      requirements: [
        { kind: 'all', requirements: [{ kind: 'item', itemId: 'item_quest_blaetterstempel' }, { kind: 'item', itemId: 'item_quest_deltastempel' }] },
        { kind: 'all', requirements: [{ kind: 'item', itemId: 'item_quest_blaetterstempel' }, { kind: 'item', itemId: 'item_quest_werftstempel' }] },
        { kind: 'all', requirements: [{ kind: 'item', itemId: 'item_quest_deltastempel' }, { kind: 'item', itemId: 'item_quest_werftstempel' }] }
      ]
    },
    text: 'Beim zweiten Freigabestempel erkennt Brik die gemeinsame Fassung: Blatt, Welle und Spule richten zusammen einen Prismenöffner aus. Noch fehlt der dritte geprüfte Regionsweg.'
  },
  {
    id: 'dritter_freigabestempel',
    requirement: { kind: 'all', requirements: [{ kind: 'item', itemId: 'item_quest_blaetterstempel' }, { kind: 'item', itemId: 'item_quest_deltastempel' }, { kind: 'item', itemId: 'item_quest_werftstempel' }] },
    text: 'Alle drei nahen Regionen sind frei. Die Teams in den Wechselgängen öffnen die mittlere Weiche zum Prismenknoten; keine Region musste zuerst oder zuletzt kommen.'
  },
  {
    id: 'prismenoeffner_fertig',
    requirement: { kind: 'item', itemId: 'item_quest_prismenoeffner' },
    text: 'Feuer, Eis und Licht leuchten gleichzeitig am Prismenknoten auf. Glascaldera, Frostobservatorium und Laternenmoor sind nun unabhängig voneinander geöffnet.'
  }
]
