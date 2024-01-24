import "./events"
import Logger, { LogLevel } from "./logger";
import "./ui"
import "./items"
import CommandHandler from "./commands/handler";
import SettingsCommand from "./commands/settings";
import { bulkSetInteractable, getObjects } from "./functions";
import { ObjectLockdown } from "./constants";
import Zones from "./zones/zones";
import DeckManager from "./objects/decks";
import RoundBonus from "./bonus/round";
import Timers from "./timer";
import BagHolders from "./objects/bags";
import Rewards from "./objects/rewards";
import PowerupManager from "./powerups/manager";

function onLoad(saveData?: any) {
    Logger.level = LogLevel.Trace
    Logger.style()
    Logger.trace('index', 'TRACER')
    Logger.debug('index', 'DEBUGGGY')
    Logger.info('index', 'INFOOSS')
    Logger.warn('index', 'WARNERS')
    Logger.error('index', 'ERRORIST')

    CommandHandler.register('settings', new SettingsCommand())
    Zones.initZones()
    Timers.initTimers()
    RoundBonus.initBonuses()
    BagHolders.initBags()
    Rewards.initRewards()
    PowerupManager.initPowerups()

    bulkSetInteractable(getObjects(ObjectLockdown), false)
    bulkSetInteractable(Zones.getActionButtons(), false)

    Zones.createButtons()
    DeckManager.checkForDeck()
    Zones.findCardsToCount()
    RoundBonus.clearBonus()
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
