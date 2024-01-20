import RoundBonus from "../bonus/round";
import State from "../state";
import ZoneHelpers from "../zones/helpers";
import ObjectSet from "../zones/objectSet";
import Zones from "../zones/zones";

export default class CardHelpers {

    public static btnFlipCard(card: GObject, color: ColorLiteral): void {
        let canFlip = RoundBonus.runBonusFunc('onCardFlip'. {
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
            set.updateHandCounter()
        }
    }

    public static cardPlacedCallback(object?: GObject, data: any): void {
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
        if (data.isStarter && RoundBonus.canFlip()) {
            object.setTable('blackjack_playerSet', data.set)
            if (data.set.color !== 'Dealer') {
                object.createButton({
                    label: "Flip",
                    click_function: CardHelpers.btnFlipCard,
                    function_owner: undefined,
                    position: Vector(-0.4, 1.1, -0.95),
                    rotation: Vector(0, 0, 0),
                    width: 300,
                    height: 350,
                    font_size: 130
                })
                object.createButton({
                    label: "Flip",
                    click_function: CardHelpers.btnFlipCard,
                    function_owner: undefined,
                    position: Vector(0.4, -1.1, -0.95),
                    rotation: Vector(0, 0, 180),
                    width: 300,
                    height: 350,
                    font_size: 130
                })
            }
        } else {
            object.setTable('blackjack_playerSet', undefined)
        }
        if (data.set !== undefined) {
            let set = data.set as ObjectSet
            set.updateCardPositions()
            set.updateHandCounter()
        } else {
            Zones.findCardsToCount()
        }
        if (object.held_by_color !== undefined) {
            let newObject = object.reload()
            newObject.interactable = false
        }
    }

}