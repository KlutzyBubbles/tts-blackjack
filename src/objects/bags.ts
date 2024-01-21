import { BagGuids } from "../constants";

export default class BagHolders {

    public static betBags: GObject | undefined;
    public static minigameBag: GObject | undefined;
    public static deckBag: GObject | undefined;

    public static initBags(): void {
        BagHolders.betBags = getObjectFromGUID(BagGuids.bet)
        BagHolders.minigameBag = getObjectFromGUID(BagGuids.minigame)
        BagHolders.deckBag = getObjectFromGUID(BagGuids.deck)
    }

    public static getBetBags(): GObject {
        return BagHolders.betBags ?? getObjectFromGUID(BagGuids.bet)
    }

    public static getDeckBags(): GObject {
        return BagHolders.deckBag ?? getObjectFromGUID(BagGuids.deck)
    }

}