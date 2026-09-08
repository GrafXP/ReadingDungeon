import type {
  AreaDefinition,
  EncounterDefinition,
  EnemyDefinition,
  InteractionDefinition,
  ItemDefinition,
  PassageDefinition,
  WorldDefinition
} from '../../domain/content'

export const phase2Areas: AreaDefinition[] = [
  {
    id: 'sonnenwacht',
    name: 'Sonnenwacht',
    regionId: 'sonnenmark',
    regionName: 'Sonnenmark',
    safe: true,
    mapPosition: { x: 270, y: 70 },
    firstDescription: 'Normalerweise trifft der erste Sonnenstrahl am Lichterfest die Spitze von Sonnenwacht. Heute steigt die Sonne nur als blasse Scheibe auf. In der Kartenstube klappt ein alter Messingkompass vier dünne Beine aus, niest Staub und sieht zu dir hoch.',
    revisitDescription: 'In der Kartenstube liegen Tessas Karten bereit. Durch das Fenster siehst du den blassen Morgen über Sonnenwacht.',
    inspectText: 'Kunos Nadel zeigt erst zur Tür, dann zu einem Schrank und wieder zur Tür. «Die richtige Richtung war kurz dabei», behauptet er.'
  },
  {
    id: 'drei_wege_platz',
    name: 'Drei-Wege-Platz',
    regionId: 'sonnenmark',
    regionName: 'Sonnenmark',
    safe: true,
    mapPosition: { x: 390, y: 165 },
    firstDescription: 'Drei breite Wege treffen sich vor einem steinernen Wegweiser. Auf seinen Armen verschwinden gerade die letzten Buchstaben. Im Süden riechst du Salzluft; im Westen stehen die Dächer des alten Markts.',
    revisitDescription: 'Der leere Wegweiser steht noch immer in der Mitte des Platzes. Die Wege nach Sonnenwacht und zur Küste sind frei.',
    inspectText: 'Unter den verblassenden Namen erkennst du drei Zeichen: ein Blatt, eine Welle und einen Blitz. Kuno wird für einen Moment ganz still.'
  },
  {
    id: 'alter_markt',
    name: 'Alter Markt',
    regionId: 'sonnenmark',
    regionName: 'Sonnenmark',
    safe: true,
    mapPosition: { x: 150, y: 165 },
    firstDescription: 'Bunte Stoffdächer hängen über verlassenen Marktständen. Zwischen Kisten lehnt eine lange eiserne Stange. Unter einem Tisch steht eine kleine Truhe, auf deren Deckel ein Blatt eingeritzt ist.',
    revisitDescription: 'Die Stoffdächer rascheln über dem stillen Markt. Wege führen zur Kartenstube, zum Garten und zur Bogenbrücke.',
    inspectText: 'Schleifspuren führen von einem schweren Stand in Richtung Küste. Vielleicht wurde dort etwas Wichtiges fortgerissen.'
  },
  {
    id: 'garten_der_namen',
    name: 'Garten der Namen',
    regionId: 'sonnenmark',
    regionName: 'Sonnenmark',
    safe: true,
    mapPosition: { x: 100, y: 285 },
    firstDescription: 'Vier flache Symbolsteine liegen zwischen duftenden Kräutern. Sonne, Welle, Blatt und Wind sind darauf abgebildet. Eine Messingplakette bittet dich, den Weg des Morgens zu ordnen.',
    revisitDescription: 'Im Garten duften Kräuter zwischen den beschrifteten Steinen. Von hier erreichst du den Markt und die Bogenbrücke.',
    inspectText: 'Die Ränder der Steine passen wie ein Weg zusammen: Dunkelheit, Wind, Licht und Wachstum. Unter dem Sonnenstein klappert etwas.'
  },
  {
    id: 'bogenbruecke',
    name: 'Bogenbrücke',
    regionId: 'sonnenmark',
    regionName: 'Sonnenmark',
    safe: true,
    mapPosition: { x: 245, y: 300 },
    firstDescription: 'Die alte Brücke spannt sich über einen schmalen Bach. Von ihrem höchsten Punkt siehst du den Wald, das Meer und die fernen Berge. Ein kurzer Weg führt direkt zum Drei-Wege-Platz.',
    revisitDescription: 'Auf der Bogenbrücke liegt ganz Talora vor dir. Der direkte Weg zum Platz spart dir den Umweg über Sonnenwacht.',
    inspectText: 'Im Geländer sind viele kleine Hände eingeritzt. Reisende haben hier über Generationen ihre Wege markiert.'
  },
  {
    id: 'kuestenpfad',
    name: 'Küstenpfad',
    regionId: 'spiegelkueste',
    regionName: 'Spiegelküste',
    safe: false,
    mapPosition: { x: 500, y: 245 },
    firstDescription: 'Der Weg fällt zwischen hellen Felsen zum Meer ab. Das Wasser glänzt wie ein Spiegel, doch darin fehlt die Farbe des Himmels. Muscheln markieren den sicheren Pfad.',
    revisitDescription: 'Salzwind streicht über den Küstenpfad. Oberhalb liegt der Drei-Wege-Platz, unterhalb der Hafen.',
    inspectText: 'Zwischen den Muscheln liegt ein Stück Holz von einem Marktstand. Es ist noch nass und trägt dieselben Schleifspuren wie am Alten Markt.'
  },
  {
    id: 'muschelhafen',
    name: 'Muschelhafen',
    regionId: 'spiegelkueste',
    regionName: 'Spiegelküste',
    safe: true,
    mapPosition: { x: 485, y: 365 },
    firstDescription: 'Kleine Boote schaukeln an bunten Pfählen. Hafenmeisterin Nela zieht an einem Seil und blickt besorgt zum überfluteten Marktplatz. «Das Wasser steht jeden Morgen höher», sagt sie.',
    revisitDescription: 'Im Muschelhafen knarren die Boote. Nela behält das steigende Wasser und den Weg zum alten Markt im Auge.',
    inspectText: 'Auf Nelas Skizze fehlt ein grosses Schleusenrad. Daneben hat sie einen umgestürzten Marktstand gezeichnet.'
  },
  {
    id: 'ueberfluteter_markt',
    name: 'Überfluteter Markt',
    regionId: 'spiegelkueste',
    regionName: 'Spiegelküste',
    safe: false,
    mapPosition: { x: 365, y: 455 },
    firstDescription: 'Knöcheltiefes Wasser fliesst zwischen verlassenen Ständen. Ein schweres Holzgestell ist umgestürzt. Unter seiner Kante schimmert das Metall eines grossen Rads.',
    revisitDescription: 'Flaches Wasser kräuselt sich über dem Marktplatz. Der Hafen, die Bibliothek und das Schleusenhaus liegen in drei Richtungen.',
    inspectText: 'Der Stand ist zu schwer zum Hochheben. Unter der Kante ist aber Platz für einen langen, stabilen Hebel.'
  },
  {
    id: 'versunkene_bibliothek',
    name: 'Versunkene Bibliothek',
    regionId: 'spiegelkueste',
    regionName: 'Spiegelküste',
    safe: false,
    mapPosition: { x: 525, y: 500 },
    firstDescription: 'Das Erdgeschoss der Bibliothek steht unter klarem Wasser. Bücher ruhen sicher auf hohen Regalen. Eine grüne Tür mit einem kleinen Sonnensymbol schützt das Kartenarchiv.',
    revisitDescription: 'Wasser spiegelt die hohen Regale der Bibliothek. Die Tür zum Kartenarchiv wartet unter ihrem Sonnensymbol.',
    inspectText: 'Das Schloss der Archivtür ist aus Messing. Seine vier Zeichen gleichen den Steinen im Garten der Namen.'
  },
  {
    id: 'gezeitentempel',
    name: 'Gezeitentempel',
    regionId: 'spiegelkueste',
    regionName: 'Spiegelküste',
    safe: false,
    mapPosition: { x: 650, y: 450 },
    firstDescription: 'Breite Stufen führen in einen Tempel, über dessen Boden dünne Wasserlinien laufen. Hinter dem letzten Tor bewegt sich ein riesiger Schatten. Schwarzes Glas schliesst sich sofort über jedem Kratzer. Kuno warnt dich, dass nur das Licht der Morgenklinge diesen Panzer öffnen kann.',
    revisitDescription: 'Die Wasserlinien im Gezeitentempel zeigen zum Perlenbecken. Hinter dem Tor wartet Marea unter ihrem schwarzen Panzer.',
    inspectText: 'Ein Wandbild zeigt eine gewaltige Schildkröte, die einen Hafen vor einer Flut schützt. Graue Risse ziehen sich über ihren Panzer.'
  },
  {
    id: 'morgen_tempel',
    name: 'Tempel der Morgenklinge',
    regionId: 'sonnenmark',
    regionName: 'Sonnenmark',
    safe: true,
    mapPosition: { x: 480, y: 70 },
    firstDescription: 'Zwischen den Ästen eines steinernen Baums steckt eine graue Klinge. Drei Bilder umgeben den Stamm: Sonnenlicht, ein klarer Tropfen und eine silberne Windlinie. Deine bisherigen Funde lassen die Bilder schwach leuchten.',
    revisitDescription: 'Der steinerne Baum wartet im stillen Tempel. Die drei Gabenplätze zeigen, was du bereits erweckt hast.',
    inspectText: 'Unter den Bildern steht: «Bringe zurück, was Licht, Wasser und Wind vergessen haben.» Kunos Nadel zeigt direkt auf die Klinge.'
  },
  {
    id: 'perlenbecken',
    name: 'Perlenbecken',
    regionId: 'spiegelkueste',
    regionName: 'Spiegelküste',
    safe: false,
    mapPosition: { x: 650, y: 540 },
    firstDescription: 'Leere Boote drehen sich im Kreis um eine gewaltige Schildkröte. Schwarzes Glas liegt zwischen den Platten ihres Panzers. Das ist Marea, die Wächterin der Gezeiten – und der Schatten hält sie fest.',
    revisitDescription: 'Marea wartet im tiefen Perlenbecken. Zwischen ihren Panzerplatten glänzt der Grauschleier wie schwarzes Glas.',
    inspectText: 'Vor einer Wellenrolle steigt das Wasser sichtbar an. Mehrere angebrochene Steinsäulen könnten Marea aus dem Gleichgewicht bringen.'
  }
]

export const phase2Passages: PassageDefinition[] = [
  { id: 'p01', fromAreaId: 'sonnenwacht', toAreaId: 'drei_wege_platz', labelFrom: 'Gehe zum Drei-Wege-Platz', labelTo: 'Gehe nach Sonnenwacht' },
  { id: 'p02', fromAreaId: 'sonnenwacht', toAreaId: 'alter_markt', labelFrom: 'Gehe zum Alten Markt', labelTo: 'Gehe nach Sonnenwacht' },
  { id: 'p03', fromAreaId: 'alter_markt', toAreaId: 'bogenbruecke', labelFrom: 'Gehe zur Bogenbrücke', labelTo: 'Gehe zum Alten Markt' },
  { id: 'p04', fromAreaId: 'alter_markt', toAreaId: 'garten_der_namen', labelFrom: 'Gehe zum Garten der Namen', labelTo: 'Gehe zum Alten Markt' },
  { id: 'p05', fromAreaId: 'garten_der_namen', toAreaId: 'bogenbruecke', labelFrom: 'Gehe zur Bogenbrücke', labelTo: 'Gehe zum Garten der Namen' },
  { id: 'p06', fromAreaId: 'bogenbruecke', toAreaId: 'drei_wege_platz', labelFrom: 'Nimm den kurzen Weg zum Platz', labelTo: 'Gehe über die Bogenbrücke', shortcut: true },
  { id: 'p07', fromAreaId: 'drei_wege_platz', toAreaId: 'morgen_tempel', labelFrom: 'Betritt den Tempel der Morgenklinge', labelTo: 'Kehre zum Drei-Wege-Platz zurück' },
  { id: 'p10', fromAreaId: 'drei_wege_platz', toAreaId: 'kuestenpfad', labelFrom: 'Folge dem Weg zur Küste', labelTo: 'Steige zum Drei-Wege-Platz hinauf' },
  { id: 'p24', fromAreaId: 'kuestenpfad', toAreaId: 'muschelhafen', labelFrom: 'Gehe zum Muschelhafen', labelTo: 'Steige den Küstenpfad hinauf' },
  { id: 'p25', fromAreaId: 'muschelhafen', toAreaId: 'ueberfluteter_markt', labelFrom: 'Gehe zum überfluteten Markt', labelTo: 'Kehre zum Muschelhafen zurück' },
  { id: 'p26', fromAreaId: 'muschelhafen', toAreaId: 'versunkene_bibliothek', labelFrom: 'Gehe zur Versunkenen Bibliothek', labelTo: 'Kehre zum Muschelhafen zurück' },
  { id: 'p28', fromAreaId: 'ueberfluteter_markt', toAreaId: 'versunkene_bibliothek', labelFrom: 'Nimm den Steg zur Bibliothek', labelTo: 'Nimm den Steg zum Markt', shortcut: true },
  { id: 'p32', fromAreaId: 'versunkene_bibliothek', toAreaId: 'gezeitentempel', labelFrom: 'Gehe zum Gezeitentempel', labelTo: 'Kehre zur Bibliothek zurück' },
  { id: 'p33', fromAreaId: 'gezeitentempel', toAreaId: 'perlenbecken', labelFrom: 'Betritt trotz des schwarzen Panzers das Perlenbecken', labelTo: 'Zieh dich in den Gezeitentempel zurück' },
  {
    id: 'p34', fromAreaId: 'perlenbecken', toAreaId: 'muschelhafen', labelFrom: 'Nimm den neuen Bootspfad zum Hafen', labelTo: 'Fahre zum Perlenbecken',
    requirement: { kind: 'flag', flag: 'marea_befreit' }, blockedText: 'Die Strömung dreht sich noch im Kreis.', shortcut: true
  }
]

export const phase2Items: ItemDefinition[] = [
  {
    id: 'reiseschwert', name: 'Reiseschwert',
    description: 'Tessas zuverlässiges altes Schwert. Es ist leicht zu führen und richtet beständigen Schaden an.',
    kind: 'weapon', weapon: { minDamage: 2, maxDamage: 4, trait: 'Sehr zuverlässig' }
  },
  {
    id: 'hafenspeer', name: 'Hafenspeer',
    description: 'Ein gut ausbalancierter Speer aus dem Muschelhafen. Seine breite Spitze hilft besonders gegen Wassergegner.',
    kind: 'weapon', weapon: { minDamage: 3, maxDamage: 5, trait: 'Bonus gegen Wassergegner' }
  },
  {
    id: 'morgenklinge', name: 'Morgenklinge',
    description: 'Eine leichte, heilige Klinge. Ihr Licht durchdringt den Schattenpanzer der verdorbenen Wächter.',
    kind: 'weapon', weapon: { minDamage: 3, maxDamage: 5, trait: 'Durchdringt Schattenpanzer' }
  },
  { id: 'laterne', name: 'Laterne', description: 'Eine kleine Laterne für dunkle Winkel.', kind: 'tool' },
  {
    id: 'apfelbrot', name: 'Apfelbrot', description: 'Stärkender Reiseproviant mit getrockneten Apfelstücken.',
    kind: 'healing', healing: { lifeRestored: 5 }
  },
  { id: 'hebelstange', name: 'Hebelstange', description: 'Lang, stabil und nützlich bei schweren Dingen.', kind: 'tool' },
  { id: 'archivschluessel', name: 'Archivschlüssel', description: 'Ein Messingschlüssel mit vier kleinen Symbolen.', kind: 'key' },
  {
    id: 'waldsalbe', name: 'Waldsalbe', description: 'Eine grüne Salbe mit beruhigendem Kräuterduft.',
    kind: 'healing', healing: { lifeRestored: 8 }
  },
  { id: 'schleusenrad', name: 'Schleusenrad', description: 'Das vermisste Rad der Küstenschleuse.', kind: 'quest' },
  { id: 'sonnenspiegel', name: 'Sonnenspiegel', description: 'Ein unversehrter Spiegel für den alten Leuchtturm.', kind: 'quest' },
  { id: 'sonnenfunke', name: 'Sonnenfunke', description: 'Ein warmer Lichtpunkt, der selbst im Grauschleier leuchtet.', kind: 'quest' },
  { id: 'quelltraene', name: 'Quellträne', description: 'Ein klarer Tropfen voller erinnerter Namen.', kind: 'quest' },
  { id: 'windlied', name: 'Windlied', description: 'Eine silberne Melodie, die in Kunos Deckel summt.', kind: 'quest' },
  { id: 'gezeitensiegel', name: 'Gezeitensiegel', description: 'Mareas altes Bannzeichen in Form einer Welle.', kind: 'quest' },
  {
    id: 'quellwasser', name: 'Quellwasser', description: 'Klares Wasser, das neue Kraft gibt.',
    kind: 'healing', healing: { lifeRestored: 6, extraEffect: 'Entfernt einen Grauschleier-Effekt' }
  }
]

export const phase2Interactions: InteractionDefinition[] = [
  {
    id: 'hebelstange_fund', areaId: 'alter_markt', actionType: 'TAKE_ITEM', label: 'Nimm die Hebelstange',
    description: 'Eine eiserne Stange lehnt griffbereit zwischen den Kisten.',
    resultText: 'Du hebst die eiserne Hebelstange auf. Kuno nickt: «Endlich etwas, das eindeutig in eine Richtung zeigt.»',
    effects: [{ kind: 'addItem', itemId: 'hebelstange', quantity: 1 }, { kind: 'discoverClue', clueId: 'hinweis_schleusenrad' }]
  },
  {
    id: 'truhe_markt_interaktion', areaId: 'alter_markt', actionType: 'OPEN_CHEST', label: 'Öffne die Blatt-Truhe',
    description: 'Die kleine Truhe ist nicht verschlossen.',
    resultText: 'Der Deckel springt auf. Darin liegt ein Töpfchen Waldsalbe.', chestId: 'truhe_markt',
    effects: [{ kind: 'addItem', itemId: 'waldsalbe', quantity: 1 }]
  },
  {
    id: 'symbolsteine_ordnen', areaId: 'garten_der_namen', actionType: 'COMPLETE_INTERACTION', label: 'Ordne die Symbolsteine',
    description: 'Die Kanten der vier Steine bilden zusammen einen Weg.',
    resultText: 'Wind, Licht, Wasser, Wachstum – der letzte Stein rastet ein. Unter dem Sonnenstein erscheint der Archivschlüssel.',
    requirement: { kind: 'flag', flag: 'area_untersucht:garten_der_namen' },
    blockedText: 'Untersuche zuerst die Zeichen und Kanten der Symbolsteine.',
    effects: [{ kind: 'addItem', itemId: 'archivschluessel', quantity: 1 }, { kind: 'discoverClue', clueId: 'archivschloss_gefunden' }]
  },
  {
    id: 'marktstand_anheben', areaId: 'ueberfluteter_markt', actionType: 'COMPLETE_INTERACTION', label: 'Heble den Marktstand hoch',
    description: 'Unter dem schweren Stand steckt ein grosses Metallrad.',
    resultText: 'Du schiebst die Hebelstange unter die Kante. Der Stand hebt sich, und du ziehst das Schleusenrad hervor.',
    requirement: { kind: 'item', itemId: 'hebelstange' },
    blockedText: 'Der Stand ist zu schwer. Unter seiner Kante ist Platz für einen langen, stabilen Hebel.',
    effects: [{ kind: 'addItem', itemId: 'schleusenrad', quantity: 1 }, { kind: 'setFlag', flag: 'schleusenrad_geborgen' }]
  },
  {
    id: 'truhe_hafenspeer_interaktion', areaId: 'muschelhafen', actionType: 'OPEN_CHEST', label: 'Öffne Nelas Hafentruhe',
    description: 'Nela hat die Truhe als Dank für deine Hilfe bereitgestellt.',
    resultText: 'Nela klappt den Deckel auf. «Wer zwischen überfluteten Ständen sucht, braucht etwas mit guter Reichweite.» Du erhältst den Hafenspeer.',
    requirement: { kind: 'flag', flag: 'schleusenrad_geborgen' },
    blockedText: 'Nela öffnet die Truhe, sobald du eine Spur zum verschwundenen Schleusenrad gefunden hast.',
    chestId: 'truhe_hafenspeer',
    effects: [{ kind: 'addItem', itemId: 'hafenspeer', quantity: 1 }]
  },
  {
    id: 'archiv_oeffnen', areaId: 'versunkene_bibliothek', actionType: 'COMPLETE_INTERACTION', label: 'Öffne das Kartenarchiv',
    description: 'Das Messingschloss zeigt vier vertraute Symbole.',
    resultText: 'Der Archivschlüssel dreht sich. Hinter der grünen Tür liegt ein unversehrter Sonnenspiegel in einer gepolsterten Kiste.',
    requirement: { kind: 'item', itemId: 'archivschluessel' },
    blockedText: 'Das Kartenarchiv ist verschlossen. Die vier Zeichen erinnern an den Garten der Namen.',
    effects: [{ kind: 'addItem', itemId: 'sonnenspiegel', quantity: 1 }, { kind: 'setFlag', flag: 'archiv_geoeffnet' }]
  },
  {
    id: 'phase2_abschluss', areaId: 'gezeitentempel', actionType: 'COMPLETE_INTERACTION', label: 'Präge dir die Warnung ein',
    description: 'Kuno möchte den gefährlichen Ort auf der Karte markieren.',
    resultText: 'Du markierst den Tempel deutlich auf deiner Karte. Für heute kennst du genug Wege, um die nächste Reise gut vorzubereiten.',
    requirement: { kind: 'all', requirements: [{ kind: 'flag', flag: 'archiv_geoeffnet' }, { kind: 'flag', flag: 'schleusenrad_geborgen' }] },
    blockedText: 'Kuno möchte zuerst das Rätsel des Archivs und den Hinweis am überfluteten Markt klären.',
    effects: [{ kind: 'setFlag', flag: 'phase2_abgeschlossen' }]
  },
  {
    id: 'truhe_gezeiten_interaktion', areaId: 'gezeitentempel', actionType: 'OPEN_CHEST', label: 'Öffne die bewachte Tempeltruhe',
    description: 'Der Wasserwächter hat den Weg zur Truhe freigegeben.',
    resultText: 'In der Tempeltruhe stehen zwei fest verschlossene Fläschchen Quellwasser.',
    requirement: { kind: 'flag', flag: 'wasserwaechter_besiegt' },
    blockedText: 'Ein langsamer Wasserwächter bewacht die Truhe.', chestId: 'truhe_gezeiten',
    effects: [{ kind: 'addItem', itemId: 'quellwasser', quantity: 2 }]
  },
  {
    id: 'sonnenfunke_erwecken', areaId: 'morgen_tempel', actionType: 'COMPLETE_INTERACTION', label: 'Fange den Sonnenfunken',
    description: 'Der Sonnenspiegel lenkt den blassen Morgen auf den ersten Gabenplatz.',
    resultText: 'Du hältst den Sonnenspiegel in den Lichtstrahl. Ein goldener Funke löst sich und schwebt in den steinernen Baum.',
    requirement: { kind: 'item', itemId: 'sonnenspiegel' },
    blockedText: 'Für dieses Bild fehlt ein unversehrter Spiegel.',
    effects: [{ kind: 'addItem', itemId: 'sonnenfunke', quantity: 1 }, { kind: 'setFlag', flag: 'sonnenfunke_eingesetzt' }]
  },
  {
    id: 'quelltraene_erwecken', areaId: 'morgen_tempel', actionType: 'COMPLETE_INTERACTION', label: 'Erwecke die Quellträne',
    description: 'Das geborgene Schleusenrad passt in den zweiten Gabenplatz.',
    resultText: 'Als du das Schleusenrad drehst, fliesst klares Wasser durch die Steinlinien. Ein einzelner Tropfen bleibt als Quellträne zurück.',
    requirement: { kind: 'item', itemId: 'schleusenrad' },
    blockedText: 'Im zweiten Bild fehlt das Rad, das den Wasserweg öffnet.',
    effects: [{ kind: 'addItem', itemId: 'quelltraene', quantity: 1 }, { kind: 'setFlag', flag: 'quelltraene_eingesetzt' }]
  },
  {
    id: 'windlied_erwecken', areaId: 'morgen_tempel', actionType: 'COMPLETE_INTERACTION', label: 'Spiele Kunos Windlied',
    description: 'Kuno hat auf euren Wegen eine kurze Windmelodie wiedergefunden.',
    resultText: 'Kuno öffnet seinen Deckel. Der Küstenwind summt darin drei helle Töne, die als silberne Linie zum dritten Gabenplatz steigen.',
    requirement: { kind: 'flag', flag: 'phase2_abgeschlossen' },
    blockedText: 'Erkunde zuerst die Wege bis zum Gezeitentempel, damit Kuno sich an die Melodie erinnert.',
    effects: [{ kind: 'addItem', itemId: 'windlied', quantity: 1 }, { kind: 'setFlag', flag: 'windlied_eingesetzt' }]
  },
  {
    id: 'morgenklinge_ziehen', areaId: 'morgen_tempel', actionType: 'COMPLETE_INTERACTION', label: 'Ziehe die Morgenklinge',
    description: 'Alle drei Gaben leuchten im steinernen Baum.',
    resultText: 'Der steinerne Baum öffnet seine Äste. Die Klinge wird leicht. Auf ihrer Seite erscheinen Worte: «Finde den Weg. Kehre zurück. Geh nicht allein.»',
    requirement: { kind: 'all', requirements: [
      { kind: 'item', itemId: 'sonnenfunke' }, { kind: 'item', itemId: 'quelltraene' }, { kind: 'item', itemId: 'windlied' }
    ] },
    blockedText: 'Die Morgenklinge erwacht erst, wenn Sonnenfunke, Quellträne und Windlied eingesetzt sind.',
    effects: [
      { kind: 'removeItem', itemId: 'sonnenfunke', quantity: 1 },
      { kind: 'removeItem', itemId: 'quelltraene', quantity: 1 },
      { kind: 'removeItem', itemId: 'windlied', quantity: 1 },
      { kind: 'addItem', itemId: 'morgenklinge', quantity: 1 },
      { kind: 'setFlag', flag: 'morgenklinge_erweckt' }
    ]
  }
]

export const phase4Enemies: EnemyDefinition[] = [
  {
    id: 'pfuetzenhopser', name: 'Pfützenhopser', kind: 'normal' as const, maxLife: 8, defense: 0, tags: ['water'],
    movesByPhase: { 1: [
      { id: 'spritzer', name: 'Spritzender Hüpfer', telegraph: 'Der Pfützenhopser wippt vor und zurück.', icon: '⌁', damage: 2, kind: 'normal' as const },
      { id: 'weiter_sprung', name: 'Weiter Sprung', telegraph: 'Er duckt sich tief für einen weiten Sprung.', icon: '↗', damage: 4, kind: 'heavy' as const, defendNegates: true, vulnerableAfterDefend: true }
    ] }
  },
  {
    id: 'wasserwaechter', name: 'Wasserwächter', kind: 'normal' as const, maxLife: 12, defense: 1, tags: ['water', 'armored'],
    movesByPhase: { 1: [
      { id: 'wasserhieb', name: 'Wasserhieb', telegraph: 'Wasser sammelt sich um den steinernen Arm.', icon: '≈', damage: 3, kind: 'normal' as const },
      { id: 'schildstoss', name: 'Schildstoss', telegraph: 'Der Wächter stemmt seinen Schild vor und holt aus.', icon: '◈', damage: 5, kind: 'heavy' as const, defendNegates: true, vulnerableAfterDefend: true }
    ] }
  },
  {
    id: 'marea', name: 'Marea, Wächterin der Gezeiten', kind: 'boss' as const, maxLife: 24, defense: 1, tags: ['water', 'boss'], shadowArmor: true, phaseTwoAtLife: 12,
    movesByPhase: {
      1: [
        { id: 'wellenrolle', name: 'Wellenrolle', telegraph: 'Das Wasser steigt. Marea richtet sich für eine gewaltige Rolle aus.', icon: '≋', damage: 7, kind: 'heavy' as const, defendNegates: true, vulnerableAfterDefend: true },
        { id: 'panzer', name: 'Schwarzer Panzer', telegraph: 'Marea zieht Kopf und Beine ein. Schwarzes Glas bedeckt jeden Spalt.', icon: '⬢', damage: 0, kind: 'guard' as const },
        { id: 'flutstoss', name: 'Flutstoss', telegraph: 'Eine breite Welle sammelt sich vor Mareas Panzer.', icon: '≈', damage: 4, kind: 'normal' as const }
      ],
      2: [
        { id: 'kleine_wellen', name: 'Wirbelnde Wellen', telegraph: 'Zwei kleinere Wellen kreisen von beiden Seiten heran.', icon: '∿', damage: 4, kind: 'normal' as const },
        { id: 'wellenrolle', name: 'Schnelle Wellenrolle', telegraph: 'Das Wasser steigt rasch. Marea zielt auf eine angebrochene Säule.', icon: '≋', damage: 8, kind: 'heavy' as const, defendNegates: true, vulnerableAfterDefend: true },
        { id: 'panzer', name: 'Schwarzer Panzer', telegraph: 'Marea schliesst ihren Panzer. Nur schwarzes Glas bleibt sichtbar.', icon: '⬢', damage: 0, kind: 'guard' as const }
      ]
    }
  }
]

export const phase4Encounters: EncounterDefinition[] = [
  {
    id: 'begegnung_pfuetzenhopser', areaId: 'kuestenpfad', enemyId: 'pfuetzenhopser',
    label: 'Stelle dich dem Pfützenhopser', description: 'Das kleine Wasserwesen versperrt eine Muschelspur, kann aber umgangen werden.',
    fleeAreaId: 'drei_wege_platz', victoryText: 'Der Pfützenhopser platscht ins flache Wasser und hüpft davon.',
    rewardEffects: [{ kind: 'setFlag', flag: 'pfuetzenhopser_besiegt' }]
  },
  {
    id: 'begegnung_wasserwaechter', areaId: 'gezeitentempel', enemyId: 'wasserwaechter',
    label: 'Fordere den Wasserwächter heraus', description: 'Ein langsamer Wächter steht vor einer alten Tempeltruhe.',
    fleeAreaId: 'versunkene_bibliothek', victoryText: 'Der Wasserwächter senkt den Schild und wird wieder zu einer stillen Statue.',
    rewardEffects: [{ kind: 'setFlag', flag: 'wasserwaechter_besiegt' }]
  },
  {
    id: 'boss_marea', areaId: 'perlenbecken', enemyId: 'marea',
    label: 'Stelle dich Marea und ihrem Schattenpanzer', description: 'Gewöhnliche Waffen können das schwarze Glas nicht durchdringen. Ein Rückzug bleibt möglich.',
    fleeAreaId: 'gezeitentempel', victoryText: 'Das schwarze Glas wird zu klarem Wasser. Marea ist frei und legt das Gezeitensiegel vor dich.',
    rewardEffects: [
      { kind: 'setFlag', flag: 'marea_befreit' },
      { kind: 'addItem', itemId: 'gezeitensiegel', quantity: 1 },
      { kind: 'unlockPassage', passageId: 'p34' }
    ]
  }
]

export const phase2World: WorldDefinition = {
  areas: phase2Areas,
  passages: phase2Passages,
  items: phase2Items,
  interactions: phase2Interactions,
  enemies: phase4Enemies,
  encounters: phase4Encounters,
  startAreaId: 'sonnenwacht',
  sliceGoalFlag: 'phase2_abgeschlossen'
}
