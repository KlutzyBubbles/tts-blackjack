import { TimerGuids } from "./constants";
import Settings from "./settings";
import State from "./state";
import { RoundState } from "./types";

export default class Timers {

    public static roundTimer: GObject | undefined = undefined;
    public static bonusTimer: GObject | undefined = undefined;

    public static preventRoundEnd: number | undefined = undefined;

    public static initTimers(): void {
        Timers.roundTimer = getObjectFromGUID(TimerGuids.round) as GObject
        if (Timers.roundTimer !== undefined) {
            Timers.roundTimer.setValue(Settings.loadTime)
            if (Timers.roundTimer.Clock !== undefined) {
                Timers.roundTimer.Clock.paused = false
            }
            State.roundState = 1// RoundState.Betting
        }
        Timers.bonusTimer = getObjectFromGUID(TimerGuids.bonus) as GObject
    }

    public static resetBonusTimer(time: number) {
        Timers.bonusTimer?.setValue(time)
        Timers.bonusTimer?.Clock?.pauseStart()
    }

}

export function setRoundState(stateId: RoundState, roundTime?: number): void {
    if (Timers.roundTimer === undefined)
        return
    State.roundState = stateId
    State.setRoundStateObject(stateId)
    Timers.roundTimer.setValue(roundTime ?? 0)
    if (Timers.roundTimer.Clock !== undefined) {
        Timers.roundTimer.Clock.paused = Timers.roundTimer.getValue() === 0
    }
}
