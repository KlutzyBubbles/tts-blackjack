import { Tag } from "../constants";

export default class ZoneHelpers {

    public static findObjectsThatMatch(zone: GObject, matcher: (object: GObject) => boolean) {
        let objectList = zone.getObjects()
        let foundObjects: GObject[] = []
        for (let object of objectList) {
            let actualObject = getObjectFromGUID(object.guid)
            if (matcher(actualObject)) {
                foundObjects.push(actualObject)
            }
        }
        return foundObjects
    }

    public static findObjectsWithTag(zone: GObject, tag: Tag, locked = true): GObject[] {
        return ZoneHelpers.findObjectsThatMatch(zone, (object: GObject) => {
            if (object.hasTag(tag)) {
                if (locked) {
                    if (object.getLock()) {
                        return true
                    }
                    return false
                }
                return true
            }
            return false
        })
    }

    public static findBetsInZone(zone: GObject): GObject[] {
        return ZoneHelpers.findObjectsThatMatch(zone, (object: GObject) => {
            if (object.hasTag(Tag.Chip) || object.hasTag(Tag.BetBag)) {
                return true
            }
            return false
        })
    }

    public static findCardsInZone(zone: GObject) {
        return ZoneHelpers.findObjectsWithTag(zone, Tag.Card, true)
    }

    public static findDecksInZone(zone: GObject) {
        return ZoneHelpers.findObjectsWithTag(zone, Tag.Deck, true)
    }

    public static findPowerupsInZone(zone: GObject) {
        return ZoneHelpers.findObjectsWithTag(zone, Tag.Powerup, true)
    }

}