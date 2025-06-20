import Logger from "../logger"
import { Zone } from "../types"

export type Event = 'onBlindfold'
| 'onChat'
| 'onPlayerChangeColor'
| 'onObjectPickUp'
| 'onObjectEnterContainer'
| 'onObjectLeaveContainer'
| 'onObjectDestroy'
| 'onObjectDrop'
| 'onObjectEnterScriptingZone'

export class EventManager {

    private static events: { [key in Event]?: ((...args: any) => void)[] } = {}

    private static register(event: Event, func: (...args: any) => void) {
        Logger.trace('events.manager', `Registering ${event}`)
        if (EventManager.events[event] === undefined) {
            EventManager.events[event] = []
        }
        EventManager.events[event]?.push(func)
    }

    public static onBlindfold(func: typeof onBlindfold) {
        EventManager.register('onBlindfold', func)
    }

    public static onChat(func: typeof onChat) {
        EventManager.register('onChat', func)
    }

    public static onPlayerChangeColor(func: typeof onPlayerChangeColor) {
        EventManager.register('onPlayerChangeColor', func)
    }

    public static onObjectPickUp(func: typeof onObjectPickUp) {
        EventManager.register('onObjectPickUp', func)
    }

    public static onObjectEnterContainer(func: typeof onObjectEnterContainer) {
        EventManager.register('onObjectEnterContainer', func)
    }

    public static onObjectLeaveContainer(func: typeof onObjectLeaveContainer) {
        EventManager.register('onObjectLeaveContainer', func)
    }

    public static onObjectDestroy(func: typeof onObjectDestroy) {
        EventManager.register('onObjectDestroy', func)
    }

    public static onObjectDrop(func: typeof onObjectDrop) {
        EventManager.register('onObjectDrop', func)
    }

    public static onObjectEnterScriptingZone(func: typeof onObjectEnterScriptingZone) {
        EventManager.register('onObjectEnterScriptingZone', func)
    }

    public static run(event: Event, ...args: any): void {
        for (let func of EventManager.events[event] ?? []) {
            // Logger.trace('events.manager', `run('${event}', [${args?.length}])`)
            func(...args)
        }
    }

}

function onObjectPickUp(color: ColorLiteral, object: GObject) {
    EventManager.run('onObjectPickUp', color, object)
}

function onObjectEnterContainer(container: GObject, object: GObject) {
    EventManager.run('onObjectEnterContainer', container, object)
}

function onObjectLeaveContainer(container: GObject, object: GObject) {
    EventManager.run('onObjectLeaveContainer', container, object)
}

function onBlindfold(player: Player, blindfolded: boolean) {
    print('blindfoldeedd')
    EventManager.run('onBlindfold', player, blindfolded)
}

function onChat(message: string, sender: Player) {
    EventManager.run('onChat', message, sender)
}

function onPlayerChangeColor(color: ColorLiteral) {
    EventManager.run('onPlayerChangeColor', color)
}

let countDestroy = 0

function onObjectDestroy(object: GObject) {
    countDestroy++;
    EventManager.run('onObjectDestroy', object)
}

function onObjectDrop(color: ColorLiteral, object: GObject) {
    EventManager.run('onObjectDrop', color, object)
}

function onObjectEnterScriptingZone(zone: Zone, object: GObject) {
    EventManager.run('onObjectEnterScriptingZone', zone, object)
}