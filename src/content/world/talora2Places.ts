import type { AreaDefinition, PassageDefinition, RegionDefinition, Requirement } from '../../domain/content'

export const talora2Regions: RegionDefinition[] = [
  { id: 'sonnenmark', name: 'Sonnenmark' },
  { id: 'wisperwald', name: 'Wisperwald' },
  { id: 'spiegelkueste', name: 'Spiegelküste' },
  { id: 'donnerhoehe', name: 'Donnerhöhe' },
  { id: 'verborgene_wege', name: 'Verborgene Wege' },
  { id: 'funkeninsel', name: 'Funkeninsel' },
  { id: 'frostsee', name: 'Frostsee' },
  { id: 'laternenmoor', name: 'Laternenmoor' },
  { id: 'reich_der_nacht', name: 'Reich der Nacht' }
]

type AreaSeed = [id: string, name: string, regionId: string, safe: boolean, text: string]

const areaSeeds: AreaSeed[] = [
  ['sm_sonnenwacht', 'Sonnenwacht', 'sonnenmark', true, 'Tessa wartet am warmen Herd. Auf dem Tisch liegen Apfelbrot und Kunos alte Karte.'],
  ['sm_festplatz', 'Festplatz', 'sonnenmark', false, 'Bunte Lichter hängen über dem Platz. Kunos Schatten steht ein Stück zu weit von ihm entfernt.'],
  ['sm_kartenstube', 'Kartenstube', 'sonnenmark', true, 'Alvas grosse Karte zeigt Blatt, Welle und Flügel. Kunos Wegbuch liegt offen daneben.'],
  ['sm_drei_wege_platz', 'Drei-Wege-Platz', 'sonnenmark', false, 'Drei helle Wegweiser zeigen zum Wald, zum Meer und zu den Bergen.'],
  ['sm_tempelgarten', 'Tempelgarten', 'sonnenmark', false, 'Kleine Glaslichter stehen zwischen weichem Moos. Ein loser Kartenrand steckt unter einer Bank.'],
  ['sm_morgen_tempel', 'Tempel der Morgenklinge', 'sonnenmark', false, 'Die Morgenklinge ruht weiter im Bannschloss. Tessa bewahrt Alvas leichtere Klinge für dich auf.'],
  ['sm_tor_sechs_zeichen', 'Tor der sechs Zeichen', 'sonnenmark', false, 'Sechs leere Zeichen warten im Stein. Drei gehören alten Freunden, drei neuen.'],

  ['ww_foersterhaus', 'Försterhaus', 'wisperwald', true, 'Lio hat Suppe gekocht. Vor dem Haus führen kleine Tierspuren in den stillen Wald.'],
  ['ww_mooslichtung', 'Mooslichtung', 'wisperwald', false, 'Hase, Igel und Reh haben verschiedene Spuren hinterlassen. Ihre Verstecke sind ganz nah.'],
  ['ww_gluehgarten', 'Glühgarten', 'wisperwald', false, 'Drei Glasblüten leuchten verschieden hell. Schwarze Ranken meiden ihr Licht.'],
  ['ww_alte_baumschule', 'Alte Baumschule', 'wisperwald', false, 'Junge Bäume wachsen in langen Reihen. Unter Mondmoos liegen Astholz und ein Kartenrand.'],
  ['ww_rankentor', 'Rankentor', 'wisperwald', false, 'Dicke Ranken halten das Tor zu. Tiefe Kerben warnen vor einem Rammstoss.'],
  ['ww_wipfelsteg', 'Wipfelsteg', 'wisperwald', false, 'Der Steg schwankt über den Bäumen. Ein Schild erklärt Kapphieb und Aufladung.'],
  ['ww_wurzelbruecke', 'Wurzelbrücke', 'wisperwald', false, 'Feste Wurzeln bilden einen Weg. Einige Lücken brauchen Astholz und Rankenseil.'],
  ['ww_wurzelheiligtum', 'Wurzelheiligtum', 'wisperwald', false, 'Arbor wartet zwischen alten Wurzeln. Sein Schatten steht allein vor der Dornenkrone.'],
  ['ww_dornenkrone', 'Dornenkrone', 'wisperwald', false, 'Schwarze Dornen umringen ein grünes Blattzeichen. Arbor ruft leise nach seinem Schatten.'],

  ['sk_muschelhafen', 'Muschelhafen', 'spiegelkueste', true, 'Nela bindet ein Boot fest. Drei Hafenlichter zeigen Ebbe, Mitte und Flut.'],
  ['sk_schleusensteg', 'Schleusensteg', 'spiegelkueste', false, 'Drei Tore halten das Wasser an. Pfeile zeigen, wie es wieder fliessen soll.'],
  ['sk_alter_leuchtturm', 'Alter Leuchtturm', 'spiegelkueste', false, 'Drei Spiegel warten auf Sonne, Welle und Boot. Falsche Schatten zittern an der Wand.'],
  ['sk_fischertreppe', 'Fischertreppe', 'spiegelkueste', false, 'Die trockene Treppe führt am Wasser vorbei. Eine lose Stufe kann repariert werden.'],
  ['sk_quellinsel', 'Quellinsel', 'spiegelkueste', false, 'Klares Wasser spritzt über flache Steine. Nasse Gegner fürchten Eis und Blitz.'],
  ['sk_muscheltor', 'Muscheltor', 'spiegelkueste', false, 'Ein grosser Panzer versperrt das Tor. Beim Hebezug öffnet sich eine helle Stelle.'],
  ['sk_schilfkanal', 'Schilfkanal', 'spiegelkueste', false, 'Schwemmholz und feste Wasserfasern treiben im ruhigen Kanal.'],
  ['sk_gezeitentempel', 'Gezeitentempel', 'spiegelkueste', false, 'Marea wartet im flachen Wasser. Ihr Schatten zieht Kreise vor dem letzten Weg.'],
  ['sk_perlenbecken', 'Perlenbecken', 'spiegelkueste', false, 'Dunkle Perlen liegen im stillen Becken. Im Wasser fehlen Namen und Gesichter.'],

  ['dh_kupferhof', 'Kupferhof', 'donnerhoehe', true, 'Tavi arbeitet unter einem sicheren Kupferdach. Blitzschutz hängt gut sichtbar an der Wand.'],
  ['dh_windhof', 'Windhof', 'donnerhoehe', false, 'Bänder zeigen die Windrichtung. Feste Halteseile führen durch den Hof.'],
  ['dh_warnmast', 'Warnmast', 'donnerhoehe', false, 'Drei Fahnen tragen Kreis, Streifen und Dreieck. Ihre Reihenfolge warnt vor Sturm.'],
  ['dh_spulengasse', 'Spulengasse', 'donnerhoehe', false, 'Kupferspulen summen immer lauter. Das Geräusch kündigt eine starke Ladung an.'],
  ['dh_erdungsfeld', 'Erdungsfeld', 'donnerhoehe', false, 'Drei Pfähle warten auf ihre Leitungen. Ein Ring liegt in einer trockenen Kiste.'],
  ['dh_wolkenbruecke', 'Wolkenbrücke', 'donnerhoehe', false, 'Ein kleiner Gleiter hängt schief über den Wolken. Segel und Korb müssen gleich schwer sein.'],
  ['dh_kristallmine', 'Kristallmine', 'donnerhoehe', false, 'Werkzeugstahl glitzert zwischen blauen Kristallen. Hier kann ein schwerer Hammer entstehen.'],
  ['dh_gewitterturm', 'Gewitterturm', 'donnerhoehe', false, 'Schwarze Federn laden sich am Turm auf. Voltaro bleibt zum Schutz aller am Boden.'],
  ['dh_adlerhorst', 'Adlerhorst', 'donnerhoehe', false, 'Der Horst liegt frei über den Wolken. Ein Flügelzeichen wartet auf Voltaros Schatten.'],

  ['vp_weglager', 'Weglager', 'verborgene_wege', true, 'Ein kleines Feuer brennt zwischen drei alten Wegen. Tessas Truhe steht neben einem freien Bett.'],
  ['vp_wegkreuz', 'Wegkreuz', 'verborgene_wege', false, 'Blatt, Welle und Flügel sind in helle Bodensteine geritzt.'],
  ['vp_wurzeltunnel', 'Wurzeltunnel', 'verborgene_wege', false, 'Wurzeln bilden einen trockenen Tunnel. An der Wand steht: Er wird mich wieder vergessen.'],
  ['vp_aquaedukt', 'Alter Aquädukt', 'verborgene_wege', false, 'Wasser tropft über Alvas alte Zeichen. Eine zweite Schattennachricht wartet im Stein.'],
  ['vp_fernwegtor', 'Fernwegtor', 'verborgene_wege', false, 'Drei Plätze warten auf Blatt, Welle und Flügel. Dahinter liegen drei unbekannte Wege.'],

  ['fi_gluthafen', 'Gluthafen', 'funkeninsel', true, 'Nima winkt am schwarzen Strand. Eine rote Tafel warnt vor der offenen Glut.'],
  ['fi_suppenkueche', 'Suppenküche', 'funkeninsel', true, 'Warme Suppe steht bereit. An der Wand hängt ein einfaches Rezept für den Feuermantel.'],
  ['fi_ofenfaserhang', 'Ofenfaserhang', 'funkeninsel', false, 'Helle Fasern wachsen im kühlen Schatten. Sie schützen Hände und Mantel vor Feuer.'],
  ['fi_glutschalenfeld', 'Glutschalenfeld', 'funkeninsel', false, 'Sichere Glutschalen tragen weisse Ringe. Nimas lange Zange erreicht sie.'],
  ['fi_rotglasgrotte', 'Rotglasgrotte', 'funkeninsel', false, 'Rotes Glas leuchtet in einer warmen Höhle. Eine Klappe lässt frische Luft herein.'],
  ['fi_ascheterrasse', 'Ascheterrasse', 'funkeninsel', false, 'Wind malt Wege in die Asche. Ein Kartenrand steckt unter einer kalten Platte.'],
  ['fi_waagehaus', 'Waagehaus', 'funkeninsel', false, 'Zwei Nestseiten brauchen gleich viel Wärme. Glutschalen liegen neben der Waage.'],
  ['fi_kuehlrinne', 'Kühlrinne', 'funkeninsel', false, 'Klares Wasser wartet hinter einem kleinen Schieber. Es kann den heissen Weg kühlen.'],
  ['fi_ofenring', 'Ofenring', 'funkeninsel', false, 'Eine Glutwalze rollt um den Ofen. Ein freier Weg führt zurück zum Hafen.'],
  ['fi_glutbruecke', 'Glutbrücke', 'funkeninsel', false, 'Die Brücke ist heiss, aber stabil. Ein Schild fragt nach Mantel und Eis.'],
  ['fi_aschennest_vorraum', 'Vorraum des Aschennests', 'funkeninsel', false, 'Drei kurze Sätze erklären Feuer, Nass und Eis. Hinter der Tür piepst ein Ei.'],
  ['fi_feuervogelnest', 'Feuervogelnest', 'funkeninsel', false, 'Ein junges Ei liegt unter schwarzer Asche. Kunos Schatten hält die heisse Decke hoch.'],

  ['fs_uferhaus', 'Uferhaus', 'frostsee', true, 'Eli zeigt eine Sternkarte. Er hat einen blauen Stern über dem See gesehen.'],
  ['fs_waermestube', 'Wärmestube', 'frostsee', true, 'Decken und warmer Saft stehen bereit. Ein Schnittmuster zeigt das Wärmewams.'],
  ['fs_sternarchiv', 'Sternarchiv', 'frostsee', false, 'Elis ganzer Bericht liegt auf einem niedrigen Pult. Kein Wort ist durchgestrichen.'],
  ['fs_firnufer', 'Firnufer', 'frostsee', false, 'Weiche Firnfelle hängen in alten Wärmenetzen. Niemand braucht sie mehr.'],
  ['fs_kaltperlengrotte', 'Kaltperlengrotte', 'frostsee', false, 'Blaue Perlen liegen im trockenen Teil der Grotte. Ihre Kälte kribbelt in der Hand.'],
  ['fs_klarglassteg', 'Klarglassteg', 'frostsee', false, 'Der klare Steg spiegelt Sterne und Wolken. Ein Kartenrand liegt unter Glas.'],
  ['fs_sternsaal', 'Sternsaal', 'frostsee', false, 'Ein blauer Stern zeigt morgens nach links. Elis Zeichnung liegt daneben.'],
  ['fs_spiegelhof', 'Spiegelhof', 'frostsee', false, 'Drei Spiegel sind mit Reif bedeckt. Feuer löst die gefrorenen Gelenke.'],
  ['fs_eistreppe', 'Eistreppe', 'frostsee', false, 'Ein Reifjäger bewacht nur den Aufstieg. Das warme Ufer bleibt frei.'],
  ['fs_kuppelgang', 'Kuppelgang', 'frostsee', false, 'Kalter Wind drückt durch den Gang. Ein Schild erinnert an das Wärmewams.'],
  ['fs_sternennest_vorraum', 'Vorraum des Sternennests', 'frostsee', false, 'Bilder zeigen Spiegelpanzer, Feuer und einen heilenden Zug.'],
  ['fs_sternenkuppel', 'Sternenkuppel', 'frostsee', false, 'Unter dem klaren Eis schwimmen gestohlene Schatten. Der blaue Stern steht darüber.'],

  ['lm_stelzendorf', 'Stelzendorf', 'laternenmoor', true, 'Pavo und Luma warten auf einem trockenen Steg. Der Laternenfuchs ist fort.'],
  ['lm_laternenhaus', 'Laternenhaus', 'laternenmoor', true, 'Luma baut Blenden und Lampen. Stoff, Proviant und kurze Baupläne liegen bereit.'],
  ['lm_torfgarten', 'Torfgarten', 'laternenmoor', false, 'Helle Inseln tragen feste Moorfasern. Dunkle Inseln bleiben unberührt.'],
  ['lm_schilfpfad', 'Schilfpfad', 'laternenmoor', false, 'Kleine Pfoten, eine Schleifspur und falsche Doppelkerben kreuzen den Pfad.'],
  ['lm_schwarzteich', 'Schwarzteich', 'laternenmoor', false, 'Natürliches Schattenlicht liegt ruhig auf dem Wasser. Dunkelglas glänzt am Ufer.'],
  ['lm_blendengang', 'Blendengang', 'laternenmoor', false, 'Helle Blenden schneiden Wege in den Nebel. Versteckte Flügel werfen kurze Schatten.'],
  ['lm_nebelsteg', 'Nebelsteg', 'laternenmoor', false, 'Ring, Kerbe und Doppelstrich stehen auf drei Pfählen.'],
  ['lm_lichtinsel', 'Lichtinsel', 'laternenmoor', false, 'Ein fester Lichtkreis liegt über dem Moor. Hier kann nichts lange verborgen bleiben.'],
  ['lm_schattenwehr', 'Schattenwehr', 'laternenmoor', false, 'Eine Dunstschwinge bewacht den Hinweg. Zwei sichere Wege führen zurück.'],
  ['lm_nachtpfad', 'Nachtpfad', 'laternenmoor', false, 'Schwarzer Nebel liegt auf dem Pfad. Eine Tafel nennt Umhang, Licht und Heilzug.'],
  ['lm_schwarze_laterne', 'Schwarze Laterne', 'laternenmoor', false, 'Der echte Fuchs sitzt hinter einer riesigen Laterne. Viele falsche Spuren enden hier.'],

  ['rn_rand_der_nacht', 'Rand der Nacht', 'reich_der_nacht', true, 'Tessa hat ein Licht und frisches Apfelbrot aufgestellt. Alle offenen Wege bleiben hinter dir.'],
  ['rn_sternentreppe', 'Sternentreppe', 'reich_der_nacht', false, 'Jede Stufe zeigt den nächsten Schlag. Feuer, Eis und Blitz leuchten klar.'],
  ['rn_halle_der_echos', 'Halle der Echos', 'reich_der_nacht', false, 'Kunos eigene Worte kommen aus zwei Richtungen zurück. Sein Schatten wartet still.'],
  ['rn_weltenkammer', 'Weltenkammer', 'reich_der_nacht', false, 'Raugrims Fäden führen zu sieben Schatten. Jeder erinnert sich an einen gemeinsamen Weg.']
]

const regionById = new Map(talora2Regions.map((region) => [region.id, region]))
const regionOrigins: Record<string, { x: number; y: number }> = {
  sonnenmark: { x: 400, y: 330 }, wisperwald: { x: 120, y: 340 }, spiegelkueste: { x: 650, y: 560 },
  donnerhoehe: { x: 650, y: 100 }, verborgene_wege: { x: 1020, y: 340 }, funkeninsel: { x: 1280, y: 570 },
  frostsee: { x: 1280, y: 90 }, laternenmoor: { x: 1320, y: 330 }, reich_der_nacht: { x: 420, y: 650 }
}

const regionIndexes = new Map<string, number>()
export const talora2Areas: AreaDefinition[] = areaSeeds.map(([id, name, regionId, safe, text]) => {
  const index = regionIndexes.get(regionId) ?? 0
  regionIndexes.set(regionId, index + 1)
  const origin = regionOrigins[regionId]
  const column = index % 4
  const row = Math.floor(index / 4)
  return {
    id, name, regionId, regionName: regionById.get(regionId)!.name, safe,
    mapPosition: { x: origin.x + column * 72, y: origin.y + row * 72 },
    firstDescription: text,
    revisitDescription: `${name} ist dir nun vertraut. ${text}`,
    inspectText: text
  }
})

const flag = (value: string): Requirement => ({ kind: 'flag', flag: value })
const anyFlags = (...values: string[]): Requirement => ({ kind: 'any', requirements: values.map(flag) })
const allFlags = (...values: string[]): Requirement => ({ kind: 'all', requirements: values.map(flag) })
const item = (itemId: string): Requirement => ({ kind: 'item', itemId })
const equipped = (slot: 'weapon' | 'body', itemId: string): Requirement => ({ kind: 'equipped', slot, itemId })

const nearFlags = ['arbors_schatten_zurueck', 'mareas_schatten_zurueck', 'voltaros_schatten_zurueck']
const outerFlags = ['feuervogel_gerettet', 'sternenschatten_gerettet', 'laternenfuchs_gerettet']

type PassageSeed = [id: string, from: string, to: string, requirement?: Requirement, guard?: string, shortcut?: boolean, blocked?: string]
const passageSeeds: PassageSeed[] = [
  ['v001', 'sm_sonnenwacht', 'sm_festplatz'], ['v002', 'sm_sonnenwacht', 'sm_kartenstube'], ['v003', 'sm_sonnenwacht', 'sm_drei_wege_platz'],
  ['v004', 'sm_festplatz', 'sm_drei_wege_platz', flag('schattenzipfel_beruhigt')],
  ['v005', 'sm_drei_wege_platz', 'sm_tempelgarten', flag('area_untersucht:sm_festplatz')],
  ['v006', 'sm_sonnenwacht', 'sm_morgen_tempel', flag('tessa_gesprochen')],
  ['v007', 'sm_festplatz', 'sm_tor_sechs_zeichen', flag('prolog_abgeschlossen')],
  ['v008', 'sm_tempelgarten', 'sm_tor_sechs_zeichen', anyFlags(...nearFlags), undefined, true],

  ['v009', 'ww_foersterhaus', 'ww_mooslichtung'], ['v010', 'ww_foersterhaus', 'ww_gluehgarten'], ['v011', 'ww_foersterhaus', 'ww_rankentor'],
  ['v012', 'ww_mooslichtung', 'ww_wurzelbruecke', flag('tierpfade_gelesen')], ['v013', 'ww_mooslichtung', 'ww_alte_baumschule'],
  ['v014', 'ww_gluehgarten', 'ww_wipfelsteg', flag('glasblueten_ausgerichtet')], ['v015', 'ww_gluehgarten', 'ww_alte_baumschule', flag('area_untersucht:ww_alte_baumschule')],
  ['v016', 'ww_rankentor', 'ww_wipfelsteg', undefined, 'enc_ww_dornenstampfer'], ['v017', 'ww_wipfelsteg', 'ww_wurzelbruecke'],
  ['v018', 'ww_wurzelbruecke', 'ww_wurzelheiligtum', flag('wurzelbruecke_repariert')],
  ['v019', 'ww_alte_baumschule', 'ww_wurzelheiligtum', flag('tierpfade_gelesen'), undefined, true],
  ['v020', 'ww_wurzelheiligtum', 'ww_dornenkrone', undefined, 'enc_ww_arbors_schatten'],

  ['v021', 'sk_muschelhafen', 'sk_schleusensteg'], ['v022', 'sk_muschelhafen', 'sk_alter_leuchtturm'], ['v023', 'sk_muschelhafen', 'sk_fischertreppe'],
  ['v024', 'sk_schleusensteg', 'sk_alter_leuchtturm'], ['v025', 'sk_schleusensteg', 'sk_quellinsel', flag('schleuse_geloest')],
  ['v026', 'sk_alter_leuchtturm', 'sk_schilfkanal', flag('leuchtturm_ausgerichtet')], ['v027', 'sk_fischertreppe', 'sk_schilfkanal'],
  ['v028', 'sk_quellinsel', 'sk_muscheltor', flag('area_untersucht:sk_quellinsel')], ['v029', 'sk_muscheltor', 'sk_gezeitentempel', undefined, 'enc_sk_muschelbrecher'],
  ['v030', 'sk_schilfkanal', 'sk_gezeitentempel', flag('fischertreppe_repariert'), undefined, true],
  ['v031', 'sk_gezeitentempel', 'sk_perlenbecken', undefined, 'enc_sk_mareas_schatten'],
  ['v032', 'sk_fischertreppe', 'sk_perlenbecken', flag('mareas_schatten_zurueck'), undefined, true],

  ['v033', 'dh_kupferhof', 'dh_windhof'], ['v034', 'dh_kupferhof', 'dh_warnmast'], ['v035', 'dh_kupferhof', 'dh_erdungsfeld'],
  ['v036', 'dh_windhof', 'dh_warnmast'], ['v037', 'dh_windhof', 'dh_spulengasse', flag('warnfahnen_gesetzt')], ['v038', 'dh_warnmast', 'dh_wolkenbruecke'],
  ['v039', 'dh_spulengasse', 'dh_erdungsfeld'], ['v040', 'dh_spulengasse', 'dh_kristallmine', flag('windruf_geloest')],
  ['v041', 'dh_erdungsfeld', 'dh_kristallmine', flag('pfahle_geerdet'), undefined, true],
  ['v042', 'dh_wolkenbruecke', 'dh_gewitterturm', flag('gleiter_ausgerichtet')], ['v043', 'dh_kristallmine', 'dh_gewitterturm', undefined, 'enc_dh_kupferlaeufer'],
  ['v044', 'dh_gewitterturm', 'dh_adlerhorst', undefined, 'enc_dh_voltaros_schatten'],

  ['v045', 'vp_weglager', 'vp_wegkreuz', anyFlags(...nearFlags)], ['v046', 'vp_weglager', 'vp_wurzeltunnel', flag('arbors_schatten_zurueck')],
  ['v047', 'vp_weglager', 'vp_aquaedukt', flag('mareas_schatten_zurueck')], ['v048', 'vp_wegkreuz', 'vp_wurzeltunnel', flag('wegkreuz_geloest'), undefined, true],
  ['v049', 'vp_wegkreuz', 'vp_aquaedukt', flag('wegkreuz_geloest'), undefined, true], ['v050', 'vp_wegkreuz', 'vp_fernwegtor', allFlags(...nearFlags)],

  ['v051', 'fi_gluthafen', 'fi_suppenkueche'], ['v052', 'fi_gluthafen', 'fi_ofenfaserhang'], ['v053', 'fi_suppenkueche', 'fi_waagehaus', flag('feuermantel_rezept')],
  ['v054', 'fi_ofenfaserhang', 'fi_glutschalenfeld', flag('nimas_zange_erhalten')], ['v055', 'fi_ofenfaserhang', 'fi_ascheterrasse'],
  ['v056', 'fi_glutschalenfeld', 'fi_rotglasgrotte', flag('hitzeklappe_geoeffnet')], ['v057', 'fi_rotglasgrotte', 'fi_ascheterrasse', flag('grotte_gelueftet'), undefined, true],
  ['v058', 'fi_ascheterrasse', 'fi_waagehaus'], ['v059', 'fi_waagehaus', 'fi_kuehlrinne', flag('nestwaage_geloest')],
  ['v060', 'fi_kuehlrinne', 'fi_ofenring', flag('kuehlrinne_geoeffnet')],
  ['v061', 'fi_ofenring', 'fi_glutbruecke', item('item_armor_feuermantel'), 'enc_fi_glutwalze'],
  ['v062', 'fi_waagehaus', 'fi_ofenring', flag('nestwaage_geloest'), undefined, true], ['v063', 'fi_glutbruecke', 'fi_aschennest_vorraum'],
  ['v064', 'fi_aschennest_vorraum', 'fi_feuervogelnest', item('item_armor_feuermantel'), 'enc_fi_aschenbrueter'],

  ['v065', 'fs_uferhaus', 'fs_waermestube'], ['v066', 'fs_uferhaus', 'fs_sternarchiv'], ['v067', 'fs_waermestube', 'fs_firnufer', flag('waermewams_rezept')],
  ['v068', 'fs_sternarchiv', 'fs_sternsaal'], ['v069', 'fs_sternarchiv', 'fs_klarglassteg', flag('elis_sterntext_geloest')],
  ['v070', 'fs_firnufer', 'fs_kaltperlengrotte'], ['v071', 'fs_kaltperlengrotte', 'fs_klarglassteg', flag('area_untersucht:fs_kaltperlengrotte')],
  ['v072', 'fs_klarglassteg', 'fs_spiegelhof', flag('spiegel_ausgerichtet'), undefined, true], ['v073', 'fs_sternsaal', 'fs_spiegelhof', flag('elis_sterntext_geloest')],
  ['v074', 'fs_spiegelhof', 'fs_eistreppe', undefined, 'enc_fs_reifjaeger'], ['v075', 'fs_firnufer', 'fs_sternsaal', flag('area_untersucht:fs_firnufer')],
  ['v076', 'fs_eistreppe', 'fs_kuppelgang'], ['v077', 'fs_kuppelgang', 'fs_sternennest_vorraum', equipped('body', 'item_armor_waermewams')],
  ['v078', 'fs_sternennest_vorraum', 'fs_sternenkuppel', item('item_armor_waermewams'), 'enc_fs_sternenfresser'],

  ['v079', 'lm_stelzendorf', 'lm_laternenhaus'], ['v080', 'lm_stelzendorf', 'lm_torfgarten'], ['v081', 'lm_laternenhaus', 'lm_schilfpfad', flag('fuchsspur_gelesen')],
  ['v082', 'lm_laternenhaus', 'lm_blendengang', flag('laternenblenden_geordnet')], ['v083', 'lm_torfgarten', 'lm_schilfpfad'],
  ['v084', 'lm_torfgarten', 'lm_schwarzteich'], ['v085', 'lm_schwarzteich', 'lm_nebelsteg', flag('pfahlzeichen_gelesen')],
  ['v086', 'lm_schilfpfad', 'lm_nebelsteg', flag('fuchsspur_geloest')], ['v087', 'lm_blendengang', 'lm_nebelsteg', flag('laternenblenden_geordnet'), undefined, true],
  ['v088', 'lm_blendengang', 'lm_lichtinsel'], ['v089', 'lm_nebelsteg', 'lm_lichtinsel', flag('lichtweg_gelegt'), undefined, true],
  ['v090', 'lm_lichtinsel', 'lm_schattenwehr', undefined, 'enc_lm_dunstschwinge'],
  ['v091', 'lm_schattenwehr', 'lm_nachtpfad', item('item_armor_schattenumhang')],
  ['v092', 'lm_nachtpfad', 'lm_schwarze_laterne', item('item_armor_schattenumhang'), 'enc_lm_nachtlaterne'],

  ['v093', 'rn_rand_der_nacht', 'rn_sternentreppe', undefined, 'enc_rn_schattenhand'],
  ['v094', 'rn_sternentreppe', 'rn_halle_der_echos', undefined, 'enc_rn_wandelpanzer'],
  ['v095', 'rn_halle_der_echos', 'rn_weltenkammer', undefined, 'enc_rn_echozwilling'],
  ['v096', 'sm_drei_wege_platz', 'ww_foersterhaus', flag('prolog_abgeschlossen')],
  ['v097', 'sm_morgen_tempel', 'sk_muschelhafen', flag('prolog_abgeschlossen')],
  ['v098', 'sm_tempelgarten', 'dh_kupferhof', flag('prolog_abgeschlossen')],
  ['v099', 'ww_dornenkrone', 'vp_wurzeltunnel', flag('arbors_schatten_zurueck')],
  ['v100', 'sk_perlenbecken', 'vp_aquaedukt', flag('mareas_schatten_zurueck')],
  ['v101', 'dh_adlerhorst', 'vp_weglager', flag('voltaros_schatten_zurueck')],
  ['v102', 'vp_fernwegtor', 'fi_gluthafen', allFlags(...nearFlags)], ['v103', 'vp_fernwegtor', 'fs_uferhaus', allFlags(...nearFlags)],
  ['v104', 'vp_fernwegtor', 'lm_stelzendorf', allFlags(...nearFlags)], ['v105', 'sm_tor_sechs_zeichen', 'rn_rand_der_nacht', allFlags(...outerFlags)],
  ['v106', 'ww_wurzelbruecke', 'fi_ascheterrasse', allFlags('arbors_schatten_zurueck', ...nearFlags), undefined, true],
  ['v107', 'sk_fischertreppe', 'lm_schilfpfad', allFlags('mareas_schatten_zurueck', ...nearFlags), undefined, true],
  ['v108', 'dh_wolkenbruecke', 'fs_klarglassteg', allFlags('voltaros_schatten_zurueck', ...nearFlags), undefined, true]
]

const areaNames = new Map(talora2Areas.map((area) => [area.id, area.name]))
export const talora2Passages: PassageDefinition[] = passageSeeds.map(([id, fromAreaId, toAreaId, requirement, guardEncounterId, shortcut, blockedText]) => ({
  id, fromAreaId, toAreaId,
  labelFrom: `${shortcut ? 'Nimm die Abkürzung' : 'Gehe'} zu ${areaNames.get(toAreaId)}`,
  labelTo: `${shortcut ? 'Nimm die Abkürzung' : 'Gehe'} zu ${areaNames.get(fromAreaId)}`,
  requirement, guardEncounterId, shortcut,
  blockedText: blockedText ?? (guardEncounterId ? 'Ein Gegner bewacht diesen Hinweg. Der Weg zum Rastplatz bleibt frei.' : 'Dieser Weg öffnet sich später in der Geschichte.')
}))
