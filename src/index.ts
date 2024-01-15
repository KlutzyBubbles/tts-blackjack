import "./events"
import Logger, { LogLevel } from "./logger";
import "./ui"
import "./items/pickup"

function onLoad(saveData?: any) {
    Logger.level = LogLevel.Trace
    Logger.style()
    Logger.trace('index', 'TRACER')
    Logger.debug('index', 'DEBUGGGY')
    Logger.info('index', 'INFOOSS')
    Logger.warn('index', 'WARNERS')
    Logger.error('index', 'ERRORIST')
}

function clickSave() {
    print("save")
}

function clickLoad() {
    print("Load")
}

function clickQuicksave() {
    print("Quicksave")
}

function clickPrestige() {
    print("Prestige")
}
