import { ColorZones } from "../constants";
import { TableColorList, TableSelection } from "../types";
import ObjectSet from "./objectSet";

export default class Zones {

    private static zones: { [key in TableSelection]?: ObjectSet } = {}

    public static initZones() {
        for (let color of TableColorList) {
            Zones.initSingleZone(color)
        }
    }

    public static initSingleZone(color: TableSelection): ObjectSet {
        let zoneIds = ColorZones[color]
        let newZone = new ObjectSet(
            getObjectFromGUID(zoneIds.zone),
            getObjectFromGUID(zoneIds.container),
            getObjectFromGUID(zoneIds.prestige),
            getObjectFromGUID(zoneIds.actionButtons),
            getObjectFromGUID(zoneIds.table)
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

}