import { campaignPuzzles } from './campaignPuzzles'
import { campaignExtras } from './campaignExtras'
import { areaVariants, campaignStoryBeats } from './campaignNarrative'
import type {
  AreaDefinition,
  EncounterDefinition,
  EnemyDefinition,
  InteractionDefinition,
  ItemDefinition,
  PassageDefinition,
  Requirement,
  WorldDefinition
} from '../../domain/content'

export const campaignAreas: AreaDefinition[] = [
  { id: 'sonnenwacht', name: 'Sonnenwacht', regionId: 'sonnenmark', regionName: 'Sonnenmark', safe: true, mapPosition: { x: 455, y: 280 }, firstDescription: 'Normalerweise trifft der erste Sonnenstrahl am Lichterfest die Spitze von Sonnenwacht. Heute steigt die Sonne nur als blasse Scheibe auf. Du hilfst Meisterin Tessa in der Kartenstube, als ein Messingkompass vier Beine ausklappt. «Ich bin Kuno. Endlich jemand, der mich hört!» Seine Nadel zeigt zur Tür. «Der Grauschleier verschluckt unsere Farben und Namen. Komm, wir suchen Hilfe im Tempel.»', revisitDescription: 'In der Kartenstube liegen Tessas Karten bereit. Kuno sitzt auf deiner Schulter. «Du darfst jederzeit umkehren», sagt Tessa. «Hier bekommst du Kraft und frisches Apfelbrot.»', inspectText: 'Kunos Nadel zeigt erst zur Tür, dann zu einem Schrank und wieder zur Tür. «Die richtige Richtung war kurz dabei», behauptet er.' },
  { id: 'drei_wege_platz', name: 'Drei-Wege-Platz', regionId: 'sonnenmark', regionName: 'Sonnenmark', safe: true, mapPosition: { x: 500, y: 370 }, firstDescription: 'Drei breite Wege treffen sich vor einem steinernen Wegweiser. Auf seinen Armen verschwinden gerade die letzten Buchstaben. Blatt, Welle und Blitz weisen zu drei offenen Regionen.', revisitDescription: 'Der leere Wegweiser steht in der Mitte des Platzes. Von hier erreichst du Wald, Küste, Berge, Tempel und das Tor der sechs Zeichen.', inspectText: 'Unter den verblassenden Namen erkennst du drei Zeichen: ein Blatt, eine Welle und einen Blitz. Kuno wird für einen Moment ganz still.' },
  { id: 'morgen_tempel', name: 'Tempel der Morgenklinge', regionId: 'sonnenmark', regionName: 'Sonnenmark', safe: true, mapPosition: { x: 430, y: 400 }, firstDescription: 'Zwischen den Ästen eines steinernen Baums steckt eine graue Klinge. Drei Bilder umgeben den Stamm: Sonnenlicht, ein klarer Tropfen und eine silberne Windlinie. Daneben zeigt ein Wandbild eine goldene Gestalt über einem Schatten und drei kleine Tiere am Rand.', revisitDescription: 'Der steinerne Baum wartet im stillen Tempel. Seine drei Gabenplätze zeigen, was du bereits zurückgebracht hast.', inspectText: 'Unter den Bildern steht: «Sonnenfunke, Quellträne und Windlied erwecken die Morgenklinge.» Kuno liest weiter: «Mit ihrem Licht befreist du die drei Wächter vom Schattenpanzer.» Auf dem Wandbild soll ein einziger Held Raugrim besiegt haben. Kuno betrachtet die kleinen Tiere am Rand lange.' },
  { id: 'alter_markt', name: 'Alter Markt', regionId: 'sonnenmark', regionName: 'Sonnenmark', safe: true, mapPosition: { x: 385, y: 315 }, firstDescription: 'Bunte Stoffdächer hängen über verlassenen Marktständen. Zwischen Kisten lehnt eine lange eiserne Stange. Unter einem Tisch steht eine kleine Truhe mit einem Blatt auf dem Deckel.', revisitDescription: 'Die Stoffdächer rascheln über dem stillen Markt. Die zurückgelassenen Stände erzählen von einem sehr hastigen Aufbruch.', inspectText: 'Schleifspuren führen von einem schweren Stand in Richtung Küste. Vielleicht wurde dort etwas Wichtiges fortgerissen.' },
  { id: 'bogenbruecke', name: 'Bogenbrücke', regionId: 'sonnenmark', regionName: 'Sonnenmark', safe: true, mapPosition: { x: 410, y: 365 }, firstDescription: 'Die alte Brücke spannt sich über einen schmalen Bach. Von ihrem höchsten Punkt siehst du den Wald, das Meer und die fernen Berge.', revisitDescription: 'Auf der Bogenbrücke liegt ganz Talora vor dir. Der kurze Weg zum Drei-Wege-Platz ist leicht zu erkennen.', inspectText: 'Im Geländer sind viele kleine Hände eingeritzt. Reisende haben hier über Generationen ihre Wege markiert.' },
  { id: 'garten_der_namen', name: 'Garten der Namen', regionId: 'sonnenmark', regionName: 'Sonnenmark', safe: true, mapPosition: { x: 350, y: 370 }, firstDescription: 'Vier flache Symbolsteine liegen zwischen duftenden Kräutern. Sonne, Welle, Blatt und Wind sind darauf abgebildet. Eine Plakette bittet dich, den Weg des Morgens zu ordnen.', revisitDescription: 'Im Garten duften Kräuter zwischen den Symbolsteinen. Auf ihren Rückseiten stehen Namen früherer Reisender.', inspectText: 'Die Ränder der Steine passen zu einem Weg: Wind, Licht, Wasser, Wachstum. Unter dem Sonnenstein klappert etwas.' },
  { id: 'tor_der_sechs_zeichen', name: 'Tor der sechs Zeichen', regionId: 'sonnenmark', regionName: 'Sonnenmark', safe: true, mapPosition: { x: 515, y: 440 }, firstDescription: 'Ein weisses Tor trägt sechs dunkle Vertiefungen: drei für das Licht der erweckten Morgenklinge und drei für die Siegel der Wächter. Durch einen Spalt ahnst du eine Treppe in die Dunkelheit.', revisitDescription: 'Das Tor bleibt geschlossen. Drei Zeichen warten auf das Licht der Morgenklinge, die übrigen auf die Wächtersiegel.', inspectText: 'Die Inschrift ist einfach: «Licht weist den Weg. Wurzel, Welle und Himmel halten ihn offen.»' },

  { id: 'eichenpforte', name: 'Eichenpforte', regionId: 'wisperwald', regionName: 'Wisperwald', safe: false, mapPosition: { x: 295, y: 285 }, firstDescription: 'Zwei lebende Eichen neigen ihre Kronen zu einem Tor. Dahinter teilt sich der Weg zwischen Farn und leuchtendem Moos.', revisitDescription: 'Die Eichenpforte raschelt über den offenen Waldwegen. Ein Hirschzeichen zeigt tiefer in den Wisperwald.', inspectText: 'Junge Zweige sind zu einem Blattzeichen verflochten. Schwarze Dornen versuchen, es zu überdecken.' },
  { id: 'funkelpfad', name: 'Funkelpfad', regionId: 'wisperwald', regionName: 'Wisperwald', safe: false, mapPosition: { x: 225, y: 300 }, firstDescription: 'Grüne Steine funkeln wie ruhige Glühwürmchen am Boden. Ein Rankenkrabbler rollt sich neben dem Pfad zusammen, doch ein schmaler Umweg bleibt frei.', revisitDescription: 'Die Leuchtsteine markieren den Weg zum Försterhaus, zur Lichtung und zum Spinnenhain.', inspectText: 'Die hellsten Steine zeigen nicht vorwärts, sondern sicher um die dichteste Dornenstelle herum.' },
  { id: 'foersterhaus', name: 'Försterhaus', regionId: 'wisperwald', regionName: 'Wisperwald', safe: true, mapPosition: { x: 155, y: 260 }, firstDescription: 'Ein Haus mit moosigem Dach lehnt an einer gewaltigen Buche. Lio, ein junger Gärtner, blickt besorgt zum Glühgarten. «Schattenmotten halten mich von der Ölpresse fern.» Neben der Tür hängt ein schiefes Vogelhaus.', revisitDescription: 'Lios Försterhaus riecht nach Kräutern und Holz. Lio braucht noch Hilfe bei der Ölpresse im Glühgarten. Danach kann er hier einen Rastplatz für dich vorbereiten.', inspectText: 'Eine passende Holzleiste liegt direkt unter dem Vogelhaus. Für die kleine Reparatur brauchst du nichts aus deinem Rucksack.' },
  { id: 'mooslichtung', name: 'Mooslichtung', regionId: 'wisperwald', regionName: 'Wisperwald', safe: false, mapPosition: { x: 235, y: 370 }, firstDescription: 'Weiches Moos liegt wie ein grüner Teppich zwischen drei stillen Bäumen. Goldene Beeren leuchten nur an der Pflanze, die am Morgen Schatten bekommt.', revisitDescription: 'Die Mooslichtung glimmt sanft. Unter den Blättern der schattigen Pflanze warten noch reife Goldbeeren.', inspectText: 'Der kürzeste Baum wirft trotz des blassen Lichts den längsten Schatten. Unter seinen Blättern glitzern Goldbeeren.' },
  { id: 'gluehgarten', name: 'Glühgarten', regionId: 'wisperwald', regionName: 'Wisperwald', safe: false, mapPosition: { x: 150, y: 365 }, firstDescription: 'Gläserne Blüten sammeln jedes bisschen Licht. Schattenmotten kreisen um die Presse, mit der Lio Leuchtöl herstellen kann.', revisitDescription: 'Schattenmotten kreisen weiter um die Ölpresse. Lio wartet darauf, wieder an seine Werkbank zu können.', inspectText: 'Die Motten folgen immer der dunkelsten Blüte. Wenn sie vertrieben sind, kann die Presse gefahrlos benutzt werden.' },
  { id: 'alte_baumschule', name: 'Alte Baumschule', regionId: 'wisperwald', regionName: 'Wisperwald', safe: false, mapPosition: { x: 125, y: 445 }, firstDescription: 'Leere Pflanzreihen ziehen sich unter einem Dach aus Wurzeln entlang. In einem feuchten Becken wächst silbriges Mondmoos.', revisitDescription: 'In der Alten Baumschule spiegeln Wassertropfen die Namen früherer Gärtnerinnen und Gärtner.', inspectText: 'Ein Pflanzenbuch erklärt: Mondmoos filtert trübes Wasser. Am Rand steckt ein eingerissenes Stück von Alvas Karte.' },
  { id: 'spinnenhain', name: 'Spinnenhain', regionId: 'wisperwald', regionName: 'Wisperwald', safe: false, mapPosition: { x: 245, y: 445 }, firstDescription: 'Silberne Netze hängen hoch zwischen den Stämmen. Ein Netzkrabbler bewacht ein festes Kletterseil, ohne den Hauptweg ganz zu versperren.', revisitDescription: 'Der Netzkrabbler hält das Kletterseil zwischen seinen Netzen fest. Du kannst ihn auf dem Weg zum Heiligtum oder zum Wurzeltunnel umgehen.', inspectText: 'Das Seil ist nicht klebrig und trägt das Zeichen der Wegfinder. Es wäre stark genug für einen Wettermast.' },
  { id: 'wurzelheiligtum', name: 'Wurzelheiligtum', regionId: 'wisperwald', regionName: 'Wisperwald', safe: false, mapPosition: { x: 175, y: 520 }, firstDescription: 'Wurzeln bilden eine hohe Halle. Eingeschlossene Tiere warten ruhig hinter Dornen. Eine Tafel warnt, dass nur das Licht der alten Klinge schwarze Ranken trennen kann.', revisitDescription: 'Das Wurzelheiligtum führt zur Dornenkrone. Die Tafel erinnert an Arbors Aufgabe, Wege zu öffnen statt sie zu verschliessen.', inspectText: 'Über der Inschrift steht der Name Arbor. Darunter liest du: «Ein Hüter lässt Wege wachsen. Ein Kerkermeister lässt keinen offen.»' },
  { id: 'dornenkrone', name: 'Dornenkrone', regionId: 'wisperwald', regionName: 'Wisperwald', safe: false, mapPosition: { x: 90, y: 550 }, firstDescription: 'Im Kreis schwarzer Hecken steht Arbor, ein Hirsch mit einem Geweih wie eine Baumkrone. Jeder Schnitt in den Ranken wächst ohne heiliges Licht sofort zu.', revisitDescription: 'Arbor wartet zwischen den schwarzen Dornen. Hinter ihm ist eine friedliche Lichtung zu erahnen.', inspectText: 'Arbor scharrt vor einem Ansturm. Die dicksten Ranken führen nicht zu seinem Körper, sondern zum schwarzen Geweih.' },

  { id: 'kuestenpfad', name: 'Küstenpfad', regionId: 'spiegelkueste', regionName: 'Spiegelküste', safe: false, mapPosition: { x: 590, y: 430 }, firstDescription: 'Der Weg fällt zwischen hellen Felsen zum Meer ab. Das Wasser glänzt wie ein Spiegel, doch darin fehlt die Farbe des Himmels.', revisitDescription: 'Salzwind streicht über den Küstenpfad. Muscheln markieren die sicheren Stufen zum Hafen.', inspectText: 'Zwischen den Muscheln liegt Holz von einem Marktstand. Es trägt dieselben Schleifspuren wie am Alten Markt.' },
  { id: 'muschelhafen', name: 'Muschelhafen', regionId: 'spiegelkueste', regionName: 'Spiegelküste', safe: true, mapPosition: { x: 650, y: 500 }, firstDescription: 'Kleine Boote schaukeln an bunten Pfählen. Nela zieht an einem Seil und blickt zum überfluteten Markt. «Das Wasser steht jeden Morgen höher», sagt sie.', revisitDescription: 'Im Muschelhafen knarren die Boote. Nela hält einen Rastplatz und eine aktuelle Skizze der Wasserwege bereit.', inspectText: 'Auf Nelas Skizze fehlt ein grosses Schleusenrad. Daneben hat sie einen umgestürzten Marktstand gezeichnet.' },
  { id: 'ueberfluteter_markt', name: 'Überfluteter Markt', regionId: 'spiegelkueste', regionName: 'Spiegelküste', safe: false, mapPosition: { x: 720, y: 535 }, firstDescription: 'Knöcheltiefes Wasser fliesst zwischen verlassenen Ständen. Unter einem schweren Holzgestell schimmert das Metall eines grossen Rads.', revisitDescription: 'Flaches Wasser kräuselt sich über dem Marktplatz. Stege führen zum Hafen, zum Schleusenhaus und zur Bibliothek.', inspectText: 'Der Stand ist zu schwer zum Heben. Unter seiner Kante ist Platz für einen langen, stabilen Hebel.' },
  { id: 'schleusenhaus', name: 'Schleusenhaus', regionId: 'spiegelkueste', regionName: 'Spiegelküste', safe: false, mapPosition: { x: 795, y: 570 }, firstDescription: 'Drei beschriftete Tore steuern den Wasserweg: Zulauf, Quelltor und Ablauf. Am leeren Radlager hängt ein Korb für Filtermoos.', revisitDescription: 'Im Schleusenhaus zeigen blaue Linien den Weg vom Zulauf durch den Filter zur Quelle. Der Ablauf zweigt zum Meer ab.', inspectText: 'Das Wandbild gibt die Reihenfolge preis: Zulauf offen, Quelltor offen, Ablauf geschlossen. Mehr als zwei Tore dürfen nie zugleich offen sein.' },
  { id: 'versunkene_bibliothek', name: 'Versunkene Bibliothek', regionId: 'spiegelkueste', regionName: 'Spiegelküste', safe: false, mapPosition: { x: 735, y: 475 }, firstDescription: 'Das Erdgeschoss steht unter klarem Wasser. Bücher ruhen auf hohen Regalen. Eine grüne Tür mit Sonnensymbol schützt das Kartenarchiv.', revisitDescription: 'Wasser spiegelt die hohen Regale. Hinter der grünen Archivtür liegen alte Karten und ein gepolstertes Spiegelfach.', inspectText: 'Das Messingschloss zeigt dieselben vier Zeichen wie die Steine im Garten der Namen.' },
  { id: 'korallengrotte', name: 'Korallengrotte', regionId: 'spiegelkueste', regionName: 'Spiegelküste', safe: false, mapPosition: { x: 835, y: 630 }, firstDescription: 'Rosafarbene Korallen umgeben eine trübe Quelle. Darin erscheinen Namen und Gesichter nur als zerbrochene Flecken.', revisitDescription: 'Die Quelle in der Korallengrotte wartet auf sauberes Wasser aus der reparierten Schleuse.', inspectText: 'Unter dem Schlamm ist die Quelle nicht trocken. Das Wasser wird nur im Kreis daran vorbeigeführt.' },
  { id: 'alter_leuchtturm', name: 'Alter Leuchtturm', regionId: 'spiegelkueste', regionName: 'Spiegelküste', safe: false, mapPosition: { x: 900, y: 570 }, firstDescription: 'Der Turm besitzt noch seine grosse Linse, aber im Spiegelrahmen klafft eine Lücke und die Lampe riecht nach leerem Öl.', revisitDescription: 'Im Alten Leuchtturm warten Linse, Spiegelrahmen und Lampe auf den ersten goldenen Strahl.', inspectText: 'Die Lichtspur führt vom ersten Spiegel nach rechts, vom zweiten nach oben und vom dritten nach links zur Sonnenlinse.' },
  { id: 'gezeitentempel', name: 'Gezeitentempel', regionId: 'spiegelkueste', regionName: 'Spiegelküste', safe: false, mapPosition: { x: 815, y: 490 }, firstDescription: 'Dünne Wasserlinien laufen über den Boden. Eine Tafel erzählt von Marea, die Geschichten bewahrte, bis niemand mehr neue erleben konnte.', revisitDescription: 'Die Wasserlinien zeigen zum Perlenbecken. Hinter dem letzten Tor wartet Marea unter schwarzem Glas.', inspectText: 'Die Tafel sagt: «Eine Geschichte, die niemand weiterträgt, ist nur ein geschlossenes Buch.»' },
  { id: 'perlenbecken', name: 'Perlenbecken', regionId: 'spiegelkueste', regionName: 'Spiegelküste', safe: false, mapPosition: { x: 890, y: 480 }, firstDescription: 'Leere Boote drehen sich um eine gewaltige Schildkröte. Schwarzes Glas liegt zwischen Mareas Panzerplatten und hält sie in derselben Runde gefangen.', revisitDescription: 'Marea wartet im tiefen Perlenbecken. Vor ihrer Wellenrolle steigt das Wasser sichtbar an.', inspectText: 'Mehrere angebrochene Säulen ragen aus dem Wasser. Eine rechtzeitig erkannte Rolle könnte Mareas Panzer dort öffnen.' },

  { id: 'bergfuss', name: 'Bergfuss', regionId: 'donnerhoehe', regionName: 'Donnerhöhe', safe: false, mapPosition: { x: 610, y: 315 }, firstDescription: 'Kupfergras zittert am Berghang. Ein kleiner Käfer aus Zahnrädern zieht sich ratternd auf, während zwei Wege nach oben führen.', revisitDescription: 'Am Bergfuss teilen sich die Pfade zur Kristallmine und zum Kupferhof. Der Gewitterhimmel flackert darüber.', inspectText: 'Der Kupferkäfer klickt dreimal, bevor er losschnellt. Zwischen seinen Läufen bleibt der breite Weg frei.' },
  { id: 'kristallmine', name: 'Kristallmine', regionId: 'donnerhoehe', regionName: 'Donnerhöhe', safe: false, mapPosition: { x: 680, y: 245 }, firstDescription: 'Kristalle werfen jedes Geräusch als farbiges Echo zurück. Drei Zeichen an einer Werkzeugkammer lauten: Glocke, Schritt, Klatschen.', revisitDescription: 'In der Kristallmine antworten die Wände auf jedes Geräusch. Die Werkzeugkammer wartet auf die sichtbare Echofolge.', inspectText: 'Die Kristalle leuchten der Reihe nach bei Glocke, Schritt und Klatschen. Genau diese Symbole trägt das Schloss.' },
  { id: 'lorenwerk', name: 'Lorenwerk', regionId: 'donnerhoehe', regionName: 'Donnerhöhe', safe: false, mapPosition: { x: 760, y: 225 }, firstDescription: 'Eine Werkhalle voller stiller Loren liegt an zwei Schienen. Eine Weiche hat keine Kurbel, und ein Lorenrumpel bewacht eine schwere Truhe.', revisitDescription: 'Im Lorenwerk führen Schienen zum Kupferhof, zur Mine und vielleicht direkt zur Himmelswerft.', inspectText: 'Das freie Kurbelgewinde passt zu altem Minenwerkzeug. Der Lorenrumpel beschleunigt erst nach einem langen Rattern.' },
  { id: 'kupferhof', name: 'Kupferhof', regionId: 'donnerhoehe', regionName: 'Donnerhöhe', safe: true, mapPosition: { x: 690, y: 335 }, firstDescription: 'Windräder, Werkbänke und blitzsichere Dächer umgeben Tavis Hof. Ein kleines Windrad dreht sein loses Blatt verkehrt herum.', revisitDescription: 'Tavi hält im Kupferhof einen sicheren Rastplatz bereit. Von hier führen Wege zur Orgel und zur Himmelswerft.', inspectText: 'Das lose Blatt passt ohne Werkzeug in die freie Halterung. Seine bemalte Seite muss zum Wind zeigen.' },
  { id: 'wolkenbruecke', name: 'Wolkenbrücke', regionId: 'donnerhoehe', regionName: 'Donnerhöhe', safe: false, mapPosition: { x: 805, y: 115 }, firstDescription: 'Eine schmale Brücke zieht sich über ein Wolkenmeer. Hoch am Wettermast steckt eine silberblaue Sturmfeder.', revisitDescription: 'Auf der Wolkenbrücke zeigt die Sturmfeder gegen den kommenden Wind. Der Mast ist mit einem Seil erreichbar.', inspectText: 'Drei Kerben am Mast bieten sicheren Halt für ein Kletterseil. Die Feder neigt sich nie mit, sondern immer gegen den Wind.' },
  { id: 'windorgel', name: 'Die Windorgel', regionId: 'donnerhoehe', regionName: 'Donnerhöhe', safe: false, mapPosition: { x: 760, y: 310 }, firstDescription: 'Drei grosse Flügel treiben silberne Pfeifen an. Die höchste Pfeife fehlt, und alle Flügel stehen gegen dieselbe falsche Richtung.', revisitDescription: 'Die Windorgel zeigt drei beschriftete Klangtasten. Teile und Flügel können ohne Zeitdruck geprüft werden.', inspectText: 'Markierungen am Mast zeigen die Flügelstellung: linker Flügel nach oben, mittlerer nach rechts, rechter nach links. Mit der Sturmfeder kannst du die Richtung prüfen. Die Klangfolge ist als Kreis, Stern, Welle eingeritzt.' },
  { id: 'himmelswerft', name: 'Himmelswerft', regionId: 'donnerhoehe', regionName: 'Donnerhöhe', safe: false, mapPosition: { x: 820, y: 285 }, firstDescription: 'Alte Flugmaschinen hängen wie schlafende Vögel in einer offenen Halle. Wartungsschächte verbinden Werft, Brücke und Gewitterturm.', revisitDescription: 'Die Himmelswerft bildet einen Rundweg über der Donnerhöhe. Eine Anlegestelle wartet auf verlässlichen Wind.', inspectText: 'Im Schein der Laterne wird Alvas Notiz sichtbar: «Voltaro trug Nachrichten, nie Krieger.»' },
  { id: 'gewitterturm', name: 'Gewitterturm', regionId: 'donnerhoehe', regionName: 'Donnerhöhe', safe: false, mapPosition: { x: 885, y: 225 }, firstDescription: 'Blitze treffen immer wieder dieselbe leere Stelle neben dem Turm. Eine Tafel erzählt, wie Voltaro den Himmel bewachte, bis er ihm keinen Platz mehr liess.', revisitDescription: 'Der Gewitterturm ist der letzte Vorraum zum Adlerhorst. Neben der Treppe steht eine Truhe mit Kupferschloss.', inspectText: 'Die Tafel nennt den Gewitteradler Voltaro. Sie warnt: In der Luft schützt Metall seine schwarzen Blitzadern.' },
  { id: 'adlerhorst', name: 'Adlerhorst', regionId: 'donnerhoehe', regionName: 'Donnerhöhe', safe: false, mapPosition: { x: 940, y: 165 }, firstDescription: 'Ein riesiger Adler aus Federn, Kupfer und blauem Licht hält jede Wolke an ihrem Platz. Schwarze Blitzadern laufen über Voltaros Flügel.', revisitDescription: 'Voltaro kreist über dem Adlerhorst. Vor dem Sturzflug legt er die Flügel an und zeigt seine Richtung deutlich.', inspectText: 'Kupferschienen durchziehen den Boden. Ein verteidigter Sturzflug könnte Voltaro zur Landung zwingen.' },

  { id: 'wurzeltunnel', name: 'Wurzeltunnel', regionId: 'verbindungswege', regionName: 'Verbindungswege', safe: false, mapPosition: { x: 430, y: 585 }, firstDescription: 'Dicke Wurzeln bilden einen Tunnel vom Wald zur Küste. In der Dunkelheit glimmt eine kleine Truhennische.', revisitDescription: 'Der Wurzeltunnel verbindet Spinnenhain und Bibliothek. Kunos Nadel dreht sich hier besonders ratlos.', inspectText: 'Deine Laterne zeigt eine Truhe und eine Randnotiz: Alvas Kompass wies einmal überzeugt in einen Besenschrank.' },
  { id: 'alter_aquaedukt', name: 'Alter Aquädukt', regionId: 'verbindungswege', regionName: 'Verbindungswege', safe: false, mapPosition: { x: 880, y: 390 }, firstDescription: 'Klares Wasser läuft über eine hohe Steinrinne von der Küste zu den Bergwerken. Der reparierte Wasserweg hat die Türen geöffnet.', revisitDescription: 'Der Alte Aquädukt ist eine schnelle, helle Verbindung zwischen Korallengrotte und Lorenwerk.', inspectText: 'Eingeritzte Wellen und Zahnräder zeigen, dass Küste und Donnerhöhe diese Leitung gemeinsam bauten.' },
  { id: 'windfaehre', name: 'Windfähre', regionId: 'verbindungswege', regionName: 'Verbindungswege', safe: false, mapPosition: { x: 560, y: 155 }, firstDescription: 'Ein breites Segelboot schwebt an einem gespannten Windseil. Das Windlied hält seine Fahrt zwischen Werft und Sonnenwacht ruhig.', revisitDescription: 'Die Windfähre summt die drei Töne der Orgel und bringt dich schnell über Talora.', inspectText: 'Auf dem Messinggeländer steht: «Kein Wind gehört nur einem Ort.»' },

  { id: 'sternentreppe', name: 'Sternentreppe', regionId: 'jenseits_des_tors', regionName: 'Jenseits des Tors', safe: false, mapPosition: { x: 505, y: 520 }, firstDescription: 'Weisse Stufen hängen in einer Dunkelheit mit zu wenigen Sternen. Auf Kunos Karte verblassen die Regionsnamen, nicht aber eure gezeichneten Wege.', revisitDescription: 'Die Sternentreppe führt weiter, solange Kuno die Namen der drei Regionen laut wiederholt.', inspectText: 'An jeder Stufe erscheint ein bekanntes Zeichen, sobald du seinen Namen sagst: Blatt, Welle, Blitz.' },
  { id: 'halle_der_echos', name: 'Halle der Echos', regionId: 'jenseits_des_tors', regionName: 'Jenseits des Tors', safe: false, mapPosition: { x: 505, y: 590 }, firstDescription: 'Kuno bleibt stehen. «Damals zeigte ich Alva den kürzesten Weg. Er führte an den Menschen vorbei, deren Hilfe wir brauchten.» Aus der Halle antwortet Alvas Echo: «Dann kehren wir um. Ein Fehler löscht nicht alle richtigen Wege.» Kuno klappt seinen Deckel auf. «Geh nicht allein. Jetzt verstehe ich es wieder.»', revisitDescription: 'Die Halle bewahrt Alvas Versprechen vollständig: «Finde den Weg. Kehre zurück. Geh nicht allein.»', inspectText: 'Die Echos wiederholen nicht Raugrims Zweifel, sondern die Stimmen aller, die euch geholfen haben.' },
  { id: 'rand_der_nacht', name: 'Rand der Nacht', regionId: 'jenseits_des_tors', regionName: 'Jenseits des Tors', safe: true, mapPosition: { x: 505, y: 660 }, firstDescription: 'Eine kleine goldene Flamme markiert den letzten Rastplatz. Kuno ergänzt dein Apfelbrot. «Mit deinem Schlussversprechen bleiben Klinge und Siegel im Bannschloss. Der Heimweg bleibt offen.» Hinter der nächsten Tür wartet Raugrim.', revisitDescription: 'Am Rand der Nacht kannst du rasten, Inventar und Morgenklinge prüfen. Der Endkampf beginnt erst, wenn du ihn selbst startest.', inspectText: 'Drei leere Lichtplätze warten auf Wurzel, Welle und Himmel. Kuno erklärt: «Im Kampf setzen wir nur ihr Licht. Erst wenn du Alvas Versprechen sprichst, bleiben die Klinge und die echten Siegel im inneren Schloss. Ohne sie kannst du danach weiterreisen.»' },
  { id: 'weltenkammer', name: 'Weltenkammer', regionId: 'jenseits_des_tors', regionName: 'Jenseits des Tors', safe: false, mapPosition: { x: 505, y: 735 }, firstDescription: 'In der Kammer fehlen Sterne dort, wo Raugrims Flügel sein könnten. Seine Augen sind zwei Fenster in einen Himmel ohne Morgen. «Alles, was du findest, wirst du wieder verlieren», sagt er. «In meiner stillen Welt muss sich niemand verabschieden.» Kuno antwortet: «Aber dort kann auch niemand ankommen.»', revisitDescription: 'Raugrim wartet über dem inneren Bannschloss. Die drei echten Siegel und die Morgenklinge sind für einen neuen Versuch noch bei dir.', inspectText: 'Unter dem Boden liegt das Bannschloss. Erst drei Siegellichter und Alvas vollständiges Versprechen können es gemeinsam schliessen.' }
]

const areaName = Object.fromEntries(campaignAreas.map((area) => [area.id, area.name]))
const destinationPhrase: Record<string, string> = {
  sonnenwacht: 'nach Sonnenwacht', drei_wege_platz: 'zum Drei-Wege-Platz', morgen_tempel: 'zum Tempel der Morgenklinge',
  alter_markt: 'zum Alten Markt', bogenbruecke: 'zur Bogenbrücke', garten_der_namen: 'zum Garten der Namen', tor_der_sechs_zeichen: 'zum Tor der sechs Zeichen',
  eichenpforte: 'zur Eichenpforte', funkelpfad: 'zum Funkelpfad', foersterhaus: 'zum Försterhaus', mooslichtung: 'zur Mooslichtung',
  gluehgarten: 'zum Glühgarten', alte_baumschule: 'zur Alten Baumschule', spinnenhain: 'zum Spinnenhain', wurzelheiligtum: 'zum Wurzelheiligtum', dornenkrone: 'zur Dornenkrone',
  kuestenpfad: 'zum Küstenpfad', muschelhafen: 'zum Muschelhafen', ueberfluteter_markt: 'zum Überfluteten Markt', schleusenhaus: 'zum Schleusenhaus',
  versunkene_bibliothek: 'zur Versunkenen Bibliothek', korallengrotte: 'zur Korallengrotte', alter_leuchtturm: 'zum Alten Leuchtturm', gezeitentempel: 'zum Gezeitentempel', perlenbecken: 'zum Perlenbecken',
  bergfuss: 'zum Bergfuss', kristallmine: 'zur Kristallmine', lorenwerk: 'zum Lorenwerk', kupferhof: 'zum Kupferhof', wolkenbruecke: 'zur Wolkenbrücke',
  windorgel: 'zur Windorgel', himmelswerft: 'zur Himmelswerft', gewitterturm: 'zum Gewitterturm', adlerhorst: 'zum Adlerhorst',
  wurzeltunnel: 'zum Wurzeltunnel', alter_aquaedukt: 'zum Alten Aquädukt', windfaehre: 'zur Windfähre',
  sternentreppe: 'zur Sternentreppe', halle_der_echos: 'zur Halle der Echos', rand_der_nacht: 'zum Rand der Nacht', weltenkammer: 'zur Weltenkammer'
}
const passageLabels: Record<string, [string, string]> = {
  p01: ['Gehe zum Drei-Wege-Platz', 'Gehe nach Sonnenwacht'],
  p02: ['Gehe zum Alten Markt', 'Gehe nach Sonnenwacht'],
  p04: ['Gehe zum Garten der Namen', 'Gehe zum Alten Markt'],
  p07: ['Betritt den Tempel der Morgenklinge', 'Kehre zum Drei-Wege-Platz zurück'],
  p10: ['Folge dem Weg zur Küste', 'Steige zum Drei-Wege-Platz hinauf'],
  p24: ['Gehe zum Muschelhafen', 'Steige den Küstenpfad hinauf'],
  p25: ['Gehe zum überfluteten Markt', 'Kehre zum Muschelhafen zurück'],
  p26: ['Gehe zur Versunkenen Bibliothek', 'Kehre zum Muschelhafen zurück'],
  p28: ['Nimm den Steg zur Bibliothek', 'Nimm den Steg zum Markt'],
  p32: ['Gehe zum Gezeitentempel', 'Kehre zur Bibliothek zurück'],
  p33: ['Betritt trotz des schwarzen Panzers das Perlenbecken', 'Zieh dich in den Gezeitentempel zurück'],
  p34: ['Nimm den neuen Bootspfad zum Hafen', 'Fahre zum Perlenbecken']
}

function passage(
  id: string,
  fromAreaId: string,
  toAreaId: string,
  requirement?: Requirement,
  shortcut = false,
  blockedText?: string
): PassageDefinition {
  return {
    id,
    fromAreaId,
    toAreaId,
    labelFrom: passageLabels[id]?.[0] ?? `Gehe ${destinationPhrase[toAreaId] ?? `nach ${areaName[toAreaId]}`}`,
    labelTo: passageLabels[id]?.[1] ?? `Gehe ${destinationPhrase[fromAreaId] ?? `nach ${areaName[fromAreaId]}`}`,
    requirement,
    blockedText,
    shortcut
  }
}

export const campaignPassages: PassageDefinition[] = [
  passage('p01', 'sonnenwacht', 'drei_wege_platz'),
  passage('p02', 'sonnenwacht', 'alter_markt'),
  passage('p03', 'alter_markt', 'bogenbruecke'),
  passage('p04', 'alter_markt', 'garten_der_namen'),
  passage('p05', 'garten_der_namen', 'bogenbruecke'),
  passage('p06', 'bogenbruecke', 'drei_wege_platz', undefined, true),
  passage('p07', 'drei_wege_platz', 'morgen_tempel'),
  passage('p08', 'drei_wege_platz', 'tor_der_sechs_zeichen'),
  passage('p09', 'drei_wege_platz', 'eichenpforte'),
  passage('p10', 'drei_wege_platz', 'kuestenpfad'),
  passage('p11', 'drei_wege_platz', 'bergfuss'),
  passage('p12', 'eichenpforte', 'funkelpfad'),
  passage('p13', 'eichenpforte', 'mooslichtung'),
  passage('p14', 'funkelpfad', 'mooslichtung'),
  passage('p15', 'funkelpfad', 'foersterhaus'),
  passage('p16', 'funkelpfad', 'spinnenhain'),
  passage('p17', 'foersterhaus', 'gluehgarten'),
  passage('p18', 'mooslichtung', 'gluehgarten'),
  passage('p19', 'gluehgarten', 'alte_baumschule'),
  passage('p20', 'alte_baumschule', 'wurzelheiligtum'),
  passage('p21', 'spinnenhain', 'wurzelheiligtum'),
  passage('p22', 'wurzelheiligtum', 'dornenkrone'),
  passage('p23', 'foersterhaus', 'wurzelheiligtum', { kind: 'flag', flag: 'arbor_befreit' }, true, 'Arbors Dornen versperren diese Abkürzung noch.'),
  passage('p24', 'kuestenpfad', 'muschelhafen'),
  passage('p25', 'muschelhafen', 'ueberfluteter_markt'),
  passage('p26', 'muschelhafen', 'versunkene_bibliothek'),
  passage('p27', 'ueberfluteter_markt', 'schleusenhaus'),
  passage('p28', 'ueberfluteter_markt', 'versunkene_bibliothek', undefined, true),
  passage('p29', 'schleusenhaus', 'korallengrotte'),
  passage('p30', 'korallengrotte', 'alter_leuchtturm'),
  passage('p31', 'korallengrotte', 'gezeitentempel'),
  passage('p32', 'versunkene_bibliothek', 'gezeitentempel'),
  passage('p33', 'gezeitentempel', 'perlenbecken'),
  passage('p34', 'perlenbecken', 'muschelhafen', { kind: 'flag', flag: 'marea_befreit' }, true, 'Die Strömung dreht sich noch im Kreis.'),
  passage('p35', 'bergfuss', 'kristallmine'),
  passage('p36', 'bergfuss', 'kupferhof'),
  passage('p37', 'kristallmine', 'lorenwerk'),
  passage('p38', 'lorenwerk', 'kupferhof'),
  passage('p39', 'kupferhof', 'himmelswerft'),
  passage('p40', 'kupferhof', 'windorgel'),
  passage('p41', 'himmelswerft', 'wolkenbruecke'),
  passage('p42', 'wolkenbruecke', 'windorgel'),
  passage('p43', 'himmelswerft', 'gewitterturm'),
  passage('p44', 'gewitterturm', 'adlerhorst'),
  passage('p45', 'lorenwerk', 'himmelswerft', { kind: 'flag', flag: 'lorenweiche_repariert' }, true, 'Der direkte Schienenweg endet an einer Weiche ohne Kurbel.'),
  passage('p46', 'spinnenhain', 'wurzeltunnel'),
  passage('p47', 'wurzeltunnel', 'versunkene_bibliothek'),
  passage('p48', 'korallengrotte', 'alter_aquaedukt', { kind: 'flag', flag: 'schleuse_repariert' }, true, 'Trübes Wasser hält die Tür des Aquädukts geschlossen.'),
  passage('p49', 'alter_aquaedukt', 'lorenwerk', { kind: 'flag', flag: 'schleuse_repariert' }, true, 'Der Aquädukt ist noch nicht freigespült.'),
  passage('p50', 'himmelswerft', 'windfaehre', { kind: 'flag', flag: 'windlied_erhalten' }, true, 'Ohne Windlied findet die Fähre keine verlässliche Strömung.'),
  passage('p51', 'windfaehre', 'sonnenwacht', { kind: 'flag', flag: 'windlied_erhalten' }, true, 'Die Windfähre wartet auf das Lied der Orgel.'),
  passage('p52', 'tor_der_sechs_zeichen', 'sternentreppe', { kind: 'flag', flag: 'endtor_offen' }, false, 'Morgenklinge und drei Wächtersiegel müssen am Tor leuchten.'),
  passage('p53', 'sternentreppe', 'halle_der_echos'),
  passage('p54', 'halle_der_echos', 'rand_der_nacht'),
  passage('p55', 'rand_der_nacht', 'weltenkammer')
]

export const campaignItems: ItemDefinition[] = [
  { id: 'reiseschwert', name: 'Reiseschwert', description: 'Tessas leichtes, zuverlässiges Schwert.', kind: 'weapon', weapon: { minDamage: 2, maxDamage: 4, trait: 'Sehr zuverlässig' } },
  { id: 'waldbeil', name: 'Waldbeil', description: 'Ein breites Beil aus dem Försterhaus.', kind: 'weapon', weapon: { minDamage: 2, maxDamage: 6, trait: 'Stark, aber schwankend' } },
  { id: 'hafenspeer', name: 'Hafenspeer', description: 'Nelas langer Speer mit breiter Spitze.', kind: 'weapon', weapon: { minDamage: 3, maxDamage: 5, trait: 'Bonus gegen Wassergegner', bonusAgainstTag: { tag: 'water', amount: 1 } } },
  { id: 'bergfaeustel', name: 'Bergfäustel', description: 'Ein schwerer Hammer aus dem Lorenwerk.', kind: 'weapon', weapon: { minDamage: 1, maxDamage: 7, trait: 'Ignoriert einen Punkt Panzerung', armorPiercing: 1 } },
  { id: 'kristallsaebel', name: 'Kristallsäbel', description: 'Eine starke optionale Klinge mit hellem Kristallgrat.', kind: 'weapon', weapon: { minDamage: 4, maxDamage: 6, trait: 'Hoher, verlässlicher Schaden' } },
  { id: 'morgenklinge', name: 'Morgenklinge', description: 'Die heilige Klinge durchdringt den Schattenpanzer verdorbener Wächter.', kind: 'weapon', weapon: { minDamage: 3, maxDamage: 5, trait: 'Durchdringt Schattenpanzer' } },
  { id: 'apfelbrot', name: 'Apfelbrot', description: 'Stärkender Reiseproviant mit Apfelstücken.', kind: 'healing', healing: { lifeRestored: 5 } },
  { id: 'waldsalbe', name: 'Waldsalbe', description: 'Eine grüne Salbe mit beruhigendem Kräuterduft.', kind: 'healing', healing: { lifeRestored: 8 } },
  { id: 'quellwasser', name: 'Quellwasser', description: 'Klares Wasser, das Kraft gibt und einen Grauschleier-Effekt entfernt.', kind: 'healing', healing: { lifeRestored: 6, extraEffect: 'Entfernt einen Grauschleier-Effekt' } },
  { id: 'kuehlende_limonade', name: 'Kühlende Limonade', description: 'Heilt und schützt kurz vor dem nächsten Blitztreffer.', kind: 'healing', healing: { lifeRestored: 5, extraEffect: 'Halbiert den nächsten Blitztreffer', combatEffect: { id: 'blitzschutz', duration: 3 } } },
  { id: 'reiseproviant', name: 'Tessas Reiseproviant', description: 'Ein seltener Vorrat, der alle Lebenspunkte wiederherstellt.', kind: 'healing', healing: { lifeRestored: 20 } },
  { id: 'laterne', name: 'Laterne', description: 'Eine kleine Laterne für dunkle Winkel.', kind: 'tool' },
  { id: 'hebelstange', name: 'Hebelstange', description: 'Lang, stabil und nützlich bei schweren Dingen.', kind: 'tool' },
  { id: 'archivschluessel', name: 'Archivschlüssel', description: 'Ein Messingschlüssel mit vier kleinen Symbolen.', kind: 'key' },
  { id: 'sonnenspiegel', name: 'Sonnenspiegel', description: 'Ein unversehrter Spiegel für den alten Leuchtturm.', kind: 'quest' },
  { id: 'goldbeeren', name: 'Goldbeeren', description: 'Warme Beeren, aus denen Leuchtöl gepresst werden kann.', kind: 'quest' },
  { id: 'leuchtoel', name: 'Leuchtöl', description: 'Goldenes Öl für die Lampe des Leuchtturms.', kind: 'quest' },
  { id: 'sonnenfunke', name: 'Sonnenfunke', description: 'Ein warmer Lichtpunkt, der selbst im Grauschleier leuchtet.', kind: 'quest' },
  { id: 'schleusenrad', name: 'Schleusenrad', description: 'Das vermisste Rad der Küstenschleuse.', kind: 'quest' },
  { id: 'mondmoos', name: 'Mondmoos', description: 'Silbriges Moos, das schmutziges Wasser filtert.', kind: 'quest' },
  { id: 'quelltraene', name: 'Quellträne', description: 'Ein klarer Tropfen voller erinnerter Namen.', kind: 'quest' },
  { id: 'silberpfeife', name: 'Silberpfeife', description: 'Die höchste fehlende Pfeife der Windorgel.', kind: 'quest' },
  { id: 'kletterseil', name: 'Kletterseil', description: 'Ein stabiles Seil der alten Wegfinder.', kind: 'tool' },
  { id: 'sturmfeder', name: 'Sturmfeder', description: 'Sie zeigt immer gegen den kommenden Wind.', kind: 'quest' },
  { id: 'windlied', name: 'Windlied', description: 'Eine silberne Melodie, die in Kunos Deckel summt.', kind: 'quest' },
  { id: 'wurzelsiegel', name: 'Wurzelsiegel', description: 'Arbors altes Bannzeichen in Form eines Blatts.', kind: 'quest' },
  { id: 'gezeitensiegel', name: 'Gezeitensiegel', description: 'Mareas altes Bannzeichen in Form einer Welle.', kind: 'quest' },
  { id: 'himmelssiegel', name: 'Himmelssiegel', description: 'Voltaros altes Bannzeichen in Form eines Blitzes.', kind: 'quest' },
  { id: 'kupferkurbel', name: 'Kupferkurbel', description: 'Eine Kurbel für die Schienenweiche im Lorenwerk.', kind: 'tool' },
  { id: 'kupferschluessel', name: 'Kupferschlüssel', description: 'Tavis Schlüssel für eine einzige Truhe im Gewitterturm.', kind: 'key' },
  { id: 'glasauge', name: 'Glasauge', description: 'Eine Linse, die den Inhalt verschlossener Truhen zeigt.', kind: 'tool' },
  { id: 'kartenstift', name: 'Alvas Kartenstift', description: 'Tessas Stift macht verborgene Kartennotizen sichtbar.', kind: 'tool' },
  { id: 'muschelhorn', name: 'Muschelhorn', description: 'Mit seinem tiefen Ton kannst du Marea grüssen.', kind: 'tool' }
]

const all = (...requirements: Requirement[]): Requirement => ({ kind: 'all', requirements })
const item = (itemId: string): Requirement => ({ kind: 'item', itemId })
const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })

export const campaignInteractions: InteractionDefinition[] = [
  { id: 'hebelstange_fund', areaId: 'alter_markt', actionType: 'TAKE_ITEM', label: 'Nimm die Hebelstange', description: 'Die eiserne Stange lehnt griffbereit zwischen den Kisten.', resultText: 'Du hebst die Hebelstange auf. Kuno nickt: «Endlich etwas, das eindeutig in eine Richtung zeigt.»', effects: [{ kind: 'addItem', itemId: 'hebelstange', quantity: 1 }] },
  { id: 'truhe_markt_interaktion', areaId: 'alter_markt', actionType: 'OPEN_CHEST', label: 'Öffne die Blatt-Truhe', description: 'Die kleine Truhe ist nicht verschlossen.', resultText: 'In der Truhe liegt ein Töpfchen Waldsalbe.', chestId: 'truhe_markt', effects: [{ kind: 'addItem', itemId: 'waldsalbe', quantity: 1 }] },
  { id: 'symbolsteine_ordnen', areaId: 'garten_der_namen', actionType: 'COMPLETE_INTERACTION', label: 'Ordne die Symbolsteine', description: 'Die Kanten der vier Steine bilden zusammen einen Weg.', resultText: 'Wind, Licht, Wasser, Wachstum – der letzte Stein rastet ein. Darunter liegt der Archivschlüssel.', requirement: flag('area_untersucht:garten_der_namen'), blockedText: 'Untersuche zuerst die Zeichen und Kanten der Symbolsteine.', effects: [{ kind: 'addItem', itemId: 'archivschluessel', quantity: 1 }] },
  { id: 'karte_mut_finden', areaId: 'garten_der_namen', actionType: 'COMPLETE_INTERACTION', label: 'Lies die Rückseite des Steins', description: 'Ein eingerissener Kartenrand steckt hinter dem Blattstein.', resultText: 'Alvas Notiz verrät: Auch sie hatte Angst vor ihrem ersten Kampf.', requirement: flag('area_untersucht:garten_der_namen'), blockedText: 'Sieh dir zuerst alle Seiten der Symbolsteine an.', effects: [{ kind: 'discoverClue', clueId: 'karte_mut' }, { kind: 'addItem', itemId: 'kartenstift', quantity: 1 }] },
  { id: 'morgenklinge_ziehen', areaId: 'morgen_tempel', actionType: 'COMPLETE_INTERACTION', label: 'Erwecke die Morgenklinge', description: 'Alle drei Gaben antworten im steinernen Baum.', resultText: 'Sonnenfunke, Quellträne und Windlied werden zu drei Lichtadern. Die Morgenklinge wird leicht. Auf ihr steht: «Finde den Weg. Kehre zurück. Geh nicht allein.» Kuno nennt die drei Wächter: Arbor, Marea und Voltaro. «Befreie sie mit dieser Klinge. Ihre Siegel brauchen wir gegen Raugrim.»', requirement: all(item('sonnenfunke'), item('quelltraene'), item('windlied')), blockedText: 'Die Klinge erwacht erst mit Sonnenfunke, Quellträne und Windlied.', effects: [{ kind: 'removeItem', itemId: 'sonnenfunke', quantity: 1 }, { kind: 'removeItem', itemId: 'quelltraene', quantity: 1 }, { kind: 'removeItem', itemId: 'windlied', quantity: 1 }, { kind: 'addItem', itemId: 'morgenklinge', quantity: 1 }, { kind: 'setFlag', flag: 'morgenklinge_erweckt' }] },
  { id: 'endtor_oeffnen', areaId: 'tor_der_sechs_zeichen', actionType: 'COMPLETE_INTERACTION', label: 'Zeige Klinge und Siegel', description: 'Sechs Zeichen warten auf ihr Licht.', resultText: 'Die Morgenklinge leuchtet. Wurzel, Welle und Himmel antworten. Das Tor bleibt von nun an offen.', requirement: all(item('morgenklinge'), item('wurzelsiegel'), item('gezeitensiegel'), item('himmelssiegel')), blockedText: 'Dir fehlen noch die Morgenklinge oder eines der drei Wächtersiegel.', effects: [{ kind: 'setFlag', flag: 'endtor_offen' }, { kind: 'unlockPassage', passageId: 'p52' }] },

  { id: 'goldbeeren_pfluecken', areaId: 'mooslichtung', actionType: 'TAKE_ITEM', label: 'Pflücke die Goldbeeren', description: 'Die richtige Pflanze leuchtet unter den längsten Morgenschatten.', resultText: 'Du findest die Goldbeeren, ohne eine einzige grüne Beere abzureissen.', requirement: flag('area_untersucht:mooslichtung'), blockedText: 'Beobachte zuerst, welche Pflanze am Morgen im Schatten steht.', effects: [{ kind: 'addItem', itemId: 'goldbeeren', quantity: 1 }] },
  { id: 'leuchtoel_pressen', areaId: 'gluehgarten', actionType: 'COMPLETE_INTERACTION', label: 'Presse Leuchtöl', description: 'Lios Presse ist wieder frei und die Goldbeeren sind reif.', resultText: 'Lio presst die Beeren. Goldenes Leuchtöl füllt ein kleines, fest verschlossenes Fläschchen.', requirement: all(item('goldbeeren'), flag('schattenmotten_besiegt')), blockedText: 'Du brauchst Goldbeeren und musst zuerst die Schattenmotten von der Presse vertreiben.', effects: [{ kind: 'removeItem', itemId: 'goldbeeren', quantity: 1 }, { kind: 'addItem', itemId: 'leuchtoel', quantity: 1 }, { kind: 'setFlag', flag: 'lio_geholfen' }] },
  { id: 'truhe_waldbeil_interaktion', areaId: 'foersterhaus', actionType: 'OPEN_CHEST', label: 'Öffne Lios Werkzeugtruhe', description: 'Lio hat sie nach deiner Hilfe bereitgestellt.', resultText: 'Lio überreicht dir das Waldbeil. «Für Gestrüpp – und nur wenn es sein muss für Krabbler.»', requirement: flag('lio_geholfen'), blockedText: 'Hilf Lio zuerst bei der Ölpresse im Glühgarten.', chestId: 'truhe_waldbeil', effects: [{ kind: 'addItem', itemId: 'waldbeil', quantity: 1 }] },
  { id: 'vogelhaus_reparieren', areaId: 'foersterhaus', actionType: 'COMPLETE_INTERACTION', label: 'Repariere das Vogelhaus', description: 'Die passende Leiste liegt gleich daneben.', resultText: 'Die Leiste sitzt. Noch bevor du zurücktrittst, schaut ein kleiner Vogel aus dem Eingang.', effects: [{ kind: 'setFlag', flag: 'vogelhaus_repariert' }] },
  { id: 'mondmoos_sammeln', areaId: 'alte_baumschule', actionType: 'TAKE_ITEM', label: 'Nimm etwas Mondmoos', description: 'Das Pflanzenbuch bestätigt seine Filterwirkung.', resultText: 'Du nimmst nur so viel Mondmoos, wie in den Filterkorb passt.', requirement: flag('area_untersucht:alte_baumschule'), blockedText: 'Lies zuerst im Pflanzenbuch nach, welches Moos Wasser reinigt.', effects: [{ kind: 'addItem', itemId: 'mondmoos', quantity: 1 }, { kind: 'discoverClue', clueId: 'karte_arbor' }] },
  { id: 'kletterseil_bergen', areaId: 'spinnenhain', actionType: 'TAKE_ITEM', label: 'Berge das Kletterseil', description: 'Nach dem Netzkrabbler ist das Seil erreichbar.', resultText: 'Du rollst das stabile, saubere Kletterseil zusammen.', requirement: flag('netzkrabbler_besiegt'), blockedText: 'Der Netzkrabbler hält das Seil noch fest.', effects: [{ kind: 'addItem', itemId: 'kletterseil', quantity: 1 }] },
  { id: 'truhe_tunnel_interaktion', areaId: 'wurzeltunnel', actionType: 'OPEN_CHEST', label: 'Öffne die Truhennische', description: 'Die Laterne zeigt einen verborgenen Holzdeckel.', resultText: 'In der Nische findest du ein Glasauge, Waldsalbe und eine eingerissene Notiz über Kunos Besenschrank-Irrtum.', requirement: item('laterne'), blockedText: 'Ohne Licht bleibt die Nische unsichtbar.', chestId: 'truhe_tunnel', effects: [{ kind: 'addItem', itemId: 'glasauge', quantity: 1 }, { kind: 'addItem', itemId: 'waldsalbe', quantity: 1 }, { kind: 'discoverClue', clueId: 'karte_kompass' }] },
  { id: 'dornen_nische', areaId: 'wurzelheiligtum', actionType: 'COMPLETE_INTERACTION', label: 'Durchsuche die freie Dornennische', description: 'Nach Arbors Befreiung ziehen sich die Ranken zurück.', resultText: 'Hinter den Dornen steht ein unversehrtes Fläschchen Waldsalbe.', requirement: flag('arbor_befreit'), blockedText: 'Schwarze Dornen verschliessen die Nische.', effects: [{ kind: 'addItem', itemId: 'waldsalbe', quantity: 1 }] },

  { id: 'marktstand_anheben', areaId: 'ueberfluteter_markt', actionType: 'COMPLETE_INTERACTION', label: 'Heble den Marktstand hoch', description: 'Unter dem schweren Stand steckt das Schleusenrad.', resultText: 'Die Hebelstange hebt die Kante. Du ziehst das Schleusenrad hervor.', requirement: item('hebelstange'), blockedText: 'Der Stand ist zu schwer. Du brauchst einen langen, stabilen Hebel.', effects: [{ kind: 'addItem', itemId: 'schleusenrad', quantity: 1 }, { kind: 'setFlag', flag: 'schleusenrad_geborgen' }] },
  { id: 'truhe_hafenspeer_interaktion', areaId: 'muschelhafen', actionType: 'OPEN_CHEST', label: 'Öffne Nelas Hafentruhe', description: 'Nela hat die Truhe als Dank bereitgestellt.', resultText: 'Nela überreicht dir den Hafenspeer. «Mit Reichweite bleibt man eher trocken.»', requirement: { kind: 'any', requirements: [flag('schleusenrad_geborgen'), flag('schleuse_repariert')] }, blockedText: 'Nela hilft, sobald du das Rad gefunden oder die Schleuse repariert hast.', chestId: 'truhe_hafenspeer', effects: [{ kind: 'addItem', itemId: 'hafenspeer', quantity: 1 }] },
  { id: 'spielzeugboot_reparieren', areaId: 'muschelhafen', actionType: 'COMPLETE_INTERACTION', label: 'Knüpfe die Segelschnur neu', description: 'Das kleine Boot hat alles Nötige an Bord.', resultText: 'Das Spielzeugboot segelt wieder gerade zwischen den Hafenpfählen hindurch.', effects: [{ kind: 'setFlag', flag: 'spielzeugboot_repariert' }] },
  { id: 'archiv_oeffnen', areaId: 'versunkene_bibliothek', actionType: 'COMPLETE_INTERACTION', label: 'Öffne das Kartenarchiv', description: 'Das Messingschloss zeigt vier vertraute Symbole.', resultText: 'Der Schlüssel dreht sich. Im gepolsterten Fach liegt der unversehrte Sonnenspiegel; eine Randnotiz lobt Mareas Geschichten.', requirement: item('archivschluessel'), blockedText: 'Der Schlüssel zum Kartenarchiv liegt bei vier Symbolsteinen.', effects: [{ kind: 'addItem', itemId: 'sonnenspiegel', quantity: 1 }, { kind: 'setFlag', flag: 'archiv_geoeffnet' }, { kind: 'discoverClue', clueId: 'karte_marea' }] },
  { id: 'schleuse_reparieren', areaId: 'schleusenhaus', actionType: 'COMPLETE_INTERACTION', label: 'Repariere und stelle die Schleuse', description: 'Rad und Filter fehlen noch. Das Wandbild zeigt die richtige Torstellung.', resultText: 'Du setzt Rad und Mondmoos ein: Zulauf offen, Quelltor offen, Ablauf geschlossen. Klares Wasser fliesst zur Quelle und öffnet den Aquädukt.', requirement: all(item('schleusenrad'), item('mondmoos'), flag('area_untersucht:schleusenhaus')), blockedText: 'Du brauchst Schleusenrad, Mondmoos und den Hinweis der Wasserlinien.', effects: [{ kind: 'removeItem', itemId: 'schleusenrad', quantity: 1 }, { kind: 'removeItem', itemId: 'mondmoos', quantity: 1 }, { kind: 'setFlag', flag: 'schleuse_repariert' }, { kind: 'unlockPassage', passageId: 'p48' }, { kind: 'unlockPassage', passageId: 'p49' }] },
  { id: 'quelltraene_schoepfen', areaId: 'korallengrotte', actionType: 'COMPLETE_INTERACTION', label: 'Empfange die Quellträne', description: 'Im klaren Wasser werden alte Namen wieder lesbar.', resultText: 'Menschen lesen die Namen gemeinsam vor. Ein klarer Tropfen steigt aus der Quelle: die Quellträne.', requirement: flag('schleuse_repariert'), blockedText: 'Die Quelle braucht klares Wasser aus der reparierten Schleuse.', effects: [{ kind: 'addItem', itemId: 'quelltraene', quantity: 1 }, { kind: 'setFlag', flag: 'quelltraene_erhalten' }] },
  { id: 'sonnenfunke_entfachen', areaId: 'alter_leuchtturm', actionType: 'COMPLETE_INTERACTION', label: 'Entfache den Sonnenfunken', description: 'Spiegel, Öl und die sichtbaren Lichtflecken machen den Turm vollständig.', resultText: 'Du setzt Spiegel und Leuchtöl ein und richtest die drei Lichtflecken aus. Unten im Hafen entzündet Nela mit dem Strahl die Festlaternen. Das geteilte Licht wird in Kunos Glasdeckel zum Sonnenfunken.', requirement: all(item('sonnenspiegel'), item('leuchtoel'), flag('area_untersucht:alter_leuchtturm')), blockedText: 'Dir fehlen Sonnenspiegel, Leuchtöl oder der Hinweis zur Spiegelstellung.', effects: [{ kind: 'removeItem', itemId: 'sonnenspiegel', quantity: 1 }, { kind: 'removeItem', itemId: 'leuchtoel', quantity: 1 }, { kind: 'addItem', itemId: 'sonnenfunke', quantity: 1 }, { kind: 'setFlag', flag: 'sonnenfunke_erhalten' }] },
  { id: 'truhe_leuchtturm_interaktion', areaId: 'alter_leuchtturm', actionType: 'OPEN_CHEST', label: 'Öffne die beleuchtete Nische', description: 'Der neue Lichtstrahl zeigt eine kleine Truhe.', resultText: 'In der hellen Nische steht ein Fläschchen Quellwasser.', requirement: flag('sonnenfunke_erhalten'), blockedText: 'Erst der Leuchtturmstrahl zeigt die Nische.', chestId: 'truhe_leuchtturm', effects: [{ kind: 'addItem', itemId: 'quellwasser', quantity: 1 }] },
  { id: 'truhe_gezeiten_interaktion', areaId: 'gezeitentempel', actionType: 'OPEN_CHEST', label: 'Öffne die Tempeltruhe', description: 'Der Wasserwächter hat den Weg freigegeben.', resultText: 'In der Truhe stehen zwei Fläschchen Quellwasser.', requirement: flag('wasserwaechter_besiegt'), blockedText: 'Ein gepanzerter Wasserwächter bewacht die Truhe.', chestId: 'truhe_gezeiten', effects: [{ kind: 'addItem', itemId: 'quellwasser', quantity: 2 }] },
  { id: 'muschelhorn_erhalten', areaId: 'perlenbecken', actionType: 'TAKE_ITEM', label: 'Nimm Mareas Muschelhorn', description: 'Marea möchte eure Geschichten später wieder hören.', resultText: 'Marea gibt dir ein Muschelhorn. Sein Ton klingt wie eine freundliche, ferne Welle.', requirement: flag('marea_befreit'), blockedText: 'Das Horn liegt noch unter Mareas Schattenpanzer.', effects: [{ kind: 'addItem', itemId: 'muschelhorn', quantity: 1 }] },

  { id: 'werkzeugkammer_oeffnen', areaId: 'kristallmine', actionType: 'COMPLETE_INTERACTION', label: 'Spiele die Echofolge', description: 'Glocke, Schritt, Klatschen stehen sichtbar am Schloss.', resultText: 'Die Kammer öffnet sich. Darin liegen Silberpfeife, Kupferkurbel und eine kühlende Limonade.', requirement: flag('area_untersucht:kristallmine'), blockedText: 'Untersuche zuerst, in welcher Reihenfolge die Kristalle leuchten.', effects: [{ kind: 'addItem', itemId: 'silberpfeife', quantity: 1 }, { kind: 'addItem', itemId: 'kupferkurbel', quantity: 1 }, { kind: 'addItem', itemId: 'kuehlende_limonade', quantity: 1 }] },
  { id: 'lorenweiche_reparieren', areaId: 'lorenwerk', actionType: 'COMPLETE_INTERACTION', label: 'Setze die Kupferkurbel ein', description: 'Die Kurbel passt an die Schienenweiche.', resultText: 'Die Weiche klickt auf den direkten Weg zur Himmelswerft. Die Kurbel bleibt fest eingebaut.', requirement: item('kupferkurbel'), blockedText: 'Der Weiche fehlt eine passende Kurbel aus der Mine.', effects: [{ kind: 'removeItem', itemId: 'kupferkurbel', quantity: 1 }, { kind: 'setFlag', flag: 'lorenweiche_repariert' }, { kind: 'unlockPassage', passageId: 'p45' }] },
  { id: 'truhe_bergfaeustel_interaktion', areaId: 'lorenwerk', actionType: 'OPEN_CHEST', label: 'Öffne die schwere Werktruhe', description: 'Der Lorenrumpel bewacht sie nicht mehr.', resultText: 'In der Truhe liegt ein Bergfäustel mit kurzem, sicherem Griff.', requirement: flag('lorenrumpel_besiegt'), blockedText: 'Der beschleunigende Lorenrumpel versperrt die Truhe.', chestId: 'truhe_bergfaeustel', effects: [{ kind: 'addItem', itemId: 'bergfaeustel', quantity: 1 }] },
  { id: 'sturmfeder_bergen', areaId: 'wolkenbruecke', actionType: 'TAKE_ITEM', label: 'Steige zur Sturmfeder', description: 'Das Kletterseil passt in die drei Kerben am Wettermast.', resultText: 'Du sicherst das Seil und erreichst die Sturmfeder. Sie zeigt sofort gegen den kommenden Wind.', requirement: item('kletterseil'), blockedText: 'Der Wettermast ist ohne ein stabiles Kletterseil zu hoch.', effects: [{ kind: 'addItem', itemId: 'sturmfeder', quantity: 1 }] },
  { id: 'windlied_spielen', areaId: 'windorgel', actionType: 'COMPLETE_INTERACTION', label: 'Vervollständige die Windorgel', description: 'Pfeife und Feder zeigen Teile und Stellungen. Die Klangtasten tragen sichtbare Symbole.', resultText: 'Die Pfeife sitzt, die Flügel folgen der Feder, und Kreis–Stern–Welle erklingt. Tavi öffnet die Schallklappen; der Ruf erreicht die Menschen im Tal. Der letzte Ton bleibt als Windlied bei dir.', requirement: all(item('silberpfeife'), item('sturmfeder'), flag('area_untersucht:windorgel')), blockedText: 'Du brauchst Silberpfeife, Sturmfeder und den Hinweis an der Orgel.', effects: [{ kind: 'removeItem', itemId: 'silberpfeife', quantity: 1 }, { kind: 'removeItem', itemId: 'sturmfeder', quantity: 1 }, { kind: 'addItem', itemId: 'windlied', quantity: 1 }, { kind: 'setFlag', flag: 'windlied_erhalten' }, { kind: 'unlockPassage', passageId: 'p50' }, { kind: 'unlockPassage', passageId: 'p51' }] },
  { id: 'kupferschluessel_erhalten', areaId: 'kupferhof', actionType: 'TAKE_ITEM', label: 'Nimm Tavis Kupferschlüssel', description: 'Tavi vertraut dir den Schlüssel zur Turmtruhe an.', resultText: 'Tavi gibt dir den Kupferschlüssel. «Er öffnet nur die Truhe, nicht den Weg zum Adler.»', requirement: flag('windlied_erhalten'), blockedText: 'Tavi gibt dir den Schlüssel nach der Reparatur der Windorgel.', effects: [{ kind: 'addItem', itemId: 'kupferschluessel', quantity: 1 }] },
  { id: 'windrad_reparieren', areaId: 'kupferhof', actionType: 'COMPLETE_INTERACTION', label: 'Setze das Windradblatt richtig ein', description: 'Die bemalte Seite muss zum Wind zeigen.', resultText: 'Das kleine Windrad dreht sich ruhig. Tavi lächelt, als hätte eine grosse Maschine ihren Takt gefunden.', effects: [{ kind: 'setFlag', flag: 'windrad_repariert' }] },
  { id: 'karte_voltaro_finden', areaId: 'himmelswerft', actionType: 'COMPLETE_INTERACTION', label: 'Lies den Wartungsschacht', description: 'Laternenlicht zeigt eine eingerissene Randnotiz.', resultText: 'Alvas Notiz bestätigt: Voltaro trug Nachrichten zwischen den Regionen, niemals Krieger.', requirement: item('laterne'), blockedText: 'Im dunklen Schacht brauchst du deine Laterne.', effects: [{ kind: 'discoverClue', clueId: 'karte_voltaro' }] },
  { id: 'truhe_kristallsaebel_interaktion', areaId: 'gewitterturm', actionType: 'OPEN_CHEST', label: 'Öffne die Kupfertruhe', description: 'Tavis Schlüssel passt genau.', resultText: 'Die Truhe öffnet sich. Darin liegt ein heller Kristallsäbel.', requirement: item('kupferschluessel'), blockedText: 'Das Kupferschloss gehört zu Tavis einzigem Truhenschlüssel.', chestId: 'truhe_kristallsaebel', effects: [{ kind: 'addItem', itemId: 'kristallsaebel', quantity: 1 }] },

  { id: 'truhe_nacht_interaktion', areaId: 'rand_der_nacht', actionType: 'OPEN_CHEST', label: 'Öffne Tessas letzte Truhe', description: 'Die Truhe ist frei zugänglich und mit einem Sonnenzeichen markiert.', resultText: 'Tessa hat vollständigen Reiseproviant und einen Zettel hinterlassen: «Du kennst den Rückweg.»', chestId: 'truhe_nacht', effects: [{ kind: 'addItem', itemId: 'reiseproviant', quantity: 1 }] },
  { id: 'karte_rueckgabe_finden', areaId: 'weltenkammer', actionType: 'COMPLETE_INTERACTION', label: 'Lies Alvas letzten Kartenrand', description: 'Nach der Verbannung liegt die Notiz offen auf dem Bannschloss.', resultText: 'Alva holte die Klinge Jahre nach dem ersten Sieg zurück und gab sie an den Tempel. Eine Rückkehr gehörte immer zum Versprechen.', requirement: flag('raugrim_verbannt'), blockedText: 'Raugrims Schatten verdeckt die letzte Notiz.', effects: [{ kind: 'discoverClue', clueId: 'karte_rueckgabe' }, { kind: 'setFlag', flag: 'phase5_abgeschlossen' }] }
]

function regularEnemy(id: string, name: string, maxLife: number, defense: number, tags: string[], first: [string, string, string, number], heavy: [string, string, string, number]): EnemyDefinition {
  return {
    id, name, kind: 'normal', maxLife, defense, tags,
    movesByPhase: { 1: [
      { id: first[0], name: first[1], telegraph: first[2], icon: '•', damage: first[3], kind: 'normal', damageType: tags.includes('lightning') ? 'lightning' : undefined },
      { id: heavy[0], name: heavy[1], telegraph: heavy[2], icon: '!', damage: heavy[3], kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true, damageType: tags.includes('lightning') ? 'lightning' : undefined, inflictedEffect: id === 'tintenqualle' ? { id: 'grauschleier', duration: 1 } : undefined }
    ] }
  }
}

export const campaignEnemies: EnemyDefinition[] = [
  regularEnemy('schattenmotte', 'Schattenmotte', 7, 0, ['shadow'], ['flattern', 'Dunkles Flattern', 'Die Motte zieht eine graue Spur durch das Licht.', 2], ['lichtsturz', 'Sturz ins Licht', 'Ihre Flügel klappen zu, bevor sie auf die hellste Blüte stürzt.', 4]),
  regularEnemy('rankenkrabbler', 'Rankenkrabbler', 9, 0, ['forest'], ['rankenhieb', 'Rankenhieb', 'Eine grüne Ranke schwingt seitlich aus.', 2], ['rollsprung', 'Rollender Sprung', 'Der Krabbler rollt sich sichtbar zu einer festen Kugel zusammen.', 5]),
  regularEnemy('knorzwolf', 'Knorzwolf', 11, 0, ['forest'], ['schnapper', 'Schneller Schnapper', 'Der Knorzwolf hebt die Schnauze.', 3], ['waldsprung', 'Knorzsprung', 'Holzpfoten scharren zweimal über den Boden.', 5]),
  regularEnemy('netzkrabbler', 'Netzkrabbler', 10, 1, ['forest'], ['beinwischer', 'Beinwischer', 'Zwei lange Beine tasten über den Boden.', 2], ['netzsprung', 'Angekündigter Netzsprung', 'Ein silbernes Netz spannt sich deutlich zwischen den Vorderbeinen.', 5]),
  regularEnemy('pfuetzenhopser', 'Pfützenhopser', 8, 0, ['water'], ['spritzer', 'Spritzender Hüpfer', 'Der Pfützenhopser wippt vor und zurück.', 2], ['weiter_sprung', 'Weiter Sprung', 'Er duckt sich tief für einen weiten Sprung.', 4]),
  regularEnemy('tintenqualle', 'Tintenqualle', 10, 0, ['water'], ['tentakelstoss', 'Tentakelstoss', 'Eine Tentakelspitze kräuselt sich über dem Wasser.', 3], ['tintenwolke', 'Tintenwolke', 'Dunkle Tinte sammelt sich sichtbar unter der Qualle.', 5]),
  regularEnemy('wasserwaechter', 'Wasserwächter', 12, 1, ['water', 'armored'], ['wasserhieb', 'Wasserhieb', 'Wasser sammelt sich um den steinernen Arm.', 3], ['schildstoss', 'Schildstoss', 'Der Wächter stemmt seinen Schild vor und holt aus.', 5]),
  regularEnemy('kupferkaefer', 'Kupferkäfer', 9, 1, ['machine', 'armored'], ['zangenklick', 'Zangenklick', 'Die kleine Kupferzange öffnet sich.', 2], ['aufziehlauf', 'Aufziehlauf', 'Sein Schlüssel klickt genau dreimal vor dem schnellen Lauf.', 5]),
  regularEnemy('lorenrumpel', 'Lorenrumpel', 13, 1, ['machine', 'armored'], ['radstoss', 'Radstoss', 'Ein loses Rad schwenkt in deine Richtung.', 3], ['beschleunigung', 'Beschleunigte Lore', 'Die Räder rattern immer schneller auf der geraden Schiene.', 6]),
  regularEnemy('gewittergeist', 'Gewittergeist', 12, 0, ['lightning'], ['funkenwurf', 'Funkenwurf', 'Blaue Funken sammeln sich an einer Hand.', 3], ['ladeblitz', 'Geladener Blitz', 'Der Geist hebt beide Arme; ein heller Blitz wächst dazwischen.', 6]),
  {
    id: 'arbor', name: 'Arbor, Hüter der Wurzeln', kind: 'boss', maxLife: 22, defense: 1, tags: ['forest', 'boss'], shadowArmor: true, phaseTwoAtLife: 11,
    movesByPhase: {
      1: [
        { id: 'ansturm', name: 'Dornenansturm', telegraph: 'Arbor scharrt und senkt sein grosses Geweih.', icon: '♜', damage: 6, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true },
        { id: 'wurzelfalle', name: 'Wurzelfalle', telegraph: 'Schwarze Wurzeln ziehen einen sichtbaren Kreis um deine Füsse.', icon: '⌁', damage: 3, kind: 'normal' }
      ],
      2: [
        { id: 'schneller_ansturm', name: 'Schneller Ansturm', telegraph: 'Der gebrochene Dornenring zittert; Arbor scharrt sofort.', icon: '♜', damage: 7, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true },
        { id: 'rankenhieb', name: 'Offener Rankenhieb', telegraph: 'Arbor schwingt die letzte schwarze Ranke weit zurück.', icon: '⌁', damage: 4, kind: 'normal' }
      ]
    }
  },
  {
    id: 'marea', name: 'Marea, Wächterin der Gezeiten', kind: 'boss', maxLife: 24, defense: 1, tags: ['water', 'boss'], shadowArmor: true, phaseTwoAtLife: 12,
    movesByPhase: {
      1: [
        { id: 'wellenrolle', name: 'Wellenrolle', telegraph: 'Das Wasser steigt. Marea richtet sich für eine gewaltige Rolle aus.', icon: '≋', damage: 7, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true },
        { id: 'panzer', name: 'Schwarzer Panzer', telegraph: 'Marea zieht Kopf und Beine ein. Schwarzes Glas bedeckt jeden Spalt.', icon: '⬢', damage: 0, kind: 'guard' },
        { id: 'flutstoss', name: 'Flutstoss', telegraph: 'Eine breite Welle sammelt sich vor Mareas Panzer.', icon: '≈', damage: 4, kind: 'normal' }
      ],
      2: [
        { id: 'kleine_wellen', name: 'Wirbelnde Wellen', telegraph: 'Zwei kleinere Wellen kreisen von beiden Seiten heran.', icon: '∿', damage: 4, kind: 'normal' },
        { id: 'wellenrolle', name: 'Schnelle Wellenrolle', telegraph: 'Das Wasser steigt rasch. Marea zielt auf eine angebrochene Säule.', icon: '≋', damage: 8, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true },
        { id: 'panzer', name: 'Schwarzer Panzer', telegraph: 'Marea schliesst ihren Panzer. Nur schwarzes Glas bleibt sichtbar.', icon: '⬢', damage: 0, kind: 'guard' }
      ]
    }
  },
  {
    id: 'voltaro', name: 'Voltaro, Wächter des Himmels', kind: 'boss', maxLife: 24, defense: 1, tags: ['lightning', 'machine', 'boss'], shadowArmor: true, airborne: true, phaseTwoAtLife: 12,
    movesByPhase: {
      1: [
        { id: 'sturzflug', name: 'Sturzflug von links', telegraph: 'Voltaro legt die Flügel an und kippt deutlich nach links.', icon: '↙', damage: 7, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true },
        { id: 'metallfluegel', name: 'Metallflügel', telegraph: 'Voltaro steigt auf. Seine Metallfedern schliessen jede Lücke.', icon: '◇', damage: 0, kind: 'guard' },
        { id: 'blitzfeder', name: 'Blitzfeder', telegraph: 'Eine einzelne Feder lädt sich blau auf.', icon: 'ϟ', damage: 3, kind: 'normal', damageType: 'lightning' }
      ],
      2: [
        { id: 'wechselsturz', name: 'Sturzflug von rechts', telegraph: 'Der Wind dreht. Voltaro legt rechts die Federn eng an.', icon: '↘', damage: 8, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true },
        { id: 'blitzkreis', name: 'Blitzkreis', telegraph: 'Drei klar sichtbare Funken ziehen einen Kreis um den Horst.', icon: 'ϟ', damage: 4, kind: 'normal', damageType: 'lightning' }
      ]
    }
  },
  {
    id: 'raugrim', name: 'Raugrim, der Grauschleier', kind: 'boss', maxLife: 36, defense: 1, tags: ['shadow', 'boss'], shadowArmor: true,
    phaseThresholds: { 2: 24, 3: 12 },
    phaseSealItemIds: { 1: 'wurzelsiegel', 2: 'gezeitensiegel', 3: 'himmelssiegel' },
    movesByPhase: {
      1: [
        { id: 'grauer_hieb', name: 'Grauer Hieb', telegraph: 'Staub weicht vor einer unsichtbaren Klaue zurück.', icon: '◐', damage: 2, kind: 'normal' },
        { id: 'loeschender_schweif', name: 'Löschender Schweif', telegraph: 'Ein breiter Teil des Bodens wird grau. Der Schweif kommt von rechts.', icon: '☾', damage: 7, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true }
      ],
      2: [
        { id: 'falsches_bild', name: 'Falsches Bild', telegraph: 'Raugrim zeigt eine leere Sonnenwacht, doch deine Lebenspunkte bleiben klar sichtbar.', icon: '▧', damage: 2, kind: 'normal' },
        { id: 'schattengriff', name: 'Schattengriff', telegraph: 'Zwei Lücken im Licht bewegen sich auf dich zu. Ohne Deckung schwächt Grauschleier deinen nächsten Angriff.', icon: '◐', damage: 2, kind: 'normal', inflictedEffect: { id: 'grauschleier', duration: 1 } },
        { id: 'welle_vergessen', name: 'Welle des Vergessens', telegraph: 'Eine hohe graue Welle sammelt sich hinter Raugrim.', icon: '≋', damage: 7, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true }
      ],
      3: [
        { id: 'fluegelschlag', name: 'Schlag der leeren Flügel', telegraph: 'Immer mehr Sterne verschwinden über der Kammer.', icon: '◒', damage: 3, kind: 'normal' },
        { id: 'endloser_abend', name: 'Endloser Abend', telegraph: 'Raugrim spannt seine Lückenflügel. Der Endlose Abend ist deutlich aufgeladen.', icon: '●', damage: 8, kind: 'heavy', defendNegates: true, vulnerableAfterDefend: true }
      ]
    }
  }
]

export const campaignEncounters: EncounterDefinition[] = [
  { id: 'begegnung_rankenkrabbler', areaId: 'funkelpfad', enemyId: 'rankenkrabbler', label: 'Stelle dich dem Rankenkrabbler', description: 'Der breite Weg bleibt über einen leuchtenden Umweg frei.', fleeAreaId: 'eichenpforte', victoryText: 'Der Krabbler entrollt sich und verschwindet friedlich im Farn.', rewardEffects: [{ kind: 'setFlag', flag: 'rankenkrabbler_besiegt' }] },
  { id: 'begegnung_schattenmotten', areaId: 'gluehgarten', enemyId: 'schattenmotte', label: 'Vertreibe die Schattenmotten', description: 'Die Motten halten Lio von der Ölpresse fern.', fleeAreaId: 'foersterhaus', victoryText: 'Die Motten flattern zu den dunklen Baumkronen. Lios Presse ist wieder frei.', rewardEffects: [{ kind: 'setFlag', flag: 'schattenmotten_besiegt' }] },
  { id: 'begegnung_knorzwolf', areaId: 'alte_baumschule', enemyId: 'knorzwolf', label: 'Beruhige den Knorzwolf', description: 'Ein knorriges Waldwesen bewacht nur ein optionales Beet.', fleeAreaId: 'gluehgarten', victoryText: 'Der Knorzwolf schüttelt grauen Staub aus dem Fell und trottet davon.', rewardEffects: [{ kind: 'setFlag', flag: 'knorzwolf_beruhigt' }] },
  { id: 'begegnung_netzkrabbler', areaId: 'spinnenhain', enemyId: 'netzkrabbler', label: 'Löse das Seil vom Netzkrabbler', description: 'Das Tier hält das Kletterseil fest; der Weg selbst bleibt frei.', fleeAreaId: 'funkelpfad', victoryText: 'Das Netz reisst. Der Krabbler zieht sich unverletzt in die hohen Äste zurück.', rewardEffects: [{ kind: 'setFlag', flag: 'netzkrabbler_besiegt' }] },
  { id: 'begegnung_pfuetzenhopser', areaId: 'ueberfluteter_markt', enemyId: 'pfuetzenhopser', label: 'Stelle dich dem Pfützenhopser', description: 'Er bewacht nur einen trockenen Seitenstand und kann umgangen werden.', fleeAreaId: 'muschelhafen', victoryText: 'Der Pfützenhopser platscht ins flache Wasser und hüpft davon.', rewardEffects: [{ kind: 'setFlag', flag: 'pfuetzenhopser_besiegt' }] },
  { id: 'begegnung_tintenqualle', areaId: 'korallengrotte', enemyId: 'tintenqualle', label: 'Vertreibe die Tintenqualle', description: 'Ihre dunkle Wolke liegt über einem optionalen Quellfach.', fleeAreaId: 'schleusenhaus', victoryText: 'Die Qualle wird durchsichtig und treibt ruhig ins Meer hinaus.', rewardEffects: [{ kind: 'setFlag', flag: 'tintenqualle_besiegt' }] },
  { id: 'begegnung_wasserwaechter', areaId: 'gezeitentempel', enemyId: 'wasserwaechter', label: 'Fordere den Wasserwächter heraus', description: 'Der langsame Wächter steht nur vor einer Tempeltruhe.', fleeAreaId: 'versunkene_bibliothek', victoryText: 'Er senkt den Schild und wird wieder zu einer stillen Statue.', rewardEffects: [{ kind: 'setFlag', flag: 'wasserwaechter_besiegt' }] },
  { id: 'begegnung_kupferkaefer', areaId: 'bergfuss', enemyId: 'kupferkaefer', label: 'Schalte den Kupferkäfer ab', description: 'Beide Bergwege bleiben an seiner Aufziehspur vorbei offen.', fleeAreaId: 'drei_wege_platz', victoryText: 'Der Käfer klappt seine Beine ein und tickt zufrieden statt wild.', rewardEffects: [{ kind: 'setFlag', flag: 'kupferkaefer_abgeschaltet' }] },
  { id: 'begegnung_lorenrumpel', areaId: 'lorenwerk', enemyId: 'lorenrumpel', label: 'Stoppe den Lorenrumpel', description: 'Die beschleunigende Maschine bewacht die schwere Werktruhe.', fleeAreaId: 'kristallmine', victoryText: 'Die Lore rollt langsam in ihre Halterung und bleibt dort.', rewardEffects: [{ kind: 'setFlag', flag: 'lorenrumpel_besiegt' }] },
  { id: 'begegnung_gewittergeist', areaId: 'himmelswerft', enemyId: 'gewittergeist', label: 'Löse den Gewittergeist', description: 'Der geladene Geist bewacht nur einen alten Aussichtsbalkon.', fleeAreaId: 'kupferhof', victoryText: 'Der Geist wird zu drei harmlosen Funken, die im Wind verlöschen.', rewardEffects: [{ kind: 'setFlag', flag: 'gewittergeist_geloest' }] },
  { id: 'boss_arbor', areaId: 'dornenkrone', enemyId: 'arbor', label: 'Betritt trotz der schwarzen Ranken die Dornenkrone', description: 'Gewöhnliche Waffen trennen Arbors Schatten nicht. Ein früher Rückzug bleibt möglich.', fleeAreaId: 'wurzelheiligtum', victoryText: 'Die schwarzen Ranken zerplatzen wie trockene Tinte. «Ich wollte alle beschützen und liess niemanden mehr hinaus», sagt Arbor. Er legt das Wurzelsiegel vor dich. «Ich bin noch zu schwach für Raugrim. Trage mein Siegel für mich.»', rewardEffects: [{ kind: 'setFlag', flag: 'arbor_befreit' }, { kind: 'addItem', itemId: 'wurzelsiegel', quantity: 1 }, { kind: 'unlockPassage', passageId: 'p23' }] },
  { id: 'boss_marea', areaId: 'perlenbecken', enemyId: 'marea', label: 'Stelle dich Marea und ihrem Schattenpanzer', description: 'Gewöhnliche Waffen öffnen Mareas Glas nicht. Ein früher Rückzug bleibt möglich.', fleeAreaId: 'gezeitentempel', victoryText: 'Das schwarze Glas wird zu klarem Wasser. «Ich wollte jede Geschichte behalten und vergass, dass Geschichten reisen müssen», sagt Marea. Sie gibt dir das Gezeitensiegel. «Meine Kraft kehrt langsam zurück. Mit diesem Zeichen helfe ich dir schon jetzt.»', rewardEffects: [{ kind: 'setFlag', flag: 'marea_befreit' }, { kind: 'addItem', itemId: 'gezeitensiegel', quantity: 1 }, { kind: 'unlockPassage', passageId: 'p34' }] },
  { id: 'boss_voltaro', areaId: 'adlerhorst', enemyId: 'voltaro', label: 'Betritt trotz der schwarzen Blitzadern den Adlerhorst', description: 'Nur die Morgenklinge trennt Voltaros Schatten. Ein früher Rückzug bleibt möglich.', fleeAreaId: 'gewitterturm', victoryText: 'Die Blitzadern werden zu blauem Licht. «Ich bewachte den Himmel, bis darin kein Platz mehr für andere war», sagt Voltaro. Er gibt dir das Himmelssiegel. «Meine Flügel brauchen Ruhe. Mein Zeichen wird dich begleiten.»', rewardEffects: [{ kind: 'setFlag', flag: 'voltaro_befreit' }, { kind: 'addItem', itemId: 'himmelssiegel', quantity: 1 }] },
  { id: 'boss_raugrim', areaId: 'weltenkammer', enemyId: 'raugrim', label: 'Beginne die letzte Verbannung', description: 'Prüfe Leben, Apfelbrot und Morgenklinge. Nach deinem ersten wirksamen Treffer bleibt der Rückweg bis zum Sieg oder zur Rettung geschlossen.', fleeAreaId: 'rand_der_nacht', victoryText: 'Morgenklinge und die drei echten Siegel gleiten ins innere Bannschloss.\n\nRaugrim wird kleiner und ferner, bis nur ein schwarzer Punkt unter dem Stein bleibt. «Ihr werdet mich wieder vergessen», flüstert er. «Darum erzählen wir die Geschichte weiter», antwortet Kuno.\n\nAuf dem Wegweiser erscheinen Buchstaben. Eine Blüte öffnet sich, ein Boot fährt hinaus, ein Windrad dreht sich. Taloras Morgen kehrt zurück. Dein Reiseschwert begleitet dich auf dem Heimweg.', rewardEffects: [{ kind: 'removeItem', itemId: 'morgenklinge', quantity: 1 }, { kind: 'removeItem', itemId: 'wurzelsiegel', quantity: 1 }, { kind: 'removeItem', itemId: 'gezeitensiegel', quantity: 1 }, { kind: 'removeItem', itemId: 'himmelssiegel', quantity: 1 }, { kind: 'setFlag', flag: 'raugrim_verbannt' }, { kind: 'setFlag', flag: 'phase5_abgeschlossen' }] }
]

export const campaignWorld: WorldDefinition = {
  storyBeats: campaignStoryBeats,
  puzzles: campaignPuzzles,
  areas: campaignAreas.map((area) => ({
    ...area,
    variants: areaVariants[area.id],
    safe: ['sonnenwacht', 'foersterhaus', 'muschelhafen', 'kupferhof', 'rand_der_nacht'].includes(area.id),
    sanctuaryRequirement: area.id === 'foersterhaus' ? flag('lio_geholfen') : undefined
  })),
  passages: campaignPassages,
  items: campaignItems,
  interactions: [...campaignInteractions.map((interaction) => interaction.id === 'karte_mut_finden' ? { ...interaction, effects: interaction.effects.filter((effect) => effect.kind !== 'addItem') } : interaction), ...campaignExtras],
  enemies: campaignEnemies,
  encounters: campaignEncounters,
  startAreaId: 'sonnenwacht',
  sliceGoalFlag: 'phase5_abgeschlossen'
}
