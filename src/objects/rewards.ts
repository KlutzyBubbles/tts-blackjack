import { RewardGuids } from "../constants";
import { RewardName } from "../types";

export default class Rewards {

    public static rewards: { [key in RewardName]?: GObject } = {}

    public static initRewards(): void {
        for (let key of Object.keys(RewardGuids)) {
            Rewards.rewards[key as RewardName] = getObjectFromGUID(RewardGuids[key as RewardName]) as GObject
        }
    }

}