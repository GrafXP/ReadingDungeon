import type { WorldDefinition } from '../../domain/content'
import { TALORA_STATUS_EFFECTS } from '../../engine/statusEffects'
import { talora2Enemies, talora2Encounters } from './talora2Combat'
import { talora2Interactions } from './talora2Interactions'
import { talora2Items } from './talora2Items'
import { talora2Journal, talora2RuleCards, talora2StoryBeats } from './talora2Journal'
import { talora2Areas, talora2Passages, talora2Regions } from './talora2Places'
import { talora2Puzzles } from './talora2Puzzles'

export const talora2World: WorldDefinition = {
  campaignId: 'talora2',
  presentation: {
    eyebrow: 'Ein neues Abenteuer in Talora',
    title: 'Talora II – Die Rückkehr des Schattens',
    subtitle: 'Kunos Schatten läuft fort. Hilf alten und neuen Freunden, und finde heraus, wovor er Angst hat.',
    fallbackPlaceName: 'Talora',
    emptyQuestTitle: 'Folge Kunos Schatten',
    emptyQuestDescription: 'Sprich mit Tessa in Sonnenwacht und gehe danach mit Kuno zum Lichterfest.',
    introduction: {
      eyebrow: 'Willkommen zurück in Talora',
      title: 'Die Rückkehr des Schattens',
      lead: '{playerName}, Kuno hat deinen Namen nicht vergessen.',
      story: [
        'Seit dem Abenteuer mit der Morgenklinge sind Taloras Wege wieder offen. Arbor wacht im Wald, Marea erzählt am Meer, und Voltaro fliegt über den Bergen.',
        'Beim Lichterfest geschieht etwas Seltsames. Die Schatten von Taloras Freunden lösen sich und laufen fort. Auch Kunos Schatten verschwindet.',
        'Raugrim sitzt noch im Bannschloss. Doch ein Rest seiner Stimme lockt ängstliche Schatten zu sich. Du und Kuno wollt sie nach Hause bringen.'
      ],
      basics: [
        { title: 'Lies den nächsten Zug', text: 'Gegner zeigen vorher, was sie tun. Bei einem schweren Zug hilft Verteidigen.' },
        { title: 'Wähle deine Ausrüstung', text: 'Waffen haben eigene Künste. Schutzkleidung hält Feuer, Eis, Blitz oder Schatten ab.' },
        { title: 'Kehre sicher zurück', text: 'Flucht und Rettung kosten keine Funde. An Rastplätzen heilst du und füllst Apfelbrot auf.' }
      ],
      firstStep: 'Beginne in Sonnenwacht. Untersuche den Raum und sprich mit Tessa.'
    }
  },
  regions: talora2Regions,
  start: {
    areaId: 'sm_sonnenwacht', maxLife: 20,
    inventory: { item_weapon_reiseschwert: 1, item_armor_reisewams: 1, item_tool_laterne: 1, item_consume_apfelbrot: 3 },
    equippedWeaponId: 'item_weapon_reiseschwert', equippedArmorId: 'item_armor_reisewams', equippedTalismanId: null,
    eventText: '{playerName}, in Sonnenwacht putzt Kuno seinen Messingdeckel für das Lichterfest. Sein Schatten zeigt schon zur Tür, obwohl Kuno stillsteht.',
    sanctuaryRestocks: [{ itemId: 'item_consume_apfelbrot', quantity: 3 }]
  },
  completionRequirement: { kind: 'flag', flag: 'talora2_abgeschlossen' },
  mapRevealRequirement: { kind: 'flag', flag: 'prolog_abgeschlossen' },
  statusEffects: TALORA_STATUS_EFFECTS,
  journal: talora2Journal,
  ruleCards: talora2RuleCards,
  storyBeats: talora2StoryBeats,
  puzzles: talora2Puzzles,
  areas: talora2Areas,
  passages: talora2Passages,
  items: talora2Items,
  interactions: talora2Interactions,
  enemies: talora2Enemies,
  encounters: talora2Encounters,
  contentInventory: {
    areas: talora2Areas.map((entry) => entry.id), passages: talora2Passages.map((entry) => entry.id),
    items: talora2Items.map((entry) => entry.id), interactions: talora2Interactions.map((entry) => entry.id),
    puzzles: talora2Puzzles.map((entry) => entry.id), enemies: talora2Enemies.map((entry) => entry.id),
    encounters: talora2Encounters.map((entry) => entry.id)
  }
}
