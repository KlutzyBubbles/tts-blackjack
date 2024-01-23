import { BagGuids } from "../constants";

export default class BagHolders {

    public static betBags: GObject | undefined;
    public static minigameBag: GObject | undefined;
    public static deckBag: GObject | undefined;

    public static initBags(): void {
        BagHolders.betBags = getObjectFromGUID(BagGuids.bet) as GObject
        BagHolders.minigameBag = getObjectFromGUID(BagGuids.minigame) as GObject
        BagHolders.deckBag = getObjectFromGUID(BagGuids.deck) as GObject
    }

    public static getBetBags(): GObject {
        return BagHolders.betBags ?? getObjectFromGUID(BagGuids.bet) as GObject
    }

    public static getDeckBag(): GObject {
        return BagHolders.deckBag ?? getObjectFromGUID(BagGuids.deck) as GObject
    }

}