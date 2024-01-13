export type Event = 'onBlindfold' | 'onChat' | 'onPlayerChangeColor'

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

    public static run(event: Event, ...args: any): void {
        for (let func of EventManager.events[event] ?? []) {
            print('calling')
            func(...args)
        }
    }

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