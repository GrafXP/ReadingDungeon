import type { AreaDefinition, ItemDefinition, WorldDefinition } from '../domain/content'
import type { GameSave } from '../domain/game'
import { otherEnd } from './actions'
import { evaluateRequirement } from './requirements'

export interface QuestView {
  id: string
  title: string
  description: string
  done: boolean
  current: boolean
  hint: string
  hintAreaIds?: string[]
}

export function getCurrentArea(save: GameSave, world: WorldDefinition): AreaDefinition {
  const area = world.areas.find((entry) => entry.id === save.currentAreaId)
  if (!area) throw new Error(`Unbekannter aktueller Ort: ${save.currentAreaId}`)
  return area
}

export function getAreaDescription(save: GameSave, area: AreaDefinition): string {
  const changed = area.variants?.find((variant) => evaluateRequirement(variant.requirement, save).met)
  if (changed) return changed.description
  return save.deliveredDialogueIds.includes(`area_intro:${area.id}`)
    ? area.revisitDescription
    : area.firstDescription
}

export function getAreaInspectText(save: GameSave, area: AreaDefinition): string {
  return area.variants?.find((variant) => evaluateRequirement(variant.requirement, save).met)?.inspectText ?? area.inspectText
}

export function getKnownAreaIds(save: GameSave, world: WorldDefinition): string[] {
  if (save.flags.includes('karte_vollstaendig')) return world.areas.map((area) => area.id)
  const known = new Set(save.visitedAreaIds)
  for (const area of world.areas) {
    if (save.discoveredClueIds.includes(`hinweis_ort:${area.id}`)) known.add(area.id)
  }
  for (const passage of world.passages) {
    if (save.flags.includes(`area_untersucht:${passage.fromAreaId}`)) known.add(passage.toAreaId)
    if (save.flags.includes(`area_untersucht:${passage.toAreaId}`)) known.add(passage.fromAreaId)
  }
  return [...known]
}

export function getInventoryItems(save: GameSave, world: WorldDefinition): Array<{ item: ItemDefinition; quantity: number }> {
  return Object.entries(save.player.inventory)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => ({ item: world.items.find((entry) => entry.id === id), quantity }))
    .filter((entry): entry is { item: ItemDefinition; quantity: number } => Boolean(entry.item))
}

export function getQuestViews(save: GameSave): QuestView[] {
  const has = (itemId: string) => (save.player.inventory[itemId] ?? 0) > 0
  const done = (gameFlag: string) => save.flags.includes(gameFlag)

  if (done('raugrim_verbannt')) {
    const mapEdges = ['karte_mut', 'karte_arbor', 'karte_marea', 'karte_voltaro', 'karte_kompass', 'karte_rueckgabe']
      .filter((clue) => save.discoveredClueIds.includes(clue)).length
    return [{
      id: 'nachspiel', title: 'Taloras Morgen ist zurück',
      description: `${mapEdges} von 6 Kartenrändern gefunden. Alle Regionen und Geheimnisse bleiben erreichbar.`,
      done: mapEdges === 6, current: mapEdges < 6,
      hint: 'Kartenränder liegen im Garten, in der Baumschule, Bibliothek, Himmelswerft, im Wurzeltunnel und in der Weltenkammer.',
      hintAreaIds: [['karte_mut', 'garten_der_namen'], ['karte_arbor', 'alte_baumschule'], ['karte_marea', 'versunkene_bibliothek'], ['karte_voltaro', 'himmelswerft'], ['karte_kompass', 'wurzeltunnel'], ['karte_rueckgabe', 'weltenkammer']].filter(([clue]) => !save.discoveredClueIds.includes(clue)).map(([, area]) => area)
    }, {
      id: 'karte_zusammensetzen', title: 'Vervollständige Alvas Karte',
      description: done('karte_vollstaendig') ? 'Tessa hat mit dir die sechs Kartenränder zusammengesetzt.' : 'Bringe alle sechs Kartenränder zu Tessa nach Sonnenwacht.',
      done: done('karte_vollstaendig'), current: mapEdges === 6 && !done('karte_vollstaendig'),
      hint: 'Sprich in Sonnenwacht mit Tessa über die vollständige Karte.', hintAreaIds: ['sonnenwacht']
    }, ...getRepairQuests(save), {
      id: 'kinder', title: 'Besuche die Kinder auf dem Platz',
      description: 'Nach den drei kleinen Reparaturen treffen sich die Kinder auf dem Drei-Wege-Platz.',
      done: done('kinder_angehoert'), current: getRepairQuests(save).every((quest) => quest.done) && !done('kinder_angehoert'),
      hint: 'Repariere Vogelhaus, Spielzeugboot und Windrad und höre den Kindern auf dem Drei-Wege-Platz zu.', hintAreaIds: ['drei_wege_platz']
    }]
  }

  if (done('endtor_offen')) {
    return [
      { id: 'letzter_weg', title: 'Folge dem letzten Weg', description: 'Gehe über Sternentreppe und Halle der Echos zum Rastplatz am Rand der Nacht.', done: save.visitedAreaIds.includes('rand_der_nacht'), current: !save.visitedAreaIds.includes('rand_der_nacht'), hint: 'Der Weg beginnt hinter dem Tor der sechs Zeichen am Drei-Wege-Platz.', hintAreaIds: ['tor_der_sechs_zeichen'] },
      { id: 'raugrim', title: 'Verbanne Raugrim', description: 'Öffne in jeder Kampfphase den Schattenriss und setze das angezeigte Siegel. Sprich danach Alvas Versprechen.', done: false, current: save.visitedAreaIds.includes('rand_der_nacht'), hint: 'Raste am Rand der Nacht. Verteidige schwere Angriffe; nutze bei höchstens acht Leben Apfelbrot, wenn eine ruhigere Bewegung folgt. Setze nach jeder Phase das leuchtende Siegel und sprich am Ende Alvas Versprechen.', hintAreaIds: ['rand_der_nacht'] }
    ]
  }

  if (has('morgenklinge')) {
    const guardians = [
      ['arbor', 'Arbor im Wisperwald', 'arbor_befreit', 'Dornenkrone', 'Verteidige dich, wenn Arbor scharrt; sein Geweih bleibt dann kurz stecken.'],
      ['marea', 'Marea an der Spiegelküste', 'marea_befreit', 'Perlenbecken', 'Verteidige dich, wenn das Wasser vor der Wellenrolle steigt.'],
      ['voltaro', 'Voltaro auf der Donnerhöhe', 'voltaro_befreit', 'Adlerhorst', 'Verteidige dich beim angekündigten Sturzflug; am Boden liegt eine Blitzader offen.']
    ] as const
    const results = guardians.map(([id, title, gameFlag, place, hint]) => ({
      id, title: done(gameFlag) ? `${title} ist frei` : `Befreie ${title}`,
      description: done(gameFlag) ? `Das Siegel aus ${place} gehört dir.` : `Der Wächter wartet in ${place}. Die Reihenfolge ist frei.`,
      done: done(gameFlag), current: !done(gameFlag), hint,
      hintAreaIds: [id === 'arbor' ? 'dornenkrone' : id === 'marea' ? 'perlenbecken' : 'adlerhorst']
    }))
    const allFreed = guardians.every(([, , gameFlag]) => done(gameFlag))
    return [...results, {
      id: 'endtor', title: allFreed ? 'Öffne das Tor der sechs Zeichen' : 'Sammle drei Wächtersiegel',
      description: allFreed ? 'Zeige Morgenklinge und alle drei Siegel am Tor.' : `${guardians.filter(([, , gameFlag]) => done(gameFlag)).length} von 3 Wächtern befreit.`,
      done: false, current: allFreed, hint: 'Das Tor steht direkt am Drei-Wege-Platz.', hintAreaIds: ['tor_der_sechs_zeichen']
    }]
  }

  const sunDone = has('sonnenfunke') || done('sonnenfunke_erhalten')
  const sourceDone = has('quelltraene') || done('quelltraene_erhalten')
  const windDone = has('windlied') || done('windlied_erhalten')
  const gifts = [sunDone, sourceDone, windDone].filter(Boolean).length
  return [
    {
      id: 'sonnenfunke', title: sunDone ? 'Sonnenfunke gefunden' : 'Entfache den Sonnenfunken',
      description: sunDone ? 'Der Leuchtturm strahlt wieder.' : 'Finde Sonnenspiegel und Goldbeeren, hilf Lio und repariere den Alten Leuchtturm.',
      done: sunDone, current: !sunDone,
      hint: !has('sonnenspiegel') ? (has('archivschluessel') ? 'Öffne mit dem Archivschlüssel das Kartenarchiv in der Versunkenen Bibliothek.' : 'Untersuche und ordne die Symbolsteine im Garten der Namen. Der Archivschlüssel öffnet die Versunkene Bibliothek.')
        : has('leuchtoel') ? 'Untersuche den Alten Leuchtturm, richte seine drei Spiegel aus und entfache den Sonnenfunken.'
          : !has('goldbeeren') ? 'Untersuche die Mooslichtung und pflücke die reifen Goldbeeren.'
            : !done('schattenmotten_besiegt') ? 'Vertreibe die Schattenmotten im Glühgarten. Verteidige dich gegen ihren angekündigten Sturz.'
              : 'Presse im Glühgarten mit Lio das Leuchtöl aus deinen Goldbeeren.',
      hintAreaIds: [!has('sonnenspiegel') ? (has('archivschluessel') ? 'versunkene_bibliothek' : 'garten_der_namen') : has('leuchtoel') ? 'alter_leuchtturm' : !has('goldbeeren') ? 'mooslichtung' : 'gluehgarten']
    },
    {
      id: 'quelltraene', title: sourceDone ? 'Quellträne gefunden' : 'Reinige die Quelle',
      description: sourceDone ? 'Der Aquädukt ist wieder offen.' : 'Berge das Schleusenrad, finde Mondmoos und repariere das Schleusenhaus.',
      done: sourceDone, current: !sourceDone,
      hint: done('schleuse_repariert') ? 'Empfange die Quellträne in der Korallengrotte.' : has('schleusenrad') && has('mondmoos') ? 'Setze im Schleusenhaus Zulauf und Quelltor auf offen, den Ablauf auf geschlossen.' : done('schleusenrad_geborgen') ? 'Mondmoos wächst in der Alten Baumschule.' : has('hebelstange') ? 'Heble mit deiner Hebelstange den schweren Stand am Überfluteten Markt hoch und berge das Schleusenrad.' : 'Nimm die Hebelstange am Alten Markt mit zum überfluteten Markt.',
      hintAreaIds: [done('schleuse_repariert') ? 'korallengrotte' : has('schleusenrad') && has('mondmoos') ? 'schleusenhaus' : done('schleusenrad_geborgen') ? 'alte_baumschule' : has('hebelstange') ? 'ueberfluteter_markt' : 'alter_markt']
    },
    {
      id: 'windlied', title: windDone ? 'Windlied gefunden' : 'Bringe die Windorgel zum Klingen',
      description: windDone ? 'Die Windfähre fährt wieder.' : 'Hole Silberpfeife und Kletterseil; erreiche damit die Sturmfeder.',
      done: windDone, current: !windDone,
      hint: !has('silberpfeife') ? 'Das sichtbare Echo in der Kristallmine öffnet die Werkzeugkammer.'
        : has('sturmfeder') ? 'Untersuche die Windorgel. Stelle ihre Flügel ein und spiele Kreis–Stern–Welle.'
          : has('kletterseil') ? 'Benutze dein Kletterseil am Wettermast der Wolkenbrücke und berge die Sturmfeder.'
            : done('netzkrabbler_besiegt') ? 'Berge das freigelegte Kletterseil im Spinnenhain.' : 'Löse im Spinnenhain das Kletterseil vom Netzkrabbler. Verteidige dich gegen den angekündigten Netzsprung.',
      hintAreaIds: [!has('silberpfeife') ? 'kristallmine' : has('sturmfeder') ? 'windorgel' : has('kletterseil') ? 'wolkenbruecke' : 'spinnenhain']
    },
    {
      id: 'morgenklinge', title: gifts === 3 ? 'Erwecke die Morgenklinge' : 'Sammle die drei Gaben',
      description: `${gifts} von 3 Gaben sind bereit.`, done: false, current: gifts === 3,
      hint: 'Bringe Sonnenfunke, Quellträne und Windlied zum Tempel am Drei-Wege-Platz.', hintAreaIds: ['morgen_tempel']
    }
  ]
}

export function getMainGoal(save: GameSave): { title: string; description: string } {
  if (save.flags.includes('raugrim_verbannt')) return { title: 'Erkunde Talora im neuen Morgen', description: 'Alle Wege bleiben offen. Finde Geheimnisse oder kehre zu deinen Freunden zurück.' }
  if (save.flags.includes('endtor_offen')) return { title: 'Verbanne Raugrim', description: 'Folge dem letzten Weg, setze im Kampf alle drei Siegel und sprich Alvas Versprechen.' }
  if (['arbor_befreit', 'marea_befreit', 'voltaro_befreit'].every((flag) => save.flags.includes(flag))) return { title: 'Öffne das Tor der sechs Zeichen', description: 'Zeige am Tor beim Drei-Wege-Platz die Morgenklinge und alle drei Wächtersiegel.' }
  if ((save.player.inventory.morgenklinge ?? 0) > 0) return { title: 'Befreie die drei Wächter', description: 'Arbor, Marea und Voltaro können in beliebiger Reihenfolge befreit werden.' }
  if (!save.visitedAreaIds.includes('morgen_tempel') && !['sonnenfunke_erhalten', 'quelltraene_erhalten', 'windlied_erhalten'].some((flag) => save.flags.includes(flag))) return { title: 'Suche den Tempel der Morgenklinge', description: 'Gehe mit Kuno über den Drei-Wege-Platz zum Tempel. Dort erfährst du, wie du Talora helfen kannst.' }
  return { title: 'Erwecke die Morgenklinge', description: 'Finde Sonnenfunke, Quellträne und Windlied in beliebiger Reihenfolge.' }
}

function getRepairQuests(save: GameSave): QuestView[] {
  return [
    ['vogelhaus', 'Repariere das Vogelhaus', 'vogelhaus_repariert', 'Die passende Holzleiste liegt am Försterhaus.'],
    ['spielzeugboot', 'Repariere das Spielzeugboot', 'spielzeugboot_repariert', 'Knüpfe im Muschelhafen die Segelschnur neu.'],
    ['windrad', 'Repariere das kleine Windrad', 'windrad_repariert', 'Setze im Kupferhof das lose Windradblatt wieder richtig ein.']
  ].map(([id, title, flag, hint]) => ({ id, title, description: save.flags.includes(flag) ? 'Du hast die kleine Reparatur erledigt.' : hint, done: save.flags.includes(flag), current: false, hint, hintAreaIds: [id === 'vogelhaus' ? 'foersterhaus' : id === 'spielzeugboot' ? 'muschelhafen' : 'kupferhof'] }))
}

export function getLastEventText(save: GameSave): string | null {
  return save.recentEvents.at(-1)?.text ?? null
}

export function getConnectedKnownAreas(save: GameSave, world: WorldDefinition, areaId: string) {
  const known = new Set(getKnownAreaIds(save, world))
  return world.passages
    .filter((passage) => otherEnd(passage, areaId) !== null)
    .map((passage) => world.areas.find((area) => area.id === otherEnd(passage, areaId)))
    .filter((area): area is AreaDefinition => Boolean(area && known.has(area.id)))
}
