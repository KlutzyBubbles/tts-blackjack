import { EventManager } from "../events/manager";
import { checkPermissions } from "../functions";
import Logger from "../logger";
import Settings from "../settings";
import { PlayerSelection } from "../types";
import { CommandRunner } from "./handler";


export default class SettingsCommand implements CommandRunner {

    public permissions: PlayerSelection[] = ['Admin'];
    public execute(player: Player, ...args: string[]): void {
        if (args === undefined || args.length === 0) {
            this.printHelp(player)
        } else {
            let arg1Options = ['list', 'get', 'set', 'add', 'remove']
            let mainArg = args[0].toLowerCase() ?? '';
            args.shift()
            if (!arg1Options.includes(mainArg)) {
                printToColor(`Invalid option: ${args[0]}`, player.color, Color.Red)
                this.printHelp(player)
            } else {
                if (mainArg === 'list') {
                    if (args.length > 0) {
                        let secondaryArg = args[0].toLowerCase() ?? ''
                        args.shift()
                        if (secondaryArg === 'help' || secondaryArg === '?') {
                            this.printHelp(player, 'list')
                            return
                        }
                    }
                    printToColor('Settings options: ', player.color, Color.White)
                    for (let property of Object.keys(Settings.definitions)) {
                        printToColor(`${property}: ${Settings.definitions[property]}`, player.color, Color.White)
                    }
                    return
                } else if (mainArg === 'get') {
                    printToColor('Get not implemented', player.color, Color.White)
                } else if (mainArg === 'set') {
                    printToColor('Set not implemented', player.color, Color.White)
                } else if (mainArg === 'add') {
                    printToColor('Add not implemented', player.color, Color.White)
                } else if (mainArg === 'remove') {
                    printToColor('Remove not implemented', player.color, Color.White)
                }
            }
        }
    }

    private printHelp(player: Player, subMenu?: string) {
        if (subMenu === 'list') {
            printToColor('!settings list help', player.color, Color.White)
            printToColor('lists settings avialable to edit, just use !settings list', player.color, Color.White)
        } else if (subMenu === 'get') {
            printToColor('!settings get help', player.color, Color.White)
            printToColor('Get value of setting', player.color, Color.White)
            printToColor('!settings get <setting>', player.color, Color.White)
        } else if (subMenu === 'set') {
            printToColor('!settings set help', player.color, Color.White)
            printToColor('Set value of setting to value', player.color, Color.White)
            printToColor('!settings get <setting> <value>', player.color, Color.White)
        } else if (subMenu === 'add') {
            printToColor('!settings add help', player.color, Color.White)
            printToColor('Add value to list setting', player.color, Color.White)
            printToColor('!settings add <setting> <value>', player.color, Color.White)
        } else if (subMenu === 'remove') {
            printToColor('!settings remove help', player.color, Color.White)
            printToColor('Remove value in list setting', player.color, Color.White)
            printToColor('!settings get <setting> <value>', player.color, Color.White)
        } else {
            printToColor('!settings help', player.color, Color.White)
            printToColor('Options', player.color, Color.White)
            printToColor('!settings list', player.color, Color.White)
            printToColor('!settings get <setting>', player.color, Color.White)
            printToColor('!settings set <setting> <value>', player.color, Color.White)
            printToColor('!settings add <setting> <value to add>', player.color, Color.White)
            printToColor('!settings remove <setting> <value to remove>', player.color, Color.White)
        }
    }

}
