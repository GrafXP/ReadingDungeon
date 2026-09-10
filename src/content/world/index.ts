import { assertWorldValid } from '../../engine/worldValidator'
import { kantaraWorld } from './kantaraWorld'

// Phase 3 intentionally keeps later regions incomplete. Structural references
// must remain sound; the inventory report keeps every later content gap visible.
assertWorldValid(kantaraWorld, { allowIncomplete: true })

export const activeWorld = kantaraWorld
export { campaignWorld, campaignWorld as phase2World } from './campaignWorld'
export { kantaraWorld }
