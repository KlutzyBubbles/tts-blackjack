import { BagGuids, Tag } from "../constants";
import PowerupManager from "../powerups/manager"
import { TableSelection } from "../types"
import ObjectSet from "../zones/objectSet";
import Zones from "../zones/zones"

export default class RoundBonus {

    public static bonusBag: GObject | undefined;
    public static bonusObjects: GObject[] = [];

    public static initBonuses(): void {
        RoundBonus.bonusBag = getObjectFromGUID(BagGuids.bonus) as GObject
    }

    public static getBonusBag(): GObject {
        return RoundBonus.bonusBag ?? getObjectFromGUID(BagGuids.bonus) as GObject
    }

    public static addBonus(position?: Vector): void {
        if (position === undefined) {
            position = Zones.bonusZone?.getPosition()
            if (position === undefined)
                return
            position.y = (position.y ?? 10) - 1.7
        }

        let params: TakeObjectParameters = {}
        params.position = position

        let autoBonuses = RoundBonus.getBonusBag().takeObject(params)
        autoBonuses.shuffle()

        params.callback_function = RoundBonus.activateBonus

        let chosenBonus: GObject | undefined;
        do {
            chosenBonus = autoBonuses.takeObject(params)
            chosenBonus.setColorTint(Color(0.25, 0.25, 0.25))

            for (let i = 0; i < RoundBonus.bonusObjects.length; i++) {
                if (RoundBonus.bonusObjects[i].getName() === chosenBonus?.getName()) {
                    destroyObject(chosenBonus)
                    chosenBonus = undefined
                    break
                }
            }
        } while (chosenBonus === undefined && autoBonuses.getObjects().length > 0)

        if (chosenBonus !== undefined) {
            RoundBonus.bonusObjects.push(chosenBonus)
        }

        autoBonuses.destruct()
    }

    public static activateBonus(object: GObject): void {
        let inTable = false
        for (let i = 0; i < RoundBonus.bonusObjects.length; i++) {
            if (RoundBonus.bonusObjects[i] === object) {
                inTable = true
                break
            }
        }
        if (!inTable) {
            RoundBonus.bonusObjects.push(object)
        }
        object.setLock(true)
        if (object.getVar('onDeploy')) {
            object.call('onDeploy')
        } else {
            object.setColorTint(Color(1, 1, 1))
        }
    }

    public static clearBonus(): void {
        if (RoundBonus.bonusObjects.length === 0) {
            let objectList = Zones.getBonusZone().getObjects()
            for (let objectData of objectList) {
                let object = getObjectFromGUID(objectData.guid)
                if (object.hasTag(Tag.Powerup) && object.getLock()) {
                    object.destruct()
                }
            }
        } else {
            for (let i = 0; i < RoundBonus.bonusObjects.length; i++) {
                RoundBonus.bonusObjects[i].destruct()
            }
            RoundBonus.bonusObjects = []
        }
    }

    public static bonusRound(): void {
        let playerList = getSeatedPlayers()
        for (let player of playerList) {
            let set = Zones.getObjectSetFromColor(player.color as TableSelection)
            PowerupManager.spawnRandomPowerup(set.zone)
        }
        if (!RoundBonus.isBonusActive()) {
            RoundBonus.clearBonus()
            RoundBonus.addBonus()
        }
    }

    public static isBonusActive(): boolean {
        return RoundBonus.runBonusFunc('isActive')
    }

    public static preRound(): any {
        return RoundBonus.runBonusFunc('preRoundStart')
    }

    public static onRoundStart(): any {
        return RoundBonus.runBonusFunc('onRoundStart')
    }

    public static onRoundEnd(): any {
        return RoundBonus.runBonusFunc('onRoundEnd')
    }

    public static getPayoutMultiplier(set: ObjectSet, multiplier: number): any {
        return RoundBonus.runBonusFunc('payoutMultiplier', { 
            set: set,
            betMultiplier: multiplier
        },
        (data: any) => {
            let value: any;
            for (let i = 0; i < data.length; i++) {
                if (value === undefined || data[i] > value) {
                    value = data[i]
                }
            }
            return value
        })
    }

    public static shouldDealerReveal(): boolean {
        return RoundBonus.runBonusFunc('shouldDealerReveal') === true
    }

    public static canUsePowerup(powerup: GObject): boolean {
        return RoundBonus.runBonusFunc('canUsePowerup', { powerup: powerup }) !== false
    }

    public static canFlip(): boolean {
        return RoundBonus.runBonusFunc('canFlip') === true
    }

    public static shouldBust(set: ObjectSet): boolean {
        return RoundBonus.runBonusFunc('shouldBust', { set: set }) !== false
    }

    public static runBonusFunc(funcName: string, data?: any, returnFunc?: (...args: any) => void): any {
        let ret = []
        for (let i = 0; i < RoundBonus.bonusObjects.length; i++) {
            let object = RoundBonus.bonusObjects[i]
            if (object !== undefined) {
                if (object.getVar(funcName) !== undefined) {
                    let newValue = object.call(funcName, data)
                    if (newValue !== undefined) {
                        ret.push(newValue)
                    }
                    if (object === undefined) {
                        delete RoundBonus.bonusObjects[i]
                    }
                }
            } else {
                delete RoundBonus.bonusObjects[i]
            }
        }
        if (returnFunc !== undefined) {
            return returnFunc(ret)
        } else {
            return ret.pop()
        }
    }

}