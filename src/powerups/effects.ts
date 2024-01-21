import State from "../state";
import { RoundState, SpecialHands } from "../types";
import ZoneHelpers from "../zones/helpers";
import ObjectSet from "../zones/objectSet";
import Zones from "../zones/zones";

export default class PowerupEffects {

    private static isPowerupState() {
        return State.roundState == RoundState.Playing || State.roundState == RoundState.Powerups
    }

    private static isBusted(value: number) {
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

    private static isSelf(objectSetTarget: ObjectSet, objectSetUser: ObjectSet): boolean {
        return objectSetTarget.color === objectSetUser.color || objectSetTarget.userColor === objectSetUser.color 
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
            if (!PowerupEffects.isSelf(objectSetTarget, objectSetUser)) {
                // TODO giveRewards
            }

            destroyObject(powerup)
            ZoneHelpers.clearCardsAndPowerups(objectSetTarget.zone)

            ZoneHelpers.setBetsLockState(objectSetTarget.zone, false)
            if (State.currentPlayerTurn == objectSetTarget.color) {
                objectSetTarget.clearPlayerActions(false)
                Zones.passPlayerActions(objectSetTarget.zone)
            }
            return true
        } else {
            broadcastToColor("Must use powerup on a zone with cards in it, also the targeted player must be losing and not busted.", objectSetUser.color, Color(1, 0.5, 0.5))
        }
        return false
    }

    public static altClear(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static redraw(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static redrawAll(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static swap(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static clone(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static destroy(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static reveal(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static stand(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static draw1(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static powerupDraw(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static rupeePull(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static rewardToken(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static royalToken(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static prestigeToken(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static resetTimer(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

    public static cardMod(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
        // TODO
        broadcastToColor("Not implemented.", objectSetUser.color, Color(1, 0.5, 0.5))
        return false
    }

}