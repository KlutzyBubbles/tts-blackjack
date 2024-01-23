import { HandType, RewardName, RoundState, SpecialHands, TableSelection } from "./types"

export enum Tag {
    Chip = 'Chip',
    Deck = 'Deck',
    Card = 'Card',
    Powerup = 'Powerup',
    BetBag = 'BetBag',
    SaveBag = 'SaveBag',
    Infinite = 'Infinite',
    Permissionable = 'Permable'
}

export const RoundStateGuids: { [key in RoundState]?: string } = {
    '1': '1fe5da', // Bets
    '2': 'bf6cbd', // Play
    '3': 'fd2298', // Powerups
    '4': 'aefae6' // Paused
}

export const PowerupGuids: string[] = [
    "2c564b",
    "432519",
    "cd6cd1",
    "a4883c",
    "7b7031",
    "4a8de2",
    "fcaebe",
    "48ae1d",
    "3bf915",
    "b5851f",
    "81121a",
    "60a985",
    "c663e1",
    "f0150d",
    "84928d"
]

export const TimerGuids: { [key: string]: string } = {
    bonus: '3cce5b',
    round: '8f93ac'
}

export const BagGuids: { [key: string]: string } = {
    bet: '697122',
    deck: 'eaa77b',
    minigame: '5b38f8',
    bonus: '91fe78'
}

export const DisplayColors: { [key in HandType]: Color } = {
    safe: Color(1, 1, 0.75),
    win: Color(0.75, 1, 0.75),
    lose: Color(1, 0.75, 0.75),
    bust: Color(0.75, 0.5, 0.5),
    clear: Color(1, 1, 1)
}

// The names (in quotes) should all match the names on your cards.
// The values should match the value of those cards.
// If you have powerup modifies (ex: +1 to score), it could be added here (again, figurine required)
// 0 is reserved for Aces.
export const CardNames: { [key: string]: number | string } = {
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9,
    Ten: 10,
    Jack: 10,
    Queen: 10,
    King: 10,
    Ace: 'Ace',
    Joker: 'Joker',
    "+1 to anyone's hand": 1,
    "+1 to any player's hand": 1,
    "-1 from anyone's hand": -1,
    "+3 to anyone's hand": 3,
    "+3 to any player's hand": 3,
    "-3 from anyone's hand": -3,
    "+10 to your own hand": 10,
    "Discard your hand and stand on 19": 19,
    "Force the dealer to bust": -69
}

export const SoftHandDisplay: { [key: number]: string } = {
    1: "①",
    2: "②",
    3: "③",
    4: "④",
    5: "⑤",
    6: "⑥",
    7: "⑦",
    8: "⑧",
    9: "⑨",
    10: "⑩",
	11: "⑪",
    12: "⑫",
    13: "⑬",
    14: "⑭",
    15: "⑮",
    16: "⑯",
    17: "⑰",
    18: "⑱",
    19: "⑲",
    20: "⑳",
	21: "㉑",
}

export const SpecialHandDisplay: { [key in SpecialHands]?: string } = {
	[SpecialHands.DealerBust]: "\u{2620}",
    [SpecialHands.Bust]: "\u{2620}",
	[SpecialHands.SingleJoker]: "\u{2661}",
	[SpecialHands.Blackjack]: "\u{2664}",
	[SpecialHands.Triple7]: "\u{277C}",
	[SpecialHands.DoubleJoker]: "\u{2665}",
}

export const OtherZones: { [key: string]: string } = {
    deck: '885bf4',
    bonus: '3c31e1'
}

export const ObjectLockdown = [
    '16f87e', '8e0429', // Dealer Area
    '9871fe', '8eafbb', // Pink
    'd5d7c5', '32da09', // Purple
    'b92ec5', '51086b', '981767', // Blue
    '51aacb', '60b260', '5a0955', // Teal
    'b01343', '704082', '653add', // Green
    '2cc362', '51690f', '63c8aa', // Yellow
    'fddcfc', '8ea777', '54895c', // Orange
    'f12fe3', '9f466e', 'a3c6db', // Red
    'ac9b82', 'b2883b', // Brown
    'a82b72', '4211a7', // White
    '9ac0b7', // unknown
    
    // Rupee tophies
    '1feed0', // Green
    '533f81', // Blue
    'b8bf89', // Yellow
    '038e19', // Red
    '02eb77', // Purple
    '5e2f09', // Orange
    'df5ce7', // Silver
    'dc1fe2', // Rupoor
    '0b6e51', // Gold
]

export const SelfDestructScript = `
    function onLoad()
        expireTime = os.time() + %i
    end
    function onUpdate()
        if expireTime and os.time()>expireTime then destroyObject(self) end
    end`

export const RewardGuids: { [key in RewardName]: string } = {
    Help: 'ef72b4',
    GiveJokers: '4dbf75',
    StealJokers: '395ece',
    CopyJokers: 'aad1be',
    FiveCardWin: '890842',
    FiveCardTwentyOne: '37085e',
    SixCardWin: '68a101',
    SixCardTwentyOne: 'fe17c6',
    Blackjack: '7c99c4',
    DoubleJoker: '887ef8',
    SingleJoker: '9b7f31',
    TripleSeven: 'fa1dc7',
    Unused: '9b7f31'
}

export const ColorZones: { [key in TableSelection]: {
    zone: string,
    container: string,
    prestige: string,
    actionButtons: string,
    table: string
} } = {
    White: {
        zone: 'a751f4',
        container: '8144bb',
        prestige: '88482c',
        actionButtons: '0a3126',
        table: '33b903',
    },
    Brown: {
        zone: '1c13af',
        container: 'cee112',
        prestige: '6c29ce',
        actionButtons: '5b2fc0',
        table: '688678',
    },
    Red: {
        zone: '8b37f7',
        container: '82aca4',
        prestige: 'd8cd49',
        actionButtons: '9fd676',
        table: 'b54e19',
    },
    Orange: {
        zone: '38b2d7',
        container: 'b179e0',
        prestige: '844d3d',
        actionButtons: 'ef0906',
        table: 'efae07',
    },
    Yellow: {
        zone: '5b82fd',
        container: '486212',
        prestige: '944b87',
        actionButtons: 'ab82ca',
        table: 'a7596f',
    },
    Green: {
        zone: '595fa9',
        container: '579f2e',
        prestige: 'a7bb1b',
        actionButtons: '031d13',
        table: '2612ed',
    },
    Teal: {
        zone: '5c2692',
        container: '54cc65',
        prestige: '3484cc',
        actionButtons: '925380',
        table: 'd21b66',
    },
    Blue: {
        zone: '423ae1',
        container: 'f2e64b',
        prestige: 'f87e7b',
        actionButtons: '5d5e85',
        table: '7a414f',
    },
    Purple: {
        zone: '63ef4e',
        container: '54d217',
        prestige: '17ddfd',
        actionButtons: '2a52f9',
        table: 'b2ab0b',
    },
    Pink: {
        zone: '44f05e',
        container: '7c4eb9',
        prestige: '0b4a58',
        actionButtons: '4503f9',
        table: 'bb54b1',
    },
    Dealer: {
        zone: '275a5d',
        container: 'df8d40',
        prestige: '885bf4',
        actionButtons: '355712',
        table: '758fe9',
    },
    Split1: {
        zone: 'f673d7',
        container: 'b2bf24',
        prestige: 'f673d7',
        actionButtons: '35ea56',
        table: 'f673d7',
    },
    Split2: {
        zone: 'e527cb',
        container: '3e331e',
        prestige: 'e527cb',
        actionButtons: 'c84a39',
        table: 'e527cb',
    },
    Split3: {
        zone: '391dea',
        container: '5f8f1e',
        prestige: '391dea',
        actionButtons: 'a356c5',
        table: '391dea',
    },
    Split4: {
        zone: 'df3fa1',
        container: '1c1194',
        prestige: 'df3fa1',
        actionButtons: '0f078a',
        table: 'df3fa1',
    },
    Split5: {
        zone: '39f2dd',
        container: '0232e3',
        prestige: '39f2dd',
        actionButtons: '9a5313',
        table: '39f2dd',
    },
    Split6: {
        zone: '43d808',
        container: 'b5effd',
        prestige: '43d808',
        actionButtons: '1f100d',
        table: '43d808',
    },
}