import State from "../state";
import Timers from "../timer";
import { EventManager } from "./manager";

export function roundTimerDestroyed(object: GObject): void {
    if (object === Timers.roundTimer) {
        Timers.roundTimer = undefined
    } else if (object === State.roundStateObject) {
        State.roundStateObject === undefined
    }
}

EventManager.onObjectDestroy((object) => roundTimerDestroyed(object))