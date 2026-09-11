import type { AreaDefinition, PassageDefinition, Requirement } from '../../domain/content'

const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })
const item = (itemId: string): Requirement => ({ kind: 'item', itemId })
const all = (...requirements: Requirement[]): Requirement => ({ kind: 'all', requirements })
const any = (...requirements: Requirement[]): Requirement => ({ kind: 'any', requirements })
const changed = (requirement: Requirement, description: string, inspectText = description) => ({ requirement, description, inspectText })

const deltaFreed = flag('kanaldelta_befreit')
const yardFreed = flag('sturmwerft_befreit')
const prismOpened = flag('aussenregionen_geoeffnet')

export const kantaraPhase4Areas: AreaDefinition[] = [
  {
    id: 'kd_hausboothafen', name: 'Hausboothafen', regionId: 'kanaldelta', regionName: 'Kanaldelta', safe: true,
    mapPosition: { x: 760, y: 520 },
    firstDescription: 'Hausboote und schwimmende Werkstätten liegen an drei verschieden tiefen Anlegern. Fährführerin Suri will sofort ablegen, doch Schleusenwart Bo zeigt wortlos auf Tiefgang, Ladung und Zielzeichen. Eine Warntafel ergänzt: Wasser macht Maschinen nass; Blitz trifft sie dann stärker, trifft Reisende ohne Schutz aber ebenfalls hart.',
    revisitDescription: 'Suri hält die Anlegerliste offen, Bo prüft die Pegelkerben und der sichere Rastplatz auf dem grossen Hausboot bleibt erreichbar.',
    inspectText: 'Anleger A ist flach und trägt ein Blatt, B ist mitteltief und mit einem Seilring markiert, C ist tief und trägt ein Zahnrad. Neben dem Proviantkasten steht: Nass verstärkt Blitz und Eis; der Erdungsring halbiert Blitzschaden.',
    variants: [changed(deltaFreed, 'Zwei beschriftete Fährrundkurse verbinden wieder Hafen, Pegelhaus und Deltastation. Suri liest vor jeder Abfahrt die ganze Pegelzeile; Bo ergänzt zufrieden die sichere Kerbe.')]
  },
  {
    id: 'kd_schleusensteg', name: 'Schleusensteg', regionId: 'kanaldelta', regionName: 'Kanaldelta', safe: false,
    mapPosition: { x: 850, y: 480 },
    firstDescription: 'Drei Schleusentore stehen quer zur Strömung. Ihre Pfeile zeigen in Fliessrichtung und ausdrücklich nicht dorthin, wohin du gerade blickst. Eine geöffnete Panzerzeichnung der Schieberkrabbe zeigt, dass ihr Hebezug die harte Schale für einen kurzen Moment anhebt.',
    revisitDescription: 'Die drei Torregler und ihre Flusspfeile bleiben lesbar; der nummerierte Wartungssteg führt zurück zum Pegelhaus.',
    inspectText: 'Die Pegeltafel schreibt vollständig: oberes Tor zu, mittleres Tor halb, unteres Tor offen. Falsche Versuche verändern weder Wasserstand noch Vorräte.',
    variants: [changed(flag('schleusentore_gestellt'), 'Die Tore stehen zu, halb und offen. Ruhiges Wasser fliesst jetzt durch den inneren Kanal zur Rohrinsel.')]
  },
  {
    id: 'kd_pegelhaus', name: 'Pegelhaus', regionId: 'kanaldelta', regionName: 'Kanaldelta', safe: false,
    mapPosition: { x: 775, y: 610 },
    firstDescription: 'Im Pegelhaus hängen Bos Messblätter nicht nach Wasserhöhe, sondern nach Tageszeit. Morgen steht bei Kerbe zwei, Mittag bei vier und Abend bei drei. Die Wörter steigend, fallend und sicher sind neben jeder Kerbe ausgeschrieben.',
    revisitDescription: 'Bos drei Messwerte und die Zeitwörter bleiben am trockenen Pult sichtbar; ein Seitenweg weist zum Schilfkanal.',
    inspectText: 'Bo tippt nacheinander auf Morgen, Mittag und Abend. «Nicht nach der grössten Zahl sortieren. Erst die Zeit lesen.»',
    variants: [changed(flag('pegelfolge_geordnet'), 'Die Pegelanzeige läuft wieder in zeitlicher Reihenfolge. Bo hat die Abendfähre als sicheren zusätzlichen Kurs markiert.')]
  },
  {
    id: 'kd_fischertreppe', name: 'Fischertreppe', regionId: 'kanaldelta', regionName: 'Kanaldelta', safe: false,
    mapPosition: { x: 665, y: 610 },
    firstDescription: 'Alte trockene Steinstufen umgehen die tiefen Kanäle. Bo hat jede zweite Stufe mit einer weissen Fussmarke versehen und an ein gebrochenes Geländer geschrieben: Ein Stück Schwemmholz genügt für den sicheren Rundweg; später kann hier ein flacher Wartungskahn zum Laternenmoor anlegen.',
    revisitDescription: 'Die trockenen Fussmarken führen weiterhin zwischen Hafen und Schilfkanal; das gebrochene Geländer wartet gut sichtbar auf Schwemmholz.',
    inspectText: 'Die Reparaturtafel nennt Material und Zweck getrennt: ein Schwemmholz für das Geländer, danach Seitensteg zum Radwehr. Der Hafenweg bleibt immer offen.',
    variants: [changed(flag('fischertreppe_repariert'), 'Das Schwemmholzgeländer ist fest. Bos markierter Seitensteg bildet einen trockenen Rundweg bis zum Radwehr.')]
  },
  {
    id: 'kd_rohrinsel', name: 'Rohrinsel', regionId: 'kanaldelta', regionName: 'Kanaldelta', safe: false,
    mapPosition: { x: 950, y: 530 },
    firstDescription: 'Auf der kleinen Insel treffen drei Rohre über einem flachen Becken zusammen. Der Text am Ventil erklärt zweimal dieselbe Kette: Pegelstab prüfen, Wasser auslösen, Maschine wird nass; Blitz und Eis treffen ein nasses Ziel zusätzlich stark. Schlammspuren hüpfen zwischen den Markierungen.',
    revisitDescription: 'Ventil, Becken und Pegelmarke bleiben offen einsehbar. Ruhiges Wasser trennt die Insel vom Schieberkai.',
    inspectText: 'Nur die Kerbe mit dem Wellenzeichen liegt im sicheren Bereich des Pegelstabs. Das Ventil bespritzt die Schieberkrabben, ohne deinen Rückweg zum Schleusensteg zu schliessen.',
    variants: [changed(flag('rohrventil_geoeffnet'), 'Das richtig eingestellte Ventil hält das Becken gefüllt. Jede Maschine darin trägt sichtbar den Zustand Nass.')]
  },
  {
    id: 'kd_schieberkai', name: 'Schieberkai', regionId: 'kanaldelta', regionName: 'Kanaldelta', safe: false,
    mapPosition: { x: 1040, y: 570 },
    firstDescription: 'Der Schottknacker steht zwischen zwei schweren Schiebern und schützt seine Stirnplatte mit einer geschlossenen Deckung. Bos Hebeltafel nennt die Reihenfolge: Deckung abwarten, beim angekündigten Hebezug verteidigen, dann den offenen Panzer treffen. Rohrinsel und Hafen bleiben als Rückweg frei.',
    revisitDescription: 'Hebeltafel, Werkzeugmarke und freier Rückweg bleiben sichtbar. Hinter dem Kai wartet der Weg zum Radwehr.',
    inspectText: 'Klick liest die drei Zeilen einzeln: Geschlossene Deckung weist Treffer ab. Hebezug öffnet sie für einen Zug. Erst dann zählt Panzerbruch oder ein starker Treffer.',
    variants: [changed(flag('schottknacker_geoeffnet'), 'Der stillgelegte Schottknacker hält nun die Fährschieber offen. In seinem Ausschussfach liegen wieder lösbare Schottnieten.')]
  },
  {
    id: 'kd_schilfkanal', name: 'Schilfkanal', regionId: 'kanaldelta', regionName: 'Kanaldelta', safe: false,
    mapPosition: { x: 820, y: 700 },
    firstDescription: 'Zwischen niedrigen Schilfinseln sind trockene Schwemmholzstücke und zähe Wasserfasern mit verschiedenen Zeichen markiert. Bos Ufernotiz warnt vor einem Frachtbiber: Sein nasses Paket bremst den zweiten Anlauf. Nur Material oberhalb der sicheren Pegelkerbe darf gesammelt werden.',
    revisitDescription: 'Die sicheren Sammelmarken stehen unverändert über dem Wasser. Nach jeder Rast treibt neues Schwemmholz und neue Wasserfaser an.',
    inspectText: 'Ein Holzzeichen markiert zwei trockene Stücke, ein geflochtener Ring zwei Wasserfasern. Beide Quellen erneuern sich nach einer Rast am Hausboothafen.',
    variants: [changed(deltaFreed, 'Der gereinigte Kanal versorgt beide Fährrundkurse. Suri hat jede Materialquelle zusätzlich mit ihrem ausgeschriebenen Namen versehen.')]
  },
  {
    id: 'kd_radwehr', name: 'Radwehr', regionId: 'kanaldelta', regionName: 'Kanaldelta', safe: false,
    mapPosition: { x: 1080, y: 670 },
    firstDescription: 'Das Deltarad presst seine geschlossenen Schaufeln wie einen Schild vor den Stationsweg. Die Radtafel erklärt: Öffnet das Rad seine Schaufeln, setzt Schwallstoss es nass und hält es fest; die Blitzspitze trifft das nasse Metall besonders stark. Kaiweg und Seitensteg bleiben frei zurück.',
    revisitDescription: 'Schwallhebel, Radtafel und beide Rückwege sind weiterhin erreichbar. Hinter dem Rad liegt die Deltastation.',
    inspectText: 'Die vollständige Kette steht doppelt auf der Tafel: Schaufeln öffnen lassen – Schwallstoss – Nass – Blitz. Geschlossene Schaufeln weisen gewöhnliche Treffer ab.',
    variants: [changed(flag('deltarad_abgeschaltet'), 'Das Deltarad steht quer und leitet nur noch ruhiges Wasser. Der Stationsweg ist offen, die Fähren fahren wieder.')]
  },
  {
    id: 'kd_deltastation', name: 'Deltastation', regionId: 'kanaldelta', regionName: 'Kanaldelta', safe: false,
    mapPosition: { x: 1160, y: 620 },
    firstDescription: 'In der Deltastation stehen Anlegeplan, Freigabepresse und ein ausgeschriebener Rückweg direkt nebeneinander. Suri liest alle Prüffelder laut; Bo kontrolliert Wasserstand, reparierte Strecke und stillstehendes Rad mit seinen genauen Kerben.',
    revisitDescription: 'Die Freigabepresse bleibt neben dem vollständigen Stationsbericht erreichbar; eine Fährleine führt trocken zurück.',
    inspectText: 'Vier Felder müssen stimmen: Anlegerliste, Rohrventil, Schottknacker und Deltarad. Erst danach darf der Deltastempel geprägt werden.',
    variants: [changed(deltaFreed, 'Suri und Bo bedienen gemeinsam zwei verlässliche Rundkurse. Der geprägte Deltastempel weist zum Südstollen der Wechselgänge.')]
  },

  {
    id: 'sw_drachenwerkstatt', name: 'Drachenwerkstatt', regionId: 'sturmwerft', regionName: 'Sturmwerft', safe: true,
    mapPosition: { x: 760, y: 230 },
    firstDescription: 'Wetterdrachen hängen festgezurrt über einer windgeschützten Werkbank. Rika reimt: «Steigt das Summen, Kunst benutzen» und zeigt daneben denselben Klartext. Jaro legt eine Schnittzeichnung aus: Panzerbruch zieht direkt von der Panzerung ab. Sein Werkzeugname ist falsch notiert, das Bild und alle Werte sind eindeutig.',
    revisitDescription: 'Rikas Warnreim, Jaros beschriftete Schnittzeichnung und der sichere Rastplatz bleiben jederzeit lesbar.',
    inspectText: 'Der Erdungsring trägt Blitzzeichen und Dreieck: Er halbiert Blitzschaden. Jaros Hammerzeichnung zeigt Panzerung 3 minus Panzerbruch 1 gleich Panzerung 2.',
    variants: [changed(yardFreed, 'Geprüfte Wetterdrachen tragen wieder Nachrichten. Rika liest Warnungen vor, Jaro kontrolliert trotz vertauschter Werkzeugnamen jede Zeichnung.')]
  },
  {
    id: 'sw_windhof', name: 'Windhof', regionId: 'sturmwerft', regionName: 'Sturmwerft', safe: false,
    mapPosition: { x: 850, y: 170 },
    firstDescription: 'Angeleinte Segel markieren sichere Bewegungsbahnen über den offenen Hof. Ein kalter Löschkasten steht bei den Funkenmotten, denn Kälte löscht ihren Staub. Der trockene Materialkasten bleibt geschlossen, bis Rikas drei Warnfahnen in der gelesenen Reihenfolge wehen.',
    revisitDescription: 'Windpfeile, Halteseile und Löschkasten zeigen weiterhin den sicheren Weg; der Materialkasten wartet unter seinem Tuchzeichen.',
    inspectText: 'Kreis, Streifen und Dreieck sind keine Dekoration: Ihre Reihenfolge kündigt Böen an. Erst gesetzte Warnfahnen machen die Spulengasse und das Segeltuch sicher.',
    variants: [changed(flag('warnfahnen_gesetzt'), 'Kreis, Streifen und Dreieck wehen in richtiger Folge. Der Windhof ist wieder Arbeitsfläche und der Segeltuchkasten trocken erreichbar.')]
  },
  {
    id: 'sw_warnmast', name: 'Warnmast', regionId: 'sturmwerft', regionName: 'Sturmwerft', safe: false,
    mapPosition: { x: 900, y: 270 },
    firstDescription: 'Rikas Bauplan ist mit Formen und Wörtern beschriftet: Kreis vor Streifen, Dreieck zuletzt. Farben wiederholen die Information nur. Eine Windklammer schlägt im Takt der Böen; sobald sie sich im Boden verhakt, trägt der Wind sie nicht mehr.',
    revisitDescription: 'Der vollständige Fahnenplan und die Bodenhaken bleiben am Mast. Der offene Flugplan weist weiter zum Gleitersteg.',
    inspectText: 'Klick liest die Reihe von links nach rechts: Kreis, Streifen, Dreieck. Falsche Versuche kosten weder Fahnentuch noch einen Zug.',
    variants: [changed(flag('warnfahnen_gesetzt'), 'Die drei Warnformen stehen richtig und machen jede Böe früh sichtbar. Eine sichere Leine führt zurück über den Windhof.')]
  },
  {
    id: 'sw_spulengasse', name: 'Spulengasse', regionId: 'sturmwerft', regionName: 'Sturmwerft', safe: false,
    mapPosition: { x: 980, y: 160 },
    firstDescription: 'Stillgelegte Spulen beginnen von selbst immer heller zu summen. Jaros Wartungssatz ist vollständig: «Erden, prüfen, dann erst laden.» Darunter steht: Steigendes Summen bedeutet Aufladung; eine Waffenkunst unterbricht sie, bevor der starke Zug endet.',
    revisitDescription: 'Wartungssatz und Pflichtspule bleiben zugänglich. Ein kupfernes Erdungsband führt zum geschützten Feld zurück.',
    inspectText: 'Drei Verben bestimmen die sichere Reihenfolge. Nach gelöster Pflichtspule lässt sich entladener Spulendraht wickeln und nach jeder Rast erneut sammeln.',
    variants: [changed(flag('pflichtspule_entladen'), 'Die Pflichtspule summt nicht mehr. Entladener Draht speist Werkstattlampen und liegt an der markierten Wickelstelle bereit.')]
  },
  {
    id: 'sw_erdungsfeld', name: 'Erdungsfeld', regionId: 'sturmwerft', regionName: 'Sturmwerft', safe: false,
    mapPosition: { x: 900, y: 70 },
    firstDescription: 'Drei Speicherpfähle tragen Nummer, Dreiecksform und ausgeschriebenes Blitzwort. Rikas Erdungsring und Jaros Klemme halbieren passende Gefahr, doch derselbe Schutz wird nicht doppelt gerechnet. Jeder Pfahl muss in Zahlenfolge an die gemeinsame Erdleitung gelegt werden.',
    revisitDescription: 'Ringzeichen, Erdleitung und drei nummerierte Pfähle bleiben gut sichtbar. Der Rückweg zur Werkstatt ist frei.',
    inspectText: 'Die Arbeitstafel verlangt Erdungsklemme und die Reihenfolge eins, zwei, drei. Danach entsteht ein sicherer Rundweg zum Blitzspeicher.',
    variants: [changed(flag('pfaehle_geerdet'), 'Alle drei Pfähle stehen still an der gemeinsamen Erdleitung. Jaro hat den Rundweg zum Speicher mit Wort und Dreieck markiert.')]
  },
  {
    id: 'sw_gleitersteg', name: 'Gleitersteg', regionId: 'sturmwerft', regionName: 'Sturmwerft', safe: false,
    mapPosition: { x: 1010, y: 290 },
    firstDescription: 'Ein Lastengleiter blockiert den Steg. Sein 4×4-Flugplan sperrt Gegenwindfelder und verlangt zwei Halteseile auf dem Weg. Ein Drachenwächter steigt an seiner Leine auf; beim Steigflug spannt sich diese sichtbar. Die spätere Route zum Frostobservatorium ist bereits ausgeschrieben.',
    revisitDescription: 'Flugplan, beide Halteseile und der freie Mastweg bleiben erreichbar. Der Gleiter wartet auf einen lückenlosen Kurs.',
    inspectText: 'Der Plan beginnt oben links und endet unten rechts. Dunkle Gegenwindfelder dürfen nicht betreten werden; jeder Schritt liegt direkt neben dem vorherigen.',
    variants: [changed(flag('gleiterkurs_gesichert'), 'Der gesicherte Lastengleiter pendelt bis zum Werftkran. Drachenpost-Marke und Resonanzsplitter sind geborgen.')]
  },
  {
    id: 'sw_blitzspeicher', name: 'Blitzspeicher', regionId: 'sturmwerft', regionName: 'Sturmwerft', safe: false,
    mapPosition: { x: 1080, y: 100 },
    firstDescription: 'Am geerdeten Rand des Blitzspeichers liegt Werkzeugstahl vor dem bewachten Kranweg. Eine grosse Rechnung erklärt Panzerbruch: Waffenwurf minus Panzerung nach Abzug des Panzerbruchs; Elementschaden wird getrennt berechnet. Der Speicherplan wiederholt Aufladung und Unterbrechen mit den genauen Zugnamen.',
    revisitDescription: 'Werkzeugfach, Panzerbruchrechnung und Speicherplan bleiben vor dem Spulenläufer frei erreichbar.',
    inspectText: 'Jaro hat zweimal unterstrichen: Bei Aufladen Kurzschluss benutzen. Gegen das geschützte Gehäuse der Wolkenspule hilft der Panzerbruch des Hammers.',
    variants: [changed(flag('spulenlaeufer_gestoppt'), 'Der Blitzspeicher liefert kontrollierte Energie. Im Ausschussfach liegt nach jeder Rast neuer Werkzeugstahl bereit.')]
  },
  {
    id: 'sw_werftkran', name: 'Werftkran', regionId: 'sturmwerft', regionName: 'Sturmwerft', safe: false,
    mapPosition: { x: 1140, y: 210 },
    firstDescription: 'Der Werftkran hebt Material zur Stationsplattform, doch die Wolkenspule hält den einzigen Hinweg besetzt. Ein breiter Rückwegpfeil zeigt ausdrücklich zum Blitzspeicher. Rikas letzte Warnkarte verbindet beide gelesenen Regeln: Aufladung unterbrechen, danach das Gehäuse mit Panzerbruch öffnen.',
    revisitDescription: 'Kranpfeiler, Warnkarte und der freie Speicherweg bleiben hinter dir erreichbar. Die Stationsplattform liegt voraus.',
    inspectText: 'Phase eins nennt das steigende Summen und Kurzschluss. Phase zwei zeigt Panzerung 3 minus Panzerbruch 1. Der Kampf schliesst den Rückweg erst nach deinem ersten wirksamen Treffer.',
    variants: [changed(flag('wolkenspule_abgeschaltet'), 'Der Kran hebt wieder Material zur Werkstatt. Die Wolkenspule ruht geerdet neben der freien Stationsplattform.')]
  },
  {
    id: 'sw_wolkenstation', name: 'Wolkenstation', regionId: 'sturmwerft', regionName: 'Sturmwerft', safe: false,
    mapPosition: { x: 1210, y: 180 },
    firstDescription: 'Freigabepresse, vollständiger Warnplan und geerdete Wolkenspule stehen gemeinsam auf der Plattform. Rika liest Fahnen, Pfähle und Unterbrechung vor; Jaro prüft Material, Panzerbruch und den klar markierten Weg zurück zum Kran.',
    revisitDescription: 'Der Stationsbericht bleibt neben der Freigabepresse offen. Der Kranweg und das Spulenzeichen zu den Wechselgängen sind sichtbar.',
    inspectText: 'Vier Felder müssen stimmen: Warnfahnen, Pflichtspule, Erdung und Wolkenspule. Erst danach prägen Rika und Jaro gemeinsam den Werftstempel.',
    variants: [changed(yardFreed, 'Wetterdrachen tragen wieder Nachrichten von der Station. Der Werftstempel weist zum Bergungslager der Wechselgänge.')]
  },

  {
    id: 'wg_bergungslager', name: 'Bergungslager', regionId: 'wechselgaenge', regionName: 'Wechselgänge', safe: true,
    mapPosition: { x: 1320, y: 360 },
    firstDescription: 'Im alten Frachttunnel arbeiten Teams aus allen drei nahen Regionen. Ihre Tafel schreibt neben jedes Zeichen auch den Zielort: Blatt nach Norden, Welle nach Süden, Spule geradeaus. Jeder Freigabestempel bringt ein neues Team und öffnet eine weitere Weiche; alle Fluchtwege führen zu diesem Rastplatz.',
    revisitDescription: 'Teamtafel, Versorgungsliste und Rastnische bleiben offen. Neue Einträge erscheinen nach jedem Freigabestempel.',
    inspectText: 'Der Bergungsleiter übergibt einen Gleishaken nur nach gelesener Sicherheitszeile. Grundproviant wird nach jeder Rast ersetzt, nicht während einer Fahrt.',
    variants: [
      changed(all(item('item_quest_blaetterstempel'), item('item_quest_deltastempel'), item('item_quest_werftstempel')), 'Teams aus Blätterdächern, Kanaldelta und Sturmwerft stehen gemeinsam an der Tafel. Alle drei Wege zum Prismenknoten sind klar benannt.'),
      changed(any(item('item_quest_blaetterstempel'), item('item_quest_deltastempel'), item('item_quest_werftstempel')), 'Das erste regionale Team ist eingetroffen und hat die Kreuzweiche geöffnet. Weitere Zielzeilen warten auf ihre Stempel.')
    ]
  },
  {
    id: 'wg_kreuzweiche', name: 'Kreuzweiche', regionId: 'wechselgaenge', regionName: 'Wechselgänge', safe: false,
    mapPosition: { x: 1430, y: 360 },
    firstDescription: 'Drei alte Gleislinien überlagern sich unter Blatt-, Wellen- und Spulenzeichen. Die Teamtafel ordnet jedes Symbol einem ausgeschriebenen Ziel zu. Eine Gleislaus knipst an den Stellstangen; an einer richtig gestellten Weiche kann sie nur geradeaus laufen.',
    revisitDescription: 'Das 4×4-Weichenfeld und alle drei ausgeschriebenen Ziele bleiben sichtbar. Das Bergungslager liegt direkt zurück.',
    inspectText: 'Der Wartungsweg beginnt oben links und endet unten rechts, ohne ein gesperrtes Kreuzungsfeld zu betreten. Falsche Pfade lassen sich kostenlos zurücksetzen.',
    variants: [changed(flag('kreuzweiche_gestellt'), 'Blatt führt nach Norden, Welle nach Süden und Spule geradeaus. Die mittlere Linie wartet nur noch auf drei Stempel.')]
  },
  {
    id: 'wg_nordstollen', name: 'Nordstollen', regionId: 'wechselgaenge', regionName: 'Wechselgänge', safe: false,
    mapPosition: { x: 1430, y: 270 },
    firstDescription: 'Blattzeichen und das ausgeschriebene Ziel Blätterdächer markieren den Nordstollen. Eine alte Tafel nennt dahinter bereits die Glascaldera, doch ein beschädigtes Halteseil muss mit Gleishaken und sicherem Material befestigt werden. Zwischen Kisten liegt die Marke «Tunnelbrot».',
    revisitDescription: 'Beide Zielnamen und der Rückweg zum Bergungslager bleiben beleuchtet. Das alte Halteseil wartet auf die Reparatur.',
    inspectText: 'Die Reparatur verbindet keine fremden Ziele: Blatt bleibt Blätterdächer, Feuer bleibt Glascaldera. Erst der Prismenöffner darf später den Aussenweg freigeben.',
    variants: [changed(flag('nordstollen_repariert'), 'Der Nordstollen ist beleuchtet und dauerhaft gesichert. Die Blatt-Feuer-Abkürzung wartet nur noch auf den Prismenöffner.')]
  },
  {
    id: 'wg_suedstollen', name: 'Südstollen', regionId: 'wechselgaenge', regionName: 'Wechselgänge', safe: false,
    mapPosition: { x: 1430, y: 450 },
    firstDescription: 'Wellenzeichen und das Wort Kanaldelta stehen am Eingang des feuchten Südstollens. Dahinter nennt eine Laternenmarke das spätere Ziel Laternenmoor. Der Frachtschieber hebt seine Stirnplatte nur beim deutlich angekündigten Seitenhebel; daneben liegt eine trockene Pumpenleitung.',
    revisitDescription: 'Pegelzeichen, Laternenziel und Pumpenleitung bleiben lesbar. Der Rückweg zum Bergungslager ist trocken markiert.',
    inspectText: 'Der Seitenhebel öffnet den Frachtschieber kurz. Für die dauerhafte Abkürzung müssen Gleishaken und Pumpenleitung geprüft werden; der Prismenöffner kommt erst später hinzu.',
    variants: [changed(flag('suedstollen_repariert'), 'Die Pumpe hält den Südstollen trocken. Die Welle-Licht-Abkürzung wartet nur noch auf den Prismenöffner.')]
  },
  {
    id: 'wg_prismenknoten', name: 'Prismenknoten', regionId: 'wechselgaenge', regionName: 'Wechselgänge', safe: false,
    mapPosition: { x: 1540, y: 360 },
    firstDescription: 'Drei Fassungen tragen ausgeschriebene Regionsnamen: Blätterdächer, Kanaldelta und Sturmwerft. Daneben liegen drei geschlossene Leitungen mit Feuer-, Eis- und Lichtzeichen. Die Stempel werden nur geprüft und eingesetzt; sie bleiben im Besitz und verweisen danach zurück zu Briks Werkhof.',
    revisitDescription: 'Alle drei Stempelfassungen und die Leitungen zu den Aussenregionen bleiben gemeinsam sichtbar. Der Rückweg zur Kreuzweiche ist frei.',
    inspectText: 'Nur drei verschiedene Freigabestempel füllen die Fassungen. Danach bestätigt Brik im Werkhof den Prismenöffner, der Feuer, Eis und Licht gleichzeitig freigibt.',
    variants: [
      changed(prismOpened, 'Der Prismenöffner leuchtet in drei getrennten Fassungen. Feuerweg, Eisweg und Lichtweg sind gleichzeitig freigegeben; keine Aussenregion hängt von einer anderen ab.'),
      changed(flag('stempelfassungen_geprueft'), 'Die drei Stempelfassungen sind geprüft. Klicks Rückgabezettel weist zum Werkhof, wo Brik den Prismenöffner fertigstellt.')
    ]
  }
]

export const kantaraPhase4Passages: PassageDefinition[] = [
  { id: 'v021', fromAreaId: 'kd_hausboothafen', toAreaId: 'kd_schleusensteg', labelFrom: 'Folge Suris Fährpfeil zum Schleusensteg', labelTo: 'Kehre zum Hausboothafen zurück' },
  { id: 'v022', fromAreaId: 'kd_hausboothafen', toAreaId: 'kd_pegelhaus', labelFrom: 'Gehe zur Pegeltafel im Pegelhaus', labelTo: 'Kehre zum Hausboothafen zurück' },
  { id: 'v023', fromAreaId: 'kd_hausboothafen', toAreaId: 'kd_fischertreppe', labelFrom: 'Folge Bos trockenen Fussmarken', labelTo: 'Kehre zum Hausboothafen zurück' },
  { id: 'v024', fromAreaId: 'kd_schleusensteg', toAreaId: 'kd_pegelhaus', labelFrom: 'Nimm den nummerierten Wartungssteg', labelTo: 'Gehe zum Schleusensteg' },
  { id: 'v025', fromAreaId: 'kd_schleusensteg', toAreaId: 'kd_rohrinsel', labelFrom: 'Fahre durch die richtig gestellte Schleuse', labelTo: 'Kehre durch die Schleuse zurück', requirement: flag('schleusentore_gestellt'), blockedText: 'Stelle zuerst die drei Tore nach der Pegeltafel.' },
  { id: 'v026', fromAreaId: 'kd_pegelhaus', toAreaId: 'kd_schilfkanal', labelFrom: 'Folge der sicheren Pegelmarke', labelTo: 'Kehre zum Pegelhaus zurück', requirement: flag('bo_pegelregel_gelesen'), blockedText: 'Höre zuerst Bos vollständige Pegelregel am Hafen.' },
  { id: 'v027', fromAreaId: 'kd_fischertreppe', toAreaId: 'kd_schilfkanal', labelFrom: 'Steige zum Schilfkanal hinab', labelTo: 'Nimm die trockene Fischertreppe' },
  { id: 'v028', fromAreaId: 'kd_rohrinsel', toAreaId: 'kd_schieberkai', labelFrom: 'Folge der geöffneten Wasserleitung', labelTo: 'Kehre zur Rohrinsel zurück', requirement: flag('rohrventil_geoeffnet'), blockedText: 'Prüfe das Rohrventil mit dem Pegelstab.' },
  { id: 'v029', fromAreaId: 'kd_schieberkai', toAreaId: 'kd_radwehr', labelFrom: 'Gehe durch die geöffneten Schieber', labelTo: 'Kehre zum Schieberkai zurück', guardEncounterId: 'enc_kd_schottknacker', blockedText: 'Der Schottknacker hält nur diesen Hinweg geschlossen.' },
  { id: 'v030', fromAreaId: 'kd_schilfkanal', toAreaId: 'kd_radwehr', labelFrom: 'Nimm Bos reparierten Seitensteg', labelTo: 'Kehre zum Schilfkanal zurück', requirement: all(flag('fischertreppe_repariert'), flag('schottknacker_geoeffnet')), blockedText: 'Repariere die Fischertreppe und öffne zuerst den Schottknacker.', shortcut: true },
  { id: 'v031', fromAreaId: 'kd_radwehr', toAreaId: 'kd_deltastation', labelFrom: 'Gehe durch das gestoppte Rad zur Station', labelTo: 'Kehre zum Radwehr zurück', guardEncounterId: 'enc_kd_deltarad', blockedText: 'Das Deltarad sperrt nur den Stationsweg.' },
  { id: 'v032', fromAreaId: 'kd_fischertreppe', toAreaId: 'kd_deltastation', labelFrom: 'Nimm Bos neue Fährleine', labelTo: 'Fahre zur Fischertreppe', requirement: flag('deltarad_abgeschaltet'), blockedText: 'Bo spannt diese Fährleine nach dem Stopp des Deltarads.', shortcut: true },

  { id: 'v033', fromAreaId: 'sw_drachenwerkstatt', toAreaId: 'sw_windhof', labelFrom: 'Gehe durch das Windtor', labelTo: 'Kehre in die Drachenwerkstatt zurück' },
  { id: 'v034', fromAreaId: 'sw_drachenwerkstatt', toAreaId: 'sw_warnmast', labelFrom: 'Folge Rikas Fahnenreim', labelTo: 'Kehre in die Drachenwerkstatt zurück' },
  { id: 'v035', fromAreaId: 'sw_drachenwerkstatt', toAreaId: 'sw_erdungsfeld', labelFrom: 'Folge dem Erdungszeichen', labelTo: 'Kehre in die Drachenwerkstatt zurück' },
  { id: 'v036', fromAreaId: 'sw_windhof', toAreaId: 'sw_warnmast', labelFrom: 'Folge der gespannten Fahnenleine', labelTo: 'Kehre zum Windhof zurück' },
  { id: 'v037', fromAreaId: 'sw_windhof', toAreaId: 'sw_spulengasse', labelFrom: 'Folge der sicheren Warnfahne', labelTo: 'Kehre zum Windhof zurück', requirement: flag('warnfahnen_gesetzt'), blockedText: 'Setze zuerst Kreis, Streifen und Dreieck am Warnmast.' },
  { id: 'v038', fromAreaId: 'sw_warnmast', toAreaId: 'sw_gleitersteg', labelFrom: 'Folge dem Flugplan zum Gleitersteg', labelTo: 'Kehre zum Warnmast zurück' },
  { id: 'v039', fromAreaId: 'sw_spulengasse', toAreaId: 'sw_erdungsfeld', labelFrom: 'Folge dem kupfernen Erdungsband', labelTo: 'Gehe in die Spulengasse' },
  { id: 'v040', fromAreaId: 'sw_spulengasse', toAreaId: 'sw_blitzspeicher', labelFrom: 'Folge dem stillen Speichersymbol', labelTo: 'Kehre in die Spulengasse zurück', requirement: flag('pflichtspule_entladen'), blockedText: 'Lies den Spulenbauplan und entlade die Pflichtspule.' },
  { id: 'v041', fromAreaId: 'sw_erdungsfeld', toAreaId: 'sw_blitzspeicher', labelFrom: 'Nimm Jaros geerdeten Rundweg', labelTo: 'Kehre zum Erdungsfeld zurück', requirement: flag('pfaehle_geerdet'), blockedText: 'Erde zuerst alle drei nummerierten Pfähle.', shortcut: true },
  { id: 'v042', fromAreaId: 'sw_gleitersteg', toAreaId: 'sw_werftkran', labelFrom: 'Folge dem gesicherten Lastengleiter', labelTo: 'Kehre zum Gleitersteg zurück', requirement: flag('gleiterkurs_gesichert'), blockedText: 'Lege zuerst den vollständigen Gleiterkurs.', shortcut: true },
  { id: 'v043', fromAreaId: 'sw_blitzspeicher', toAreaId: 'sw_werftkran', labelFrom: 'Gehe am gestoppten Spulenläufer vorbei', labelTo: 'Kehre zum Blitzspeicher zurück', guardEncounterId: 'enc_sw_spulenlaeufer', blockedText: 'Der Spulenläufer bewacht nur den Kranweg.' },
  { id: 'v044', fromAreaId: 'sw_werftkran', toAreaId: 'sw_wolkenstation', labelFrom: 'Steige zur freien Stationsplattform', labelTo: 'Kehre zum Werftkran zurück', guardEncounterId: 'enc_sw_wolkenspule', blockedText: 'Die Wolkenspule hält nur die Stationsplattform.' },

  { id: 'v045', fromAreaId: 'wg_bergungslager', toAreaId: 'wg_kreuzweiche', labelFrom: 'Folge der offenen Wegnummer zur Kreuzweiche', labelTo: 'Kehre zum Bergungslager zurück', requirement: any(item('item_quest_blaetterstempel'), item('item_quest_deltastempel'), item('item_quest_werftstempel')), blockedText: 'Ein regionaler Freigabestempel öffnet die erste Weiche.' },
  { id: 'v046', fromAreaId: 'wg_bergungslager', toAreaId: 'wg_nordstollen', labelFrom: 'Folge Blattzeichen und Zielwort nach Norden', labelTo: 'Kehre zum Bergungslager zurück', requirement: item('item_quest_blaetterstempel'), blockedText: 'Der Blätterstempel öffnet den Nordstollen.' },
  { id: 'v047', fromAreaId: 'wg_bergungslager', toAreaId: 'wg_suedstollen', labelFrom: 'Folge Wellenzeichen und Zielwort nach Süden', labelTo: 'Kehre zum Bergungslager zurück', requirement: item('item_quest_deltastempel'), blockedText: 'Der Deltastempel öffnet den Südstollen.' },
  { id: 'v048', fromAreaId: 'wg_kreuzweiche', toAreaId: 'wg_nordstollen', labelFrom: 'Nimm die gestellte Nordweiche', labelTo: 'Kehre zur Kreuzweiche zurück', requirement: flag('kreuzweiche_gestellt'), blockedText: 'Stelle zuerst die drei Zielweichen.', shortcut: true },
  { id: 'v049', fromAreaId: 'wg_kreuzweiche', toAreaId: 'wg_suedstollen', labelFrom: 'Nimm die gestellte Südweiche', labelTo: 'Kehre zur Kreuzweiche zurück', requirement: flag('kreuzweiche_gestellt'), blockedText: 'Stelle zuerst die drei Zielweichen.', shortcut: true },
  { id: 'v050', fromAreaId: 'wg_kreuzweiche', toAreaId: 'wg_prismenknoten', labelFrom: 'Folge den drei gefüllten Stempelfassungen', labelTo: 'Kehre zur Kreuzweiche zurück', requirement: all(item('item_quest_blaetterstempel'), item('item_quest_deltastempel'), item('item_quest_werftstempel')), blockedText: 'Blätter-, Delta- und Werftstempel müssen gemeinsam vorhanden sein.' },

  { id: 'v097', fromAreaId: 'kb_wassertor', toAreaId: 'kd_hausboothafen', labelFrom: 'Nimm die Hilfsfähre ins Kanaldelta', labelTo: 'Fahre zum Wassertor zurück', requirement: flag('medizin_geliefert'), blockedText: 'Die Hilfsfähre fährt nach der Medizinlieferung.' },
  { id: 'v098', fromAreaId: 'kb_dachsteg', toAreaId: 'sw_drachenwerkstatt', labelFrom: 'Nimm die gesicherte Lastenleine zur Sturmwerft', labelTo: 'Kehre über die Lastenleine zum Dachsteg zurück', requirement: flag('medizin_geliefert'), blockedText: 'Meral sichert die Lastenleine nach der Medizinlieferung.' },
  { id: 'v099', fromAreaId: 'bd_kronenstation', toAreaId: 'wg_nordstollen', labelFrom: 'Folge dem Stationspfeil in den Nordstollen', labelTo: 'Kehre zur Kronenstation zurück', requirement: item('item_quest_blaetterstempel'), blockedText: 'Der Blätterstempel öffnet diesen Stationsweg.' },
  { id: 'v100', fromAreaId: 'kd_deltastation', toAreaId: 'wg_suedstollen', labelFrom: 'Folge dem Wellenpfeil in den Südstollen', labelTo: 'Kehre zur Deltastation zurück', requirement: item('item_quest_deltastempel'), blockedText: 'Der Deltastempel öffnet diesen Stationsweg.' },
  { id: 'v101', fromAreaId: 'sw_wolkenstation', toAreaId: 'wg_bergungslager', labelFrom: 'Folge dem Spulenpfeil ins Bergungslager', labelTo: 'Kehre zur Wolkenstation zurück', requirement: item('item_quest_werftstempel'), blockedText: 'Der Werftstempel öffnet diesen Stationsweg.' }
]
