import State from "../state";
import { RoundState, SpecialHands } from "../types";
import ObjectSet from "../zones/objectSet";

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

    public static isSelf(objectSetTarget: ObjectSet, objectSetUser: ObjectSet): boolean {
        return objectSetTarget.color === objectSetUser.color || objectSetTarget.userColor === objectSetUser.color 
    }

}