import type { InteractionDefinition, Requirement } from '../../domain/content'

export const cardNotes: Record<string, string> = {
  karte_mut: 'Alva hatte vor ihrem ersten Kampf ebenfalls Angst. Mut hiess für sie, trotzdem um Hilfe zu bitten.',
  karte_arbor: 'Arbor pflanzte mit Alva neue Bäume. Der Hüter der Wurzeln war ihr Freund, kein Feind.',
  karte_marea: 'Marea sammelte Geschichten von Reisenden. Alva hörte ihr stundenlang zu.',
  karte_voltaro: 'Voltaro trug Nachrichten zwischen den Regionen, niemals Krieger.',
  karte_kompass: 'Kuno führte Alva einmal in einen Besenschrank. Auch ein Kompass darf sich irren.',
  karte_rueckgabe: 'Alva holte die Morgenklinge Jahre nach dem ersten Sieg zurück und gab sie an den Tempel. Rückkehr gehörte immer zum Versprechen.'
}
const cardRequirements: Requirement[] = Object.keys(cardNotes).map((clueId) => ({ kind: 'clue', clueId }))
export const campaignExtras: InteractionDefinition[] = [
  {
    id: 'knorzwolf_heilbeet', areaId: 'alte_baumschule', actionType: 'TAKE_ITEM', label: 'Hole die Waldsalbe am Heilbeet',
    description: 'Ein Töpfchen steht neben den heilenden Kräutern.', resultText: 'Hinter dem beruhigten Knorzwolf erreichst du das Heilbeet. Du nimmst ein Töpfchen Waldsalbe mit.',
    requirement: { kind: 'flag', flag: 'knorzwolf_beruhigt' }, blockedText: 'Beruhige zuerst den Knorzwolf vor dem Heilbeet.',
    effects: [{ kind: 'addItem', itemId: 'waldsalbe', quantity: 1 }]
  },
  {
    id: 'pfuetzenhopser_seitenstand', areaId: 'ueberfluteter_markt', actionType: 'TAKE_ITEM', label: 'Berge das Apfelbrot am Seitenstand',
    description: 'Im trockenen Seitenstand liegt ein verschlossenes Proviantpäckchen.', resultText: 'Der Pfützenhopser ist fort. In dem trockenen Päckchen findest du zwei Apfelbrote.',
    requirement: { kind: 'flag', flag: 'pfuetzenhopser_besiegt' }, blockedText: 'Der Pfützenhopser bewacht den trockenen Seitenstand.',
    effects: [{ kind: 'addItem', itemId: 'apfelbrot', quantity: 2 }]
  },
  {
    id: 'tintenqualle_quellfach', areaId: 'korallengrotte', actionType: 'TAKE_ITEM', label: 'Nimm das Wasser aus dem Quellfach',
    description: 'Eine verschlossene Flasche wartet in der Felsnische.', resultText: 'Ohne die Tintenwolke erkennst du die Flasche im Quellfach. Du erhältst ein Quellwasser.',
    requirement: { kind: 'flag', flag: 'tintenqualle_besiegt' }, blockedText: 'Vertreibe zuerst die Tintenqualle vor dem Quellfach.',
    effects: [{ kind: 'addItem', itemId: 'quellwasser', quantity: 1 }]
  },
  {
    id: 'gewittergeist_balkon', areaId: 'himmelswerft', actionType: 'TAKE_ITEM', label: 'Hole den Vorrat vom Aussichtsbalkon',
    description: 'Tavi hat eine Flasche für die Werftarbeiter bereitgestellt.', resultText: 'Der Gewittergeist ist verschwunden. Auf dem Balkon wartet eine Kühlende Limonade auf dich.',
    requirement: { kind: 'flag', flag: 'gewittergeist_geloest' }, blockedText: 'Löse zuerst den Gewittergeist am Balkon.',
    effects: [{ kind: 'addItem', itemId: 'kuehlende_limonade', quantity: 1 }]
  },
  {
    id: 'alvas_bann_erklaerung', areaId: 'versunkene_bibliothek', actionType: 'COMPLETE_INTERACTION', label: 'Lies Alvas Notiz über den Bann',
    description: 'Alva beschrieb, warum Taloras Licht, Wasser und Wind zusammengehören.',
    resultText: 'Alva schrieb: «Leuchtturm, Schleuse und Windorgel geben den Wächtersiegeln Kraft. Als alle drei wieder zuverlässig arbeiteten, konnte ich die Klinge aus dem Bannschloss holen und im Tempel schlafen legen.» Kuno betrachtet die Zeichnung. «Die Anlagen wurden vernachlässigt. So konnte Raugrim wieder flüstern. Reparaturen helfen dem Bann, doch den Schattenpanzer der Wächter löst nur die Morgenklinge.»',
    requirement: { kind: 'flag', flag: 'archiv_geoeffnet' }, blockedText: 'Öffne zuerst das Kartenarchiv.',
    effects: [{ kind: 'discoverClue', clueId: 'alvas_bann' }]
  },
  {
    id: 'tessa_kartenstift', areaId: 'sonnenwacht', actionType: 'COMPLETE_INTERACTION', label: 'Zeige Tessa deinen Kartenrand',
    visibilityRequirement: { kind: 'any', requirements: cardRequirements },
    description: 'Tessa kennt Alvas alte Kartenschrift.', resultText: 'Tessa überreicht dir Alvas Kartenstift. «Die Ränder erzählen, wer mit ihr ging.» Benutze den Stift im Inventar, um eine verborgene Kartennotiz sichtbar zu machen.',
    requirement: { kind: 'any', requirements: cardRequirements }, blockedText: 'Finde zuerst einen von Alvas sechs Kartenrändern.',
    effects: [{ kind: 'addItem', itemId: 'kartenstift', quantity: 1 }]
  },
  {
    id: 'wandbild_benennen', areaId: 'morgen_tempel', actionType: 'COMPLETE_INTERACTION', label: 'Benenne die Wächter auf dem Wandbild',
    description: 'Die drei Inschriften erzählen, wer Alva wirklich begleitete.', resultText: 'Arbor, Marea und Voltaro: Kuno nennt jeden Namen. «Sie ging nie allein.» Die Namen stehen nun unter dem alten Wandbild.',
    requirement: { kind: 'all', requirements: ['wurzelheiligtum', 'gezeitentempel', 'gewitterturm'].map((id) => ({ kind: 'flag', flag: `area_untersucht:${id}` })) }, blockedText: 'Untersuche die Inschriften im Wurzelheiligtum, Gezeitentempel und Gewitterturm.',
    effects: [{ kind: 'setFlag', flag: 'wandbild_benannt' }]
  },
  {
    id: 'kinder_nachspiel', areaId: 'drei_wege_platz', actionType: 'COMPLETE_INTERACTION', label: 'Höre den drei Kindern zu',
    visibilityRequirement: { kind: 'flag', flag: 'raugrim_verbannt' },
    description: 'Auf dem Platz drehen sich ein Windrad und kleine Segel im Morgenwind.', resultText: 'Ein Kind erzählt vom Vogel im reparierten Haus, eines vom wieder fahrenden Boot und eines vom Windrad. «Du hast unsere kleinen Dinge nicht vergessen.»',
    requirement: { kind: 'all', requirements: ['raugrim_verbannt', 'vogelhaus_repariert', 'spielzeugboot_repariert', 'windrad_repariert'].map((flag) => ({ kind: 'flag', flag })) }, blockedText: 'Repariere Vogelhaus, Spielzeugboot und Windrad. Nach der Verbannung treffen sich die Kinder hier.',
    effects: [{ kind: 'setFlag', flag: 'kinder_angehoert' }]
  },
  {
    id: 'tessa_vollstaendige_karte', areaId: 'sonnenwacht', actionType: 'COMPLETE_INTERACTION', label: 'Setze mit Tessa die Karte zusammen',
    visibilityRequirement: { kind: 'flag', flag: 'raugrim_verbannt' },
    description: 'Sechs Kartenränder ergeben Alvas ganze Reise.', resultText: 'Tessa glättet die Ränder. «Jetzt ist nicht nur der Weg vollständig. Auch die Geschichte ist es.» Auf deiner Karte sind alle Orte Taloras sichtbar.',
    requirement: { kind: 'all', requirements: [{ kind: 'flag', flag: 'raugrim_verbannt' }, ...cardRequirements] }, blockedText: 'Bringe Tessa nach der Verbannung alle sechs Kartenränder.',
    effects: [{ kind: 'setFlag', flag: 'karte_vollstaendig' }]
  }
]
