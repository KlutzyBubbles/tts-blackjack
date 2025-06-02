import State from "../state";
import Timers from "../timer";
import { EventManager } from "./manager";

export class RoundTimerDestroyed {

    public static countDestroy = 0
    public static roundTimerDestroyed(object: GObject): void {
        RoundTimerDestroyed.countDestroy++;
        if (object === Timers.roundTimer) {
            Timers.roundTimer = undefined
        } else if (object === State.roundStateObject) {
            State.roundStateObject === undefined
        }
    }
}

EventManager.onObjectDestroy(RoundTimerDestroyed.roundTimerDestroyed)
