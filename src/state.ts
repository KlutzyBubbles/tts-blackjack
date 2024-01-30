import { RoundStateGuids } from "./constants";
import Timers from "./timer";
import { RoundState, TableSelection } from "./types";

export default class State {

    public static roundState: RoundState = RoundState.Betting
    public static roundStateObject: GObject | undefined = undefined;

    public static lastCard: GObject | undefined = undefined;

    public static dealersTurn: boolean = false
    public static dealingDealerCards: boolean = false
    public static lockout: boolean = false

    public static currentPlayerTurn: TableSelection | 'Nobody' = 'Nobody'
    
    public static timerTick: number = 0
    public static nextAutoCardCount: number = 0

    public static turnActive: boolean = false

    public static dealOrder: Player[] = []


    public static setRoundStateObject(stateId: RoundState): void {
        for (let id of Object.keys(RoundStateGuids)) {
            State.roundStateObject = getObjectFromGUID(id) as GObject
            if (State.roundStateObject !== undefined)
                break
        }
        if (State.roundStateObject !== undefined
            && State.roundStateObject.getStateId() !== -1
            && State.roundStateObject.getStateId() !== stateId) {
            State.roundStateObject.setState(stateId)
            State.roundState = stateId
        }
    }

    public static getRoundStateFromObject(): RoundState {
        if (State.roundStateObject !== undefined) {
            return State.roundStateObject.getStateId()
        }
        for (let id of Object.keys(RoundStateGuids)) {
            State.roundStateObject = getObjectFromGUID(id) as GObject
            if (State.roundStateObject !== undefined)
                return State.roundStateObject.getStateId()
        }
        return RoundState.Unknown
    }

    public static lockoutTimer(time: number): void {
        State.lockout = true
        Wait.time(() => State.concludeLockout, time)
    }

    public static concludeLockout(): void {
        State.lockout = false
    }

}
