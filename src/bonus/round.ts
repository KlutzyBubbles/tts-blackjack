import { BagGuids, Tag } from "../constants";
//import PowerupManager from "../powerups/manager"
//import { TableSelection } from "../types"
import ObjectSet from "../zones/objectSet";
//import Zones from "../zones/zones"

export default class RoundBonus {

    public static bonusBag: GObject | undefined = undefined;
    public static bonusObjects: GObject[] = [];

    public static initBonuses(): void {
        RoundBonus.bonusBag = getObjectFromGUID(BagGuids.bonus) as GObject
    }

    public static getBonusBag(): GObject {
        return RoundBonus.bonusBag ?? getObjectFromGUID(BagGuids.bonus) as GObject
    }

}