import type { AreaDefinition, Requirement, WorldDefinition } from '../../domain/content'

const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })
const finished = flag('raugrim_verbannt')
const changed = (value: string, description: string, inspectText = description) => ({ requirement: flag(value), description, inspectText })

export const areaVariants: Record<string, AreaDefinition['variants']> = {
  sonnenwacht: [changed('raugrim_verbannt', 'Goldenes Morgenlicht fällt in die Kartenstube. Neben dem alten Wandbild steht eine neue Tafel: Alva, die drei Wächter und viele Helfende. Tessa lächelt. «Ihr habt Talora gemeinsam seinen Morgen zurückgegeben. Jetzt sorgen wir dafür, dass Licht, Wasser und Wind weiterfliessen.»')],
  drei_wege_platz: [changed('raugrim_verbannt', 'Kinder spielen zwischen den Wegweisern. Die Buchstaben sind zurück. Jeder Weg führt wieder zu Menschen mit Namen und Geschichten. Du kannst in jede Region zurückkehren.')],
  morgen_tempel: [
    changed('raugrim_verbannt', 'Die Äste des steinernen Baums sind leer. Drei Lichtadern verbinden den Tempel mit dem Bannschloss unter Talora. Dort halten Morgenklinge und Siegel Raugrim fest.'),
    changed('morgenklinge_erweckt', 'Der steinerne Baum hat seine Äste geöffnet. Sonnenfunke, Quellträne und Windlied leuchten jetzt in deiner Morgenklinge.', 'Auf der leeren Halterung erscheinen Blatt, Welle und Blitz: die Zeichen von Arbor, Marea und Voltaro.')
  ],
  tor_der_sechs_zeichen: [changed('endtor_offen', 'Alle sechs Zeichen leuchten. Das äussere Tor steht offen; dahinter führt die Sternentreppe unter Talora.', 'Die drei Lichtadern der Morgenklinge weckten die ersten Zeichen. Die Siegel der Wächter weckten die übrigen. Das Tor bleibt offen.')],
  mooslichtung: [changed('interaktion:goldbeeren_pfluecken', 'Die Mooslichtung glimmt sanft. Du hast die reifen Goldbeeren gepflückt; die grünen Beeren bleiben an den Zweigen.', 'Unter dem Baum dürfen die übrigen Beeren in Ruhe weiterwachsen.')],
  gluehgarten: [
    changed('lio_geholfen', 'Die Glasblüten sammeln wieder Licht. Lio reinigt die Ölpresse. «Unser Leuchtöl bringt den goldenen Strahl bis zur Küste», sagt er.', 'Die Goldbeeren sind zu Leuchtöl geworden. Die Presse hat ihre Arbeit getan.'),
    changed('schattenmotten_besiegt', 'Die Schattenmotten sind fort. Lio, der junge Gärtner, steht an seiner freien Ölpresse. Die Glasblüten sammeln wieder Licht.', 'Die Presse ist frei. Für Leuchtöl braucht Lio die reifen Goldbeeren von der Mooslichtung.')
  ],
  foersterhaus: [changed('lio_geholfen', 'Lios Försterhaus riecht nach Kräutern und Holz. Seit deiner Hilfe an der Ölpresse steht hier ein warmer Rastplatz bereit.', 'Lio legt Apfelbrot bereit. «Komm vor einem schweren Kampf hierher zurück.»')],
  spinnenhain: [changed('netzkrabbler_besiegt', 'Zerrissene Netze schimmern im Spinnenhain. Der Netzkrabbler sitzt friedlich in den hohen Ästen. Die Wege zum Heiligtum und zum Wurzeltunnel sind frei.', 'Am Boden liegt nur loses, ungefährliches Netz. Das Kletterseil wird nicht mehr festgehalten.')],
  wurzelheiligtum: [changed('arbor_befreit', 'Die Dornen haben sich geöffnet. Die Tiere laufen aus der Wurzelhalle ins Freie. Ein neuer Pfad führt direkt zu Lios Försterhaus.', 'Auf der Tafel steht Arbors alte Aufgabe: «Lass Wege wachsen. Wer Schutz sucht, soll auch wieder gehen können.»')],
  dornenkrone: [changed('arbor_befreit', 'Arbor steht auf einer friedlichen Lichtung. Aus seinem Geweih wachsen frische Blätter. «Ein guter Hüter hält den Rückweg offen», sagt er.')],
  ueberfluteter_markt: [
    changed('schleuse_repariert', 'Das Wasser ist aus den Marktgassen abgelaufen. Nela hat die Stege geprüft; sie führen sicher zu Hafen, Schleusenhaus und Bibliothek.'),
    changed('schleusenrad_geborgen', 'Der angehobene Marktstand ruht sicher auf Holzblöcken. Du hast das Schleusenrad geborgen. Flaches Wasser fliesst noch zwischen den Ständen.', 'Unter dem abgestützten Stand liegt kein Rad mehr. Das Schleusenhaus wartet auf die Reparatur.')
  ],
  muschelhafen: [changed('schleuse_repariert', 'Die Boote liegen wieder ruhig an ihren Pfählen. Nela, die Hafenlehrlingin, winkt dir vom Rastplatz zu. «Das Wasser fliesst wieder dorthin, wo es gebraucht wird.»')],
  schleusenhaus: [changed('schleuse_repariert', 'Das Schleusenrad dreht sich leicht. Klares Wasser fliesst durch das Mondmoos zur Quelle; der Ablauf bleibt geschlossen.', 'Zulauf und Quelltor sind offen. Der Filter arbeitet, und der Aquädukt ist freigespült.')],
  versunkene_bibliothek: [changed('archiv_geoeffnet', 'Die grüne Archivtür steht offen. Das gepolsterte Spiegelfach ist leer, doch Alvas Aufzeichnungen liegen weiterhin auf dem trockenen Lesetisch.', 'Der Archivschlüssel hat seine Aufgabe erfüllt. Du kannst Alvas Aufzeichnungen in Ruhe lesen.')],
  korallengrotte: [
    changed('quelltraene_erhalten', 'Klares Quellwasser spiegelt lesbare Namen. Menschen aus dem Hafen erzählen einander, wer diese Reisenden waren.'),
    changed('schleuse_repariert', 'Sauberes Wasser aus der Schleuse füllt die Quelle. Unter den Korallen werden alte Namen sichtbar. Menschen aus dem Hafen kommen, um sie gemeinsam zu lesen.')
  ],
  alter_leuchtturm: [changed('sonnenfunke_erhalten', 'Der Alte Leuchtturm sendet wieder einen warmen Strahl über die Spiegelküste bis nach Sonnenwacht.', 'Die Spiegel stehen richtig. Ihr Strahl zeigt auch die kleine Truhennische in der Mauer.')],
  gezeitentempel: [changed('marea_befreit', 'Klares Wasser zeichnet ruhige Linien im Tempel. Der Weg zum Perlenbecken führt zu Marea, die wieder Geschichten mit den Reisenden teilt.', 'Mareas Tafel erinnert daran, Geschichten weiterzutragen. Ihr schwarzer Panzer ist verschwunden.')],
  perlenbecken: [changed('marea_befreit', 'Marea zieht ruhige Kreise im klaren Wasser. Boote können wieder zum Hafen fahren. «Welche Geschichte bringst du heute mit?», fragt sie.')],
  bergfuss: [changed('kupferkaefer_abgeschaltet', 'Der Kupferkäfer ruht mit eingeklappten Beinen neben dem Weg. Die Pfade zur Kristallmine und zum Kupferhof sind frei.')],
  kristallmine: [changed('interaktion:werkzeugkammer_oeffnen', 'Die Werkzeugkammer steht offen. Kristalle werfen dein Echo als farbige Lichtpunkte zurück.', 'Glocke, Schritt, Klatschen: Die Zeichen am offenen Schloss leuchten noch immer in dieser Reihenfolge.')],
  kupferhof: [changed('windrad_repariert', 'Vor Tavis Werkstatt dreht sich das reparierte Windrad im richtigen Takt. Unter den blitzsicheren Dächern ist Platz zum Rasten.', 'Das Windradblatt sitzt fest. Seine bemalte Seite zeigt zum Wind.')],
  lorenwerk: [changed('lorenrumpel_besiegt', 'Der Lorenrumpel steht ruhig in seiner Halterung. Du kannst die Werktruhe und die Schienenweiche gefahrlos erreichen.')],
  wolkenbruecke: [changed('interaktion:sturmfeder_bergen', 'Über der Wolkenbrücke zieht heller Nebel vorbei. Der Wettermast ist leer; du hast die Sturmfeder sicher geborgen.')],
  windorgel: [changed('windlied_erhalten', 'Die reparierte Windorgel spielt ihre drei hellen Töne. Von fern antwortet die Windfähre. Tavi und seine Helfenden halten die Flügel im Wind.')],
  gewitterturm: [changed('voltaro_befreit', 'Über dem Gewitterturm ziehen die Wolken weiter. Die Treppe führt zu Voltaros friedlichem Horst. Die Kupfertruhe steht neben dem Aufgang.')],
  adlerhorst: [changed('voltaro_befreit', 'Voltaro gleitet ruhig über dem Horst. Zwischen den Wolken ist Platz für andere Flügel. «Der Himmel braucht Wege, keine Käfige», sagt er.')],
  sternentreppe: [{ requirement: finished, description: 'Die Sternentreppe leuchtet bis zum offenen Tor. Auf Kunos Karte sind alle drei Regionsnamen wieder klar zu lesen.', inspectText: 'Blatt, Welle und Blitz bleiben auf den Stufen sichtbar.' }],
  rand_der_nacht: [changed('raugrim_verbannt', 'Die goldene Flamme brennt ruhig. Dieser Rastplatz bleibt auch nach dem Sieg offen. Hinter der nächsten Tür liegt das geschlossene Bannschloss.')],
  weltenkammer: [changed('raugrim_verbannt', 'Goldenes Morgenlicht fällt auf das geschlossene Bannschloss. Morgenklinge und drei Siegel halten Raugrim darunter fest. Alvas letzter Kartenrand liegt daneben.', 'Das innere Schloss bleibt geschlossen. Der Weg nach draussen ist frei, und Alvas Notiz ist erreichbar.')]
}

const gifts = ['sonnenfunke_erhalten', 'quelltraene_erhalten', 'windlied_erhalten'].map(flag)
export const campaignStoryBeats: WorldDefinition['storyBeats'] = [
  {
    id: 'erinnerung_alva', requirement: { kind: 'any', requirements: gifts },
    text: 'Kuno hält inne. «Ich erinnere mich an eine Kartenmacherin. Alva! Das ist die goldene Gestalt auf dem alten Wandbild. Sie rettete Talora mit vielen Helfenden. Die Sage hat sie vergessen.»'
  },
  {
    id: 'erinnerung_waechter', requirement: { kind: 'any', requirements: [[0, 1], [0, 2], [1, 2]].map((pair) => ({ kind: 'all', requirements: pair.map((index) => gifts[index]) })) },
    text: 'Ein zweites Bild kehrt in Kunos Glas zurück: Ein Hirsch, eine Schildkröte und ein Adler halten einen riesigen Schatten fest. «Die Wächter halfen Alva, Raugrim zu verbannen. Sie waren ihre Freunde, keine Haustiere!»'
  },
  {
    id: 'erinnerung_kuno', requirement: { kind: 'all', requirements: gifts },
    text: 'Kuno sieht einen kleinen Messingkompass auf Alvas Schulter. «Das war ich. Ich war ihr Begleiter!» Seine Nadel zeigt zum Tempel. «Alle drei Gaben sind bereit. Jetzt können wir die Morgenklinge erwecken.»'
  }
]
