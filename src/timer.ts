import RoundBonus from "./bonus/round";
import { TimerGuids } from "./constants";
import Settings from "./settings";
import State from "./state";
import { RoundState } from "./types";
import ObjectSet from "./zones/objectSet";
import Zones from "./zones/zones";

export default class Timers {

    public static roundTimer: GObject | undefined;
    public static bonusTimer: GObject | undefined;

    public static preventRoundEnd: number | undefined;

    public static initTimers(): void {
        Timers.roundTimer = getObjectFromGUID(TimerGuids.round)
        if (Timers.roundTimer !== undefined) {
            Timers.roundTimer.setValue(Settings.loadTime)
            Timers.roundTimer.Clock.paused = false
            State.roundState = RoundState.Betting
        }
        Timers.bonusTimer = getObjectFromGUID(TimerGuids.bonus)
    }

    public static resetBonusTimer(time: number) {
        Timers.bonusTimer?.setValue(time)
        Timers.bonusTimer?.Clock.pauseStart()
    }

    public static timerStart(): void {
        Wait.time(Timers.timerStart, 0.5)
        if ((Timers.bonusTimer?.getValue() ?? 0) as number < 1) {
            Timers.resetBonusTimer(Settings.bonusTime)
            RoundBonus.bonusRound()
        }

        if (os.time() >= State.nextAutoCardCount) {
            Zones.findCardsToCount()
        }

        if (Timers.roundTimer !== undefined) {
            if (Timers.roundTimer.getValue() as number <= 0 && (Timers.preventRoundEnd === undefined || os.time() > Timers.preventRoundEnd)) {
                Timers.preventRoundEnd = undefined
                if (State.roundState === RoundState.Betting) {
                    // TODO dealButtonPressed(undefined, 'Lua')
                } else if (State.roundState === RoundState.Powerups) {
                    // TODO payButtonPressed(undefined, 'Lua')
                } else if (State.roundState === RoundState.Playing && !State.dealersTurn && Settings.turnTimeLimit > 0 && !State.turnActive) {
                    State.turnActive = true
                    if (State.currentPlayerTurn !== 'Nobody') {
                        let set = Zones.getObjectSetFromColor(State.currentPlayerTurn)
                        if (set !== undefined) {
                            set.clearPlayerActions(false)
                            Zones.passPlayerActions(set.zone)
                        }
                    }
                }
            }

            if (Timers.roundTimer.Clock.paused && (State.roundState === RoundState.Betting || State.roundState === RoundState.Powerups)) {
                State.setRoundStateObject(RoundState.Paused)
            } else {
                let objectState = State.getRoundStateFromObject()
                if (objectState !== RoundState.Unknown && objectState !== State.roundState) {
                    State.setRoundStateObject(State.roundState)
                }
            }

            // MINIGAME
        }
    }

    public static beginTurnTimer(set: ObjectSet, supressMessage: boolean): void {
        if (Settings.turnTimeLimit > 0) {
            State.turnActive = false
            State.setRoundState(RoundState.Playing, Settings.turnTimeLimit)

            if (Player[(set.userColor ?? set.color) as ColorLiteral].seated && !supressMessage) {
                broadcastToColor(`It's your turn. You have ${Settings.turnTimeLimit} seconds to take an action or you will be forced to stand.`, set.userColor ?? set.color, Color(0.25, 1, 0.25))
            }
        }
    }

    public static endTurnTimer(set: ObjectSet, force: boolean): void {
        if (force || Settings.turnTimeLimitEnds) {
            State.turnActive = true
            if (Timers.roundTimer !== undefined && Timers.roundTimer.getValue() as number > 0) {
                State.setRoundState(RoundState.Playing, 0)
            }
        } else {
            Timers.beginTurnTimer(set, true)
        }
    }

}