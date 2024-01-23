import RoundBonus from "../bonus/round";
import { CardNames, DisplayColors, SelfDestructScript, SoftHandDisplay, SpecialHandDisplay, Tag } from "../constants";
import { hasPermission, isSpecialValue } from "../functions";
import { generatePermissionString } from "../items/pickup";
import Logger from "../logger";
import CardHelpers from "../objects/cards";
import DeckManager from "../objects/decks";
import Rewards from "../objects/rewards";
import Settings from "../settings";
import State from "../state";
import Timers from "../timer";
import { RewardName, SpecialHands, TableSelection } from "../types";
import ZoneHelpers from "./helpers";
import Zones from "./zones";

export default class ObjectSet {

    public zone: Zone;
    public container: GObject;
    public prestige: Zone;
    public actionButtons: GObject;
    public table?: Zone;

    public value = 0;
    public soft = false;
    public count = 0;

    public splitUser: ObjectSet | undefined;

    public userColor: TableSelection | undefined;
    public color: TableSelection;

    public constructor(zone: Zone, container: GObject, prestige: Zone, actionButtons: GObject, color: TableSelection, table?: Zone) {
        this.zone = zone;
        this.container = container;
        this.prestige = prestige;
        this.actionButtons = actionButtons;
        this.table = table;
        this.color = color;
    }

    public displayResult(value: number, soft: boolean): void {
        this.value = value
        this.soft = soft
        this.updateHandDisplay()            
    }

    public updateHandDisplay(): void {
        let valueLabel: string = `${this.value}`
        if (isSpecialValue(this.value)) {
            valueLabel = SpecialHandDisplay[this.value as SpecialHands] ?? `${this.value}`
        }
        if (this.soft) {
            valueLabel = SoftHandDisplay[this.value] ?? `${this.value}`
        }
        this.actionButtons.editButton({
            index: 0,
            label: valueLabel,
            color: this.getHandDisplayColor()
        })
    }

    public updateHandCounter(): void {
        let cardList = ZoneHelpers.findCardsInZone(this.zone)
        let deckList = ZoneHelpers.findDecksInZone(this.zone)
        let powerupList = ZoneHelpers.findPowerupsInZone(this.zone)
        if (cardList.length > 0 || deckList.length > 0 || powerupList.length > 0) {
            this.obtainCardNames(cardList, deckList, powerupList)
            return
        }

        this.value = 0
        this.count = 0

        this.actionButtons.editButton({
            index: 0,
            label: '0',
            color: DisplayColors.clear
        })
    }

    public updateCardPositions(): void {
        let cards = ZoneHelpers.findCardsInZone(this.zone)
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
        let zoneRot = this.zone.getRotation()
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i]
            card.setPosition(this.findCardPlacement(i + 1))
            let rot = card.getRotation()
            rot.x = zoneRot.x
            rot.y = (zoneRot.y ?? 0) + 180
            rot.z = (rot.z ?? 0) > 15 && (rot.z ?? 0) < 275 ? 180 : 0
            card.setRotation(rot)
        }
    }

    public obtainCardNames(cardList: GObject[], deckList: GObject[], powerupList: GObject[]) {
        let validCards: string[] = []
        let facedownCount = 0
        let facedownCard: GObject | undefined = undefined
        for (let card of cardList) {
            let z = card.getRotation().z ?? 0
            if (z > 270 || z < 90) {
                if (this.color === 'Dealer' && card.getName() === 'Joker') {
                    Timers.resetBonusTimer(3)
                    card.destruct()
                }
                validCards.push(card.getName())
            } else if (this.color === 'Dealer') {
                facedownCount += 1
                facedownCard = card
            }
        }
        /*
        Not sure of the point of this
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
        this.count = validCards.length
        this.addCardValues(validCards, facedownCount, facedownCard);
    }

    public addCardValues(cardList: string[], facedownCount: number, facedownCard: GObject | undefined): void {
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
                if (this.count === 1) {
                    sevenCount += 3
                }
                v = 21
            } else if (v === SpecialHands.DealerBust) {
                dealerBust++
            }

            if (this.color === 'Dealer') {
                if (this.count >= Settings.dealerBustCount || dealerBust > 0) {
                    stopCount = true
                    value = SpecialHands.DealerBust
                }
            } else {
                if (jokerCount > 0) {
                    if (jokerCount === 2 && this.count <= 2) {
                        value = SpecialHands.DoubleJoker
                    } else {
                        value = SpecialHands.SingleJoker
                    }
                    stopCount = true
                } else if (sevenCount === 3 && this.count <= 3) {
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
                    if (aceCount === 1 && tenCount === 1 && this.count <= 2) {
                        value = SpecialHands.Blackjack
                        stopCount = true
                    } else if (this.color === 'Dealer' && facedownCount < 1 && Settings.dealerAceIsOne) {
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

        if (value > 50 && !(stopCount || this.count === 1)) {
            value = SpecialHands.Bust
        }

        this.displayResult(value, soft)

        if (this.color === 'Dealer') {
            if (cardList.length === 1 && facedownCount === 1)  {
                CardHelpers.checkForBlackjack(value, facedownCard)
            }
        }
    }

    private canInitiateAction(color: ColorLiteral): boolean {
        return this.color === color
            || color === 'Black'
            || Player[color].promoted
            || Player[color].host
            || (this.color.startsWith('Split') && this.userColor === color)
    }

    private checkCurrentTurn(): boolean {
        if (this.color !== State.currentPlayerTurn) {
            this.clearPlayerActions(false)
            broadcastToColor("Error: It's not your turn.", this.color, Color(1, 0.25, 0.25))
            return false
        }
        return true
    }

    public playerStand(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
        if (this.canInitiateAction(color)) {
            if (altClick || !this.checkCurrentTurn()) {
                return
            }

            if (color === 'Black' || !State.lockout) {
                Timers.endTurnTimer(this, true)
                this.clearPlayerActions(false)
                State.lockoutTimer(0.5)

                Wait.time(() => {
                    if (State.currentPlayerTurn === this.color) {
                        Zones.passPlayerActions(this.zone)
                    }
                }, 0.25)
                RoundBonus.runBonusFunc('onPlayerStand', {
                    set: this,
                    color: color
                })
            } else {
                broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
            }
        }
    }

    public playerSplit(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
        if (this.canInitiateAction(color)) {
            if (altClick || !this.checkCurrentTurn()) {
                return
            }

            let cards = ZoneHelpers.findCardsInZone(this.zone)
            if (cards.length !== 2 || CardNames[cards[0].getName()] !== CardNames[cards[1].getName()]) {
                return
            }
            if (!Settings.splitOnValue && cards[0].getName() !== cards[1].getName()) {
                return
            }

            if (!State.lockout) {
                Timers.endTurnTimer(this, false)
                for (let splitSet of Object.values(Zones.zones)) {
                    if (splitSet.color.startsWith('Split') && splitSet.splitUser === undefined) {
                        let override = RoundBonus.runBonusFunc('prePlayerSplit', {
                            set: this,
                            color: color
                        })
                        if (override === true) {
                            return
                        }
                        if (!ZoneHelpers.repeatBet(color as TableSelection, this, splitSet)) {
                            return
                        }
                        override = RoundBonus.runBonusFunc('onPlayerSplit', {
                            set: this,
                            color: color
                        })
                        if (override === true) {
                            return
                        }

                        State.lockoutTimer(2)

                        splitSet.splitUser = this
                        splitSet.userColor = this.userColor ?? this.color
                        splitSet.prestige = this.prestige
                        splitSet.table = this.table
                        splitSet.container.setColorTint(stringColorToRGB(this.userColor ?? this.color) ?? Color(1, 1, 1))

                        cards[0].setPosition(splitSet.findCardPlacement(1))
                        cards[0].setTable('blackjack_playerSet', splitSet)

                        cards[1].setPosition(this.findCardPlacement(1))

                        CardHelpers.placeCard(this.findCardPlacement(2), true, this, true, false)
                        CardHelpers.placeCard(splitSet.findCardPlacement(2), true, splitSet, true, false)

                        this.clearPlayerActions(false)
                        State.currentPlayerTurn = splitSet.color

                        Wait.time(() => {
                            splitSet.delayedCreatePlayerActions()
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

    public playerHit(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
        if (this.canInitiateAction(color)) {
            if (altClick || !this.checkCurrentTurn()) {
                return
            }
            if (!State.lockout) {
                let override = RoundBonus.runBonusFunc('onPlayerHit', {
                    set: this,
                    color: color
                })
                if (override === true) {
                    return
                }
                Timers.endTurnTimer(this, false)
                this.clearPlayerActions(true)
                State.lockoutTimer(1)
                if (this.value > 21) {
                    this.clearPlayerActions(false)
                    Zones.passPlayerActions(this.zone)
                } else {
                    let card = ''
                    if (DeckManager.mainDeck !== undefined) {
                        if (DeckManager.mainDeck.getObjects()[0] !== undefined) {
                            card = DeckManager.mainDeck.getObjects()[0].name ?? ''
                        }
                    }
                    this.checkForBust(card)
                    this.forcedCardDraw()
                }
            } else {
                broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
            }
        }
    }

    public playerDouble(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
        if (this.canInitiateAction(color)) {
            if (altClick || !this.checkCurrentTurn()) {
                return
            }
            if (this.value > 21) {
                this.clearPlayerActions(false)
                Zones.passPlayerActions(this.zone)
                return
            }

            let cards = ZoneHelpers.findCardsInZone(this.zone)
            if (cards.length !== 2) {
                this.clearPlayerActions(true)
                return
            }

            if (!State.lockout) {
                let override = RoundBonus.runBonusFunc('prePlayerDouble', {
                    set: this,
                    color: color
                })
                if (override === true) {
                    return
                }
                Timers.endTurnTimer(this, false)
                if (!ZoneHelpers.repeatBet(color as TableSelection, this, undefined)) {
                    return
                }
                override = RoundBonus.runBonusFunc('onPlayerDouble', {
                    set: this,
                    color: color
                })
                if (override === true) {
                    return
                }
                State.lockoutTimer(1.5)
                this.forcedCardDraw()
                this.clearPlayerActions(false)
                Zones.passPlayerActions(this.zone)
            } else {
                broadcastToColor("Error: Button delay is active.\nWait a moment then try again.", color, Color(1, 0.25, 0.25))
            }
        }
    }

    public delayedCreatePlayerActions(): void {
        let betsInZone = ZoneHelpers.findBetsInZone(this.zone).length
        let cardsInZone = ZoneHelpers.findCardsInZone(this.zone).length
        let decksInZone = ZoneHelpers.findDecksInZone(this.zone).length
        if (betsInZone !== 0 && (cardsInZone !== 0 || decksInZone !== 0) && this.value <= 21) {
            State.currentPlayerTurn = this.color
            return this.createPlayerActions(false)
        }
        return Zones.passPlayerActions(this.zone)
    }

    public forcedCardDraw(): void {
        let targetCardList = ZoneHelpers.findCardsInZone(this.zone)
        let cardToDraw = targetCardList.length + 1
        let pos = this.findCardPlacement(cardToDraw)
        CardHelpers.placeCard(pos, true, this, false, false)
    }

    public findCardPlacement(spot: number): Vector {
        let override = RoundBonus.runBonusFunc('findCardPlacement', {
            zone: this.zone,
            spot: spot
        })
        if (type(override) === 'table') {
            return override as Vector
        }
        if (this.zone === Zones.getObjectSetFromColor('Dealer').zone) {
            return Vector(6.5 - 2.6 * (spot - 1), 1.8, -4.84)
        } else {
            let pos = this.zone.getPosition()
            let scale = this.zone.getScale()
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

    public findPowerupPlacement(spot: number): Vector {
        let override = RoundBonus.runBonusFunc('findPowerupPlacement', {
            zone: this.zone,
            spot: spot
        })
        if (type(override) === 'table') {
            return override as Vector
        }
        if (this.zone === Zones.getObjectSetFromColor('Dealer').zone) {
            return Vector(-8, 1.8, -8 + (1.5 * math.min(spot, 3)))
        } else {
            let column = math.min(math.floor((spot - 1) / 5) + 1, 18) / 20
            let row = ((spot - 1) % 5) / 5
            return this.zone.positionToWorld(Vector(0.5, column - 0.45, -0.5 + row * 1.1))
        }
    }

    public checkForBust(addCard?: string): void {
        if (this.value > 21) {
            this.clearPlayerActions(false)
            State.lockoutTimer(0.75)
            Wait.time(() => {
                if (this.color === State.currentPlayerTurn) {
                    Zones.passPlayerActions(this.zone)
                }
            }, 0.5)
        } else if (addCard !== undefined && CardNames[addCard] !== undefined) {
            let val = CardNames[addCard]
            if (val === 'Ace') {
                val = 1
            }
            if (val === 'Joker' || (this.value + (tonumber(val as string) ?? 0) > (this.soft ? 31 : 21))) {
                this.clearPlayerActions(false)
                State.lockoutTimer(0.75)
                Wait.time(() => {
                    if (this.color === State.currentPlayerTurn) {
                        Zones.passPlayerActions(this.zone)
                    }
                }, 0.5)
            }
        }
    }

    public hitCard(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
        if (altClick) {
            return
        }
        if (hasPermission(color)) {
            let override = RoundBonus.runBonusFunc('onHit', {
                zone: this.zone
            })
            if (override === true) {
                return
            }
            let cardsInZone = ZoneHelpers.findCardsInZone(this.zone).length
            let decksInZone = ZoneHelpers.findDecksInZone(this.zone).length
            let pos = this.findCardPlacement(cardsInZone + decksInZone + 1)
            CardHelpers.placeCard(pos, true, this, cardsInZone < 2 && decksInZone === 0, this.color === 'Dealer')
        }
    }

    public giveReward(rewardName: RewardName): void {
        let reward = Rewards.rewards[rewardName]
        if (reward === undefined) {
            return
        }
        let set: ObjectSet = this
        if (this.userColor !== undefined) {
            set = Zones.getObjectSetFromColor(set.userColor as TableSelection) ?? this
        }
        if (!Player[set.color as ColorLiteral].seated) {
            return
        }

        let params: TakeObjectParameters = {}
        params.position = set.zone.positionToWorld(Vector(0.5, 0, -0.5))
        params.callback = 'giveRewardCallback'
        params.params = {}
        
        for (let itemData of reward.getObjects()) {
            params.position.y = (params.position.y ?? 0) + 0.1
            params.params.pos = params.position

            let item = getObjectFromGUID(itemData.guid)
            let object: GObject | undefined;
            let player = Player[this.color as ColorLiteral]
            if (item.hasTag(Tag.Infinite)) {
                object = item.takeObject(params)
            } else if (object?.hasTag(Tag.SaveBag)) {
                object = item.clone(params)
                object.reset()

                object.setName(`Player save: ${player.steam_name}`)
                object.setDescription(player.steam_id)
            } else {
                object = item.clone(params)

                object.setDescription(`${generatePermissionString(player)}\n\n${object.getDescription()}`)
            }

            if (object !== undefined) {
                object.interactable = true
                object.setLock(false)
            }
        }
    }

    public calculatePayout(): number {
        let multiplier = 1
        if (this.value === SpecialHands.DoubleJoker && this.count === 2) {
            this.giveReward('DoubleJoker')
            multiplier = Settings.betMultipliers.DoubleJoker
        } else if (this.value === SpecialHands.Triple7 && this.count === 3) {
            this.giveReward('TripleSeven')
            multiplier = Settings.betMultipliers.TripleSeven
        } else if ((this.value <= 21 || this.value === SpecialHands.SingleJoker) && this.count >= 5) {
            if ((this.value === 21 || this.value === SpecialHands.SingleJoker) && this.count >= 6) {
                this.giveReward('SixCardTwentyOne')
                multiplier = Settings.betMultipliers.SixCardTwentyOne
            } else if (this.count >= 6) {
                this.giveReward('SixCardWin')
                multiplier = Settings.betMultipliers.SixCardWin
            } else if ((this.value === 21 || this.value === SpecialHands.SingleJoker) && this.count == 5) {
                this.giveReward('FiveCardTwentyOne')
                multiplier = Settings.betMultipliers.FiveCardTwentyOne
            } else if (this.count === 5) {
                this.giveReward('FiveCardWin')
                multiplier = Settings.betMultipliers.FiveCardWin
            }
        } else if (this.value === SpecialHands.Blackjack) {
            this.giveReward('Blackjack')
            multiplier = Settings.betMultipliers.Blackjack
        } else if (this.value === SpecialHands.SingleJoker) {
            this.giveReward('SingleJoker')
            multiplier = 1 + Settings.betMultipliers.SingleJoker
            // TODO getPrestige
            // multiplier = this.getPrestige() + Settings.betMultipliers.SingleJoker
        } else if (this.value === 21) {
            multiplier = Settings.betMultipliers.TwentyOne
        }
        multiplier = (RoundBonus.getPayoutMultiplier(this, multiplier) ?? multiplier) * math.max(Settings.multiplier, 1)
        return multiplier
    }

    public processPayout(iterations: number, lockedOnly: boolean): void {
        let zoneObjects = ZoneHelpers.findBetsInZone(this.zone)
        let badBagObjects = 0

        let playerId = Player[(this.userColor ?? this.color) as ColorLiteral].seated ? Player[(this.userColor ?? this.color) as ColorLiteral].steam_id : undefined
        
        for (let bet of zoneObjects) {
            let wasLocked: { [key: string]: boolean } = {}
            if (!lockedOnly || !bet.interactable || wasLocked[bet.getGUID()] !== undefined) {
                if (lockedOnly && bet.hasTag(Tag.BetBag)) {
                    let goodIds = bet.getTable('blackjack_betBagContents')
                    let contents = bet.getObjects()

                    let params: TakeObjectParameters = {}
                    params.position = this.container.getPosition()
                    params.position.y = (params.position.y ?? 0) + 0.25

                    for (let object of contents) {
                        if (goodIds[object.guid] === undefined || goodIds[object.guid] <= 0) {
                            let taken = bet.takeObject(params)

                            params.position.y = math.min((params.position.y ?? 0) + 0.5, 20)
                            this.container.putObject(taken)

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
                    for (let player of getSeatedPlayers()) {
                        let targetSet = Zones.getObjectSetFromColor(player.color as TableSelection)
                        if (player.seated && bet.getDescription().startsWith(player.steam_id) && targetSet !== undefined) {
                            foundPlayer = true
                            for (let i = 1; i <= iterations; i++) {
                                Wait.time(() => {
                                    targetSet.payBet(clone, i === iterations)
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
                            this.payBet(clone, i === iterations)
                        }, 1 / 10)
                    }
                    if (this.userColor !== undefined) {
                        let targetSet = Zones.getObjectSetFromColor(this.userColor)
                        if (targetSet !== undefined) {
                            targetSet.container.putObject(bet)
                        }
                    }
                }
            }
        }

        if (badBagObjects > 0) {
            broadcastToColor(`Refunded ${badBagObjects} bad object(s) in bet bag. Did you attempt to alter your bet?`, this.color, Color(1, 0.25, 0.25))
            for (let adminColor of getSeatedPlayers()) {
                if (adminColor.admin) {
                    printToColor(`Refunded ${badBagObjects} bad object(s) in bet bag of player ${this.color} (${Player[this.color as ColorLiteral].steam_name}).`, adminColor.color, Color(1, 0, 0))
                }
            }
        }
    }

    public payBet(bet: GObject, final: boolean) {
        let params: CloneParameters = {}
        params.position = this.container.getPosition()
        params.position.y = (params.position.y ?? 0) + 0.25
        
        params.params = { container: this.container }
        params.callback = "validatePayoutObjectCallback"
	    params.callback_owner = Global
        
        if (bet.hasTag(Tag.Chip)) {
            let payout = bet.clone(params)
            payout.setPosition(params.position)

            payout.interactable = true
            payout.setLock(false)
            payout.setLuaScript('')

            this.container.putObject(payout)

            payout.destruct()
        } else if (bet.hasTag(Tag.BetBag)) {
            let payout = bet.takeObject(params)

            for (let i = 0; payout.getQuantity(); i++) {
                let taken = payout.takeObject(params)
                taken.setPosition(params.position)

                taken.setLock(true)
                params.position.y = math.min((params.position.y ?? 0) + 0.5, 20)
            }
            payout.destruct()
        }
        if (final) {
            bet.destruct()
        }
    }

    public clearBets(lockedOnly: boolean): void {
        let override = RoundBonus.runBonusFunc('clearBets', {
            zone: this.zone,
            lockedOnly: lockedOnly
        })
        if (override === true) {
            return
        }
        let objectsInZone = ZoneHelpers.findBetsInZone(this.zone)
        let badBagObjects = 0
        for (let object of objectsInZone) {
            if (!(lockedOnly && object.interactable)) {
                if (object.hasTag(Tag.BetBag)) {
                    let goodIds: { [key: string]: number } = object.getTable('blackjack_betBagContents')
                    let contents = object.getObjects()

                    let params: TakeObjectParameters = {}
                    params.position = this.container.getPosition()
                    params.position.y = (params.position.y ?? 0) + 0.25

                    for (let subObject of contents) {
                        if (lockedOnly && goodIds[subObject.guid] === undefined || goodIds[subObject.guid] <= 0) {
                            let taken = object.takeObject(params)
                            this.container.putObject(taken)
                            badBagObjects += 1
                        } else {
                            let taken = object.takeObject(params)
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
            broadcastToColor(`Refunded ${badBagObjects} bad objects in bet bag(s). Did you attempt to alter your bet?`, this.color, Color(1, 0.25, 0.25))
            for (let adminColor of getSeatedPlayers()) {
                if (adminColor.admin) {
                    printToColor(`Refunded ${badBagObjects} bad object(s) in bet bag of player ${this.color} (${Player[this.color as ColorLiteral].steam_name}).`, adminColor.color, Color(1, 0, 0))
                }
            }
        }
    }

    public revealHandZone(): void {
        let targetCardList = ZoneHelpers.findCardsInZone(this.zone)
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
            if (this.zone === Zones.getObjectSetFromColor('Dealer').zone) {
                startLuaCoroutine(Global, 'DoDealersCards')
            }

            this.updateHandCounter()
        } else {
            printToAll("ERROR: No cards to reveal. Powerup devoured anyway (yummy).", Color(1, 0.1, 0.1))
        }
    }

    public deal(whichCard: number[]): void {
        let override: any;
        if (this.color === 'Dealer') {
            override = RoundBonus.runBonusFunc('dealDealer', { whichCard: whichCard })
        } else {
            override = RoundBonus.runBonusFunc('dealPlayer', { color: this.color, whichCard: whichCard })
        }
        if (override === true) {
            return
        }
        for (let spot of whichCard) {
            let pos = this.findCardPlacement(spot)
            if (this.color === 'Dealer') {
                if (spot !== 2 || RoundBonus.shouldDealerReveal()) {
                    CardHelpers.placeCard(pos, true, this, spot <= 2, true)
                } else {
                    CardHelpers.placeCard(pos, false, this, spot <= 2, true)
                }
            } else {
                CardHelpers.placeCard(pos, true, this, true, true)
            }
        }
    }

    public playerPrestige(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
        // TODO Whole prestige functoin
        Logger.error('zones.objectSet', 'Not implemented')
    }

    public playerBankrupt(_actionButtons: GObject, color: ColorLiteral, altClick: boolean): void {
        // TODO Whole bankrupt functoin
        Logger.error('zones.objectSet', 'Not implemented')
    }

    public createPlayerActions(simpleOnly: boolean): void {
        this.actionButtons.createButton({
            label: 'Stand',
            click_function: this.playerStand,
            function_owner: undefined,
            position: Vector(-1, 0.25, 0),
            rotation: Vector(0, 0, 0),
            width: 400,
            height: 350,
            font_size: 130
        })
        this.actionButtons.createButton({
            label: 'Hit',
            click_function: this.playerHit,
            function_owner: undefined,
            position: Vector(1, 0.25, 0),
            rotation: Vector(0, 0, 0),
            width: 400,
            height: 350,
            font_size: 130
        })

        if (simpleOnly)
            return

        let cards = ZoneHelpers.findCardsInZone(this.zone)
        if (cards.length === 2 && CardNames[cards[0].getName()] === CardNames[cards[1].getName()]) {
            if (cards[0].getName() === cards[1].getName() || Settings.splitOnValue) {
                this.actionButtons.createButton({
                    label: 'Split',
                    click_function: this.playerSplit,
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
            this.actionButtons.createButton({
                label: 'Double',
                click_function: this.playerDouble,
                function_owner: undefined,
                position: Vector(1, 0.25, -0.65),
                rotation: Vector(0, 0, 0),
                width: 400,
                height: 250,
                font_size: 100
            })
        }
    }

    public clearPlayerActions(extraOnly: boolean): void {
        this.actionButtons.clearButtons()
        this.actionButtons.createButton({
            label: '0',
            click_function: this.hitCard,
            function_owner: undefined,
            color: DisplayColors.clear,
            position: Vector(0, 0.25, 0),
            rotation: Vector(0, 0, 0),
            width: 450,
            height: 450,
            font_size: 300
        })
        this.createPlayerMetaActions()
        if (extraOnly) {
            this.createPlayerActions(true)
        }
        Zones.findCardsToCount()
        this.updateHandCounter()
    }

    public createPlayerMetaActions(): void {
        if (this.table !== undefined && this.table !== this.zone && this.color !== 'Dealer') {
            this.table.clearButtons()
            let scaleTable = this.table.getScale()
            this.table.createButton({
                click_function: this.playerPrestige,
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
            this.table.createButton({
                click_function: this.playerBankrupt,
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

    public getHandDisplayColor(): Color {
        if (this.color === 'Dealer' || this.value === 0) {
            return DisplayColors.clear
        }
        if (this.value === SpecialHands.SingleJoker || this.value === SpecialHands.DoubleJoker) {
            return DisplayColors.win
        }
        if (this.value > 21 && (this.value < SpecialHands.LowEnd || this.value > SpecialHands.HighEnd)) {
            return this.count >= Settings.countForSafe ? DisplayColors.safe : DisplayColors.bust
        }

        let dealerValue = Zones.getObjectSetFromColor('Dealer').value
        if (dealerValue === SpecialHands.Blackjack) {
            if (this.value === SpecialHands.Blackjack || this.count >= Settings.countForSafe) {
                return DisplayColors.safe
            }
            return DisplayColors.lose
        }

        if (dealerValue <= 21) {
            if (dealerValue === this.value) {
                return DisplayColors.safe
            } else if (dealerValue > this.value) {
                return this.count >= Settings.countForSafe ? DisplayColors.safe : DisplayColors.lose
            }
        }
        return DisplayColors.win
    }

}