import { assertWorldValid } from '../../engine/worldValidator'
import { campaignWorld } from './campaignWorld'

assertWorldValid(campaignWorld)

// Keep the original export name while older saves and components migrate to the
// complete campaign. Content IDs from the vertical slice remain stable.
export const phase2World = campaignWorld
export { campaignWorld }
