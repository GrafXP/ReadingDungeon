import { assertWorldValid } from '../../engine/worldValidator'
import { kantaraWorld } from './kantaraWorld'

// Phase 4 intentionally keeps the outer regions and finale incomplete.
// Structural references remain sound; the inventory report keeps those later
// content gaps visible until their implementation phases.
assertWorldValid(kantaraWorld, { allowIncomplete: true })

export const activeWorld = kantaraWorld
export { campaignWorld, campaignWorld as phase2World } from './campaignWorld'
export { kantaraWorld }
