import { PowerupGuids } from "../constants"
import { generatePermissionString } from "../items/pickup"
import { PowerupEffect, PowerupTarget } from "../types"
import ObjectSet from "../zones/objectSet"
import Zones from "../zones/zones"
import PowerupEffects from "./effects"

export default class PowerupManager { 

    private static definitions: { [key: string]: {
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
        /*
        AltClear
        Redraw
        RedrawAll
        Swap
        Clone
        Destroy
        Reveal
        Stand
        Draw1
        PowerupDraw
        RupeePull
        RewardToken
        RoyalToken
        PrestigeToken
        ResetTimer
        CardMod
        */
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

    public static spawnRandomPowerup(zone: GObject): boolean {
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

}