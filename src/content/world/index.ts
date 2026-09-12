import { assertWorldValid } from '../../engine/worldValidator'
import { talora2World } from './talora2World'

assertWorldValid(talora2World)

export const activeWorld = talora2World
export { campaignWorld, campaignWorld as phase2World } from './campaignWorld'
export { talora2World }
