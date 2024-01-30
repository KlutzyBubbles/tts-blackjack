//import RoundBonus from "../bonus/round"
import { PowerupGuids } from "../constants"
//import { generatePermissionString } from "../items/pickup"
//import Settings from "../settings"
//import State from "../state"
//import Timers from "../timer"
import { PowerupEffect, PowerupTarget, RoundState, SpecialHands, TableSelection } from "../types"
//import { altClear, cardMod, clear, clone, destroy, draw1, effects, findCardsToCount, findPowerupPlacement, giveReward, powerupDraw, prestigeToken, redraw, redrawAll, resetTimer, reveal, rewardToken, royalToken, rupeePull, stand, swap } from "../zones/functions"
// import ZoneHelpers from "../zones/helpers"
import ObjectSet from "../zones/objectSet"
//import Zones from "../zones/zones"
//import PowerupEffects from "./effects"
// import Zones from "../zones/zones"
// import PowerupEffects from "./effects"

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

    // Key is name, value is object guid
    public static powerups: { [key: string]: string } = {}
    public static spawnPowerupPosModifier: { [key: string]: number | undefined } = {}

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
}
