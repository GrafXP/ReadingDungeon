import type { AreaDefinition, PassageDefinition, Requirement } from '../../domain/content'

const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })
const item = (itemId: string): Requirement => ({ kind: 'item', itemId })
const changed = (requirement: Requirement, description: string, inspectText = description) => ({ requirement, description, inspectText })

export const kantaraPhase3Areas: AreaDefinition[] = [
  {
    id: 'kb_kurierhof',
    name: 'Kurierhof',
    regionId: 'kesselbrueck',
    regionName: 'Kesselbrück',
    safe: true,
    mapPosition: { x: 520, y: 380 },
    firstDescription: 'Am Morgen des Tauschfests warten drei Übungspakete unter gestreiften Marktsegeln. Auf jedem Etikett stehen Ziel, Inhalt und Warnzeichen. Kuriermeisterin Meral hält den sicheren Übungsweg frei. Neben ihr liegt ein zusammengefalteter Paketkäfer, auf dessen Rücken «Klick» steht.',
    revisitDescription: 'Meral steht an der freien Rückkehrtafel. Der niedrige Übungstisch, dein beschrifteter Spind und der Rastplatz bleiben erreichbar.',
    inspectText: 'Am Käferfach steht «Zum Lesen aufklappen». Merals Tafel erklärt: Ein angekündigtes Rattern bedeutet Deckung. Flucht und Rettung führen ohne verlorene Funde zum letzten Rastplatz.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Fenn und Ina sind sicher in Kesselbrück angekommen. Am Rand des Kurierhofs wachsen geordnete Setzlinge statt wilder Packranken. Meral hat den Blätterstempel auf der freien Tafel eingetragen; Klick fragt jede neue Kiste nun erst nach ihrem Ziel.'),
      changed(flag('medizin_geliefert'), 'Die Medikamentenkiste ist sicher angekommen. Meral hat drei gleichberechtigte Regionsaufträge an die Tafel gehängt. Klick wartet neben deinem Rückweg und Brik hält den Werkhof offen.')
    ]
  },
  {
    id: 'kb_sortierhalle',
    name: 'Sortierhalle',
    regionId: 'kesselbrueck',
    regionName: 'Kesselbrück',
    safe: false,
    mapPosition: { x: 610, y: 340 },
    firstDescription: 'Drei Übungszettel liegen offen auf dem Sortierpult: Frostbeeren müssen kühl bleiben, eine Ersatzspule muss trocken in die Werftkiste und die Medizin mit Wellenzeichen gehört zum Wassertor.',
    revisitDescription: 'Zwischen stillstehenden Sortierarmen liegen die drei vollständig lesbaren Übungsetiketten. Der Ausgangskorb wartet auf die richtige Zuordnung.',
    inspectText: 'Klick fährt jede Zeile ab. «Erst Ziel, dann Inhalt, dann Warnzeichen. Wenn etwas nicht zusammenpasst, fragen wir nach.» Hinter dem Pult beginnt die Halle leise zu beben.',
    variants: [
      changed(flag('medizin_geliefert'), 'Die Sortierhalle dient jetzt als ruhiges Notlager. Glühende Frostbeeren und eine nasse Wetterspule stehen getrennt auf deutlich beschrifteten Plätzen.', 'Die falschen Lieferungen tragen denselben leuchtenden Sammelbefehl. Er führt zum Vorplatz des Wechselwerks.'),
      changed(flag('uebungsetiketten_geloest'), 'Die Übungspakete stehen richtig. Im selben Moment bebt die Halle: Eine heisse Frostbeerenkiste kommt zurück, eine Wetterspule rollt zum Wassertor und über sechs Leitungen erscheint «Sammeln».')
    ]
  },
  {
    id: 'kb_werkhof',
    name: 'Werkhof',
    regionId: 'kesselbrueck',
    regionName: 'Kesselbrück',
    safe: true,
    mapPosition: { x: 500, y: 475 },
    firstDescription: 'Werkzeugmacher Brik legt Werkstoffe nicht einfach auf einen Haufen. Jedes Fach nennt Quelle, Menge und Zweck. Er reicht dir das Werkhofbuch und zeigt am Kurierwams: Panzerung zieht festen Wuchtschaden ab; ein Schutz halbiert den passenden Elementschaden.',
    revisitDescription: 'Briks Werkbank ist frei. Das Werkhofbuch liegt neben den Materialfächern und zeigt nur Rezepte, deren Herkunft du bereits gelesen hast.',
    inspectText: 'Eine Vergleichstafel stellt ausgerüstete und neue Werte nebeneinander. Darunter steht: «Ausrüstung ausserhalb eines Kampfes wechseln. Umstellbare Waffen nur am Rastplatz prüfen.»',
    firstVisitRestocks: [{ itemId: 'item_tool_werkhofbuch', quantity: 1 }],
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Fenns Blattplan hängt über Briks Werkbank. Neben dem fertigen Astbeil und dem Rindenmuster ist Platz für Baupläne aus weiteren Regionen.', 'Brik zeigt auf drei leere Prismenfassungen. «Ein geprüfter Stempel ist ein Anfang. Zwei weitere fehlen noch.»'),
      changed(flag('rezept_astbeil_bekannt'), 'Fenns Blattplan liegt im Werkhofbuch. Brik hat eine breite Beilklinge und geschichtete Rindenplatten für die ersten beiden Rezepte vorbereitet.')
    ]
  },
  {
    id: 'kb_tauschmarkt',
    name: 'Tauschmarkt',
    regionId: 'kesselbrueck',
    regionName: 'Kesselbrück',
    safe: false,
    mapPosition: { x: 425, y: 365 },
    firstDescription: 'Unter halb eingerollten Marktsegeln sichern Händlerinnen ihre Stände. Eine alte Dachpost-Marke liegt bei den Notvorräten. Vom Blatt-Wegweiser führt der Marktweg in die riesigen Baumkronen der Blätterdächer.',
    revisitDescription: 'Die Marktsegel spannen sich über die gesicherten Stände. Der Leiterweg zum Dachsteg und der beschriftete Marktweg zu den Blätterdächern bleiben sichtbar.',
    inspectText: 'Die Marktleiterin zeigt zuerst den freien Rückweg zum Kurierhof. Dann öffnet sie den Versorgungskasten und erzählt, dass die erste Dachpost lange vor dem Wechselwerk unterwegs war.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Ein Obst- und Seilstand ist wieder geöffnet. Menschen aus den Blätterdächern erzählen, wie Fenn und Ina die Kronenstation gemeinsam geprüft haben.'),
      changed(flag('medizin_geliefert'), 'Die Notstände sind geordnet. Am Blatt-Wegweiser steht nun ausgeschrieben: «Kronengarten – sicherer Rastplatz».')
    ]
  },
  {
    id: 'kb_dachsteg',
    name: 'Dachsteg',
    regionId: 'kesselbrueck',
    regionName: 'Kesselbrück',
    safe: false,
    mapPosition: { x: 350, y: 315 },
    firstDescription: 'Über den Backsteindächern hängen falsch zugestellte Kisten in einem Netz aus Klebezetteln. Darin krabbeln kleine Metallbeine. Zwischen zwei Schornsteinen klingt ein Resonanzsplitter im Wind.',
    revisitDescription: 'Der hohe Steg überblickt Markt, Werkhof und den verriegelten Vorplatz. Lose Etiketten kleben noch an den Geländern.',
    inspectText: 'Ohne Klebezettel verlieren die Etikettenkrabbler ihren Halt. Der singende Splitter steckt mitten in ihrem Nest; der Marktweg zurück bleibt frei.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Ina hat ein breites Halteseil vom Dachsteg zum Vorplatz gespannt. Unter der neuen Abkürzung hängen nur noch richtig beschriftete Lastkörbe.'),
      changed(flag('etikettennest_geraeumt'), 'Das Etikettennest ist leer. Der Resonanzsplitter klingt nun sicher in deinem Gepäck, und der Blick über Kesselbrück ist frei.')
    ]
  },
  {
    id: 'kb_wassertor',
    name: 'Wassertor',
    regionId: 'kesselbrueck',
    regionName: 'Kesselbrück',
    safe: false,
    mapPosition: { x: 610, y: 455 },
    firstDescription: 'Der nicht registrierte Übungstunnel endet am Wassertor. Vor der Annahmestelle rattert eine schwere Frachtkiste auf geraden Rollen hin und her. Das Wellenzeichen der Medikamentenkiste passt zum Schild hinter ihr; der Rückweg zum Kurierhof bleibt offen.',
    revisitDescription: 'Die Annahmestelle am Wassertor ist deutlich mit einer Welle markiert. Durch den Übungstunnel erreichst du jederzeit den Kurierhof.',
    inspectText: 'Merals Lieferzettel warnt: «Rattern kündigt Anrollen an. Verteidige dich; dann steht die Rollkiste einen Moment offen. Beobachten kostet keine Bewegung.»',
    variants: [
      changed(flag('medizin_geliefert'), 'Die Medizin ist verteilt und die Rollkiste steht gebremst neben dem Tor. Eine Hilfsfähre wartet auf ihre spätere Route ins Kanaldelta.'),
      changed(flag('rollkiste_gebremst'), 'Die Rollkiste steht offen neben der Annahmestelle. Der Weg zum Empfänger mit dem Wellenzeichen ist frei.')
    ]
  },
  {
    id: 'kb_wechselwerk_vorplatz',
    name: 'Vorplatz des Wechselwerks',
    regionId: 'kesselbrueck',
    regionName: 'Kesselbrück',
    safe: false,
    mapPosition: { x: 700, y: 370 },
    firstDescription: 'Drei gewaltige Haupttore sind verriegelt. Darüber läuft ein vollständiger Befehl: «Sammle Wärme, Kälte, Blitz, Licht, Dämmer und alle Wege zur Prüfung.» Drei leere Kernfassungen zeigen nach unten ins Grosse Wechselwerk.',
    revisitDescription: 'Der Sammelbefehl leuchtet unverändert über den verriegelten Toren. Rückpfeile zeigen zur Sortierhalle und über die Dächer.',
    inspectText: 'Neben dem Befehl steht Orens Name als Freigabestelle. Klick liest zweimal und klappt dann die Lupe ein. «Naturkräfte sind keine Pakete. Der Auftrag kann nicht stimmen.»',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Das Blätterzeichen leuchtet in einem Seitenfeld des Vorplatzes. Inas neue Dachleine bildet eine sichere Abkürzung; die drei grossen Kernfassungen bleiben leer.'),
      changed(flag('sammelbefehl_gelesen'), 'Klick hat den fehlerhaften Sammelbefehl im Register vermerkt. Das Haupttor bleibt zu, doch die offenen Regionswege sind klar beschriftet.')
    ]
  },
  {
    id: 'bd_kronengarten',
    name: 'Kronengarten',
    regionId: 'blaetterdaecher',
    regionName: 'Blätterdächer',
    safe: true,
    mapPosition: { x: 285, y: 400 },
    firstDescription: 'Plattformen liegen zwischen mächtigen Kronenästen. Zu schnell gewachsene Ranken zerren an den Häusern. Der junge Gärtner Fenn hält drei Pflanzschilder hoch: Jungtrieb, Tragwurzel und Fruchtranke müssen nach Blattkante, Stammfarbe und Wasserbedarf unterschieden werden.',
    revisitDescription: 'Fenn hält den sicheren Rastplatz frei. Die Pflanzentafel und das Ernteschild für alte, lose Rankenseile bleiben vollständig lesbar.',
    inspectText: 'Die Tafel nennt alle Merkmale: Der helle Jungtrieb mit glatter Kante braucht Schatten. Die dunkle Tragwurzel mit breiter Kante gehört an die Quellrinne. Die gezackte Fruchtranke trägt nur am Sonnenseil.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Die Beete des Kronengartens wachsen wieder in geordneten Reihen. Fenn liefert reife Materialien an Brik und lässt junge Triebe unberührt.'),
      changed(flag('quellventil_geoeffnet'), 'Kühles Wasser läuft durch die Wurzelrinnen des Kronengartens. Die ausgewachsenen, losen Ranken am Ernteschild können sicher als Rankenseil genommen werden.')
    ]
  },
  {
    id: 'bd_seilmarkt',
    name: 'Seilmarkt',
    regionId: 'blaetterdaecher',
    regionName: 'Blätterdächer',
    safe: false,
    mapPosition: { x: 205, y: 365 },
    firstDescription: 'Bewohnerinnen sichern ihre Plattformhäuser mit dicken Halteseilen. Brückenbauerin Ina markiert jedes tragfähige Seil mit einem breiten Ring und jedes Zugseil mit zwei kurzen Kerben. Ein falscher Knoten kriecht auf acht Seilbeinen zwischen den Ständen.',
    revisitDescription: 'Ina prüft die Seile am Markt. Der Kronengarten bleibt als Rückweg ausgeschildert; ein Bauzettel zeigt zum Brückenwerk.',
    inspectText: 'Ina zeigt auf ihren Plan: Für das neue Brückenseil braucht sie ein Stück Astholz und ein altes Rankenseil. Beides liegt im offenen Rundweg vor dem Kranplatz.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Die Händler sind zurück. Eine reparierte Seilbahn bringt Obst und Material nach Kesselbrück; Ina kontrolliert jeden Knoten ein zweites Mal.'),
      changed(flag('ina_brueckenauftrag'), 'Inas Bauauftrag hängt gut lesbar am Marktstand: «Ein Astholz, ein Rankenseil, Halteseil – keine Zugleine.»')
    ]
  },
  {
    id: 'bd_quellast',
    name: 'Quellast',
    regionId: 'blaetterdaecher',
    regionName: 'Blätterdächer',
    safe: false,
    mapPosition: { x: 285, y: 500 },
    firstDescription: 'Ein kaltes Rohr läuft über einen dicken Ast, doch drei falsch beschriftete Klemmen leiten das Wasser fort. Der Wartungsbericht hängt trocken daneben: «Erst blaue Klemme, dann mittlere Rinne, zuletzt Gartenast.»',
    revisitDescription: 'Der Rohrbericht bleibt neben Klemme, Rinne und Gartenleitung hängen. Harzzeichen markieren nur ausgewachsene Fruchtranken.',
    inspectText: 'Die drei entscheidenden Richtungswörter stehen ausgeschrieben im Bericht: blau, Mitte, Garten. Fenns Tafel unterscheidet daneben reifes Harz von weichen Jungtrieben.',
    variants: [
      changed(flag('quellventil_geoeffnet'), 'Kaltes Quellwasser fliesst durch die mittlere Rinne zum Gartenast. Die überhitzten Wurzeln entspannen sich sichtbar.'),
      changed(flag('pflanzentafel_gelesen'), 'Fenns drei Pflanzenmerkmale sind neben dem Rohrbericht notiert. An einer reifen Fruchtranke sammelt sich klares Blätterharz.')
    ]
  },
  {
    id: 'bd_rankentor',
    name: 'Rankentor',
    regionId: 'blaetterdaecher',
    regionName: 'Blätterdächer',
    safe: false,
    mapPosition: { x: 360, y: 455 },
    firstDescription: 'Tiefe Rammspuren führen durch ein Tor aus geflochtenen Ästen. Das Warnschild nennt nicht nur die Gefahr, sondern auch die Reaktion: «Tiefes Knarren kündigt den Rammstoss an. In Deckung gehen.» Der Gartenweg hinter dir bleibt frei.',
    revisitDescription: 'Am Rankentor sind Rammspuren und das vollständige Warnschild weiterhin sichtbar. Der Weg zum Garten bleibt offen.',
    inspectText: 'Eine Zeichnung zeigt: Wer den Rammstoss verteidigt, lässt den Aststampfer im Tor verkeilen. Ein offener Riss macht die Rinde für kurze Zeit verwundbar.',
    variants: [
      changed(flag('aststampfer_beruhigt'), 'Der Aststampfer trägt jetzt sorgsam Holz zwischen Garten und Rankentor. Das tiefe Knarren kündigt nur noch seine langsame Ankunft an.'),
      changed(flag('rammwarnung_gelesen'), 'Das Warnschild ist in Klicks Register übertragen. Du kennst Knarren, Deckung und das kurze Trefferfenster.')
    ]
  },
  {
    id: 'bd_wipfelsteg',
    name: 'Wipfelsteg',
    regionId: 'blaetterdaecher',
    regionName: 'Blätterdächer',
    safe: false,
    mapPosition: { x: 395, y: 535 },
    firstDescription: 'Hoch über den Blättern ziehen Kranklammern Ranken zu straffen Bündeln. Vor jedem Zug steigt ihr Summen an. Eine Werkzeugtafel zeigt einen breiten Kapphieb durch das gespannte Seil: Aufladung mit Waffenkunst unterbrechen.',
    revisitDescription: 'Der Wipfelsteg verbindet Rankentor und Brückenwerk. Die Kapphieb-Zeichnung bleibt am Geländer lesbar.',
    inspectText: 'Die Tafel erklärt vollständig: Kapphieb unterbricht die gerade angekündigte Bewegung und braucht danach zwei Runden, bis er wieder bereit ist.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Die Kranklammern liegen sauber sortiert am Rand. Der entwirrte Wipfelsteg bleibt als Rundweg offen.'),
      changed(flag('kranranker_gestoppt'), 'Das angespannte Rankengeflecht ist gelöst. Nur die gut sichtbare Kapphieb-Tafel hängt noch über dem freien Steg.')
    ]
  },
  {
    id: 'bd_brueckenwerk',
    name: 'Brückenwerk',
    regionId: 'blaetterdaecher',
    regionName: 'Blätterdächer',
    safe: false,
    mapPosition: { x: 285, y: 590 },
    firstDescription: 'Inas offene Werkplattform liegt zwischen zwei dicken Ästen. Ein beschrifteter Verschnittkorb enthält tragfähiges Astholz. Der Knotenplan trennt breite Ringzeichen für Halteseile von Doppelkerben für Zugseile.',
    revisitDescription: 'Astholz liegt im Verschnittkorb. Der Knotenplan zeigt vom Seilmarkt über die Werkplattform zum Kranplatz.',
    inspectText: 'Für die Reparatur nennt Ina genau ein Astholz und ein Rankenseil. Der Rest des Materials bleibt für Briks Astbeil oder einen Rindenpanzer verfügbar.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Die neue Brücke trägt Menschen und Material sicher. Ina plant bereits ein hitzefestes Halteseil für einen späteren Weg.'),
      changed(flag('brueckenseil_befestigt'), 'Das geprüfte Halteseil spannt eine sichere Brücke zum Kranplatz. Der Knotenplan bleibt für spätere Reparaturen hängen.')
    ]
  },
  {
    id: 'bd_obstterrasse',
    name: 'Obstterrasse',
    regionId: 'blaetterdaecher',
    regionName: 'Blätterdächer',
    safe: false,
    mapPosition: { x: 155, y: 475 },
    firstDescription: 'Kleine Birnenkisten und eine grosse Apfelkiste stehen vor einer Balkenwaage. Die Lieferliste sagt: «Zwei kleine Birnenkisten wiegen so viel wie eine grosse Apfelkiste.» Eine alte Marke und ein Resonanzsplitter stecken unter der falschen Ablage.',
    revisitDescription: 'Lieferliste, Kistenbilder und Balkenwaage bleiben auf der Terrasse. Ein Versorgungskorb ist mit «Obstbrot nach geprüfter Waage» beschriftet.',
    inspectText: 'Die Liste verlangt links eine grosse Apfelkiste und rechts zwei kleine Birnenkisten. Farbe spielt keine Rolle; Bild, Grösse und Zahl sind ausgeschrieben.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Pflückende füllen wieder klar beschriftete Kisten. Der zurückgeschnittene Rankengang zum Kranplatz bleibt offen.'),
      changed(flag('obstwaage_geloest'), 'Die Waage steht genau in der Mitte. Pflückende sind zurückgekehrt, und im geprüften Versorgungskorb liegt frisches Obstbrot.')
    ]
  },
  {
    id: 'bd_kranplatz',
    name: 'Kranplatz',
    regionId: 'blaetterdaecher',
    regionName: 'Blätterdächer',
    safe: false,
    mapPosition: { x: 205, y: 580 },
    firstDescription: 'Der Kronenheber spannt alle Stationsseile zu einem einzigen Frachtbündel. In Phase eins lässt er vor seinem Ansturm die Hauptklammer tief sinken: verteidigen. Danach lädt er den Kronenzug mit steigendem Summen: mit Kapphieb unterbrechen. Beide Wege zurück bleiben frei.',
    revisitDescription: 'Kranplan und Rückwegpfeile sind am Platz vollständig sichtbar. Der Kronenheber hält die Stationsbrücke, ohne die Wege zu Garten und Terrasse zu sperren.',
    inspectText: 'Der zweigeteilte Kranplan wiederholt beide Regeln: «Ansturm – Deckung» und «Aufladen – Kapphieb». Für Kapphieb muss das Astbeil ausgerüstet sein.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Der Kronenheber hebt nun einzeln beschriftete Körbe für die Bewohner. Kein Seil verschnürt mehr den Stationsweg.'),
      changed(flag('kronenheber_abgeschaltet'), 'Der Kronenheber ist abgeschaltet. Seine Hauptklammer hält die Stationsbrücke ruhig und der Weg zur Presse ist frei.')
    ]
  },
  {
    id: 'bd_kronenstation',
    name: 'Kronenstation',
    regionId: 'blaetterdaecher',
    regionName: 'Blätterdächer',
    safe: false,
    mapPosition: { x: 115, y: 620 },
    firstDescription: 'In der Kronenstation stehen Freigabepresse und Stationsbericht nebeneinander. Fenn liest den Bericht, Ina prüft die Seile. Der Rückpfeil zum Kranplatz ist sichtbar, bevor jemand die Presse bedient.',
    revisitDescription: 'Fenn und Ina warten an der geprüften Presse. Der Stationsbericht nennt Wasserleitung, Brückenseil und abgeschalteten Kronenheber.',
    inspectText: 'Alle drei Prüffelder sind bestätigt. Erst wenn Bericht und Rückweg gelesen sind, kann der Blätterstempel sicher geprägt werden.',
    variants: [
      changed(item('item_quest_blaetterstempel'), 'Das Blätterzeichen leuchtet über der Station. Fenn und Ina reisen zwischen Kronengarten und Kesselbrück; die Presse sendet ein klares Bereitsignal.')
    ]
  }
]

export const kantaraPhase3Passages: PassageDefinition[] = [
  { id: 'v001', fromAreaId: 'kb_kurierhof', toAreaId: 'kb_sortierhalle', labelFrom: 'Gehe zu Merals Übungsauftrag', labelTo: 'Kehre in den Kurierhof zurück' },
  { id: 'v002', fromAreaId: 'kb_kurierhof', toAreaId: 'kb_werkhof', labelFrom: 'Gehe zu Briks Werkhof', labelTo: 'Kehre in den Kurierhof zurück' },
  { id: 'v003', fromAreaId: 'kb_kurierhof', toAreaId: 'kb_tauschmarkt', labelFrom: 'Gehe zum Tauschmarkt', labelTo: 'Kehre in den Kurierhof zurück' },
  { id: 'v004', fromAreaId: 'kb_sortierhalle', toAreaId: 'kb_tauschmarkt', labelFrom: 'Folge der richtig etikettierten Ausgangskiste', labelTo: 'Gehe in die Sortierhalle', requirement: flag('uebungsetiketten_geloest'), blockedText: 'Die Ausgangskiste ist noch nicht richtig zugeordnet.' },
  { id: 'v005', fromAreaId: 'kb_tauschmarkt', toAreaId: 'kb_dachsteg', labelFrom: 'Steige über die Marktleiter zum Dachsteg', labelTo: 'Steige zum Tauschmarkt hinab', requirement: flag('marktleiter_geoeffnet'), blockedText: 'Die Marktleiterin öffnet die Leiter nach der Versorgungskontrolle.' },
  { id: 'v006', fromAreaId: 'kb_kurierhof', toAreaId: 'kb_wassertor', labelFrom: 'Bringe die Medizin durch den Übungstunnel', labelTo: 'Kehre durch den Übungstunnel zurück', requirement: flag('medizin_erhalten'), blockedText: 'Meral übergibt die Medizin nach der richtigen Etikettenübung.' },
  { id: 'v007', fromAreaId: 'kb_sortierhalle', toAreaId: 'kb_wechselwerk_vorplatz', labelFrom: 'Folge dem Sammelbefehl zum Vorplatz', labelTo: 'Kehre in die Sortierhalle zurück', requirement: flag('medizin_geliefert'), blockedText: 'Die Notlieferung muss zuerst sicher ankommen.' },
  { id: 'v008', fromAreaId: 'kb_dachsteg', toAreaId: 'kb_wechselwerk_vorplatz', labelFrom: 'Nimm Inas neue Dachleine zum Vorplatz', labelTo: 'Nimm Inas Dachleine zum Dachsteg', requirement: item('item_quest_blaetterstempel'), blockedText: 'Ina spannt diese Abkürzung nach der Rettung der Blätterdächer.', shortcut: true },
  { id: 'v009', fromAreaId: 'bd_kronengarten', toAreaId: 'bd_seilmarkt', labelFrom: 'Gehe zu Inas Seilmarkt', labelTo: 'Kehre zum Kronengarten zurück' },
  { id: 'v010', fromAreaId: 'bd_kronengarten', toAreaId: 'bd_quellast', labelFrom: 'Folge dem kalten Rohr zum Quellast', labelTo: 'Folge dem Gartenast zurück' },
  { id: 'v011', fromAreaId: 'bd_kronengarten', toAreaId: 'bd_rankentor', labelFrom: 'Gehe zum Rankentor', labelTo: 'Kehre zum Kronengarten zurück' },
  { id: 'v012', fromAreaId: 'bd_seilmarkt', toAreaId: 'bd_brueckenwerk', labelFrom: 'Folge Inas Bauzettel zum Brückenwerk', labelTo: 'Kehre zum Seilmarkt zurück' },
  { id: 'v013', fromAreaId: 'bd_seilmarkt', toAreaId: 'bd_obstterrasse', labelFrom: 'Gehe zur Obstterrasse', labelTo: 'Kehre zum Seilmarkt zurück' },
  { id: 'v014', fromAreaId: 'bd_quellast', toAreaId: 'bd_wipfelsteg', labelFrom: 'Folge der richtig geleiteten Wasserader', labelTo: 'Kehre am Quellrohr zurück', requirement: flag('quellventil_geoeffnet'), blockedText: 'Der Rohrbericht muss richtig ergänzt und das Quellventil geöffnet werden.' },
  { id: 'v015', fromAreaId: 'bd_quellast', toAreaId: 'bd_obstterrasse', labelFrom: 'Folge der Quellmarke zur Obstterrasse', labelTo: 'Gehe zum Quellast' },
  { id: 'v016', fromAreaId: 'bd_rankentor', toAreaId: 'bd_wipfelsteg', labelFrom: 'Gehe durch das Rankentor zum Wipfelsteg', labelTo: 'Kehre durch das Rankentor zurück', guardEncounterId: 'enc_bd_aststampfer', blockedText: 'Der Aststampfer rammt nur diesen Hinweg; der Gartenweg bleibt frei.' },
  { id: 'v017', fromAreaId: 'bd_wipfelsteg', toAreaId: 'bd_brueckenwerk', labelFrom: 'Folge dem Halteseil zum Brückenwerk', labelTo: 'Steige zum Wipfelsteg hinauf' },
  { id: 'v018', fromAreaId: 'bd_brueckenwerk', toAreaId: 'bd_kranplatz', labelFrom: 'Überquere Inas reparierte Brücke', labelTo: 'Kehre über Inas Brücke zurück', requirement: flag('brueckenseil_befestigt'), blockedText: 'Ina braucht ein Astholz und ein Rankenseil für das Halteseil.' },
  { id: 'v019', fromAreaId: 'bd_obstterrasse', toAreaId: 'bd_kranplatz', labelFrom: 'Nimm den freigeschnittenen Rankengang', labelTo: 'Kehre durch den Rankengang zur Obstterrasse zurück', requirement: flag('obstwaage_geloest'), blockedText: 'Die ausgewogene Lieferung öffnet diesen zusätzlichen Rundweg.', shortcut: true },
  { id: 'v020', fromAreaId: 'bd_kranplatz', toAreaId: 'bd_kronenstation', labelFrom: 'Überquere die freie Stationsbrücke', labelTo: 'Kehre zum Kranplatz zurück', guardEncounterId: 'enc_bd_kronenheber', blockedText: 'Der Kronenheber hält nur die Stationsbrücke; beide Wege zurück bleiben offen.' },
  { id: 'v096', fromAreaId: 'kb_tauschmarkt', toAreaId: 'bd_kronengarten', labelFrom: 'Folge dem Blatt-Wegweiser zum Kronengarten', labelTo: 'Kehre über den Marktweg nach Kesselbrück zurück', requirement: flag('medizin_geliefert'), blockedText: 'Nach der Medizinlieferung öffnet Meral die drei nahen Regionswege.' }
]
