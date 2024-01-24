import RoundBonus from "../bonus/round";
import { hasPermission } from "../functions";
import DeckManager from "../objects/decks";
import Settings from "../settings";
import State from "../state";
import { RoundState, ScriptCallableColor, SpecialHands, TableSelection } from "../types";
import ZoneHelpers from "./helpers";
import ObjectSet from "./objectSet";
import Zones from "./zones";

export default class ZoneButtons {

    public static payButtonPressed(object: GObject | undefined, color: ScriptCallableColor) {
        if (hasPermission(color)) {
            State.setRoundState(RoundState.Betting, Settings.betTime)

            if (color === 'Lua' || !State.lockout) {
                State.dealersTurn = false
                State.dealingDealerCards = false
 
                Zones.findCardsToCount()

                State.lockoutTimer(10)
                let dealerValue = Zones.getObjectSetFromColor('Dealer').value
                for (let i = 0; i < Object.keys(Zones.zones).length; i++) {
                    let set = Zones.zones[Object.keys(Zones.zones)[i] as TableSelection]
                    if (set === undefined)
                        continue
                    let value = set.value
                    let count = set.count
                    if (i !== 0 && value !== 0 && count !== 0) {
                        if ((value <= 21 && (value > dealerValue || (dealerValue > 21 && dealerValue !== SpecialHands.Blackjack)))
                            || (value >= SpecialHands.LowEnd && value <= SpecialHands.HighEnd && dealerValue !== SpecialHands.Blackjack)
                            || value === SpecialHands.SingleJoker || value === SpecialHands.DoubleJoker) {
                            let betsInZone = ZoneHelpers.findBetsInZone(set.zone).length
                            if (betsInZone !== 0) {
                                set.processPayout(set.calculatePayout(), true)
                            }
                        } else if (((dealerValue <= 21 || dealerValue === SpecialHands.Blackjack) && value === dealerValue)
                            || count >= Settings.countForSafe
                            || (value >= SpecialHands.LowEnd && value <= SpecialHands.HighEnd)) {
                            // Unlock chips
                            let zoneObjectList = ZoneHelpers.findBetsInZone(set.zone)
                            for (let bet of zoneObjectList) {
                                bet.interactable = true
                                bet.setLock(false)

                                if (set.userColor !== undefined) {
                                    let targetSet = Zones.getObjectSetFromColor(set.userColor) ?? set.splitUser
                                    if (targetSet !== undefined && targetSet.container !== undefined) {
                                        targetSet.container.putObject(bet)
                                    }
                                }
                            }
                        } else {
                            if (value > 21 && !RoundBonus.shouldBust(set)) {
                                // Unlock chips
                                let zoneObjectList = ZoneHelpers.findBetsInZone(set.zone)
                                for (let bet of zoneObjectList) {
                                    bet.interactable = true
                                    bet.setLock(false)

                                    if (set.userColor !== undefined) {
                                        let targetSet = Zones.getObjectSetFromColor(set.userColor) ?? set.splitUser
                                        if (targetSet !== undefined && targetSet.container !== undefined) {
                                            targetSet.container.putObject(bet)
                                        }
                                    }
                                }
                            } else {
                                set.clearBets(true)
                            }
                        }
                    }
                    set.clearPlayerActions(false)
                    ZoneHelpers.clearCardsAndPowerups(set.zone)

                    let zoneObjects = ZoneHelpers.findBetsInZone(set.zone, true)
                    let tableObjects = ZoneHelpers.findBetsInZone(set.table, true)
                    let prestigeObjects = ZoneHelpers.findBetsInZone(set.prestige, true)
                    for (let bet of [...tableObjects, ...prestigeObjects]) {
                        bet.interactable = true
                        bet.setLock(false)
                    }
                    for (let bet of zoneObjects) {
                        bet.interactable = true
                        bet.setLock(false)
                        if (set.userColor !== undefined) {
                            let container = (Zones.getObjectSetFromColor(set.userColor) ?? set.splitUser ?? {}).container
                            if (container !== undefined) {
                                Wait.frames(() => {
                                    if (bet !== undefined && container !== undefined) {
                                        container.putObject(bet)
                                    }
                                }, 1)
                            }
                        }
                    }
                }
                State.concludeLockout()
            } else {
                broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
            }
        }
    }

    public static dealButtonPressed(object: GObject | undefined, color: ScriptCallableColor): void {
        if (hasPermission(color)) {
            State.setRoundState(RoundState.Playing)

            let override = RoundBonus.preRound()
            if (override) {
                return
            }
            if (color === 'Lua' || !State.lockout) {
                State.dealersTurn = false
                State.dealingDealerCards = false

                for (let i = 0; i < Object.keys(Zones.zones).length; i++) {
                    let splitSet = Zones.zones[Object.keys(Zones.zones)[i] as TableSelection]
                    if (splitSet === undefined)
                        continue
                    if (!splitSet.color.startsWith('Split'))
                        continue
                    if (splitSet.container.getQuantity() > 0) {
                        let targetSet: ObjectSet | undefined;
                        for (let set of Object.values(Zones.zones)) {
                            if (splitSet.userColor === set.color) {
                                targetSet = set
                                break
                            }
                        }
                        if (targetSet !== undefined && targetSet.container !== undefined) {
                            let params: TakeObjectParameters = {}
                            params.position = targetSet.container.getPosition()
                            params.position.y = (params.position.y ?? 0) + 0.15
                            for (let i = 0; i < splitSet.container.getQuantity(); i++) {
                                splitSet.container.takeObject(params)
                            }
                        }
                    }
                    splitSet.splitUser = undefined
                    splitSet.userColor = undefined
                    splitSet.prestige = splitSet.zone
                    splitSet.table = splitSet.zone

                    splitSet.container.setColorTint(Color(0.25, 0.25, 0.25))
                }

                State.lockoutTimer(10)
                if (DeckManager.mainDeck === undefined || DeckManager.mainDeck.getQuantity() < 80) {
                    DeckManager.newDeck()
                    DeckManager.deckBool = true
                }
                for (let set of Object.values(Zones.zones)) {
                    set.clearPlayerActions(false)
                    ZoneHelpers.clearCardsOnly(set.zone)
                }
                RoundBonus.onRoundStart()

                State.dealOrder = []
                for (let player of getSeatedPlayers()) {
                    let set = Zones.getObjectSetFromColor(player.color as TableSelection)
                    if (set !== undefined) {
                        let zoneObjectList = ZoneHelpers.findBetsInZone(set.zone)
                        if (zoneObjectList.length > 0) {
                            State.dealOrder.push(player)
                        }
                    }
                }
                startLuaCoroutine(Global, 'dealInOrder')
            } else {
                broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
            }
        }
    }

}