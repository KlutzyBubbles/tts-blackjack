import RoundBonus from "../bonus/round"
import { SpecialHandDisplay, SoftHandDisplay, DisplayColors, CardNames, Tag, SelfDestructScript, OtherObjectGuids } from "../constants"
import { hasPermission, isSpecialValue, tableSelectionToColorLiteral } from "../functions"
import { generatePermissionString } from "../items/pickup"
import Logger from "../logger"
// import CardHelpers from "../objects/cards"
import DeckManager from "../objects/decks"
import Rewards from "../objects/rewards"
import PowerupEffects from "../powerups/effects"
import PowerupManager from "../powerups/manager"
import Settings from "../settings"
import State from "../state"
import Timers, { setRoundState } from "../timer"
import { SpecialHands, RoundState, RewardName, TableSelection, ScriptCallableColor, PowerupEffect, PowerupTarget, Zone } from "../types"
import ZoneHelpers from "./helpers"
import ObjectSet from "./objectSet"
import Zones from "./zones"

const LOG_LABEL = "zones.functions"

export function displayResult(objectSet: ObjectSet, value: number, soft: boolean): void {
    Logger.trace(LOG_LABEL, `displayResult(${objectSet.color}, ${value}, ${soft})`)
    objectSet.value = value
    objectSet.soft = soft
    updateHandDisplay(objectSet)            
}

export function updateHandDisplay(objectSet: ObjectSet): void {
    Logger.trace(LOG_LABEL, `updateHandDisplay(${objectSet.color})`)
    let valueLabel: string = `${objectSet.value}`
    if (isSpecialValue(objectSet.value)) {
        valueLabel = SpecialHandDisplay[objectSet.value as SpecialHands] ?? `${objectSet.value}`
    }
    if (objectSet.soft) {
        valueLabel = SoftHandDisplay[objectSet.value] ?? `${objectSet.value}`
    }
    objectSet.actionButtons.editButton({
        index: 0,
        label: valueLabel,
        color: getHandDisplayColor(objectSet)
    })
}

export function updateHandCounter(objectSet: ObjectSet): void {
    Logger.trace(LOG_LABEL, `updateHandCounter(${objectSet.color})`)
    let cardList = ZoneHelpers.findCardsInZone(objectSet.zone)
    let deckList = ZoneHelpers.findDecksInZone(objectSet.zone)
    let powerupList = ZoneHelpers.findPowerupsInZone(objectSet.zone)
    if (cardList.length > 0 || deckList.length > 0 || powerupList.length > 0) {
        obtainCardNames(objectSet, cardList, deckList, powerupList)
        return
    }

    objectSet.value = 0
    objectSet.count = 0

    objectSet.actionButtons.editButton({
        index: 0,
        label: '0',
        color: DisplayColors.clear
    })
}

export function updateCardPositions(objectSet: ObjectSet): void {
    Logger.trace(LOG_LABEL, `updateCardPositions(${objectSet.color})`)
    let cards = ZoneHelpers.findCardsInZone(objectSet.zone)
    cards.sort((a, b) => {
        let aStarter = a.getTable('blackjack_playerSet')
        let bStarter = b.getTable('blackjack_playerSet')
        if (aStarter !== undefined && bStarter === undefined) {
            return 1
        } else if (bStarter !== undefined && aStarter === undefined) {
            return -1
        }
        let aPos = a.getPosition()
        let bPos = b.getPosition()
        if (math.abs((aPos.z ?? 0) - (bPos.z ?? 0)) < 0.25) {
            if (math.abs((aPos.x ?? 0) - (bPos.x ?? 0)) < 0.25) {
                return (bPos.y ?? 0) - (aPos.y ?? 0)
            }
            return (aPos.x ?? 0) - (bPos.x ?? 0)
        }
        return (bPos.z ?? 0) - (aPos.z ?? 0)
    })
    let zoneRot = objectSet.zone.getRotation()
    for (let i = 0; i < cards.length; i++) {
        let card = cards[i]
        card.setPosition(findCardPlacement(objectSet, i + 1))
        let rot = card.getRotation()
        rot.x = zoneRot.x
        rot.y = (zoneRot.y ?? 0) + 180
        rot.z = (rot.z ?? 0) > 15 && (rot.z ?? 0) < 275 ? 180 : 0
        card.setRotation(rot)
    }
}

export function obtainCardNames(objectSet: ObjectSet, cardList: GObject[], deckList: GObject[], powerupList: GObject[]) {
    Logger.trace(LOG_LABEL, `obtainCardNames(${objectSet.color}, [${cardList.join(', ')}], [${powerupList.join(', ')}])`)
    let validCards: string[] = []
    let facedownCount = 0
    let facedownCard: GObject | undefined = undefined
    for (let card of cardList) {
        let z = card.getRotation().z ?? 0
        if (z > 270 || z < 90) {
            if (objectSet.color === 'Dealer' && card.getName() === 'Joker') {
                Timers.resetBonusTimer(3)
                card.destruct()
            }
            validCards.push(card.getName())
        } else if (objectSet.color === 'Dealer') {
            facedownCount += 1
            facedownCard = card
        }
    }
    /*
    Not sure of the point of objectSet
    for (let deck of deckList) {
        let z = deck.getRotation().z ?? 0
        if (z > 270 || z < 90) {
            for (let card of deck.getObjects()) {
                cardNames.push(card.name)
            }
        }
    }
    */
    for (let powerup of powerupList) {
        validCards.push(powerup.getName())
    }
    objectSet.count = validCards.length
    addCardValues(objectSet, validCards, facedownCount, facedownCard);
}

export function addCardValues(objectSet: ObjectSet, cardList: string[], facedownCount: number, facedownCard: GObject | undefined): void {
    Logger.trace(LOG_LABEL, `addCardValues(${objectSet.color}, [${cardList.join(', ')}], ${facedownCount}, ${facedownCard})`)
    let value = 0, aceCount = 0, sevenCount = 0, tenCount = 0, jokerCount = 0, dealerBust = 0
    let stopCount = false
    for (let card of cardList) {
        let v: string | number = CardNames[card]
        if (v === 'Ace') {
            aceCount++
        } else if (v === 7) {
            sevenCount++
        } else if (v === 10) {
            tenCount++
        } else if (v === SpecialHands.Blackjack) {
            aceCount++
            tenCount++
            v = 10
        } else if (v === 'Joker' || v === SpecialHands.SingleJoker) {
            jokerCount++
        } else if (v === SpecialHands.DoubleJoker) {
            jokerCount += 2
        } else if (v === SpecialHands.Triple7) {
            if (objectSet.count === 1) {
                sevenCount += 3
            }
            v = 21
        } else if (v === SpecialHands.DealerBust) {
            dealerBust++
        }

        if (objectSet.color === 'Dealer') {
            if (objectSet.count >= Settings.dealerBustCount || dealerBust > 0) {
                stopCount = true
                value = SpecialHands.DealerBust
            }
        } else {
            if (jokerCount > 0) {
                if (jokerCount === 2 && objectSet.count <= 2) {
                    value = SpecialHands.DoubleJoker
                } else {
                    value = SpecialHands.SingleJoker
                }
                stopCount = true
            } else if (sevenCount === 3 && objectSet.count <= 3) {
                value = SpecialHands.Triple7
                stopCount = true
            }
        }
        if (!stopCount) {
            value += tonumber(v as string) ?? 0
        }
    }

    let soft = false
    if (aceCount > 0 && !stopCount) {
        for (let i = 1; i <= aceCount; i++) {
            if (i === aceCount && value <= 10) {
                if (aceCount === 1 && tenCount === 1 && objectSet.count <= 2) {
                    value = SpecialHands.Blackjack
                    stopCount = true
                } else if (objectSet.color === 'Dealer' && facedownCount < 1 && Settings.dealerAceIsOne) {
                    value += 1
                } else {
                    value += 11
                    soft = true
                }
            } else {
                value += 1
            }
        }
    }

    if (value > 50 && !(stopCount || objectSet.count === 1)) {
        value = SpecialHands.Bust
    }

    displayResult(objectSet, value, soft)

    if (objectSet.color === 'Dealer') {
        if (cardList.length === 1 && facedownCount === 1)  {
            checkForBlackjack(value, facedownCard)
        }
    }
}

export function checkCurrentTurn(objectSet: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `checkCurrentTurn(${objectSet.color})`)
    if (objectSet.color !== State.currentPlayerTurn) {
        clearPlayerActions(objectSet, false)
        broadcastToColor("Error: It's not your turn.", tableSelectionToColorLiteral(objectSet.color), Color(1, 0.25, 0.25))
        return false
    }
    return true
}

export function playerStand(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `playerStand(${_actionButtons}, ${color}, ${altClick})`)
    return localPlayerStand(_actionButtons, color, altClick);
}

function localPlayerStand(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `localPlayerStand(${_actionButtons}, ${color}, ${altClick})`)
    let objectSet = Zones.getObjectSetFromColor(color as TableSelection)
    if (objectSet.canInitiateAction(color)) {
        if (altClick || !checkCurrentTurn(objectSet)) {
            return
        }

        if (color === 'Black' || !State.lockout) {
            objectSet.endTurnTimer(true)
            clearPlayerActions(objectSet, false)
            State.lockoutTimer(0.5)

            Wait.time(() => {
                if (State.currentPlayerTurn === objectSet.color) {
                    passPlayerActions(objectSet.zone)
                }
            }, 0.25)
            runBonusFunc('onPlayerStand', {
                set: objectSet,
                color: color
            })
        } else {
            broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
        }
    }
}

export function playerSplit(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `playerSplit(${_actionButtons}, ${color}, ${altClick})`)
    return localPlayerSplit(_actionButtons, color, altClick)
}

function localPlayerSplit(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `localPlayerSplit(${_actionButtons}, ${color}, ${altClick})`)
    let objectSet = Zones.getObjectSetFromColor(color as TableSelection)
    if (objectSet.canInitiateAction(color)) {
        if (altClick || !checkCurrentTurn(objectSet)) {
            return
        }

        let cards = ZoneHelpers.findCardsInZone(objectSet.zone)
        if (cards.length !== 2 || CardNames[cards[0].getName()] !== CardNames[cards[1].getName()]) {
            return
        }
        if (!Settings.splitOnValue && cards[0].getName() !== cards[1].getName()) {
            return
        }

        if (!State.lockout) {
            objectSet.endTurnTimer(false)
            for (let splitSet of Object.values(Zones.zones)) {
                if (splitSet.color.startsWith('Split') && splitSet.splitUser === undefined) {
                    let override = runBonusFunc('prePlayerSplit', {
                        set: objectSet,
                        color: color
                    })
                    if (override === true) {
                        return
                    }
                    if (!ZoneHelpers.repeatBet(color as TableSelection, objectSet, splitSet)) {
                        return
                    }
                    override = runBonusFunc('onPlayerSplit', {
                        set: objectSet,
                        color: color
                    })
                    if (override === true) {
                        return
                    }

                    State.lockoutTimer(2)

                    splitSet.splitUser = objectSet
                    splitSet.userColor = objectSet.userColor ?? objectSet.color
                    splitSet.prestige = objectSet.prestige
                    splitSet.table = objectSet.table
                    splitSet.container.setColorTint(stringColorToRGB(tableSelectionToColorLiteral(objectSet.userColor ?? objectSet.color)) ?? Color(1, 1, 1))

                    cards[0].setPosition(findCardPlacement(splitSet, 1))
                    cards[0].setTable('blackjack_playerSet', splitSet)

                    cards[1].setPosition(findCardPlacement(objectSet, 1))

                    placeCard(findCardPlacement(objectSet, 2), true, objectSet, true, false)
                    placeCard(findCardPlacement(splitSet, 2), true, splitSet, true, false)

                    clearPlayerActions(objectSet, false)
                    State.currentPlayerTurn = splitSet.color

                    Wait.time(() => {
                        delayedCreatePlayerActions(splitSet)
                    }, 1.5)
                    return
                }
            }
            broadcastToColor("Error: No free Split zones!", color, Color(1, 0.25, 0.25))
        } else {
            broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
        }
    }
}

export function playerHit(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `playerHit(${_actionButtons}, ${color}, ${altClick})`)
    return localPlayerHit(_actionButtons, color, altClick);
}

function localPlayerHit(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `localPlayerHit(${_actionButtons}, ${color}, ${altClick})`)
    let objectSet = Zones.getObjectSetFromColor(color as TableSelection)
    if (objectSet.canInitiateAction(color)) {
        if (altClick || !checkCurrentTurn(objectSet)) {
            return
        }
        if (!State.lockout) {
            let override = runBonusFunc('onPlayerHit', {
                set: objectSet,
                color: color
            })
            if (override === true) {
                return
            }
            objectSet.endTurnTimer(false)
            clearPlayerActions(objectSet, true)
            State.lockoutTimer(1)
            if (objectSet.value > 21) {
                clearPlayerActions(objectSet, false)
                passPlayerActions(objectSet.zone)
            } else {
                let card = ''
                if (DeckManager.mainDeck !== undefined) {
                    if (DeckManager.mainDeck.getObjects()[0] !== undefined) {
                        card = DeckManager.mainDeck.getObjects()[0].name ?? ''
                    }
                }
                checkForBust(objectSet, card)
                forcedCardDraw(objectSet)
            }
        } else {
            broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
        }
    }
}

export function playerDouble(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `playerDouble(${_actionButtons}, ${color}, ${altClick})`)
    return localPlayerDouble(_actionButtons, color, altClick);
}

function localPlayerDouble(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `localPlayerDouble(${_actionButtons}, ${color}, ${altClick})`)
    let objectSet = Zones.getObjectSetFromColor(color as TableSelection)
    if (objectSet.canInitiateAction(color)) {
        if (altClick || !checkCurrentTurn(objectSet)) {
            return
        }
        if (objectSet.value > 21) {
            clearPlayerActions(objectSet, false)
            passPlayerActions(objectSet.zone)
            return
        }

        let cards = ZoneHelpers.findCardsInZone(objectSet.zone)
        if (cards.length !== 2) {
            clearPlayerActions(objectSet, true)
            return
        }

        if (!State.lockout) {
            let override = runBonusFunc('prePlayerDouble', {
                set: objectSet,
                color: color
            })
            if (override === true) {
                return
            }
            objectSet.endTurnTimer(false)
            if (!ZoneHelpers.repeatBet(color as TableSelection, objectSet, undefined)) {
                return
            }
            override = runBonusFunc('onPlayerDouble', {
                set: objectSet,
                color: color
            })
            if (override === true) {
                return
            }
            State.lockoutTimer(1.5)
            forcedCardDraw(objectSet)
            clearPlayerActions(objectSet, false)
            passPlayerActions(objectSet.zone)
        } else {
            broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
        }
    }
}

export function hitCard(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `hitCard(${_actionButtons}, ${color}, ${altClick})`)
    return localHitCard(_actionButtons, color, altClick);
}

function localHitCard(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `localHitCard(${_actionButtons}, ${color}, ${altClick})`)
    let objectSet = Zones.getObjectSetFromColor(color as TableSelection)
    if (altClick) {
        return
    }
    if (hasPermission(color)) {
        let override = runBonusFunc('onHit', {
            zone: objectSet.zone
        })
        if (override === true) {
            return
        }
        let cardsInZone = ZoneHelpers.findCardsInZone(objectSet.zone).length
        let decksInZone = ZoneHelpers.findDecksInZone(objectSet.zone).length
        let pos = findCardPlacement(objectSet, cardsInZone + decksInZone + 1)
        placeCard(pos, true, objectSet, cardsInZone < 2 && decksInZone === 0, objectSet.color === 'Dealer')
    }
}

export function delayedCreatePlayerActions(objectSet: ObjectSet): void {
    Logger.trace(LOG_LABEL, `delayedCreatePlayerActions(${objectSet.color})`)
    let betsInZone = ZoneHelpers.findBetsInZone(objectSet.zone).length
    let cardsInZone = ZoneHelpers.findCardsInZone(objectSet.zone).length
    let decksInZone = ZoneHelpers.findDecksInZone(objectSet.zone).length
    if (betsInZone !== 0 && (cardsInZone !== 0 || decksInZone !== 0) && objectSet.value <= 21) {
        State.currentPlayerTurn = objectSet.color
        return createPlayerActions(objectSet, false)
    }
    return passPlayerActions(objectSet.zone)
}

export function forcedCardDraw(objectSet: ObjectSet): void {
    Logger.trace(LOG_LABEL, `forcedCardDraw(${objectSet.color})`)
    let targetCardList = ZoneHelpers.findCardsInZone(objectSet.zone)
    let cardToDraw = targetCardList.length + 1
    let pos = findCardPlacement(objectSet, cardToDraw)
    placeCard(pos, true, objectSet, false, false)
}

export function findCardPlacement(objectSet: ObjectSet, spot: number): Vector {
    Logger.trace(LOG_LABEL, `findCardPlacement(${objectSet.color}, ${spot})`)
    let override = runBonusFunc('findCardPlacement', {
        zone: objectSet.zone,
        spot: spot
    })
    if (type(override) === 'table') {
        return override as Vector
    }
    if (objectSet.zone === Zones.getObjectSetFromColor('Dealer').zone) {
        return Vector(6.5 - 2.6 * (spot - 1), 1.8, -4.84)
    } else {
        let pos = objectSet.zone.getPosition()
        let scale = objectSet.zone.getScale()
        if (spot <= 3) {
            return Vector(
                (pos.x ?? 0) + 1 - (spot - 1),
                (pos.y ?? 0) - ((scale.y ?? 1) / 2) + 0.1 + (0.1 * (spot - 1)),
                (pos.z ?? 0) - 0.5)
        } else {
            return Vector(
                (pos.x ?? 0) + 1 - (math.min(spot, 6) - 4),
                (pos.y ?? 0) - ((scale.y ?? 1) / 2) + 0.4 + (0.1 * (math.min(spot, 20) - 4)),
                (pos.z ?? 0) - 0.5)
        }
    }
}

export function findPowerupPlacement(objectSet: ObjectSet, spot: number): Vector {
    Logger.trace(LOG_LABEL, `findPowerupPlacement(${objectSet.color}, ${spot})`)
    let override = runBonusFunc('findPowerupPlacement', {
        zone: objectSet.zone,
        spot: spot
    })
    if (type(override) === 'table') {
        return override as Vector
    }
    if (objectSet.zone === Zones.getObjectSetFromColor('Dealer').zone) {
        return Vector(-8, 1.8, -8 + (1.5 * math.min(spot, 3)))
    } else {
        let column = math.min(math.floor((spot - 1) / 5) + 1, 18) / 20
        let row = ((spot - 1) % 5) / 5
        return objectSet.zone.positionToWorld(Vector(0.5, column - 0.45, -0.5 + row * 1.1))
    }
}

export function checkForBust(objectSet: ObjectSet, addCard?: string): void {
    Logger.trace(LOG_LABEL, `checkForBust(${objectSet.color}, ${addCard})`)
    if (objectSet.value > 21) {
        clearPlayerActions(objectSet, false)
        State.lockoutTimer(0.75)
        Wait.time(() => {
            if (objectSet.color === State.currentPlayerTurn) {
                passPlayerActions(objectSet.zone)
            }
        }, 0.5)
    } else if (addCard !== undefined && CardNames[addCard] !== undefined) {
        let val = CardNames[addCard]
        if (val === 'Ace') {
            val = 1
        }
        if (val === 'Joker' || (objectSet.value + (tonumber(val as string) ?? 0) > (objectSet.soft ? 31 : 21))) {
            clearPlayerActions(objectSet, false)
            State.lockoutTimer(0.75)
            Wait.time(() => {
                if (objectSet.color === State.currentPlayerTurn) {
                    passPlayerActions(objectSet.zone)
                }
            }, 0.5)
        }
    }
}

export function giveReward(objectSet: ObjectSet, rewardName: RewardName): void {
    Logger.trace(LOG_LABEL, `giveReward(${objectSet.color}, ${rewardName})`)
    let reward = Rewards.rewards[rewardName]
    if (reward === undefined) {
        return
    }
    let set: ObjectSet = objectSet
    if (objectSet.userColor !== undefined) {
        set = Zones.getObjectSetFromColor(set.userColor as TableSelection) ?? objectSet
    }
    if (!Player[set.color as ColorLiteral].seated) {
        return
    }

    let params: TakeObjectParameters = {}
    params.position = set.zone.positionToWorld(Vector(0.5, 0, -0.5))
    params.callback = 'giveRewardCallback'
    params.params = {}
    
    let object: GObject | undefined = undefined;
    for (let itemData of reward.getObjects()) {
        if (params.position !== undefined)
            params.position.y = (params.position.y ?? 0) + 0.1
        params.params.pos = params.position

        let item = getObjectFromGUID(itemData.guid)
        let player = Player[objectSet.color as ColorLiteral]
        if (item !== undefined) {
            if (item.hasTag(Tag.Infinite)) {
                object = item.takeObject(params)
            } else if (object?.hasTag(Tag.SaveBag)) {
                object = item.clone(params)
                object.reset()

                object.setName(`Player save: ${player.steam_name}`)
                object.setDescription(player.steam_id ?? 'UNKNOWN_STEAM_ID')
            } else {
                object = item.clone(params)

                object.setDescription(`${generatePermissionString(player)}\n\n${object.getDescription()}`)
            }
        }

        if (object !== undefined) {
            object.interactable = true
            object.setLock(false)
        }
    }
}

export function calculatePayout(objectSet: ObjectSet): number {
    Logger.trace(LOG_LABEL, `calculatePayout(${objectSet.color})`)
    let multiplier = 1
    if (objectSet.value === SpecialHands.DoubleJoker && objectSet.count === 2) {
        giveReward(objectSet, 'DoubleJoker')
        multiplier = Settings.betMultipliers.DoubleJoker
    } else if (objectSet.value === SpecialHands.Triple7 && objectSet.count === 3) {
        giveReward(objectSet, 'TripleSeven')
        multiplier = Settings.betMultipliers.TripleSeven
    } else if ((objectSet.value <= 21 || objectSet.value === SpecialHands.SingleJoker) && objectSet.count >= 5) {
        if ((objectSet.value === 21 || objectSet.value === SpecialHands.SingleJoker) && objectSet.count >= 6) {
            giveReward(objectSet, 'SixCardTwentyOne')
            multiplier = Settings.betMultipliers.SixCardTwentyOne
        } else if (objectSet.count >= 6) {
            giveReward(objectSet, 'SixCardWin')
            multiplier = Settings.betMultipliers.SixCardWin
        } else if ((objectSet.value === 21 || objectSet.value === SpecialHands.SingleJoker) && objectSet.count == 5) {
            giveReward(objectSet, 'FiveCardTwentyOne')
            multiplier = Settings.betMultipliers.FiveCardTwentyOne
        } else if (objectSet.count === 5) {
            giveReward(objectSet, 'FiveCardWin')
            multiplier = Settings.betMultipliers.FiveCardWin
        }
    } else if (objectSet.value === SpecialHands.Blackjack) {
        giveReward(objectSet, 'Blackjack')
        multiplier = Settings.betMultipliers.Blackjack
    } else if (objectSet.value === SpecialHands.SingleJoker) {
        giveReward(objectSet, 'SingleJoker')
        multiplier = 1 + Settings.betMultipliers.SingleJoker
        // TODO getPrestige
        // multiplier = objectSet.getPrestige() + Settings.betMultipliers.SingleJoker
    } else if (objectSet.value === 21) {
        multiplier = Settings.betMultipliers.TwentyOne
    }
    multiplier = (getPayoutMultiplier(objectSet, multiplier) ?? multiplier) * math.max(Settings.multiplier, 1)
    return multiplier
}

export function processPayout(objectSet: ObjectSet, iterations: number, lockedOnly: boolean): void {
    Logger.trace(LOG_LABEL, `processPayout(${objectSet.color}, ${iterations}, ${lockedOnly})`)
    let zoneObjects = ZoneHelpers.findBetsInZone(objectSet.zone)
    let badBagObjects = 0

    let playerId = Player[(objectSet.userColor ?? objectSet.color) as ColorLiteral].seated ? Player[(objectSet.userColor ?? objectSet.color) as ColorLiteral].steam_id : undefined
    
    for (let bet of zoneObjects) {
        let wasLocked: { [key: string]: boolean } = {}
        if (!lockedOnly || !bet.interactable || wasLocked[bet.getGUID()] !== undefined) {
            if (lockedOnly && bet.hasTag(Tag.BetBag)) {
                let goodIds = bet.getTable('blackjack_betBagContents')
                let contents = bet.getObjects()

                let params: TakeObjectParameters = {}
                params.position = objectSet.container.getPosition()
                params.position.y = (params.position.y ?? 0) + 0.25

                for (let object of contents) {
                    if (goodIds[object.guid] === undefined || goodIds[object.guid] <= 0) {
                        let taken = bet.takeObject(params)

                        params.position.y = math.min((params.position.y ?? 0) + 0.5, 20)
                        if (taken !== undefined)
                            objectSet.container.putObject(taken)

                        badBagObjects += 1
                    }
                    goodIds[object.guid] = (goodIds[object.guid] ?? 0) - 1
                }
            }
            wasLocked[bet.getGUID()] = true
            bet.interactable = true
            bet.setLock(false)

            let params: CloneParameters = {}
            params.position = bet.getPosition()
            params.position.y = (params.position.y ?? 0) - 10

            let clone = bet.clone(params)
            clone.setLock(true)
            clone.setPosition(params.position)

            clone.setLuaScript(SelfDestructScript.replace('%i', `${((iterations / 10) + 2) * 1.25}`))

            if (!bet.getDescription().startsWith(playerId ?? 'noplayerid!$&VDW$#$')) {
                let foundPlayer = false
                for (let playerColor of getSeatedPlayers()) {
                    let player = Player[playerColor];
                    let targetSet = Zones.getObjectSetFromColor(player.color as TableSelection)
                    if (player.seated && bet.getDescription().startsWith(player.steam_id || 'UNKNOWN_STEAM_ID') && targetSet !== undefined) {
                        foundPlayer = true
                        for (let i = 1; i <= iterations; i++) {
                            Wait.time(() => {
                                payBet(targetSet, clone, i === iterations)
                            }, 1 / 10)
                        }
                        let setPos = targetSet.zone.getPosition()
                        bet.setPosition(setPos)
                        break
                    }
                }
                if (!foundPlayer) {
                    // Says in script a todo to push objects to autosave
                    destroyObject(bet)
                    destroyObject(clone)
                }
            } else {
                for (let i = 1; i <= iterations; i++) {
                    Wait.time(() => {
                        payBet(objectSet, clone, i === iterations)
                    }, 1 / 10)
                }
                if (objectSet.userColor !== undefined) {
                    let targetSet = Zones.getObjectSetFromColor(objectSet.userColor)
                    if (targetSet !== undefined) {
                        targetSet.container.putObject(bet)
                    }
                }
            }
        }
    }

    if (badBagObjects > 0) {
        broadcastToColor(`Refunded ${badBagObjects} bad object(s) in bet bag. Did you attempt to alter your bet?`, tableSelectionToColorLiteral(objectSet.color), Color(1, 0.25, 0.25))
        for (let adminColor of getSeatedPlayers()) {
            if (Player[adminColor].admin) {
                printToColor(`Refunded ${badBagObjects} bad object(s) in bet bag of player ${objectSet.color} (${Player[objectSet.color as ColorLiteral].steam_name}).`, Player[adminColor].color, Color(1, 0, 0))
            }
        }
    }
}

export function payBet(objectSet: ObjectSet, bet: GObject, final: boolean) {
    Logger.trace(LOG_LABEL, `payBet(${objectSet.color}, ${bet}, ${final})`)
    let params: CloneParameters = {}
    params.position = objectSet.container.getPosition()
    params.position.y = (params.position.y ?? 0) + 0.25
    
    params.params = { container: objectSet.container }
    params.callback = "validatePayoutObjectCallback"
    params.callback_owner = Global
    
    if (bet.hasTag(Tag.Chip)) {
        let payout = bet.clone(params)
        payout.setPosition(params.position)

        payout.interactable = true
        payout.setLock(false)
        payout.setLuaScript('')

        objectSet.container.putObject(payout)

        payout.destruct()
    } else if (bet.hasTag(Tag.BetBag)) {
        let payout = bet.takeObject(params)
        if (payout !== undefined) {
            for (let i = 0; payout.getQuantity(); i++) {
                let taken = payout.takeObject(params)
                if (taken !== undefined) {
                    taken.setPosition(params.position)

                    taken.setLock(true)
                }
                params.position.y = math.min((params.position.y ?? 0) + 0.5, 20)
            }
            payout.destruct()
        }
    }
    if (final) {
        bet.destruct()
    }
}

export function clearBets(objectSet: ObjectSet, lockedOnly: boolean): void {
    Logger.trace(LOG_LABEL, `clearBets(${objectSet.color}, ${lockedOnly})`)
    let override = runBonusFunc('clearBets', {
        zone: objectSet.zone,
        lockedOnly: lockedOnly
    })
    if (override === true) {
        return
    }
    let objectsInZone = ZoneHelpers.findBetsInZone(objectSet.zone)
    let badBagObjects = 0
    for (let object of objectsInZone) {
        if (!(lockedOnly && object.interactable)) {
            if (object.hasTag(Tag.BetBag)) {
                let goodIds: { [key: string]: number } = object.getTable('blackjack_betBagContents')
                let contents = object.getObjects()

                let params: TakeObjectParameters = {}
                params.position = objectSet.container.getPosition()
                params.position.y = (params.position.y ?? 0) + 0.25

                for (let subObject of contents) {
                    if (lockedOnly && goodIds[subObject.guid] === undefined || goodIds[subObject.guid] <= 0) {
                        let taken = object.takeObject(params)
                        if (taken !== undefined)
                            objectSet.container.putObject(taken)
                        badBagObjects += 1
                    } else {
                        let taken = object.takeObject(params)
                        if (taken !== undefined)
                            destroyObject(taken)
                        goodIds[subObject.guid] = (goodIds[subObject.guid] ?? 0) + 1
                    }
                    params.position.y = math.min((params.position.y ?? 0) + 0.5, 20)
                }
            } else {
                destroyObject(object)
            }
        }
    }

    if (badBagObjects > 0) {
        broadcastToColor(`Refunded ${badBagObjects} bad objects in bet bag(s). Did you attempt to alter your bet?`, tableSelectionToColorLiteral(objectSet.color), Color(1, 0.25, 0.25))
        for (let adminColor of getSeatedPlayers()) {
            if (Player[adminColor].admin) {
                printToColor(`Refunded ${badBagObjects} bad object(s) in bet bag of player ${objectSet.color} (${Player[objectSet.color as ColorLiteral].steam_name}).`, Player[adminColor].color, Color(1, 0, 0))
            }
        }
    }
}

export function revealHandZone(objectSet: ObjectSet): void {
    Logger.trace(LOG_LABEL, `revealHandZone(${objectSet.color})`)
    let targetCardList = ZoneHelpers.findCardsInZone(objectSet.zone)
    if (targetCardList.length !== 0) {
        for (let card of targetCardList) {
            let z = card.getRotation().z ?? 0
            if (z > 15 && z < 345) {
                card.setRotation(Vector(0, 0, 0))
                let pos = card.getPosition()
                pos.y = (pos.y ?? 0) + 0.2
                card.setPosition(pos)
            }
        }
        if (objectSet.zone === Zones.getObjectSetFromColor('Dealer').zone) {
            startLuaCoroutine(Global, 'DoDealersCards')
        }

        updateHandCounter(objectSet)
    } else {
        printToAll("ERROR: No cards to reveal. Powerup devoured anyway (yummy).", Color(1, 0.1, 0.1))
    }
}

export function deal(objectSet: ObjectSet, whichCard: number[]): void {
    Logger.trace(LOG_LABEL, `deal(${objectSet.color}, ${whichCard})`)
    let override: any;
    if (objectSet.color === 'Dealer') {
        override = runBonusFunc('dealDealer', { whichCard: whichCard })
    } else {
        override = runBonusFunc('dealPlayer', { color: objectSet.color, whichCard: whichCard })
    }
    if (override === true) {
        return
    }
    for (let spot of whichCard) {
        let pos = findCardPlacement(objectSet, spot)
        if (objectSet.color === 'Dealer') {
            if (spot !== 2 || shouldDealerReveal()) {
                placeCard(pos, true, objectSet, spot <= 2, true)
            } else {
                placeCard(pos, false, objectSet, spot <= 2, true)
            }
        } else {
            placeCard(pos, true, objectSet, true, true)
        }
    }
}

export function whoGoesFirst(objectSet: ObjectSet): void {
    Logger.trace(LOG_LABEL, `whoGoesFirst(${objectSet.color})`)
    if (objectSet.value > 21) {
        passPlayerActions(objectSet.zone)
    } else {
        State.currentPlayerTurn = objectSet.color
        createPlayerActions(objectSet, false)
        objectSet.beginTurnTimer(false)
    }
    State.concludeLockout()
}


export function playerPrestige(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `playerPrestige(${_actionButtons}, ${color}, ${altClick})`)
    return localPlayerPrestige(_actionButtons, color, altClick);
}

export function playerBankrupt(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `playerBankrupt(${_actionButtons}, ${color}, ${altClick})`)
    return localPlayerBankrupt(_actionButtons, color, altClick);
}

function localPlayerPrestige(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `playerPrestige(${_actionButtons}, ${color}, ${altClick})`)
    // TODO Whole prestige functoin
    Logger.error('zones.objectSet', 'Not implemented')
}

function localPlayerBankrupt(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
    Logger.trace(LOG_LABEL, `playerBankrupt(${_actionButtons}, ${color}, ${altClick})`)
    // TODO Whole bankrupt functoin
    Logger.error('zones.objectSet', 'Not implemented')
}

export function createPlayerActions(objectSet: ObjectSet, simpleOnly: boolean): void {
    Logger.trace(LOG_LABEL, `createPlayerActions(${objectSet.color}, ${simpleOnly})`)
    objectSet.actionButtons.createButton({
        label: 'Stand',
        click_function: 'localPlayerStand',
        function_owner: undefined,
        position: Vector(-1, 0.25, 0),
        rotation: Vector(0, 0, 0),
        width: 400,
        height: 350,
        font_size: 130
    })
    objectSet.actionButtons.createButton({
        label: 'Hit',
        click_function: 'localPlayerHit',
        function_owner: undefined,
        position: Vector(1, 0.25, 0),
        rotation: Vector(0, 0, 0),
        width: 400,
        height: 350,
        font_size: 130
    })

    if (simpleOnly)
        return

    let cards = ZoneHelpers.findCardsInZone(objectSet.zone)
    if (cards.length === 2 && CardNames[cards[0].getName()] === CardNames[cards[1].getName()]) {
        if (cards[0].getName() === cards[1].getName() || Settings.splitOnValue) {
            objectSet.actionButtons.createButton({
                label: 'Split',
                click_function: 'localPlayerSplit',
                function_owner: undefined,
                position: Vector(-1, 0.25, -0.65),
                rotation: Vector(0, 0, 0),
                width: 400,
                height: 250,
                font_size: 100
            })
        }
    }

    if (cards.length === 2) {
        objectSet.actionButtons.createButton({
            label: 'Double',
            click_function: 'localPlayerDouble',
            function_owner: undefined,
            position: Vector(1, 0.25, -0.65),
            rotation: Vector(0, 0, 0),
            width: 400,
            height: 250,
            font_size: 100
        })
    }
}

export function clearPlayerActions(objectSet: ObjectSet, extraOnly: boolean): void {
    Logger.trace(LOG_LABEL, `clearPlayerActions(${objectSet.color}, ${extraOnly})`)
    objectSet.actionButtons.clearButtons()
    objectSet.actionButtons.createButton({
        label: '0',
        click_function: 'localHitCard',
        function_owner: undefined,
        color: DisplayColors.clear,
        position: Vector(0, 0.25, 0),
        rotation: Vector(0, 0, 0),
        width: 450,
        height: 450,
        font_size: 300
    })
    createPlayerMetaActions(objectSet)
    if (extraOnly) {
        createPlayerActions(objectSet, true)
    }
    findCardsToCount()
    updateHandCounter(objectSet)
}

export function createPlayerMetaActions(objectSet: ObjectSet): void {
    Logger.trace(LOG_LABEL, `createPlayerMetaActions(${objectSet.color})`)
    if (objectSet.table !== undefined && objectSet.table !== objectSet.zone && objectSet.color !== 'Dealer') {
        objectSet.table.clearButtons()
        let scaleTable = objectSet.table.getScale()
        objectSet.table.createButton({
            click_function: 'localPlayerPrestige',
            label: 'Prestige',
            function_owner: undefined,
            position: Vector(-0.13, -0.435, -0.48),
            rotation: Vector(0, 180, 0),
            scale: Vector(2 / (scaleTable.x ?? 1), 2 / (scaleTable.y ?? 1), 2 / (scaleTable.x ?? 1)),
            width: 650,
            height: 190,
            font_size: 110,
            color: Color(0.5, 0.5, 0.5)
        })
        objectSet.table.createButton({
            click_function: 'localPlayerBankrupt',
            label: 'Bankrupt',
            function_owner: undefined,
            position: Vector(0.13, -0.435, -0.48),
            rotation: Vector(0, 180, 0),
            scale: Vector(2 / (scaleTable.x ?? 1), 2 / (scaleTable.y ?? 1), 2 / (scaleTable.x ?? 1)),
            width: 650,
            height: 190,
            font_size: 110,
            color: Color(0.5, 0.5, 0.5)
        })
    }
}

export function getHandDisplayColor(objectSet: ObjectSet): Color {
    Logger.trace(LOG_LABEL, `getHandDisplayColor(${objectSet.color})`)
    if (objectSet.color === 'Dealer' || objectSet.value === 0) {
        return DisplayColors.clear
    }
    if (objectSet.value === SpecialHands.SingleJoker || objectSet.value === SpecialHands.DoubleJoker) {
        return DisplayColors.win
    }
    if (objectSet.value > 21 && (objectSet.value < SpecialHands.LowEnd || objectSet.value > SpecialHands.HighEnd)) {
        return objectSet.count >= Settings.countForSafe ? DisplayColors.safe : DisplayColors.bust
    }

    let dealerValue = Zones.getObjectSetFromColor('Dealer').value
    if (dealerValue === SpecialHands.Blackjack) {
        if (objectSet.value === SpecialHands.Blackjack || objectSet.count >= Settings.countForSafe) {
            return DisplayColors.safe
        }
        return DisplayColors.lose
    }

    if (dealerValue <= 21) {
        if (dealerValue === objectSet.value) {
            return DisplayColors.safe
        } else if (dealerValue > objectSet.value) {
            return objectSet.count >= Settings.countForSafe ? DisplayColors.safe : DisplayColors.lose
        }
    }
    return DisplayColors.win
}

export function timerStart(): void {
    Logger.trace(LOG_LABEL, `timerStart()`)
    Wait.time(() => timerStart, 0.5)
    if ((Timers.bonusTimer?.getValue() ?? 0) as number < 1) {
        Timers.resetBonusTimer(Settings.bonusTime)
        bonusRound()
    }

    if (Time.time >= State.nextAutoCardCount) {
        findCardsToCount()
    }

    if (Timers.roundTimer !== undefined) {
        if (Timers.roundTimer.getValue() as number <= 0 && (Timers.preventRoundEnd === undefined || Time.time > Timers.preventRoundEnd)) {
            Timers.preventRoundEnd = undefined
            if (State.roundState === RoundState.Betting) {
                dealButtonPressed(undefined, 'Lua')
            } else if (State.roundState === RoundState.Powerups) {
                payButtonPressed(undefined, 'Lua')
            } else if (State.roundState === RoundState.Playing && !State.dealersTurn && Settings.turnTimeLimit > 0 && !State.turnActive) {
                State.turnActive = true
                if (State.currentPlayerTurn !== 'Nobody') {
                    let set = Zones.getObjectSetFromColor(State.currentPlayerTurn)
                    if (set !== undefined) {
                        clearPlayerActions(set, false)
                        passPlayerActions(set.zone)
                    }
                }
            }
        }

        if (Timers.roundTimer.Clock !== undefined && Timers.roundTimer.Clock.paused && (State.roundState === RoundState.Betting || State.roundState === RoundState.Powerups)) {
            State.setRoundStateObject(RoundState.Paused)
        } else {
            let objectState = State.getRoundStateFromObject()
            if (objectState !== RoundState.Unknown && objectState !== State.roundState) {
                State.setRoundStateObject(State.roundState)
            }
        }

        // MINIGAME
    }
}

export function payButtonPressed(object: GObject | undefined, color: ScriptCallableColor) {
    Logger.trace(LOG_LABEL, `payButtonPressed(${object}, ${color})`)
    return localPayButtonPressed(object, color);
}

export function localPayButtonPressed(object: GObject | undefined, color: ScriptCallableColor) {
    Logger.trace(LOG_LABEL, `localPayButtonPressed(${object}, ${color})`)
    if (hasPermission(color)) {
        setRoundState(RoundState.Betting, Settings.betTime)

        if (color === 'Lua' || !State.lockout) {
            State.dealersTurn = false
            State.dealingDealerCards = false
/*
            findCardsToCount()

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
            */
        } else {
            broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
        }
    }
}

export function dealButtonPressed(object: GObject | undefined, color: ScriptCallableColor): void {
    Logger.trace(LOG_LABEL, `dealButtonPressed(${object}, ${color})`)
    return localDealButtonPressed(object, color);
}

export function localDealButtonPressed(object: GObject | undefined, color: ScriptCallableColor): void {
    Logger.trace(LOG_LABEL, `localDealButtonPressed(${object}, ${color})`)
    if (hasPermission(color)) {
        setRoundState(RoundState.Playing)
/*
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
                    let targetSet: ObjectSet | undefined = undefined;
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
        */
    }
}

export function findCardsToCount(): void {
    Logger.trace(LOG_LABEL, `findCardsToCount()`)
    State.nextAutoCardCount = Time.time + 5
    for (let zone of Object.values(Zones.zones)) {
        updateHandDisplay(zone)
    }
    timerStart()
}

export function passPlayerActions(zone: Zone): void {
    Logger.trace(LOG_LABEL, `passPlayerActions(${zone})`)
    let nextInLine = -1;
    for (let i = 0; i < Object.keys(Zones.zones).length; i++) {
        let set = Zones.zones[Object.keys(Zones.zones)[i] as TableSelection]
        if (set === undefined)
            continue
        if (set.color === 'Dealer') {
            State.dealersTurn = true
            State.currentPlayerTurn = 'Nobody'
            revealHandZone(set)
            if (Settings.turnTimeLimit > 0 && Timers.roundTimer !== undefined) {
                Timers.roundTimer.setValue(0)
                if (Timers.roundTimer.Clock !== undefined)
                    Timers.roundTimer.Clock.paused = false
            }
            break
        } else if (set.zone === zone) {
            if (set.color.startsWith('Split') && set.splitUser !== undefined) {
                let originalSet = set.splitUser
                
                let betsInZone = ZoneHelpers.findBetsInZone(originalSet.zone).length
                let cardsInZone = ZoneHelpers.findCardsInZone(originalSet.zone).length
                let decksInZone = ZoneHelpers.findDecksInZone(originalSet.zone).length
                if (betsInZone !== 0 && (cardsInZone !== 0 || decksInZone !== 0) && originalSet.value <= 21) {
                    State.currentPlayerTurn = originalSet.color
                    createPlayerActions(originalSet, false)
                    break
                }
                return passPlayerActions(originalSet.zone)
            }
            nextInLine = i + 1
        } else if (i === nextInLine) {
            let betsInZone = ZoneHelpers.findBetsInZone(set.zone).length
            let cardsInZone = ZoneHelpers.findCardsInZone(set.zone).length
            let decksInZone = ZoneHelpers.findDecksInZone(set.zone).length
            if (betsInZone !== 0 && (cardsInZone !== 0 || decksInZone !== 0) && set.value <= 21) {
                State.currentPlayerTurn = set.color
                createPlayerActions(set, false)
                set.beginTurnTimer(false)
                break
            }
            nextInLine += 1
        }
    }
}

export function createZoneButtons(): void {
    Logger.trace(LOG_LABEL, `createZoneButtons()`)
    for (let set of Object.values(Zones.zones)) {
        set.actionButtons.createButton({
            label: '0',
            click_function: 'localHitCard',
            function_owner: undefined,
            position: Vector(0, 0.25, 0),
            rotation: Vector(0, 0, 0),
            width: 450,
            height: 450,
            font_size: 300
        })
        createPlayerMetaActions(set)
    }
    let cardHandler = getObjectFromGUID(OtherObjectGuids.cardHandler)
    if (cardHandler === undefined) {
        return
    }
    cardHandler.createButton({
        label: 'Deal\ncards',
        click_function: 'localDealButtonPressed',
        function_owner: undefined,
        position: Vector(-0.46, 0.19, -0.19),
        rotation: Vector(0, 0, 0),
        width: 450,
        height: 450,
        font_size: 150
    })
    cardHandler.createButton({
        label: 'End\nround',
        click_function: 'localPayButtonPressed',
        function_owner: undefined,
        position: Vector(0.46, 0.19, -0.19),
        rotation: Vector(0, 0, 0),
        width: 450,
        height: 450,
        font_size: 150
    })
}

export function updateAllDisplays(): void {
    Logger.trace(LOG_LABEL, `updateAllDisplays()`)
    for (let zone of Object.values(Zones.zones)) {
        updateHandDisplay(zone)
    }
}

export function bonusRound(): void {
    Logger.trace(LOG_LABEL, `bonusRound()`)
    let playerList = getSeatedPlayers()
    for (let player of playerList) {
        let set = Zones.getObjectSetFromColor(Player[player].color as TableSelection)
        spawnRandomPowerup(set.zone)
    }
    if (!isBonusActive()) {
        clearBonus()
        addBonus()
    }
}

export function spawnRandomPowerup(zone: Zone): boolean {
    Logger.trace(LOG_LABEL, `spawnRandomPowerup(${zone})`)
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
        return spawnRandomPowerup(zone)
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

export function activatePowerupEffect(effect: PowerupEffect, setTarget: ObjectSet, powerup: GObject, setUser: ObjectSet): void {
    Logger.trace(LOG_LABEL, `activatePowerupEffect(${effect}, ${setTarget.color}, ${powerup}, ${setUser.color})`)
    findCardsToCount()
    Wait.frames(() => {
        findCardsToCount()
    }, 2)
    let effectFunc = effects[effect]
    if (effectFunc !== undefined) {
        if (!effectFunc(setTarget, powerup, setUser)) {
            Wait.frames(() => {
                activatePowerupFailedCallback(powerup, setUser, setTarget)
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
                activatePowerupFailedCallback(powerup, setUser, setTarget)
            }, 1)
            return
        }
    } else {
        Wait.frames(() => {
            activatePowerupFailedCallback(powerup, setUser, setTarget)
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

    powerup.setPosition(findPowerupPlacement(setTarget, ZoneHelpers.findPowerupsInZone(setTarget.zone).length + 1))
    powerup.setRotation(Vector(0, 0, 0))
    powerup.setLock(true)

    powerup.setColorTint(stringColorToRGB(tableSelectionToColorLiteral(setUser.color)) ?? Color(1, 1, 1))

    if (State.roundState === RoundState.Powerups && Timers.roundTimer !== undefined && (Timers.roundTimer.getValue() as number) < 10) {
        Timers.preventRoundEnd = Time.time + 1
        Timers.roundTimer.setValue(10)
        if (Timers.roundTimer.Clock !== undefined)
            Timers.roundTimer.Clock.paused = false
    }
}

export function activatePowerupFailedCallback(object: GObject, setUser: ObjectSet, setTarget: ObjectSet): void {
    Logger.trace(LOG_LABEL, `activatePowerupFailedCallback(${object}, ${setTarget.color}, ${setUser.color})`)
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
            giveReward(setUser, 'Help')
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
        
        object.setPosition(findPowerupPlacement(setTarget, ZoneHelpers.findPowerupsInZone(setTarget.zone).length + 1))
        object.setRotation(Vector(0, 0, 0))
        object.setName('Fifth Card')
        object.setDescription('This powerup has been used as a fifth card to give this hand bust immunity.')
        object.setLock(true)
        
        setTarget.count += 1
        object.setColorTint(stringColorToRGB(tableSelectionToColorLiteral(setUser.color)) ?? Color(1, 1, 1))
        if (State.roundState === RoundState.Powerups && Timers.roundTimer !== undefined && (Timers.roundTimer.getValue() as number) < 10) {
            Timers.roundTimer.setValue(10)
            if (Timers.roundTimer.Clock !== undefined)
                Timers.roundTimer.Clock.paused = false
        }
    }
}

export let effects: { [key in PowerupEffect | string]?: (objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet) => boolean } = {
    //Clear: clear,
    //AltClear: altClear,
    //Redraw: redraw,
    //RedrawAll: redrawAll,
    //Swap: swap,
    //Clone: clone,
    //Destroy: destroy,
    //Reveal: reveal,
    //Stand: stand,
    //Draw1: draw1,
    //PowerupDraw: powerupDraw,
    //RupeePull: rupeePull,
    //RewardToken: rewardToken,
    //RoyalToken: royalToken,
    //PrestigeToken: prestigeToken,
    //ResetTimer: resetTimer,
    //CardMod: cardMod
}

export function clear(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `activatePowerupFailedCallback(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    if (!PowerupEffects.isPowerupState()) {
        return false
    }

    let cardsInZone = ZoneHelpers.findCardsInZone(objectSetTarget.zone)
    let decksInZone = ZoneHelpers.findDecksInZone(objectSetTarget.zone)
    let dealerValue = Zones.getObjectSetFromColor('Dealer').value

    if ((cardsInZone.length > 0 || decksInZone.length > 0)
        && (!PowerupEffects.isBusted(objectSetTarget.value) && objectSetTarget.value < dealerValue && (!PowerupEffects.isBusted(dealerValue)))) {
        if (!PowerupEffects.isSelf(objectSetTarget, objectSetUser)) {
            giveReward(objectSetUser, 'Help')
        }

        destroyObject(powerup)
        ZoneHelpers.clearCardsAndPowerups(objectSetTarget.zone)

        ZoneHelpers.setBetsLockState(objectSetTarget.zone, false)
        if (State.currentPlayerTurn == objectSetTarget.color) {
            clearPlayerActions(objectSetTarget, false)
            passPlayerActions(objectSetTarget.zone)
        }
        return true
    } else {
        broadcastToColor("Must use powerup on a zone with cards in it, also the targeted player must be losing and not busted.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    }
    return false
}

export function altClear(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `altClear(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function redraw(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `redraw(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function redrawAll(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `redrawAll(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function swap(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `swap(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function clone(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `clone(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function destroy(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `destroy(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function reveal(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `reveal(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function stand(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `stand(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function draw1(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `draw1(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function powerupDraw(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `powerupDraw(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function rupeePull(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `rupeePull(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function rewardToken(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `rewardToken(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function royalToken(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `royalToken(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function prestigeToken(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `prestigeToken(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function resetTimer(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `resetTimer(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function cardMod(objectSetTarget: ObjectSet, powerup: GObject, objectSetUser: ObjectSet): boolean {
    Logger.trace(LOG_LABEL, `cardMod(${objectSetTarget.color}, ${powerup.name}, ${objectSetUser.color})`)
    // TODO
    broadcastToColor("Not implemented.", tableSelectionToColorLiteral(objectSetUser.color), Color(1, 0.5, 0.5))
    return false
}

export function checkPowerupDropZone(color: ColorLiteral, object: GObject, who: PowerupTarget, effect: PowerupEffect): void {
    Logger.trace(LOG_LABEL, `checkPowerupDropZone(${color}, ${object}, ${who}, ${effect})`)
    /*for (let set of Object.values(Zones.zones)) {
        let objectsInZone = set.zone.getObjects()
        for (let zoneObject of objectsInZone) {
            if (zoneObject === object) {
                PowerupManager.checkPowerupEffect(color, object, who, effect, set)
                break
            }
        }
    }*/
}

export function checkPowerupEffect(color: ColorLiteral, object: GObject, who: PowerupTarget, effect: PowerupEffect, setTarget: ObjectSet): void {
    Logger.trace(LOG_LABEL, `checkPowerupEffect(${color}, ${object}, ${who}, ${effect}, ${setTarget.color})`)
    /*let setUser = Zones.getObjectSetFromColor(color as TableSelection)
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
    }*/
}

export function addBonus(position?: Vector): void {
    Logger.trace(LOG_LABEL, `addBonus(${position})`)
    if (position === undefined) {
        position = Zones.bonusZone?.getPosition()
        if (position === undefined)
            return
        position.y = (position.y ?? 10) - 1.7
    }

    let params: TakeObjectParameters = {}
    params.position = position

    let autoBonuses = RoundBonus.getBonusBag().takeObject(params)
    if  (autoBonuses === undefined) {
        return;
    }
    autoBonuses.shuffle()

    params.callback_function = activateBonus

    let chosenBonus: GObject | undefined = undefined;
    do {
        chosenBonus = autoBonuses.takeObject(params)
        if (chosenBonus === undefined) {
            break;
        }
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

export function activateBonus(object: GObject): void {
    Logger.trace(LOG_LABEL, `activateBonus(${object})`)
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

export function clearBonus(): void {
    Logger.trace(LOG_LABEL, `clearBonus()`)
    if (RoundBonus.bonusObjects.length === 0) {
        let objectList = Zones.getBonusZone().getObjects()
        for (let objectData of objectList) {
            let object = getObjectFromGUID(objectData.guid)
            if (object !== undefined && object.hasTag(Tag.Powerup) && object.getLock()) {
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



export function isBonusActive(): boolean {
    return runBonusFunc('isActive')
}

export function preRound(): any {
    return runBonusFunc('preRoundStart')
}

export function onRoundStart(): any {
    return runBonusFunc('onRoundStart')
}

export function onRoundEnd(): any {
    return runBonusFunc('onRoundEnd')
}

export function getPayoutMultiplier(set: ObjectSet, multiplier: number): any {
    Logger.trace(LOG_LABEL, `getPayoutMultiplier(${set}, ${multiplier})`)
    return runBonusFunc('payoutMultiplier', { 
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

export function shouldDealerReveal(): boolean {
    return runBonusFunc('shouldDealerReveal') === true
}

export function canUsePowerup(powerup: GObject): boolean {
    return runBonusFunc('canUsePowerup', { powerup: powerup }) !== false
}

export function canFlip(): boolean {
    return runBonusFunc('canFlip') === true
}

export function shouldBust(set: ObjectSet): boolean {
    return runBonusFunc('shouldBust', { set: set }) !== false
}

export function runBonusFunc(funcName: string, data?: any, returnFunc?: (...args: any) => void): any {
    Logger.trace(LOG_LABEL, `runBonusFunc(${funcName}, ${data})`)
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

export function btnFlipCard(card: GObject, color: ColorLiteral): void {
    Logger.trace(LOG_LABEL, `btnFlipCard(${card}, ${color})`)
    return localBtnFlipCard(card, color);
}

export function localBtnFlipCard(card: GObject, color: ColorLiteral): void {
    Logger.trace(LOG_LABEL, `localBtnFlipCard(${card}, ${color})`)
    let canFlip = runBonusFunc('onCardFlip', {
        card: card,
        col: color
    })
    if (canFlip === false) {
        return
    }
    let set: ObjectSet = card.getTable('blackjack_playerSet')
    if (set !== undefined && color !== set.color && color !== set.userColor && !Player[color].admin) {
        broadcastToColor("This does not belong to you!", color, Color(1, 0.2, 0.2))
        return
    }
    let rot = card.getRotation()
    rot.z = (rot.z ?? 0) + 180
    card.setRotation(rot)
    if (set !== undefined) {
        let targetRot = Vector(0, 0, 0)
        for (let object of ZoneHelpers.findCardsInZone(set.zone)) {
            if (object !== card) {
                object.setRotation(targetRot)
            }
        }
        updateHandCounter(set)
    }
}

export function cardPlacedCallback(object: GObject, data: any): void {
    Logger.trace(LOG_LABEL, `cardPlacedCallback(${object}, ${data})`)
    if (object === undefined) {
        return
    }
    object.setLock(true)
    object.interactable = false
    object.clearButtons()

    object.setPosition(data.targetPos)
    let flippable = true
    if (State.dealersTurn) {
        for (let dealerCard of ZoneHelpers.findCardsInZone(Zones.getObjectSetFromColor('Dealer').zone)) {
            if (dealerCard === object) {
                flippable = false
                break
            }
        }
    }
    if (flippable) {
        let rot = object.getRotation()
        rot.z = data.flip ? 0 : 180
        object.setRotation(rot)
    }
    if (data.isStarter && canFlip()) {
        object.setTable('blackjack_playerSet', data.set)
        if (data.set.color !== 'Dealer') {
            object.createButton({
                label: "Flip",
                click_function: 'localBtnFlipCard',
                function_owner: undefined,
                position: Vector(-0.4, 1.1, -0.95),
                rotation: Vector(0, 0, 0),
                width: 300,
                height: 350,
                font_size: 130
            })
            object.createButton({
                label: "Flip",
                click_function: 'localBtnFlipCard',
                function_owner: undefined,
                position: Vector(0.4, -1.1, -0.95),
                rotation: Vector(0, 0, 180),
                width: 300,
                height: 350,
                font_size: 130
            })
        }
    } else {
        object.setTable('blackjack_playerSet', {})
    }
    if (data.set !== undefined) {
        let set = data.set as ObjectSet
        updateCardPositions(set)
        updateHandCounter(set)
    } else {
        findCardsToCount()
    }
    if (object.held_by_color !== undefined) {
        let newObject = object.reload()
        newObject.interactable = false
    }
}

export function placeCard(position: Vector, flip: boolean, set: ObjectSet, isStarter: boolean, fastDraw: boolean): void {
    Logger.trace(LOG_LABEL, `placeCard(${position}, ${flip}, ${set.color}, ${isStarter}, ${fastDraw})`)
    if (DeckManager.mainDeck === undefined || DeckManager.mainDeck.getQuantity() < 40) {
        DeckManager.newDeck()
    }

    let targetPos = position
    if (position.y !== undefined) {
        targetPos = Vector(position.x ?? 0, position.y ?? 0, position.z ?? 0)
        position.y = (position.y ?? 0) + 0.1
    } else if (position[1] !== undefined) {
        targetPos = Vector(position[1] ?? 0, position[2] ?? 0, position[3] ?? 0)
        position.y = (position[1] ?? 0) + 0.1
    }

    State.lastCard = DeckManager.mainDeck?.takeObject({
        position: position,
        flip: flip,
        callback_function: (object) => {
            cardPlacedCallback(object, {
                targetPos: targetPos,
                flip: flip,
                set: set,
                isStarter: isStarter
            })
        },
        smooth: !fastDraw
    })
    if (State.lastCard === undefined) {
        return
    }
    State.lastCard.interactable = false

    if (fastDraw) {
        State.lastCard.setLock(true)
        State.lastCard.setPosition(targetPos)
        let rot = State.lastCard.getRotation()
        rot.z = flip ? 0 : 180
        State.lastCard.setRotation(rot)
    }
}

export function checkForBlackjack(value: number, facedownCard: GObject | undefined): void {
    Logger.trace(LOG_LABEL, `checkForBlackjack(${value}, ${facedownCard})`)
    if (facedownCard === undefined) {
        return
    }
    let facedownValue: string | number | undefined = undefined;
    for (let name of Object.keys(CardNames)) {
        if (name === facedownCard.getName()) {
            facedownValue = CardNames[name]
            break
        }
    }
    if ((facedownValue === 'Ace' && value === 10) || (facedownValue === 10 && value === 11)) {
        facedownCard.setRotation(Vector(0, 0, 0))
        let pos = facedownCard.getPosition()
        pos.y = (pos.y ?? 0) + 0.2
        facedownCard.setPosition(pos)
        broadcastToAll("Dealer has Blackjack!", Color(0.9, 0.2, 0.2))
        Wait.frames(() => {
            updateHandCounter(Zones.getObjectSetFromColor('Dealer'))
            updateAllDisplays()
        }, 2)
    }
}
