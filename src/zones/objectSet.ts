import Settings from "../settings";
import State from "../state";
import Timers, { setRoundState } from "../timer";
import { RoundState, TableSelection } from "../types";

export default class ObjectSet {

    public zone: Zone;
    public container: GObject;
    public prestige: Zone;
    public actionButtons: GObject;
    public table?: Zone;

    public value = 0;
    public soft = false;
    public count = 0;

    public splitUser: ObjectSet | undefined = undefined;

    public userColor: TableSelection | undefined = undefined;
    public color: TableSelection;

    public constructor(zone: Zone, container: GObject, prestige: Zone, actionButtons: GObject, color: TableSelection, table?: Zone) {
        this.zone = zone;
        this.container = container;
        this.prestige = prestige;
        this.actionButtons = actionButtons;
        this.table = table;
        this.color = color;
    }

    public getZone(key: string): Zone | undefined {
        if (key.toLowerCase() == 'zone') {
            return this.zone
        } else if (key.toLowerCase() == 'prestige') {
            return this.prestige
        } else if (key.toLowerCase() == 'table' || key.toLowerCase() == 'tbl') {
            return this.table
        }
        return undefined
    }

    public beginTurnTimer(supressMessage: boolean): void {
        if (Settings.turnTimeLimit > 0) {
            State.turnActive = false
            setRoundState(RoundState.Playing, Settings.turnTimeLimit)
    
            if (Player[(this.userColor ?? this.color) as ColorLiteral].seated && !supressMessage) {
                broadcastToColor(`It's your turn. You have ${Settings.turnTimeLimit} seconds to take an action or you will be forced to stand.`, this.userColor ?? this.color, Color(0.25, 1, 0.25))
            }
        }
    }
    
    public endTurnTimer(force: boolean): void {
        if (force || Settings.turnTimeLimitEnds) {
            State.turnActive = true
            if (Timers.roundTimer !== undefined && Timers.roundTimer.getValue() as number > 0) {
                setRoundState(RoundState.Playing, 0)
            }
        } else {
            this.beginTurnTimer(true)
        }
    }

    public canInitiateAction(color: ColorLiteral): boolean {
        return this.color === color
            || color === 'Black'
            || Player[color].promoted
            || Player[color].host
            || (this.color.startsWith('Split') && this.userColor === color)
    }

}