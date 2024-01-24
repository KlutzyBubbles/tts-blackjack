import { Tag } from "../constants";
import { EventManager } from "../events/manager";
import DeckManager from "../objects/decks";
import Rewards from "../objects/rewards";
import Zones from "../zones/zones";

export function onObjectEnterScriptingZone(zone: Zone, object: GObject): void {
    if (zone === Zones.deckZone && object.hasTag(Tag.Deck)) {
        if (DeckManager.mainDeck !== undefined && DeckManager.mainDeck !== object) {
            destroyObject(DeckManager.mainDeck)
        }
        DeckManager.mainDeck = object
    }

    for (let rewardZone of Object.values(Rewards.rewards)) {
        if (zone === rewardZone) {
            let color: ColorLiteral = object.held_by_color
            if (color === undefined) {
                object.setPosition(Vector(0, 10, 0))
            } else if (color !== 'Black' && !Player[color].admin) {
                object.destruct()
            }
            return
        }
    }
}

EventManager.onObjectEnterScriptingZone((zone, object) => onObjectEnterScriptingZone(zone, object))
