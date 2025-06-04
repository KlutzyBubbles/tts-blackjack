import Logger from "../logger"

export function generatePermissionString(player: Player): string {
    let result = `${player.steam_id} - ${player.steam_name}`
    Logger.trace('items.pickup', `generatePermissionString(${player}) => '${result}'`)
    return result
}