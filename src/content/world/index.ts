import { assertWorldValid } from '../../engine/worldValidator'
import { kantaraWorld } from './kantaraWorld'

// Phase 1 intentionally starts with an incomplete content scaffold. Structural
// references must already be sound; inventory and completion gaps are reported
// by the Phase 1 contract validator until later content phases fill them.
assertWorldValid(kantaraWorld, { allowIncomplete: true })

export const activeWorld = kantaraWorld
export { campaignWorld, campaignWorld as phase2World } from './campaignWorld'
export { kantaraWorld }
