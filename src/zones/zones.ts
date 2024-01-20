import { ColorZones, OtherZones } from "../constants";
import Settings from "../settings";
import State from "../state";
import Timers from "../timer";
import { TableColorList, TableSelection } from "../types";
import ZoneHelpers from "./helpers";
import ObjectSet from "./objectSet";

export default class Zones {

    public static zones: { [key in TableSelection]?: ObjectSet } = {}
    public static deckZone: GObject | undefined;
    public static bonusZone: GObject | undefined;

    public static initZones() {
        for (let color of TableColorList) {
            Zones.initSingleZone(color, true)
        }
        Zones.deckZone = getObjectFromGUID(OtherZones.deck)
        Zones.bonusZone = getObjectFromGUID(OtherZones.bonus)
    }

    public static getBonusZone(): GObject {
        return Zones.bonusZone ?? getObjectFromGUID(OtherZones.bonus)
    }

    public static initSingleZone(color: TableSelection, force = false): ObjectSet {
        if (Zones.zones[color] !== undefined && !force)
            return Zones.zones[color] as ObjectSet
        let zoneIds = ColorZones[color]
        let newZone = new ObjectSet(
            getObjectFromGUID(zoneIds.zone),
            getObjectFromGUID(zoneIds.container),
            getObjectFromGUID(zoneIds.prestige),
            getObjectFromGUID(zoneIds.actionButtons),
            getObjectFromGUID(zoneIds.table),
            color
        )
        Zones.zones[color] = newZone
        return newZone
    }

    public static getObjectSetFromColor(color: TableSelection): ObjectSet {
        return Zones.zones[color] ?? Zones.initSingleZone(color)
    }

    public static getObjectSetFromSubObject(object: GObject, key: keyof ObjectSet): ObjectSet | undefined {
        if (object === undefined || !object)
            return undefined
        for (let objectSet of Object.values(Zones.zones)) {
            if (object === objectSet[key]) {
                return objectSet
            }
        }
        return undefined
    }

    public static getObjectSetFromZone(zone: GObject): ObjectSet | undefined {
        return Zones.getObjectSetFromSubObject(zone, 'zone')
    }

    public static getObjectSetFromButtons(actionButtons: GObject): ObjectSet | undefined {
        return Zones.getObjectSetFromSubObject(actionButtons, 'actionButtons')
    }

    public static updateAllDisplays(): void {
        for (let zone of Object.values(Zones.zones)) {
            zone.updateHandDisplay()
        }
    }

    public static findCardsToCount(): void {
        State.nextAutoCardCount = os.time() + 5
        for (let zone of Object.values(Zones.zones)) {
            zone.updateHandDisplay()
        }
        // TODO timerStart()
    }

    public static passPlayerActions(zone: GObject): void {
        let nextInLine = -1;
        for (let i = 0; i < Object.keys(Zones.zones).length; i++) {
            let set = Zones.zones[Object.keys(Zones.zones)[i] as TableSelection]
            if (set === undefined)
                continue
            if (set.color === 'Dealer') {
                State.dealersTurn = true
                State.currentPlayerTurn = 'Nobody'
                // TODO revealHandZone(set.zone, true)
                if (Settings.turnTimeLimit > 0 && Timers.roundTimer !== undefined) {
                    Timers.roundTimer.setValue(0)
                    Timers.roundTimer.Clock.paused = false
                }
                break
            } else if (set.zone === zone) {
                if (set.color.startsWith('Split') && set.splitUser !== undefined) {
                    let originalSet = set.splitUser
                    
                    let betsInZone = ZoneHelpers.findBetsInZone(originalSet.zone).length
                    let cardsInZone = ZoneHelpers.findCardsInZone(originalSet.zone).length
                    let decksInZone = ZoneHelpers.findDecksInZone(originalSet.zone).length
                    if (betsInZone !== 0 && (cardsInZone !== 0 || decksInZone !== 0) && originalSet.value <= 21) {
                        State.currentPlayerTurn = originalSet.color
                        originalSet.createPlayerActions(false)
                        break
                    }
                    return Zones.passPlayerActions(originalSet.zone)
                }
                nextInLine = i + 1
            } else if (i === nextInLine) {
                let betsInZone = ZoneHelpers.findBetsInZone(set.zone).length
                let cardsInZone = ZoneHelpers.findCardsInZone(set.zone).length
                let decksInZone = ZoneHelpers.findDecksInZone(set.zone).length
                if (betsInZone !== 0 && (cardsInZone !== 0 || decksInZone !== 0) && set.value <= 21) {
                    State.currentPlayerTurn = set.color
                    set.createPlayerActions(false)
                    // TODO beginTurnTimer(set)
                    break
                }
            }
        }
    }

}