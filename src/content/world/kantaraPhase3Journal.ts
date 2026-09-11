import type { CampaignJournalDefinition, QuestViewDefinition, RuleCardDefinition, WorldDefinition } from '../../domain/content'
import type { GameSave } from '../../domain/game'

const hasItem = (save: GameSave, itemId: string) => (save.player.inventory[itemId] ?? 0) > 0
const hasFlag = (save: GameSave, value: string) => save.flags.includes(value)

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

function getQuestViews(save: GameSave): QuestViewDefinition[] {
  const labelsDone = hasFlag(save, 'uebungsetiketten_geloest')
  const medicineTaken = hasFlag(save, 'medizin_erhalten')
  const medicineDone = hasFlag(save, 'medizin_geliefert')
  const fennDone = hasFlag(save, 'pflanzentafel_gelesen')
  const sourceDone = hasFlag(save, 'quellventil_geoeffnet')
  const stampferDone = save.defeatedEncounterIds.includes('enc_bd_aststampfer')
  const bridgeDone = hasFlag(save, 'brueckenseil_befestigt')
  const axeDone = hasItem(save, 'item_weapon_astbeil')
  const lifterDone = save.defeatedEncounterIds.includes('enc_bd_kronenheber')
  const stampDone = hasItem(save, 'item_quest_blaetterstempel')

  if (!medicineDone) {
    return [
      quest('prolog_ausruestung', 'Bereite die Übung vor', 'Klappe Klick auf und nimm die Grundausrüstung aus deinem Spind.', hasItem(save, 'item_tool_etikettenlupe') && hasItem(save, 'item_weapon_kurierklinge'), !labelsDone, 'Untersuche den Kurierhof. Käferfach und Spind sind dort beschriftet.', ['kb_kurierhof']),
      quest('prolog_etiketten', 'Ordne die Übungspakete', 'Lies Ziel, Inhalt und Warnzeichen in der Sortierhalle.', labelsDone, !labelsDone, 'Frostbeeren brauchen Kälte, die Spule Trockenheit und die Medizin das Wellenzeichen.', ['kb_sortierhalle']),
      quest('prolog_medizin', 'Liefere die Medizin', medicineTaken ? 'Bringe die Medikamentenkiste durch den Übungstunnel zum Wassertor. Verteidige beim Rattern.' : 'Nimm nach der Etikettenübung Merals Hilfsauftrag an.', medicineDone, labelsDone, 'Meral wartet im Kurierhof. Das Wassertor ist durch den nicht registrierten Übungstunnel erreichbar.', [medicineTaken ? 'kb_wassertor' : 'kb_kurierhof'])
    ]
  }

  return [
    quest('blaetter_fenn', 'Lies Fenns Pflanzentafel', 'Ordne Jungtrieb, Tragwurzel und Fruchtranke ihren richtigen Plätzen zu.', fennDone, !fennDone, 'Fenn und die vollständige Tafel warten am sicheren Kronengarten.', ['bd_kronengarten']),
    quest('blaetter_quelle', 'Leite Wasser zum Garten', 'Ergänze den Rohrbericht und öffne das Quellventil.', sourceDone, fennDone && !sourceDone, 'Am Quellast steht: blaue Klemme, mittlere Rinne, Gartenast.', ['bd_quellast']),
    quest('blaetter_stampfer', 'Öffne das Rankentor', 'Lies die Rammwarnung und verteidige beim tiefen Knarren.', stampferDone, sourceDone && !stampferDone, 'Der Aststampfer bewacht nur den Weg vom Rankentor zum Wipfelsteg.', ['bd_rankentor']),
    quest('blaetter_bruecke', 'Baue den Weg zum Kranplatz', 'Hilf Ina und befestige ein Astholz und ein Rankenseil nach ihrem Knotenplan.', bridgeDone, fennDone && !bridgeDone, 'Ina beginnt den Auftrag am Seilmarkt. Astholz liegt im Brückenwerk, Rankenseil wächst nach dem Quellrätsel im Kronengarten.', ['bd_seilmarkt', 'bd_brueckenwerk', 'bd_kronengarten']),
    quest('blaetter_astbeil', 'Baue das Astbeil', 'Bringe ein Astholz und ein Rankenseil zu Brik. Rüste das fertige Werkzeug aus.', axeDone, fennDone && !axeDone, 'Die erneuerbaren Materialien liegen im Kronengarten und Brückenwerk; Brik arbeitet im Werkhof.', ['kb_werkhof', 'bd_kronengarten', 'bd_brueckenwerk']),
    quest('blaetter_kronenheber', 'Schalte den Kronenheber ab', 'Verteidige seinen Ansturm und unterbrich die Aufladung mit Kapphieb.', lifterDone, axeDone && !lifterDone, 'Rüste das Astbeil aus. Der Kronenheber wartet am Kranplatz; beide Wege zurück bleiben offen.', ['bd_kranplatz']),
    quest('blaetter_stempel', 'Präge den Blätterstempel', 'Lass Fenn den Bericht lesen und Ina die Freigabepresse prüfen.', stampDone, lifterDone && !stampDone, 'Die Presse steht in der Kronenstation direkt hinter dem Kranplatz.', ['bd_kronenstation'])
  ]
}

function getMainGoal(save: GameSave) {
  if (hasItem(save, 'item_quest_blaetterstempel')) {
    return { title: 'Erkunde den offenen ersten Ring', description: 'Blätterdächer ist befreit. Kanaldelta und Sturmwerft folgen in Phase 4; alle bisherigen Wege bleiben offen.' }
  }
  if (hasFlag(save, 'medizin_geliefert')) {
    return { title: 'Befreie die Blätterdächer', description: 'Hilf Fenn und Ina, baue das Astbeil und schalte den Kronenheber an der Kronenstation ab.' }
  }
  if (hasFlag(save, 'uebungsetiketten_geloest')) {
    return { title: 'Bringe die Medizin zum Wassertor', description: 'Nimm Merals Auftrag an. Lies die Zugankündigung der Rollkiste und halte den Rückweg offen.' }
  }
  return { title: 'Prüfe die Übungspakete', description: 'Klappe Klick auf, nimm deine Grundausrüstung und ordne in der Sortierhalle drei vollständige Etiketten zu.' }
}

export const kantaraPhase3Journal: CampaignJournalDefinition = {
  getQuestViews,
  getMainGoal,
  hintSteps: {
    prolog_ausruestung: ['Eine gute Lieferung beginnt vor dem ersten Weg.', 'Am niedrigen Übungstisch und am persönlichen Spind findest du alles Nötige.'],
    prolog_etiketten: ['Jedes Paket nennt drei Merkmale.', 'Vergleiche besonders Warnzeichen und Ziel, bevor du bestätigst.'],
    prolog_medizin: ['Der Empfänger ist nicht weit entfernt.', 'Verteidige beim angekündigten Anrollen; Treffer und Flucht lassen die Medizin bei dir.'],
    blaetter_fenn: ['Nicht jede Ranke braucht dasselbe.', 'Achte auf Kante, Stamm und Wasserbedarf, nicht nur auf eine Farbe.'],
    blaetter_quelle: ['Der Wartungsbericht enthält alle drei Schritte.', 'Lies die Zeitwörter erst, dann und zuletzt.'],
    blaetter_stampfer: ['Das Tor erklärt die Bewegung vor dem Kampf.', 'Ein verteidigter Rammstoss öffnet einen Riss für deinen nächsten Angriff.'],
    blaetter_bruecke: ['Ina nennt Material und Seilart vollständig.', 'Nimm zwei Astholz im Brückenwerk und zwei Rankenseile nach dem Quellrätsel im Garten.'],
    blaetter_astbeil: ['Fenns gelöste Pflanzentafel gibt Brik den Plan.', 'Bringe ein Astholz und ein Rankenseil in den Werkhof; nach dem Bau im Inventar ausrüsten.'],
    blaetter_kronenheber: ['Der Kranplan hat eine Regel pro Phase.', 'Phase eins: Ansturm verteidigen. Phase zwei: beim Aufladen Kapphieb benutzen.'],
    blaetter_stempel: ['Nach dem Kampf bleibt der Hin- und Rückweg offen.', 'Gehe vom Kranplatz über die freie Stationsbrücke zur Kronenstation.']
  }
}

const flagRequirement = (value: string) => ({ kind: 'flag' as const, flag: value })
const clueRequirement = (clueId: string) => ({ kind: 'clue' as const, clueId })

export const kantaraPhase3RuleCards: RuleCardDefinition[] = [
  { id: 'regel_etiketten_pruefen', title: 'Etiketten prüfen', description: 'Lies Ziel, Inhalt und Warnzeichen vollständig. Wenn sie nicht zusammenpassen, frage nach.', requirement: clueRequirement('regel_etiketten_pruefen') },
  { id: 'regel_beobachten', title: 'Beobachten', description: 'Beobachten kostet keinen Gegnerzug und schaltet Schwächen, Widerstände und Bewegungen im Register frei.', requirement: clueRequirement('regel_beobachten') },
  { id: 'regel_zugankuendigung', title: 'Angekündigte Bewegung', description: 'Der nächste gegnerische Zug steht vor deiner Entscheidung sichtbar im Kampf. Lies Name und Ankündigung zusammen.', requirement: clueRequirement('regel_zugankuendigung') },
  { id: 'regel_verteidigen', title: 'Verteidigen', description: 'Verteidigen halbiert gewöhnlichen Schaden. Bei ausdrücklich markierten Anstürmen kann es den Treffer ganz verhindern.', requirement: clueRequirement('regel_verteidigen') },
  { id: 'regel_flucht', title: 'Flucht und Rettung', description: 'Flucht und Rettung führen zum regionalen Rastplatz. Gegenstände, Rätsel und frühere Siege bleiben erhalten.', requirement: clueRequirement('regel_flucht') },
  { id: 'regel_trefferrechnung', title: 'Trefferrechnung', description: 'Die sichtbare Rechnung zeigt Waffenwurf, Panzerung, Schwäche oder Widerstand und das Ergebnis. Ein wirksamer Treffer verursacht mindestens einen Schaden.', requirement: clueRequirement('regel_trefferrechnung') },
  { id: 'regel_koerperruestung', title: 'Körperrüstung', description: 'Körperpanzerung zieht einen festen Wert ab. Zusätzlicher Elementschutz halbiert nur den passenden Schaden.', requirement: clueRequirement('regel_koerperruestung') },
  { id: 'regel_rastplatz_ausruesten', title: 'Rastplatz und Ausrüstung', description: 'Waffen und Rüstung wechselst du ausserhalb eines Kampfes. Elementmodi umstellbarer Waffen änderst du nur an einem Rastplatz.', requirement: flagRequirement('area_untersucht:kb_werkhof') },
  { id: 'regel_offener_riss', title: 'Offener Riss', description: 'Ein richtig verteidigter Rammstoss kann einen offenen Riss erzeugen. Deine nächsten Treffer verursachen dort zwei Schaden mehr.', requirement: clueRequirement('regel_offener_riss') },
  { id: 'regel_waffenkunst', title: 'Waffenkunst und Abklingzeit', description: 'Eine Waffenkunst hat eine besondere Wirkung. Nach dem Einsatz zeigt der Kampf, wie viele Runden sie noch abklingt.', requirement: clueRequirement('regel_waffenkunst') },
  { id: 'regel_aufladung', title: 'Aufladung unterbrechen', description: 'Steigendes Summen und der Zugname Aufladen warnen vor einem starken Folgeschritt. Kapphieb unterbricht die angekündigte Bewegung.', requirement: flagRequirement('area_untersucht:bd_wipfelsteg') }
]

export const kantaraPhase3StoryBeats: NonNullable<WorldDefinition['storyBeats']> = [
  {
    id: 'merals_regionsauftrag',
    requirement: flagRequirement('medizin_geliefert'),
    text: 'Meral markiert drei offene Aufträge: Blätterdächer, Kanaldelta und Sturmwerft. «Keiner ist wichtiger als der andere. Stelle Kontakt her, lies die Stationsregeln und halte immer einen Rückweg frei.»'
  },
  {
    id: 'erster_freigabestempel',
    requirement: {
      kind: 'any',
      requirements: [
        { kind: 'item', itemId: 'item_quest_blaetterstempel' },
        { kind: 'item', itemId: 'item_quest_deltastempel' },
        { kind: 'item', itemId: 'item_quest_werftstempel' }
      ]
    },
    text: 'Klick betrachtet den ersten Freigabestempel und den fehlerhaften Sammelbefehl. «Das Werk sammelt nicht nur Kisten, sondern auch Kräfte und Wege. Das ist keine Zustellung.» Das erste regionale Team bricht zu den Wechselgängen auf.'
  }
]
