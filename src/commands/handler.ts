import { EventManager } from "../events/manager";
import { checkPermissions } from "../functions";
import Logger from "../logger";
import { PlayerSelection } from "../types";

export interface CommandRunner {
    permissions: PlayerSelection[]
    execute(...args: string[]): void
}

export default class CommandHandler {

    private static commands: { [key: string]: CommandRunner }

    public static register(command: string, runner: CommandRunner) {
        Logger.trace('commands.handler', `register('${command}', ${runner})`)
        CommandHandler.commands[command] = runner;
    }

    public static playerChat(message: string, player: Player) {
        Logger.trace('commands.handler', `playerChat('${message}', ${player})`)
        if (message.startsWith('!')) {
            Logger.trace('commands.handler', 'is command')
            let args = message.substring(1, message.length).split(' ')
            let base = args.shift() ?? ''
            Logger.trace('commands.handler', `base: ${base}`)
            Logger.trace('commands.handler', `args: [${args.join(', ')}]`)
            if (CommandHandler.commands[base] !== undefined) {
                Logger.trace('commands.handler', 'base command exists')
                // Command exists
                let command = CommandHandler.commands[base]
                if (checkPermissions(command.permissions, player)) {
                    Logger.trace('commands.handler', 'base command player has permission')
                    command.execute(...args)
                }
            }
        }
    }

}

EventManager.onChat((message, player) => CommandHandler.playerChat(message, player))