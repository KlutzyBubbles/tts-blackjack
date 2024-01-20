import RoundBonus from "../bonus/round";
import { Tag } from "../constants";
import ObjectSet from "./objectSet";
import Zones from "./zones";

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

    public static findObjectsWithTag(zone: GObject, tag: Tag, locked = false): GObject[] {
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

    public static findObjectsWithTags(zone: GObject, tags: Tag[], locked = false): GObject[] {
        return ZoneHelpers.findObjectsThatMatch(zone, (object: GObject) => {
            let hasTag = false
            for (let tag of tags) {
                if (object.hasTag(tag)) {
                    hasTag = true
                    break;
                }
            }
            if (hasTag) {
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
        return ZoneHelpers.findObjectsWithTags(zone, [Tag.Chip, Tag.BetBag], false)
    }

    public static findCardsInZone(zone: GObject): GObject[] {
        return ZoneHelpers.findObjectsWithTag(zone, Tag.Card, true)
    }

    public static findDecksInZone(zone: GObject): GObject[] {
        return ZoneHelpers.findObjectsWithTag(zone, Tag.Deck, true)
    }

    public static findPowerupsInZone(zone: GObject): GObject[] {
        return ZoneHelpers.findObjectsWithTag(zone, Tag.Powerup, true)
    }

    public static setBetsLockState(zone: GObject, locked: boolean = false): void {
        let objectList = ZoneHelpers.findBetsInZone(zone)
        for (let object of objectList) {
            object.interactable = !locked
            object.setLock(locked)
        }
    }

    public static clearCardsAndPowerups(zone: GObject): void {
        let override = RoundBonus.runBonusFunc('clearCards', { zone: zone })
        if (override === true)
            return
        let objectsToRemove = ZoneHelpers.findObjectsWithTags(zone, [Tag.Card, Tag.Deck, Tag.Powerup], false)
        for (let object of objectsToRemove) {
            destroyObject(object)
        }
        Zones.getObjectSetFromZone(zone)?.displayResult(0, false)
    }

    public static clearCardsOnly(zone: GObject): void {
        let override = RoundBonus.runBonusFunc('clearCardsOnly', { zone: zone })
        if (override === true)
            return
        let objectsToRemove = ZoneHelpers.findObjectsWithTags(zone, [Tag.Card, Tag.Deck], false)
        for (let object of objectsToRemove) {
            destroyObject(object)
        }
    }

}