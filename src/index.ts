import Logger, { LogLevel } from "./logger";
import "./events";
import "./chips"; // Tabletop Board Chip Spawner
import "./ui";
import "./items";
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
import "./commands/handler";
import "./events/onObjectDestroy";
import State from "./state";
import { PowerupEffect, PowerupTarget } from "./types";
import ObjectSet from "./zones/objectSet";
import { clearBonus, createZoneButtons, effects, findCardsToCount } from "./zones/functions";

function onLoad(saveData?: any) {
    Logger.level = LogLevel.Trace
    Logger.style()
    Logger.trace('index', 'TRACER')
    Logger.debug('index', 'DEBUGGGY')
    Logger.info('index', 'INFOOSS')
    Logger.warn('index', 'WARNERS')
    Logger.error('index', 'ERRORIST')

    State.roundState = 1
    CommandHandler.register('settings', new SettingsCommand())
    Zones.initZones()
    Timers.initTimers()
    RoundBonus.initBonuses()
    BagHolders.initBags()
    Rewards.initRewards()
    PowerupManager.initPowerups()

    bulkSetInteractable(getObjects(ObjectLockdown), false)
    bulkSetInteractable(Zones.getActionButtons(), false)

    createZoneButtons()
    DeckManager.checkForDeck()
    findCardsToCount()
    clearBonus()
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

function AddPowerup(data?: {
    obj?: GObject,
    who?: PowerupTarget,
    effectName?: PowerupEffect,
    func?: (objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet) => boolean
}): void {
    if (data === undefined || data.obj === undefined || data.who === undefined) {
        return
    }
    let name = data.obj.getName()
    if (name === undefined || name === '' || PowerupManager.definitions[name] !== undefined) {
        return
    }
    let effectName = data.effectName
    if (effectName === undefined || effectName as string === '') {
        return
    }
    PowerupManager.definitions[name] = {
        who: data.who,
        effect: effectName
    }
    effects[effectName] = effects[effectName] ?? data.func
    PowerupManager.powerups[name] = data.obj.getGUID()
}