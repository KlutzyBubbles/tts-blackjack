import RoundBonus from "../bonus/round";
import { OtherObjectGuids, Tag } from "../constants";
import { EventManager } from "../events/manager";
import PowerupManager from "../powerups/manager"; // Problem
//import Settings from "../settings";
//import { TableSelection } from "../types";
import { checkPowerupDropZone } from "../zones/functions";
import Zones from "../zones/zones";
//import { generatePermissionString } from "./pickup";

let objectHasLeftContainer: { [key: string]: Container | undefined } = {}
let objectForceDropped: { [key: string]: boolean } = {}

export function onObjectDropped(color: ColorLiteral, object: GObject): void {
    let player = Player[color]
    let holding = player.getHoldingObjects()
    if (holding.length > 0) {
        return
    }

    if (objectForceDropped[object.guid] !== undefined && objectForceDropped[object.guid]) {
        return
    } else if ((object.getPosition().z ?? 0) < -16 && color !== 'Black' && !player.admin) {
        let trash = getObjectFromGUID(OtherObjectGuids.trash)
        if (trash !== undefined) {
            trash.putObject(object)
            printToColor("You dropped an item in the dealer zone; it has ben placed in Trash.", color, Color(0.75, 0.45, 0.35))
        }
        return
    }

    /*
    let power = PowerupManager.definitions[object.getName()]
    if (power !== undefined && RoundBonus.canUsePowerup(object)) {
        checkPowerupDropZone(color, object, power.who, power.effect)
        return
    }
/*
    if ((object.hasTag(Tag.Chip) || object.hasTag(Tag.Powerup)) && object.getDescription().startsWith(player.steam_id)) {
        let inOwnZone = false
        for (let set of Object.values(Zones.zones)) {
            if (set.color !== 'Dealer') {
                for (let v of ['zone', 'table', 'prestige']) {
                    let zone = set.getZone(v)
                    if (zone === undefined)
                        continue
                    for (let zoneObject of zone.getObjects()) {
                        if (object === zoneObject) {
                            let setColor = set.color
                            if (setColor === color) {
                                inOwnZone = true
                                zoneObject.setDescription(generatePermissionString(player))
                                break
                            }
                            let setPlayer = Player[setColor as ColorLiteral]
                            if (setColor.startsWith('Split') && setPlayer !== undefined && setPlayer.seated) {
                                if ((zoneObject.hasTag(Tag.Chip) && Settings.allowChipTrading) || (zoneObject.hasTag(Tag.Powerup) && Settings.allowPowerupTrading)) {
                                    zoneObject.setDescription(generatePermissionString(player))
                                } else if (!player.admin) {
                                    let ownSet = Zones.getObjectSetFromColor(color as TableSelection)
                                    if (ownSet !== undefined) {
                                        zoneObject.setPosition(ownSet.table?.getPosition() ?? Vector(0, 0, 0))
                                    }
                                    broadcastToColor("You may not trade chips. Chips have been returned to your table.", color, Color(1, 0, 0))
                                    break
                                }
                            }
                        }
                    }
                    if (inOwnZone) {
                        break
                    }
                }
            }
        }
    }
    */
}

export function onObjectLeaveContainer(bag: Container, object: GObject): void {
    if ((object.getPosition().z ?? 0) < -16) {
        objectHasLeftContainer[object.guid] = bag
        Wait.frames(() => {
            objectHasLeftContainer[object.guid] = undefined
        }, 2)
    }
}

export function onObjectPickedUp(color: ColorLiteral, object: GObject): void {
    if (color !== 'Black' && !Player[color].admin) {
        if ((object.getPosition().z ?? 0) < -16) {
            object.translate(Vector(0, 0.15, 0))
            print(`${color} picked up a ${object.getTags().join(', ')} titled "${object.getName()}" from the hidden zone!`)
            let container = objectHasLeftContainer[object.guid]
            if (container !== undefined) {
                if (container.hasTag(Tag.Infinite)) {
                    destroyObject(object)
                } else {
                    container.putObject(object)
                }
            } else {
                objectForceDropped[object.guid] = true
                Wait.frames(() => {
                    objectForceDropped[object.guid] = false
                }, 2)
            }
        }
        for (let set of Object.values(Zones.zones)) {
            let objectsInZone = set.zone.getObjects()
            for (let found of objectsInZone) {
                if (found.hasTag(Tag.Deck) || found.hasTag(Tag.Card)) {
                    if (found === object) {
                        object.translate(Vector(0, 0.15, 0))
                    }
                }
            }
        }
    }
}

//EventManager.onObjectDrop(onObjectDropped)
EventManager.onObjectLeaveContainer(onObjectLeaveContainer)
EventManager.onObjectPickUp(onObjectPickedUp)
