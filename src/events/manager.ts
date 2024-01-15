import Logger from "../logger"

export type Event = 'onBlindfold'
| 'onChat'
| 'onPlayerChangeColor'
| 'onObjectPickUp'
| 'onObjectEnterContainer'

export class EventManager {

    private static events: { [key in Event]?: ((...args: any) => void)[] } = {}

    private static register(event: Event, func: (...args: any) => void) {
        if (EventManager.events.hasOwnProperty(event)) {
            EventManager.events[event]?.push(func)
        } else {
            EventManager.events[event] = [func]
        }
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

    public static run(event: Event, ...args: any): void {
        for (let func of EventManager.events[event] ?? []) {
            Logger.trace('events.manager', `run('${event}', [${args?.length}])`)
            func(...args)
        }
    }

}

function onObjectPickUp(color: ColorLiteral, object: GObject) {
    EventManager.run('onObjectPickUp', color, object)
}

function onObjectEnterContainer(contianer: Container, object: GObject) {
    EventManager.run('onObjectEnterContainer', contianer, object)
}

function onBlindfold(player: Player, blindfolded: boolean) {
    EventManager.run('onBlindfold', player, blindfolded)
}

function onChat(message: string, sender: Player) {
    EventManager.run('onChat', message, sender)
}

function onPlayerChangeColor(color: ColorLiteral) {
    EventManager.run('onPlayerChangeColor', color)
}