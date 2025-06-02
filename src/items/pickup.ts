import { Tag } from "../constants";
import { EventManager } from "../events/manager";
import Logger from "../logger";

export function generatePermissionString(player: Player): string {
    let result = `${player.steam_id} - ${player.steam_name}`
    Logger.trace('items.pickup', `generatePermissionString(${player}) => '${result}'`)
    return result
}

let preventEnterContainer: { [key: string]: GObject | undefined } = {}

export function pickupItemPermission(color: ColorLiteral, object: GObject) {
    Logger.trace('items.pickup', `pickupItemPermission(${color}, ${object})`)
    if (color === 'Black' || !object.hasTag(Tag.Permissionable)) {
        Logger.trace('items.pickup', `Color is black or doesn't have tag`)
        return
    }
    let description = object.getDescription()
    let player = Player[color]
    if (description === '') {
        Logger.trace('items.pickup', `Description is empty`)
        object.setDescription(generatePermissionString(player))
    } else if (description.startsWith(player.steam_id || 'UNKNOWN_STEAM_ID')) {
        Logger.trace('items.pickup', `Description starts with '${player.steam_id}'`)
        if (description.includes('\n')) {
            Logger.trace('items.pickup', `Description includes newline`)
            let oldDescription = description.split('\n')
            oldDescription.shift()
            object.setDescription(`${generatePermissionString(player)}\n${oldDescription.join('\n')}`)
        } else {
            Logger.trace('items.pickup', `Description only permission`)
            object.setDescription(generatePermissionString(player))
        }
    } else if (!player.admin) {
        Logger.trace('items.pickup', `Player isn't admin`)
        let guid = object.getGUID()
        preventEnterContainer[guid] = object.reload()
        Wait.frames(() => {
            preventEnterContainer[guid] = undefined
        }, 1)
        Logger.broadcast(`${player.steam_name} attempted to lift another player's ${object.getName()}`, ['Admin'], Color.Red)
    }
}

export function preventEnterList(container: GObject, object: GObject) {
    Logger.trace('items.pickup', `preventEnterList(${container}, ${object})`)
    let preventItem = preventEnterContainer[object.getGUID()]
    if (preventItem !== undefined && preventItem === object) {
        Logger.trace('items.pickup', 'item is in and the same, destroying...')
        destroyObject(object)
    }
}

EventManager.onObjectPickUp(pickupItemPermission)
EventManager.onObjectEnterContainer(preventEnterList)
