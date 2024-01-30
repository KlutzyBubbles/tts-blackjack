import { checkPermissions, colorToHex } from "./functions"
// import Settings from "./settings"
import { PlayerSelection } from "./types"

export enum LogLevel {
    Silly = 5,
    Trace = 5,
    Debug = 4,
    Info = 3,
    Information = 3,
    Warn = 2,
    Warning = 2,
    Error = 1
}

export default class Logger {

    public static colors: { [key in LogLevel]: Color } = {
        [LogLevel.Trace]: Color(0.5, 0.5, 0.5),
        [LogLevel.Debug]: Color(0.8, 0.8, 0.5),
        [LogLevel.Info]: Color(1, 1, 1),
        [LogLevel.Warn]: Color(1, 0.69, 0.255),
        [LogLevel.Error]: Color(1, 0.255, 0.255)
    }

    public static level: LogLevel = LogLevel.Trace

    public static log(tag: LogLevel, label: string, value: any) {
        if (Logger.level >= tag) {
            let file = label.toLowerCase()
            let folder = ''
            if (file.includes('.')) {
                let split = file.split('.')
                split.pop()
                folder = split.join('.')
            }
            // if (Settings.ignoreFolderTags.includes(folder)) {
            //     return
            // }
            // if (Settings.ignoreTags.includes(file)) {
            //     return
            // }
            // log(logString(value, `[${label}]`, tag, true, false), undefined, tag)
            let hex = 'FFFFFF'
            //if (Logger.colors[tag] !== undefined) {
                
            // let hexFunction = Logger.colors[tag].toHex
            // hex = hexFunction !== undefined ? hexFunction(false) : 'FFFFFF'
            //}
            hex = colorToHex(Logger.colors[tag])
            print(`[${hex}]\[${label}\]${value}`)
            //log(value, `[${label}]`, tag)
        }
    }

    public static silly(label: string, value: any) {
        Logger.log(LogLevel.Silly, label, value)
    }

    public static trace(label: string, value: any) {
        Logger.log(LogLevel.Trace, label, value)
    }

    public static debug(label: string, value: any) {
        Logger.log(LogLevel.Debug, label, value)
    }

    public static information(label: string, value: any) {
        Logger.log(LogLevel.Information, label, value)
    }

    public static info(label: string, value: any) {
        Logger.log(LogLevel.Info, label, value)
    }

    public static warning(label: string, value: any) {
        Logger.log(LogLevel.Warning, label, value)
    }

    public static warn(label: string, value: any) {
        Logger.log(LogLevel.Warn, label, value)
    }

    public static error(label: string, value: any) {
        Logger.log(LogLevel.Error, label, value)
    }

    public static broadcast(message: string, who: PlayerSelection[], color: Color) {
        for (let player of getSeatedPlayers()) {
            if (checkPermissions(who, player)) {
                broadcastToColor(message, player.color, color)
            }
        }
    }

    public static style() {
        logStyle('debug', Color(0.5, 0.5, 0.5), '[Debug]', '')
        logStyle('info', Color(1, 1, 1), '[Info]', '')
        logStyle('warn', Color(1, 0.69, 0.255), '[Warn]', '')
        logStyle('error', Color(1, 0.255, 0.255), '[Error]', '')
    }

}