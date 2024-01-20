import State from "../state";
import { RoundState, SpecialHands } from "../types";
import ZoneHelpers from "../zones/helpers";
import ObjectSet from "../zones/objectSet";
import Zones from "../zones/zones";

export default class PowerupEffects {

    public static isPowerupState() {
        return State.roundState == RoundState.Playing || State.roundState == RoundState.Powerups
    }

    public static isBusted(value: number) {
        if (value >= 0 && value <= 21) {
            return false
        }
        let validSpecial: SpecialHands[] = [
            SpecialHands.Blackjack,
            SpecialHands.SingleJoker,
            SpecialHands.DoubleJoker,
            SpecialHands.Triple7
        ]
        if (validSpecial.includes(value)) {
            return false
        }
        return true
    }

    public static clear(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        if (!PowerupEffects.isPowerupState()) {
            return false
        }

        let cardsInZone = ZoneHelpers.findCardsInZone(objectSetTarget.zone)
        let decksInZone = ZoneHelpers.findDecksInZone(objectSetTarget.zone)
        let dealerValue = Zones.getObjectSetFromColor('Dealer').value

        if ((cardsInZone.length > 0 || decksInZone.length > 0)
            && (!PowerupEffects.isBusted(objectSetTarget.value) && objectSetTarget.value < dealerValue && (!PowerupEffects.isBusted(dealerValue)))) {
        
        } else {
            broadcastToColor("Must use powerup on a zone with cards in it, also the targeted player must be losing and not busted.", objectSetUser.color, Color(1, 0.5, 0.5))
        }
        return false
    }

}