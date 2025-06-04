import { Tag } from "../constants";
import { EventManager } from "../events/manager";
import Logger from "../logger";
import { generatePermissionString } from "./functions";

let preventEnterContainer: { [key: string]: GObject | undefined } = {}

export function dropItemPermission(color: ColorLiteral, object: GObject) {
    Logger.trace('items.drop', `dropItemPermission(${color}, ${object})`)
    
}

EventManager.onObjectDrop(dropItemPermission)
