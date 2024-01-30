// import RoundBonus from "../bonus/round";
import { Tag } from "../constants";
// import BagHolders from "../objects/bags";
import { TableSelection } from "../types";
import ObjectSet from "./objectSet";

export default class ZoneHelpers {

    public static findObjectsThatMatch(zone: Zone, matcher: (object: GObject) => boolean) {
        let objectList = zone.getObjects()
        let foundObjects: GObject[] = []
        for (let object of objectList) {
            if (matcher(object)) {
                foundObjects.push(object)
            }
        }
        return foundObjects
    }

    public static findObjectsWithTag(zone: Zone, tag: Tag, locked = false): GObject[] {
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

    public static findObjectsWithTags(zone: Zone, tags: Tag[], locked = false): GObject[] {
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

    public static findBetsInZone(zone: Zone | undefined, interactableCheck = false): GObject[] {
        if (zone === undefined) {
            return []
        }
        let objects = ZoneHelpers.findObjectsWithTags(zone, [Tag.Chip, Tag.BetBag], false)
        let output: GObject[] = []
        if (interactableCheck) {
            for (let object of objects) {
                if (!object.interactable)
                    output.push(object)
            }
        } else {
            output = objects
        }
        return output
    }

    public static findCardsInZone(zone: Zone): GObject[] {
        return ZoneHelpers.findObjectsWithTag(zone, Tag.Card, true)
    }

    public static findDecksInZone(zone: Zone): GObject[] {
        return ZoneHelpers.findObjectsWithTag(zone, Tag.Deck, true)
    }

    public static findPowerupsInZone(zone: Zone): GObject[] {
        return ZoneHelpers.findObjectsWithTag(zone, Tag.Powerup, true)
    }

    public static setBetsLockState(zone: Zone, locked: boolean = false): void {
        let objectList = ZoneHelpers.findBetsInZone(zone)
        for (let object of objectList) {
            object.interactable = !locked
            object.setLock(locked)
        }
    }

    public static clearCardsAndPowerups(zone: Zone): void {
        //let override = RoundBonus.runBonusFunc('clearCards', { zone: zone })
        //if (override === true)
        //    return
        let objectsToRemove = ZoneHelpers.findObjectsWithTags(zone, [Tag.Card, Tag.Deck, Tag.Powerup], false)
        for (let object of objectsToRemove) {
            destroyObject(object)
        }
        // Zones.getObjectSetFromZone(zone)?.displayResult(0, false)
    }

    public static clearCardsOnly(zone: Zone): void {
        //let override = RoundBonus.runBonusFunc('clearCardsOnly', { zone: zone })
        //if (override === true)
        //    return
        let objectsToRemove = ZoneHelpers.findObjectsWithTags(zone, [Tag.Card, Tag.Deck], false)
        for (let object of objectsToRemove) {
            destroyObject(object)
        }
    }

    public static repeatBet(color: TableSelection, set: ObjectSet, setTarget?: ObjectSet, addHeight?: number): boolean {
        let target = setTarget ?? set
        let zoneObjects = set.zone.getObjects()
        let currentBet: { [key: string]: number | undefined } = {}
        
        let container: GObject | undefined = undefined;
        let badBagObjects = 0

        let refundParams: TakeObjectParameters = {}
        refundParams.position = set.container.getPosition()
        refundParams.position.y = (refundParams.position.y ?? 0) + 0.25
        for (let bet of zoneObjects) {
            if (!bet.interactable) {
                if (bet.hasTag(Tag.Chip) && !bet.hasTag(Tag.Powerup)) {
                    let count = bet.getQuantity()
                    if (count === -1) {
                        count = 1
                    }
                    currentBet[bet.getName()] = (currentBet[bet.getName()] ?? 0) + count
                } else if (bet.hasTag(Tag.BetBag)) {
                    container = bet
                    let contents = bet.getObjects()

                    bet.setRotation(Vector(0, 0, 0))
                    let pos = bet.getPosition()
                    pos.y = (pos.y ?? 0) + 10

                    let objs: GObject[] = []
                    let goodIds = bet.getTable('blackjack_betBagContents')

                    for (let i = 0; i < contents.length; i++) {
                        if (goodIds[contents[i].guid] !== undefined && goodIds[contents[i].guid] > 0) {
                            let obj = bet.takeObject({
                                position: pos,
                                rotation: Vector(0, 0, 0)
                            })
                            pos.y = (pos.y ?? 0) + 8

                            if (obj.hasTag(Tag.Chip)) {
                                let count = obj.getQuantity()
                                if (count === -1) {
                                    count = 1
                                }
                                currentBet[obj.getName()] = (currentBet[obj.getName()] ?? 0) + count
                            }
                            objs.push(obj)
                        } else {
                            let taken = bet.takeObject(refundParams)
                            refundParams.position.y = math.min((refundParams.position.y ?? 0) + 0.5, 20)
                            set.container.putObject(taken)
                            badBagObjects += 1
                        }
                        goodIds[contents[i].guid] = (goodIds[contents[i].guid] ?? 0) - 1
                    }
                    for (let i = 0; i < objs.length; i++) {
                        bet.putObject(objs[i])
                        destroyObject(objs[i])
                    }
                    Wait.time(() => {
                        //BagHolders.validateBetBag(bet)
                    }, 0.1)
                }
            }
        }
        if (badBagObjects > 0) {
            broadcastToColor(`Refunded ${badBagObjects} bad object(s) in bet bag. Did you attempt to alter your bet?`, set.color, Color(1, 0.25, 0.25))
            for (let adminColor of getSeatedPlayers()) {
                if (adminColor.admin) {
                    printToColor(`Refunded ${badBagObjects} bad object(s) in bet bag of player ${set.color} (${Player[set.color as ColorLiteral].steam_name}).`, adminColor.color, Color(1, 0, 0))
                }
            }
        }

        let tableObjects = set.table?.getObjects() ?? []
        let foundStacks: {
            chip: GObject,
            currentBet?: number
        }[] = []
        for (let chip of tableObjects) {
            if (chip.hasTag(Tag.Chip)) {
                let name = chip.getName()
                if (currentBet[name] !== undefined && (currentBet[name] ?? 0) > 0) {
                    let count = chip.getQuantity()
                    if (count === -1) {
                        count = 1
                    }
                    if (count > (currentBet[name] ?? 0)) {
                        foundStacks.push({
                            chip: chip,
                            currentBet: currentBet[name]
                        })
                        currentBet[name] = undefined
                    } else if (count === (currentBet[name] ?? 0)) {
                        foundStacks.push({
                            chip: chip
                        })
                        currentBet[name] = undefined
                    } else {
                        foundStacks.push({
                            chip: chip
                        })
                        currentBet[name] = (currentBet[name] ?? 0) - count
                    }
                }
            }
        }

        let hasBetsLeft = false
        for (let v of Object.values(currentBet)) {
            if (v !== undefined) {
                hasBetsLeft = true
                break
            }
        }

        if (hasBetsLeft) {
            broadcastToColor("Error: You don't have enough matching chips on your table.", color, Color(1, 0.25, 0.25))
		    return false
        }

        let zonePos = target.zone.getPosition()

        if (container !== undefined && set === target) {
            zonePos = container.getPosition()
            zonePos.y = (zonePos.y ?? 0) + 2
        } else {
            if (addHeight !== undefined) {
                zonePos.y = (zonePos.y ?? 0) + addHeight
            }
            zonePos.z = (zonePos.z ?? 0) + 3.1
            zonePos.y = (zonePos.y ?? 0) - 2
        }

        let placedBag: GObject | undefined = undefined
        /*if (BagHolders.betBags !== undefined && foundStacks.length > 1) {
            placedBag = BagHolders.betBags.takeObject({
                position: zonePos,
                rotation: Vector(0, 0, 0)
            })
            zonePos.y = (zonePos.y ?? 0) + 3
            placedBag.interactable = false
            placedBag.setLock(true)
        }*/

        for (let i = 0; i < foundStacks.length; i++) {
            let table = foundStacks[i]
            if (table.currentBet !== undefined) {
                for (let j = 0; j < table.currentBet; j++) {
                    let taken = table.chip.takeObject({
                        position: zonePos,
                        rotation: Vector(0, 0, 0)
                    })
                    zonePos.y = (zonePos.y ?? 0) + 0.1
                    if (placedBag !== undefined) {
                        //placedBag.putObject(taken)
                    } else {
                        taken.interactable = false
                        taken.setLock(true)
                    }
                    zonePos.y = (zonePos.y ?? 0) + 0.6
                }
            } else {
                table.chip.setPositionSmooth(zonePos)
                table.chip.setRotation(Vector(0, 0, 0))

                zonePos.y = (zonePos.y ?? 0) + (math.max(table.chip.getQuantity(), 1) * 0.6)

                if (placedBag !== undefined) {
                    //placedBag.putObject(table.chip)
                } else {
                    table.chip.interactable = false
                    table.chip.setLock(true)
                }
            }
        }

        if (placedBag !== undefined) {
            Wait.time(() => {
                //BagHolders.validateBetBag(placedBag)
            }, 0.1)
        }
        return true
    }

}