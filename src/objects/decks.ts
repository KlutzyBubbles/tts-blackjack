import { Tag } from "../constants";
import Zones from "../zones/zones";
import BagHolders from "./bags";

export default class DeckManager {

    public static mainDeck: GObject | undefined;
    public static deckBool: boolean = false;

    public static newDeck(): void {
        if (DeckManager.mainDeck !== undefined) {
            destroyObject(DeckManager.mainDeck)
        }
        DeckManager.obtainDeck()
    }

    public static obtainDeck(): void {
        let deckPos = Zones.deckZone?.getPosition() ?? Vector(0, 0, 0)
        let params: TakeObjectParameters = {}
        params.position = Vector(deckPos.x ?? 0, deckPos.y ?? 0, deckPos.z ?? 0)
        let decks = BagHolders.getDeckBag().takeObject(params)
        decks.shuffle()

        params.rotation = Vector(0, 0, 180)
        params.callback_function = DeckManager.shuffleNewDeck
        
        let taken = decks.takeObject(params)
        taken.shuffle()
        taken.setPosition(params.position)
        taken.setRotation(params.rotation)
        DeckManager.mainDeck = taken

        decks.destruct()
    }

    public static checkForDeck(): void {
        let objectsInZone = Zones.deckZone?.getObjects() ?? []
        for (let deck of objectsInZone) {
            if (deck.hasTag(Tag.Deck)) {
                if (DeckManager.mainDeck !== undefined && DeckManager.mainDeck !== deck) {
                    destroyObject(DeckManager.mainDeck)
                }
                DeckManager.mainDeck = deck
                break
            }
        }
    }

    public static shuffleNewDeck(): void {
        DeckManager.mainDeck?.shuffle()
        DeckManager.mainDeck?.setLock(true);
        (DeckManager.mainDeck ?? { interactable: true }).interactable = false
    }

}