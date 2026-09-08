import type { GameSave } from '../domain/game'

export type ReminderStatus = 'missing' | 'ready' | 'done'

export interface ReminderStep {
  id: string
  label: string
  detail: string
  status: ReminderStatus
  areaId?: string
}

export interface ReminderGroup {
  id: string
  title: string
  description: string
  steps: ReminderStep[]
}

function hasItem(save: GameSave, itemId: string): boolean {
  return (save.player.inventory[itemId] ?? 0) > 0
}

function hasFlag(save: GameSave, flag: string): boolean {
  return save.flags.includes(flag)
}

function itemStatus(save: GameSave, itemId: string, alreadyUsed: boolean): ReminderStatus {
  if (alreadyUsed) return 'done'
  return hasItem(save, itemId) ? 'ready' : 'missing'
}

function giftReminders(save: GameSave): ReminderGroup[] {
  const sunDone = hasFlag(save, 'sonnenfunke_erhalten')
  const oilDone = hasFlag(save, 'lio_geholfen') || sunDone
  const sourceDone = hasFlag(save, 'quelltraene_erhalten')
  const sluiceDone = hasFlag(save, 'schleuse_repariert') || sourceDone
  const windDone = hasFlag(save, 'windlied_erhalten')
  const featherDone = hasItem(save, 'sturmfeder') || windDone

  const groups: ReminderGroup[] = [
    {
      id: 'sonnenfunke',
      title: 'Für den Sonnenfunken',
      description: 'Spiegel und Leuchtöl gehören zum Alten Leuchtturm.',
      steps: [
        {
          id: 'sonnenspiegel', label: 'Sonnenspiegel', status: itemStatus(save, 'sonnenspiegel', sunDone),
          detail: sunDone ? 'Im Leuchtturm eingesetzt.' : hasItem(save, 'sonnenspiegel') ? 'Du trägst ihn zum Alten Leuchtturm.' : hasItem(save, 'archivschluessel') ? 'Öffne damit das Kartenarchiv in der Versunkenen Bibliothek.' : 'Der Archivschlüssel liegt bei den Symbolsteinen im Garten der Namen.',
          areaId: sunDone || hasItem(save, 'sonnenspiegel') ? 'alter_leuchtturm' : hasItem(save, 'archivschluessel') ? 'versunkene_bibliothek' : 'garten_der_namen'
        },
        {
          id: 'goldbeeren', label: 'Goldbeeren', status: itemStatus(save, 'goldbeeren', oilDone),
          detail: oilDone ? 'Lio hat daraus Leuchtöl gepresst.' : hasItem(save, 'goldbeeren') ? 'Bring sie zu Lios Ölpresse im Glühgarten.' : 'Die reifen Beeren wachsen auf der Mooslichtung.',
          areaId: oilDone || hasItem(save, 'goldbeeren') ? 'gluehgarten' : 'mooslichtung'
        },
        {
          id: 'leuchtoel', label: 'Leuchtöl', status: itemStatus(save, 'leuchtoel', sunDone),
          detail: sunDone ? 'Im Leuchtturm eingesetzt.' : hasItem(save, 'leuchtoel') ? 'Das Öl ist für die Lampe des Alten Leuchtturms bereit.' : 'Lio presst es im Glühgarten aus Goldbeeren, sobald die Schattenmotten fort sind.',
          areaId: hasItem(save, 'leuchtoel') || sunDone ? 'alter_leuchtturm' : 'gluehgarten'
        },
        {
          id: 'leuchtturm', label: 'Alten Leuchtturm entzünden', status: sunDone ? 'done' : hasItem(save, 'sonnenspiegel') && hasItem(save, 'leuchtoel') ? 'ready' : 'missing',
          detail: sunDone ? 'Der Sonnenfunke ist geborgen.' : 'Untersuche dort die Lichtflecken und setze Spiegel und Öl ein.', areaId: 'alter_leuchtturm'
        }
      ]
    },
    {
      id: 'quelltraene',
      title: 'Für die Quellträne',
      description: 'Schleusenrad und Mondmoos reinigen gemeinsam das Wasser.',
      steps: [
        {
          id: 'schleusenrad', label: 'Schleusenrad', status: itemStatus(save, 'schleusenrad', sluiceDone),
          detail: sluiceDone ? 'In der Schleuse eingesetzt.' : hasItem(save, 'schleusenrad') ? 'Du trägst es zum Schleusenhaus.' : hasItem(save, 'hebelstange') ? 'Heble damit den Stand am Überfluteten Markt hoch.' : 'Nimm die Hebelstange am Alten Markt mit.',
          areaId: sluiceDone || hasItem(save, 'schleusenrad') ? 'schleusenhaus' : hasItem(save, 'hebelstange') ? 'ueberfluteter_markt' : 'alter_markt'
        },
        {
          id: 'mondmoos', label: 'Mondmoos', status: itemStatus(save, 'mondmoos', sluiceDone),
          detail: sluiceDone ? 'Im Filterkorb der Schleuse eingesetzt.' : hasItem(save, 'mondmoos') ? 'Du trägst das Moos zum Schleusenhaus.' : 'Das Pflanzenbuch in der Alten Baumschule zeigt, welches Moos Wasser reinigt.',
          areaId: sluiceDone || hasItem(save, 'mondmoos') ? 'schleusenhaus' : 'alte_baumschule'
        },
        {
          id: 'schleuse', label: 'Schleuse reparieren', status: sluiceDone ? 'done' : hasItem(save, 'schleusenrad') && hasItem(save, 'mondmoos') ? 'ready' : 'missing',
          detail: sluiceDone ? 'Klares Wasser fliesst wieder.' : 'Untersuche die Wasserlinien und setze Rad und Mondmoos im Schleusenhaus ein.', areaId: 'schleusenhaus'
        },
        {
          id: 'quelle', label: 'Quellträne empfangen', status: sourceDone ? 'done' : sluiceDone ? 'ready' : 'missing',
          detail: sourceDone ? 'Die Quellträne ist geborgen.' : 'Nach der Reparatur wartet sie in der Korallengrotte.', areaId: 'korallengrotte'
        }
      ]
    },
    {
      id: 'windlied',
      title: 'Für das Windlied',
      description: 'Pfeife und Sturmfeder vervollständigen die Windorgel.',
      steps: [
        {
          id: 'silberpfeife', label: 'Silberpfeife', status: itemStatus(save, 'silberpfeife', windDone),
          detail: windDone ? 'In die Windorgel eingesetzt.' : hasItem(save, 'silberpfeife') ? 'Du trägst sie zur Windorgel.' : 'Die Echofolge öffnet die Werkzeugkammer in der Kristallmine.',
          areaId: windDone || hasItem(save, 'silberpfeife') ? 'windorgel' : 'kristallmine'
        },
        {
          id: 'kletterseil', label: 'Kletterseil', status: windDone || featherDone ? 'done' : hasItem(save, 'kletterseil') ? 'ready' : 'missing',
          detail: windDone || featherDone ? 'Damit hast du die Sturmfeder erreicht.' : hasItem(save, 'kletterseil') ? 'Befestige es am Wettermast der Wolkenbrücke.' : 'Der Netzkrabbler hält es im Spinnenhain fest.',
          areaId: hasItem(save, 'kletterseil') ? 'wolkenbruecke' : 'spinnenhain'
        },
        {
          id: 'sturmfeder', label: 'Sturmfeder', status: itemStatus(save, 'sturmfeder', windDone),
          detail: windDone ? 'In die Windorgel eingesetzt.' : hasItem(save, 'sturmfeder') ? 'Du trägst sie zur Windorgel.' : 'Mit dem Kletterseil erreichst du sie auf der Wolkenbrücke.',
          areaId: windDone || hasItem(save, 'sturmfeder') ? 'windorgel' : 'wolkenbruecke'
        },
        {
          id: 'windorgel', label: 'Windorgel vervollständigen', status: windDone ? 'done' : hasItem(save, 'silberpfeife') && hasItem(save, 'sturmfeder') ? 'ready' : 'missing',
          detail: windDone ? 'Das Windlied ist geborgen.' : 'Untersuche die Orgel, setze Pfeife und Feder ein und spiele die sichtbare Folge.', areaId: 'windorgel'
        }
      ]
    }
  ]

  const giftsReady = ['sonnenfunke', 'quelltraene', 'windlied'].every((itemId) => hasItem(save, itemId))
  const morningBlade: ReminderGroup = {
    id: 'morgenklinge',
    title: 'Gaben für die Morgenklinge',
    description: 'Sonnenfunke, Quellträne und Windlied gehören gemeinsam in den Tempel.',
    steps: [
      ...([['sonnenfunke', 'Sonnenfunke'], ['quelltraene', 'Quellträne'], ['windlied', 'Windlied']] as const).map(([id, label]) => ({
        id: `gabe_${id}`,
        label,
        detail: hasItem(save, id) ? 'Diese Gabe ist bei dir.' : 'Diese Gabe fehlt noch.',
        status: hasItem(save, id) ? 'ready' as const : 'missing' as const
      })),
      {
        id: 'morgenklinge_erwecken',
        label: 'Morgenklinge erwecken',
        detail: giftsReady ? 'Alle drei Gaben sind bereit. Kehre zum steinernen Baum zurück.' : 'Der steinerne Baum wartet auf alle drei Gaben.',
        status: giftsReady ? 'ready' : 'missing',
        areaId: 'morgen_tempel'
      }
    ]
  }

  return [...groups.filter((group) => group.steps.some((step) => step.status !== 'done')), morningBlade]
}

function guardianReminders(save: GameSave): ReminderGroup[] {
  const guardians = [
    ['arbor', 'Arbor und das Wurzelsiegel', 'arbor_befreit', 'dornenkrone', 'Arbor wartet in der Dornenkrone.'],
    ['marea', 'Marea und das Gezeitensiegel', 'marea_befreit', 'perlenbecken', 'Marea wartet im Perlenbecken.'],
    ['voltaro', 'Voltaro und das Himmelssiegel', 'voltaro_befreit', 'adlerhorst', 'Voltaro wartet im Adlerhorst.']
  ] as const
  const allFreed = guardians.every(([, , flag]) => hasFlag(save, flag))
  return [{
    id: 'waechter', title: 'Wächter und Siegel', description: 'Die Morgenklinge kann ihre drei Schattenpanzer öffnen.',
    steps: [
      ...guardians.map(([id, label, flag, areaId, detail]) => ({ id, label, areaId, detail: hasFlag(save, flag) ? 'Befreit; das Siegel ist bei dir.' : detail, status: hasFlag(save, flag) ? 'done' as const : 'missing' as const })),
      { id: 'endtor', label: 'Tor der sechs Zeichen', areaId: 'tor_der_sechs_zeichen', detail: allFreed ? 'Alle drei Siegel und die Morgenklinge sind bereit.' : 'Dort werden Morgenklinge und alle drei Siegel gebraucht.', status: allFreed ? 'ready' : 'missing' }
    ]
  }]
}

function finalReminders(save: GameSave): ReminderGroup[] {
  const fullyPrepared = save.player.life === save.player.maxLife && (save.player.inventory.apfelbrot ?? 0) >= 3
  return [{
    id: 'raugrim', title: 'Für die letzte Verbannung', description: 'Nimm Klinge, Siegel und genug Kraft mit in die Weltenkammer.',
    steps: [
      { id: 'rast', label: 'Rasten und Vorräte auffüllen', areaId: 'rand_der_nacht', detail: fullyPrepared ? 'Du hast volle Kraft und mindestens drei Apfelbrote.' : 'Am Rand der Nacht kannst du vollständig rasten.', status: fullyPrepared ? 'ready' : 'missing' },
      { id: 'morgenklinge', label: 'Morgenklinge ausrüsten', detail: save.player.equippedWeaponId === 'morgenklinge' ? 'Die Morgenklinge ist ausgerüstet.' : 'Rüste sie vor dem Kampf im Inventar aus.', status: save.player.equippedWeaponId === 'morgenklinge' ? 'ready' : 'missing' },
      ...([['wurzelsiegel', 'Wurzelsiegel'], ['gezeitensiegel', 'Gezeitensiegel'], ['himmelssiegel', 'Himmelssiegel']] as const).map(([id, label]) => ({ id, label, detail: hasItem(save, id) ? 'Für eine Kampfphase bereit.' : 'Dieses Siegel fehlt noch.', status: hasItem(save, id) ? 'ready' as const : 'missing' as const })),
      { id: 'weltenkammer', label: 'Raugrim verbannen', areaId: 'weltenkammer', detail: 'Verteidige schwere Angriffe und setze nach jeder Phase das angezeigte Siegel.', status: 'missing' }
    ]
  }]
}

function epilogueReminders(save: GameSave): ReminderGroup[] {
  const notes = [
    ['karte_mut', 'Kartenrand im Garten der Namen', 'garten_der_namen'],
    ['karte_arbor', 'Kartenrand in der Alten Baumschule', 'alte_baumschule'],
    ['karte_marea', 'Kartenrand in der Versunkenen Bibliothek', 'versunkene_bibliothek'],
    ['karte_voltaro', 'Kartenrand in der Himmelswerft', 'himmelswerft'],
    ['karte_kompass', 'Kartenrand im Wurzeltunnel', 'wurzeltunnel'],
    ['karte_rueckgabe', 'Kartenrand in der Weltenkammer', 'weltenkammer']
  ] as const
  const repairs = [
    ['vogelhaus', 'Vogelhaus reparieren', 'vogelhaus_repariert', 'foersterhaus'],
    ['spielzeugboot', 'Spielzeugboot reparieren', 'spielzeugboot_repariert', 'muschelhafen'],
    ['windrad', 'Windrad reparieren', 'windrad_repariert', 'kupferhof']
  ] as const
  const allNotes = notes.every(([clue]) => save.discoveredClueIds.includes(clue))
  const allRepairs = repairs.every(([, , flag]) => hasFlag(save, flag))
  const groups: ReminderGroup[] = [
    {
      id: 'kartenraender', title: 'Alvas ganze Karte', description: 'Sechs Kartenränder erzählen, wer Alva begleitete.',
      steps: [
        ...notes.map(([id, label, areaId]) => ({ id, label, areaId, detail: save.discoveredClueIds.includes(id) ? 'Gefunden.' : 'Dieser Kartenrand fehlt noch.', status: save.discoveredClueIds.includes(id) ? 'done' as const : 'missing' as const })),
        { id: 'karte_zusammensetzen', label: 'Karte mit Tessa zusammensetzen', areaId: 'sonnenwacht', detail: hasFlag(save, 'karte_vollstaendig') ? 'Alvas Karte ist vollständig.' : allNotes ? 'Alle Ränder sind bereit.' : 'Dafür brauchst du alle sechs Ränder.', status: hasFlag(save, 'karte_vollstaendig') ? 'done' : allNotes ? 'ready' : 'missing' }
      ]
    },
    {
      id: 'kleine_dinge', title: 'Die kleinen Dinge', description: 'Drei Reparaturen warten in den befreiten Regionen.',
      steps: [
        ...repairs.map(([id, label, flag, areaId]) => ({ id, label, areaId, detail: hasFlag(save, flag) ? 'Erledigt.' : 'Hier ist noch etwas offen.', status: hasFlag(save, flag) ? 'done' as const : 'missing' as const })),
        { id: 'kinder', label: 'Den Kindern zuhören', areaId: 'drei_wege_platz', detail: hasFlag(save, 'kinder_angehoert') ? 'Die Kinder haben dir ihre Geschichten erzählt.' : allRepairs ? 'Die Kinder warten auf dem Platz.' : 'Sie treffen sich nach allen drei Reparaturen.', status: hasFlag(save, 'kinder_angehoert') ? 'done' : allRepairs ? 'ready' : 'missing' }
      ]
    }
  ]
  return groups.filter((group) => group.steps.some((step) => step.status !== 'done'))
}

export function getReminderGroups(save: GameSave): ReminderGroup[] {
  if (hasFlag(save, 'raugrim_verbannt')) return epilogueReminders(save)
  if (hasFlag(save, 'endtor_offen')) return finalReminders(save)
  if (hasItem(save, 'morgenklinge') || hasFlag(save, 'morgenklinge_erweckt')) return guardianReminders(save)
  if (!save.visitedAreaIds.includes('morgen_tempel')) {
    return [{
      id: 'erster_weg', title: 'Kunos erste Richtung', description: 'Im Tempel erfährst du, was Talora braucht.',
      steps: [{ id: 'morgen_tempel', label: 'Tempel der Morgenklinge finden', detail: 'Der Weg führt vom Drei-Wege-Platz zum Tempel.', status: 'missing', areaId: 'morgen_tempel' }]
    }]
  }
  return giftReminders(save)
}
