import { Tag } from "./constants"
import DeckManager from "./objects/decks"
import Settings from "./settings"
import State from "./state"
import Timers, { setRoundState } from "./timer"
import { RoundState, SpecialHands, TableSelection } from "./types"
import { deal, findCardsToCount, hitCard, revealHandZone, updateAllDisplays, updateHandCounter, whoGoesFirst } from "./zones/functions"
import ZoneHelpers from "./zones/helpers"
import ObjectSet from "./zones/objectSet"
import Zones from "./zones/zones"

function waitTime(time: number): void {
    let endTime = os.time() + time
    while (os.time() < endTime) {
        coroutine.yield
    }
}

function DoDealersCards(): void {
    if (State.dealingDealerCards || !State.dealersTurn) {
        return
    }
    State.dealingDealerCards = true
    let set = Zones.getObjectSetFromColor('Dealer')
    waitTime(1)
    let targetCardList = ZoneHelpers.findCardsInZone(set.zone)
    if (targetCardList.length !== 0) {
        for (let card of targetCardList) {
            if (!State.dealingDealerCards) {
                return
            }
            let z = card.getRotation().z ?? 0
            if (z > 15 && z < 345) {
                let pos = card.getPosition()
                card.setRotation(Vector(0, 0, 0))
                card.setPosition(pos)
                updateAllDisplays()
                waitTime(1)
            }
        }
    }
    findCardsToCount()
    updateHandCounter(set)
    updateAllDisplays()
    waitTime(0.05)

    while (set.value < Settings.standValue && set.value <= 21 && set.value > 0 && set.count < Settings.standCount) {
        if (!State.dealingDealerCards) {
            return
        }
        updateHandCounter(set)
        if (set.value >= 0) {
            hitCard(set.actionButtons, 'Black', false)
            while (State.lastCard?.getName() === 'Joker') {
                State.lastCard.destruct()
                hitCard(set.actionButtons, 'Black', false)
                updateAllDisplays()
                Timers.resetBonusTimer(3)
            }
        }
        updateAllDisplays()
        waitTime(1)
        findCardsToCount()
        updateHandCounter(set)
        updateAllDisplays()
        waitTime(0.5)
    }
    if (!State.dealingDealerCards) {
        return
    }

    if (set.count >= Settings.standCount) {
        printToAll("Dealer: 5-card bust.", Color(0.1, 0.1, 0.1))
    } else if (set.value >= SpecialHands.LowEnd || set.value < 0) {
        printToAll("Dealer: Stand.", Color(0.1, 0.1, 0.1))
    } else if (set.value > 21) {
        printToAll("Dealer: Bust.", Color(0.1, 0.1, 0.1))
    } else {
        printToAll(`Dealer: Stand on ${set.value}.`, Color(0.1, 0.1, 0.1))
    }
    State.dealingDealerCards = false
    updateAllDisplays()
    State.dealingDealerCards = false

    setRoundState(RoundState.Powerups, Settings.powerupTime)
}

function dealInOrder(): void {
    let firstToGo: ObjectSet | undefined = undefined
    if (DeckManager.deckBool) {
        waitTime(1)
        DeckManager.deckBool = false
    }
    findCardsToCount()

    let newDealOrder: Player[] = []
    for (let player of State.dealOrder) {
        let set = Zones.getObjectSetFromColor(player.color as TableSelection)
        if (set !== undefined) {
            let zoneObjectList = ZoneHelpers.findBetsInZone(set.zone)
            let foundBets = false
            for (let bet of zoneObjectList) {
                if (bet.held_by_color === undefined) {
                    foundBets = true
                    bet.interactable = false
                    bet.setLock(true)

                    if (bet.hasTag(Tag.BetBag)) {
                        // Additional bag protections
                        let fullContents = bet.getObjects()
                        let guids: { [key: string]: number } = {}
                        for (let object of fullContents) {
                            guids[object.guid] = (guids[object.guid] ?? 0) + 1
                        }
                        bet.setTable('blackjack_betBagContents', guids)
                    }
                }
            }
            if (foundBets) {
                newDealOrder.push(player)
            }
        }
    }
    State.dealOrder = newDealOrder

    for (let i = 0; i < 2; i++) {
        for (let set of Object.values(Zones.zones).reverse()) {
            if (set.color === 'Dealer') {
                deal(set, [i])
                while (State.lastCard?.getName() === 'Jokeer') {
                    State.lastCard.destruct()
                    deal(set, [i])
                    Timers.resetBonusTimer(3)
                }
                waitTime(0.1)
            } else {
                for (let player of State.dealOrder) {
                    if (set.color === player.color) {
                        if (firstToGo === undefined) {
                            firstToGo = set
                            deal(set, [i])
                            waitTime(0.1)
                            break
                        }
                    }
                }
            }
        }
    }
    if (firstToGo === undefined) {
        Wait.time(() => {
            if (firstToGo !== undefined) {
                whoGoesFirst(firstToGo)
            }
        }, 1)
    } else {
        State.concludeLockout()
        waitTime(0.6)
        State.dealersTurn = true
        revealHandZone(Zones.getObjectSetFromColor('Dealer'))
    }
}