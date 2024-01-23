import { Tag } from "./constants"
import ObjectSet from "./zones/objectSet"

function giveRewardCallback(object: GObject, data?: {
    pos?: Vector,
    set?: ObjectSet
}): void {
    if (object === undefined || data === undefined || data.pos === undefined || data.set === undefined) {
        return
    }
    if (object.hasTag(Tag.SaveBag)) {
        object.reset()

        let player = Player[data.set.color as ColorLiteral]
        object.setName(`Player save: ${player.steam_name}`)
        object.setDescription(player.steam_id)
    }
    let pos = Vector(data.pos.x ?? 0, data.pos.y ?? 0, data.pos.z ?? 0)
    object.setPosition(pos)
}

function validatePayoutObjectCallback(object: GObject, data?: {
    container?: GObject
}): void {
    if (object.hasTag(Tag.Chip)) {
        object.destruct()
        return
    }
    object.setLock(false)
    if (data?.container !== undefined) {
        data.container.putObject(object)
    }
}