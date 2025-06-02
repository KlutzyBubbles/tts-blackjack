import RoundBonus from "../bonus/round";
import { CardNames } from "../constants";
import State from "../state";
import { updateHandCounter, updateCardPositions, findCardsToCount, updateAllDisplays, canFlip, runBonusFunc } from "../zones/functions";
import ZoneHelpers from "../zones/helpers";
import ObjectSet from "../zones/objectSet";
import Zones from "../zones/zones";
import DeckManager from "./decks";

export default class CardHelpers {

    public static btnFlipCard(card: GObject, color: ColorLiteral): void {
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

    public static cardPlacedCallback(object: GObject, data: any): void {
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

    public static placeCard(position: Vector, flip: boolean, set: ObjectSet, isStarter: boolean, fastDraw: boolean): void {
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
                CardHelpers.cardPlacedCallback(object, {
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

    public static checkForBlackjack(value: number, facedownCard: GObject | undefined): void {
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

}