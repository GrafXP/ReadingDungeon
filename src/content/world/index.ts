import { assertWorldValid } from '../../engine/worldValidator'
import { kantaraWorld } from './kantaraWorld'

// Phase 2 intentionally keeps an incomplete content foundation. Structural
// references must already be sound; inventory and completion gaps stay visible
// until the later content phases fill them.
assertWorldValid(kantaraWorld, { allowIncomplete: true })

export const activeWorld = kantaraWorld
export { campaignWorld, campaignWorld as phase2World } from './campaignWorld'
export { kantaraWorld }
