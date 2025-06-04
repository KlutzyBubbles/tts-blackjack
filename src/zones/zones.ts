import { ColorZones, OtherObjectGuids, OtherZones } from "../constants";
import Settings from "../settings";
import State from "../state";
import Timers from "../timer";
import { TableColorList, TableSelection, Zone } from "../types";
import { dealButtonPressed, payButtonPressed, updateHandDisplay, createPlayerMetaActions, hitCard } from "./functions";
import ZoneHelpers from "./helpers";
import ObjectSet from "./objectSet";

export default class Zones {

    public static zones: { [key in TableSelection]?: ObjectSet } = {}
    public static deckZone: Zone | undefined = undefined;
    public static bonusZone: Zone | undefined = undefined;

    public static initZones() {
        for (let color of TableColorList) {
            Zones.initSingleZone(color, true)
        }
        Zones.deckZone = getObjectFromGUID(OtherZones.deck) as Zone
        Zones.bonusZone = getObjectFromGUID(OtherZones.bonus) as Zone
    }

    public static getBonusZone(): Zone {
        return Zones.bonusZone ?? getObjectFromGUID(OtherZones.bonus) as Zone
    }

    public static getActionButtons(): GObject[] {
        let output: GObject[] = []
        for (let zone of Object.values(Zones.zones)) {
            output.push(zone.actionButtons)
        }
        return output
    }

    public static getChipContainers(onlyPlayers: boolean = false): GObject[] {
        let output: GObject[] = []
        if (onlyPlayers) {
            for (let zoneColor of Object.keys(Zones.zones)) {
                if (zoneColor.startsWith('Split') || zoneColor === 'Dealer')
                    continue;
                let zone = Zones.zones[zoneColor as keyof typeof Zones.zones];
                if (zone !== undefined)
                    output.push(zone.container)
            }
        } else {
            for (let zone of Object.values(Zones.zones)) {
                output.push(zone.container)
            }
        }
        return output
    }

    public static getChipContainerByColor(color: ColorLiteral): GObject | undefined {
        if (color === 'Nobody' || color === 'Black' || color === 'Grey') {
            return undefined
        }
        return Zones.zones[color as keyof typeof Zones.zones]?.container
    }

    public static initSingleZone(color: TableSelection, force = false): ObjectSet {
        if (Zones.zones[color] !== undefined && !force)
            return Zones.zones[color] as ObjectSet
        let zoneIds = ColorZones[color]
        let newZone = new ObjectSet(
            getObjectFromGUID(zoneIds.zone) as Zone,
            getObjectFromGUID(zoneIds.container) as GObject,
            getObjectFromGUID(zoneIds.prestige) as Zone,
            getObjectFromGUID(zoneIds.actionButtons) as GObject,
            color,
            getObjectFromGUID(zoneIds.table) as Zone
        )
        Zones.zones[color] = newZone
        return newZone
    }

    public static getObjectSetFromColor(color: TableSelection): ObjectSet {
        return Zones.zones[color] ?? Zones.initSingleZone(color)
    }

    public static getObjectSetFromSubObject(object: GObject | Zone, key: keyof ObjectSet): ObjectSet | undefined {
        if (object === undefined || !object)
            return undefined
        for (let objectSet of Object.values(Zones.zones)) {
            if (object === objectSet[key]) {
                return objectSet
            }
        }
        return undefined
    }
    
    public static getObjectSetFromZone(zone: Zone): ObjectSet | undefined {
        return Zones.getObjectSetFromSubObject(zone, 'zone')
    }

    public static getObjectSetFromButtons(actionButtons: GObject): ObjectSet | undefined {
        return Zones.getObjectSetFromSubObject(actionButtons, 'actionButtons')
    }
}
