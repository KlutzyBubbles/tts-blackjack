import { PowerupGuids } from "../constants"
import { generatePermissionString } from "../items/pickup"
import Settings from "../settings"
import State from "../state"
import Timers from "../timer"
import { PowerupEffect, PowerupTarget, RoundState, SpecialHands, TableSelection } from "../types"
import ZoneHelpers from "../zones/helpers"
import ObjectSet from "../zones/objectSet"
import Zones from "../zones/zones"
import PowerupEffects from "./effects"

export default class PowerupManager { 

    public static definitions: { [key: string]: {
        who: PowerupTarget,
        effect: PowerupEffect
    }} = {
        "Force the dealer to reveal their facedown card": { who: "Dealer", effect: "Reveal"},
		"Force the dealer to stand on two cards": { who: "Dealer", effect: "Stand"},
		"Force the dealer to draw an additional card": { who: "Dealer", effect: "Draw1"},
		"Copy another player's hand": { who: "Other Player", effect: "Clone"},
		"Exit from the round": { who: "Self", effect: "Clear"},
		"Help another player exit from the round": { who: "Other Player", effect: "Clear"},
		"Discard your hand and stand on 19": { who: "Self", effect: "AltClear"},
		"Swap hands with another player": { who: "Other Player", effect: "Swap"},
		"Swap hands with the dealer": { who: "Dealer", effect: "Swap"},
		"Random powerup draw": { who: "Self", effect: "PowerupDraw"},
		"Random rupee pull": { who: "Self", effect: "RupeePull"},
		"Reward token": { who: "Self", effect: "RewardToken"},
		"Royal token": { who: "Self", effect: "RoyalToken"},
		"Prestige token": { who: "Self", effect: "PrestigeToken"},
		
		// Card numbers only
		"+1 to anyone's hand": { who: "Anyone", effect: "CardMod"},
        "+1 to any player's hand": { who: "Any Player", effect: "CardMod"},
		"-1 from anyone's hand": { who: "Anyone", effect: "CardMod"},
		"+3 to anyone's hand": { who: "Anyone", effect: "CardMod"},
        "+3 to any player's hand": { who: "Any Player", effect: "CardMod"},
		"-3 from anyone's hand": { who: "Anyone", effect: "CardMod"},
		"+10 to your own hand": { who: "Self", effect: "CardMod"},
		
		"Force the dealer to bust": { who: "Dealer", effect: "CardMod"},
		
		// Internal - Do not use
		"Fifth Card": { who: "Nobody", effect: "FifthCard"},
    }

    // Type doesn't help with coding, but good for what the keys actually are
    private static effects: { [key in PowerupEffect | string]?: (objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet) => boolean } = {
        Clear: PowerupEffects.clear,
        AltClear: PowerupEffects.altClear,
        Redraw: PowerupEffects.redraw,
        RedrawAll: PowerupEffects.redrawAll,
        Swap: PowerupEffects.swap,
        Clone: PowerupEffects.clone,
        Destroy: PowerupEffects.destroy,
        Reveal: PowerupEffects.reveal,
        Stand: PowerupEffects.stand,
        Draw1: PowerupEffects.draw1,
        PowerupDraw: PowerupEffects.powerupDraw,
        RupeePull: PowerupEffects.rupeePull,
        RewardToken: PowerupEffects.rewardToken,
        RoyalToken: PowerupEffects.royalToken,
        PrestigeToken: PowerupEffects.prestigeToken,
        ResetTimer: PowerupEffects.resetTimer,
        CardMod: PowerupEffects.cardMod
    }

    // Key is name, value is object guid
    private static powerups: { [key: string]: string } = {}
    private static spawnPowerupPosModifier: { [key: string]: number | undefined } = {}

    public static initPowerups() {
        PowerupManager.powerups = {}
        for (let guid of PowerupGuids) {
            let object = getObjectFromGUID(guid)
            let powerupName = object.getName()
            if (Object.keys(PowerupManager.definitions).includes(powerupName)) {
                PowerupManager.powerups[powerupName] = guid
            }
        }
    }

    public static spawnRandomPowerup(zone: Zone): boolean {
        let powerupNames = Object.keys(PowerupManager.powerups)
        if (powerupNames.length === 0)
            return false

        let chosenIndex = math.random(1, powerupNames.length)
        let chosenPowerup = PowerupManager.powerups[powerupNames[chosenIndex]]
        let chosenObject = getObjectFromGUID(chosenPowerup)
        if (chosenObject === undefined) {
            delete PowerupManager.powerups[powerupNames[chosenIndex]]
            for (let object of getAllObjects())  {
                if (object.getLock() && object.getName() === powerupNames[chosenIndex]) {
                    PowerupManager.powerups[powerupNames[chosenIndex]] = object.getGUID()
                    break
                }
            }
            return PowerupManager.spawnRandomPowerup(zone)
        }

        let clone = chosenObject.clone({
            position: zone.positionToWorld(
                Vector(0.5, 0 + (PowerupManager.spawnPowerupPosModifier[zone.getGUID()] ?? 0), -0.5)
            )
        })
        clone.setLock(false)
        PowerupManager.spawnPowerupPosModifier[zone.getGUID()] = (PowerupManager.spawnPowerupPosModifier[zone.getGUID()] ?? 0) + 0.04
        Wait.frames(() => {
            PowerupManager.spawnPowerupPosModifier[zone.getGUID()] = undefined
        }, 2)

        let playerColor = (Zones.getObjectSetFromZone(zone) ?? {}).color
        if (playerColor === 'Dealer' || playerColor?.startsWith('Split')) {
            playerColor = undefined
        }
        if (playerColor !== undefined && Player[playerColor as ColorLiteral].seated) {
            clone.setDescription(`${generatePermissionString(Player[playerColor as ColorLiteral])}\n${clone.getDescription()}`)
        }
        return true
    }

    public static checkPowerupDropZone(color: ColorLiteral, object: GObject, who: PowerupTarget, effect: PowerupEffect): void {
        for (let set of Object.values(Zones.zones)) {
            let objectsInZone = set.zone.getObjects()
            for (let zoneObject of objectsInZone) {
                if (zoneObject === object) {
                    PowerupManager.checkPowerupEffect(color, object, who, effect, set)
                    break
                }
            }
        }
    }

    public static checkPowerupEffect(color: ColorLiteral, object: GObject, who: PowerupTarget, effect: PowerupEffect, setTarget: ObjectSet): void {
        let setUser = Zones.getObjectSetFromColor(color as TableSelection)
        if (setUser === undefined) {
            return
        }
        let setDealer = Zones.getObjectSetFromColor('Dealer')
        if (setTarget === setDealer && State.dealingDealerCards) {
            broadcastToColor("You can't use a powerup on the dealer while their cards are being dealt.", color, Color(1, 0.5, 0.5))
            return
        }
        if (who === 'Anyone') {
            PowerupManager.activatePowerupEffect(effect, setTarget, object, setUser)
        } else if (who === 'Any Player' && setTarget !== setDealer) {
            PowerupManager.activatePowerupEffect(effect, setTarget, object, setUser)
        } else if (who === 'Other Player' && color !== setTarget.color && setTarget !== setDealer && setTarget.userColor !== color) {
            PowerupManager.activatePowerupEffect(effect, setTarget, object, setUser)
        } else if (who === 'Self' && (color === setTarget.color || setTarget.userColor === color)) {
            PowerupManager.activatePowerupEffect(effect, setTarget, object, setUser)
        } else if (who === 'Dealer' && setTarget === setDealer) {
            PowerupManager.activatePowerupEffect(effect, setTarget, object, setUser)
        } else if (who === setTarget.color || (setTarget.userColor !== undefined && who === setTarget.userColor)) {
            PowerupManager.activatePowerupEffect(effect, setTarget, object, setUser)
        } else {
            PowerupManager.activatePowerupFailedCallback(object, setUser, setTarget)
        }
    }

    public static activatePowerupEffect(effect: PowerupEffect, setTarget: ObjectSet, powerup: GObject, setUser: ObjectSet): void {
        Zones.findCardsToCount()
        Wait.frames(() => {
            Zones.findCardsToCount()
        }, 2)
        let effectFunc = PowerupManager.effects[effect]
        if (effectFunc !== undefined) {
            if (!effectFunc(setTarget, powerup, setUser)) {
                Wait.frames(() => {
                    PowerupManager.activatePowerupFailedCallback(powerup, setUser, setTarget)
                }, 1)
                return
            }
        } else if (powerup.getVar('powerupUsed') !== undefined) {
            if (!powerup.call('powerupUsed', {
                setTarget: setTarget,
                powerup: powerup,
                setUser: setUser
            })) {
                Wait.frames(() => {
                    PowerupManager.activatePowerupFailedCallback(powerup, setUser, setTarget)
                }, 1)
                return
            }
        } else {
            Wait.frames(() => {
                PowerupManager.activatePowerupFailedCallback(powerup, setUser, setTarget)
            }, 1)
            return
        }

        let targetString: string = setTarget.color
        if (setTarget.color === setUser.color) {
            targetString = 'themself'
        } else if (setTarget.color === 'Dealer') {
            targetString = 'the dealer'
        }

        if (setTarget.userColor !== undefined) {
            if (setTarget.userColor === setUser.color) {
                targetString += ' (themself)'
            } else if (setTarget.color === 'Dealer') {
                targetString += ' (the dealer)'
            } else {
                targetString += ` (${setTarget.userColor})`
            }
        }
        printToAll(`Powerup event: ${setUser.color} used ${powerup.getName()} on ${targetString}.`, Color(0.5, 0.5, 1))

        powerup.setPosition(setTarget.findPowerupPlacement(ZoneHelpers.findPowerupsInZone(setTarget.zone).length + 1))
        powerup.setRotation(Vector(0, 0, 0))
        powerup.setLock(true)

        powerup.setColorTint(stringColorToRGB(setUser.color) ?? Color(1, 1, 1))

        if (State.roundState === RoundState.Powerups && Timers.roundTimer !== undefined && (Timers.roundTimer.getValue() as number) < 10) {
            Timers.preventRoundEnd = os.time() + 1
            Timers.roundTimer.setValue(10)
            Timers.roundTimer.Clock.paused = false
        }
    }

    public static activatePowerupFailedCallback(object: GObject, setUser: ObjectSet, setTarget: ObjectSet): void {
        if (object.getName().toLowerCase() === 'royal token' || object.getName().toLowerCase() === 'reward token') {
            return
        }
        if (Settings.fifthCard) {
            if (setTarget.count !== 4) {
                return
            }
            let setDealer = Zones.getObjectSetFromColor('Dealer')
            if ((setTarget.value <= 21 && setTarget.value >= setDealer.value) || (setTarget.value >= SpecialHands.LowEnd && setTarget.value <= SpecialHands.HighEnd)) {
                return
            }
            if (setUser.color !== setTarget.color && setUser.color !== setTarget.userColor) {
                setUser.giveReward('Help')
            }

            let targetString: string = setTarget.color
            if (setTarget.color === setUser.color) {
                targetString = 'themself'
            } else if (setTarget.color === 'Dealer') {
                targetString = 'the dealer'
            }
    
            if (setTarget.userColor !== undefined) {
                if (setTarget.userColor === setUser.color) {
                    targetString += ' (themself)'
                } else if (setTarget.color === 'Dealer') {
                    targetString += ' (the dealer)'
                } else {
                    targetString += ` (${setTarget.userColor})`
                }
            }
            printToAll(`Powerup event: ${setUser.color} used ${object.getName()} as a fifth card for ${targetString}.`, Color(0.5, 0.5, 1))
            
            object.setPosition(setTarget.findPowerupPlacement(ZoneHelpers.findPowerupsInZone(setTarget.zone).length + 1))
            object.setRotation(Vector(0, 0, 0))
            object.setName('Fifth Card')
            object.setDescription('This powerup has been used as a fifth card to give this hand bust immunity.')
            object.setLock(true)
            
            setTarget.count += 1
            object.setColorTint(stringColorToRGB(setUser.color) ?? Color(1, 1, 1))
            if (State.roundState === RoundState.Powerups && Timers.roundTimer !== undefined && (Timers.roundTimer.getValue() as number) < 10) {
                Timers.roundTimer.setValue(10)
                Timers.roundTimer.Clock.paused = false
            }
        }
    }

}