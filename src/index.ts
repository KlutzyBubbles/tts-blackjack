import "./events"
import Logger, { LogLevel } from "./logger";
import "./ui"
import "./items/pickup"
import CommandHandler from "./commands/handler";
import SettingsCommand from "./commands/settings";
import { bulkSetInteractable, getObjects } from "./functions";
import { ObjectLockdown } from "./constants";
import Zones from "./zones/zones";

function onLoad(saveData?: any) {
    Logger.level = LogLevel.Trace
    Logger.style()
    Logger.trace('index', 'TRACER')
    Logger.debug('index', 'DEBUGGGY')
    Logger.info('index', 'INFOOSS')
    Logger.warn('index', 'WARNERS')
    Logger.error('index', 'ERRORIST')

    CommandHandler.register('settings', new SettingsCommand())
    bulkSetInteractable(getObjects(ObjectLockdown), false)
    bulkSetInteractable(Zones.getActionButtons(), false)
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
