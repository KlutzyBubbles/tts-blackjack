import { Chip, HandType, RewardName, RoundState, SpecialHands, TableSelection } from "./types"

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

export const OtherObjectGuids: { [key: string]: string } = {
    trash: 'df8d40',
    cardHandler: '77a0c3'
}

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

export const ChipSeperatorGUID = '9ac0b7'

export const ObjectLockdown = [
    'ad770c', // Tabletop board

    '16f87e', '8e0429', // Dealer Area
    '9871fe', '8eafbb', '8287c5', // Pink
    'd5d7c5', '32da09', 'bfc076', // Purple
    'b92ec5', '51086b', '981767', // Blue
    '51aacb', '60b260', '5a0955', // Teal
    'b01343', '704082', '653add', // Green
    '2cc362', '51690f', '63c8aa', // Yellow
    'fddcfc', '8ea777', '54895c', // Orange
    'f12fe3', '9f466e', 'a3c6db', // Red
    'ac9b82', 'b2883b', '5bc8e6', // Brown
    'a82b72', '4211a7', 'f2bd2b', // White
    ChipSeperatorGUID, // Stack seperator
    
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

export const imageMissing = 'https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/MISSING.jpg'
export const imageNoValue = 'https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/NO_VALUE.jpg'

export const chipList: Chip[] = [
    {
        name: "$1",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1.jpg"
    },
    {
        name: "$10",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10.jpg"
    },
    {
        name: "$100",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100.jpg"
    },
    {
        name: "$1,000",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1000.jpg"
    },
    {
        name: "$10,000",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10000.jpg"
    },
    {
        name: "$100,000",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100000.jpg"
    },
    {
        name: "$1 Million",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Million.jpg"
    },
    {
        name: "$10 Million",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Million.jpg"
    },
    {
        name: "$100 Million",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Million.jpg"
    },
    {
        name: "$1 Billion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Billion.jpg"
    },
    {
        name: "$10 Billion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Billion.jpg"
    },
    {
        name: "$100 Billion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Billion.jpg"
    },
    {
        name: "$1 Trillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Trillion.jpg"
    },
    {
        name: "$10 Trillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Trillion.jpg"
    },
    {
        name: "$100 Trillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Trillion.jpg"
    },
    {
        name: "$1 Quadrillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Quadrillion.jpg"
    },
    {
        name: "$10 Quadrillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Quadrillion.jpg"
    },
    {
        name: "$100 Quadrillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Quadrillion.jpg"
    },
    {
        name: "$1 Quintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Quintillion.jpg"
    },
    {
        name: "$10 Quintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Quintillion.jpg"
    },
    {
        name: "$100 Quintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Quintillion.jpg"
    },
    {
        name: "$1 Sextillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Sextillion.jpg"
    },
    {
        name: "$10 Sextillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Sextillion.jpg"
    },
    {
        name: "$100 Sextillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Sextillion.jpg"
    },
    {
        name: "$1 Septillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Septillion.jpg"
    },
    {
        name: "$10 Septillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Septillion.jpg"
    },
    {
        name: "$100 Septillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Septillion.jpg"
    },
    {
        name: "$1 Octillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Octillion.jpg"
    },
    {
        name: "$10 Octillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Octillion.jpg"
    },
    {
        name: "$100 Octillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Octillion.jpg"
    },
    {
        name: "$1 Nonillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Nonillion.jpg"
    },
    {
        name: "$10 Nonillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Nonillion.jpg"
    },
    {
        name: "$100 Nonillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Nonillion.jpg"
    },
    {
        name: "$1 Decillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Decillion.jpg"
    },
    {
        name: "$10 Decillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Decillion.jpg"
    },
    {
        name: "$100 Decillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Decillion.jpg"
    },
    {
        name: "$1 Undecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Undecillion.jpg"
    },
    {
        name: "$10 Undecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Undecillion.jpg"
    },
    {
        name: "$100 Undecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Undecillion.jpg"
    },
    {
        name: "$1 Duodecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Duodecillion.jpg"
    },
    {
        name: "$10 Duodecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Duodecillion.jpg"
    },
    {
        name: "$100 Duodecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Duodecillion.jpg"
    },
    {
        name: "$1 Tredecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Tredecillion.jpg"
    },
    {
        name: "$10 Tredecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Tredecillion.jpg"
    },
    {
        name: "$100 Tredecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Tredecillion.jpg"
    },
    {
        name: "$1 Quattuordecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Quattuordecillion.jpg"
    },
    {
        name: "$10 Quattuordecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Quattuordecillion.jpg"
    },
    {
        name: "$100 Quattuordecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Quattuordecillion.jpg"
    },
    {
        name: "$1 Quindecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Quindecillion.jpg"
    },
    {
        name: "$10 Quindecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Quindecillion.jpg"
    },
    {
        name: "$100 Quindecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Quindecillion.jpg"
    },
    {
        name: "$1 Sexdecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Sexdecillion.jpg"
    },
    {
        name: "$10 Sexdecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Sexdecillion.jpg"
    },
    {
        name: "$100 Sexdecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Sexdecillion.jpg"
    },
    {
        name: "$1 Septendecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Septendecillion.jpg"
    },
    {
        name: "$10 Septendecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Septendecillion.jpg"
    },
    {
        name: "$100 Septendecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Septendecillion.jpg"
    },
    {
        name: "$1 Octodecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Octodecillion.jpg"
    },
    {
        name: "$10 Octodecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Octodecillion.jpg"
    },
    {
        name: "$100 Octodecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Octodecillion.jpg"
    },
    {
        name: "$1 Novemdecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Novemdecillion.jpg"
    },
    {
        name: "$10 Novemdecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Novemdecillion.jpg"
    },
    {
        name: "$100 Novemdecillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Novemdecillion.jpg"
    },
    {
        name: "$1 Vigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Vigintillion.jpg"
    },
    {
        name: "$10 Vigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Vigintillion.jpg"
    },
    {
        name: "$100 Vigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Vigintillion.jpg"
    },
    {
        name: "$1 Unvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Unvigintillion.jpg"
    },
    {
        name: "$10 Unvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Unvigintillion.jpg"
    },
    {
        name: "$100 Unvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Unvigintillion.jpg"
    },
    {
        name: "$1 Duovigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Duovigintillion.jpg"
    },
    {
        name: "$10 Duovigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Duovigintillion.jpg"
    },
    {
        name: "$100 Duovigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Duovigintillion.jpg"
    },
    {
        name: "$1 Trevigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Trevigintillion.jpg"
    },
    {
        name: "$10 Trevigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Trevigintillion.jpg"
    },
    {
        name: "$100 Trevigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Trevigintillion.jpg"
    },
    {
        name: "$1 Quattuorvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Quattuorvigintillion.jpg"
    },
    {
        name: "$10 Quattuorvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Quattuorvigintillion.jpg"
    },
    {
        name: "$100 Quattuorvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Quattuorvigintillion.jpg"
    },
    {
        name: "$1 Quinvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Quinvigintillion.jpg"
    },
    {
        name: "$10 Quinvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Quinvigintillion.jpg"
    },
    {
        name: "$100 Quinvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Quinvigintillion.jpg"
    },
    {
        name: "$1 Sexvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Sexvigintillion.jpg"
    },
    {
        name: "$10 Sexvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Sexvigintillion.jpg"
    },
    {
        name: "$100 Sexvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Sexvigintillion.jpg"
    },
    {
        name: "$1 Septenvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Septenvigintillion.jpg"
    },
    {
        name: "$10 Septenvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Septenvigintillion.jpg"
    },
    {
        name: "$100 Septenvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Septenvigintillion.jpg"
    },
    {
        name: "$1 Octovigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Octovigintillion.jpg"
    },
    {
        name: "$10 Octovigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Octovigintillion.jpg"
    },
    {
        name: "$100 Octovigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Octovigintillion.jpg"
    },
    {
        name: "$1 Novemvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Novemvigintillion.jpg"
    },
    {
        name: "$10 Novemvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Novemvigintillion.jpg"
    },
    {
        name: "$100 Novemvigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Novemvigintillion.jpg"
    },
    {
        name: "$1 Trigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Trigintillion.jpg"
    },
    {
        name: "$10 Trigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Trigintillion.jpg"
    },
    {
        name: "$100 Trigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Trigintillion.jpg"
    },
    {
        name: "$1 Untrigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Untrigintillion.jpg"
    },
    {
        name: "$10 Untrigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Untrigintillion.jpg"
    },
    {
        name: "$100 Untrigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Untrigintillion.jpg"
    },
    {
        name: "$1 Duotrigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Duotrigintillion.jpg"
    },
    {
        name: "$10 Duotrigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Duotrigintillion.jpg"
    },
    {
        name: "$100 Duotrigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Duotrigintillion.jpg"
    },
    {
        name: "$1 Tretrigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/1_Tretrigintillion.jpg"
    },
    {
        name: "$10 Tretrigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/10_Tretrigintillion.jpg"
    },
    {
        name: "$100 Tretrigintillion",
        tierUp: 10,
        image: "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/100_Tretrigintillion.jpg"
    }
];

export const chipNameList: Record<string, number> = {};

for (let i = 0; i < chipList.length; i++) {
    chipNameList[chipList[i].name] = i;
}
