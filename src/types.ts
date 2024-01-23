const OnlyPlayable: ColorLiteral[] = ['White', 'Brown', 'Red', 'Orange', 'Green', 'Teal', 'Blue', 'Purple', 'Pink']
export const ColorList: ColorLiteral[] = OnlyPlayable.concat(['Grey', 'Black', 'Nobody']);
export const TableColorList: TableSelection[] = (OnlyPlayable as TableSelection[]).concat(['Dealer', 'Split1', 'Split2', 'Split3', 'Split4', 'Split5', 'Split6']);

export type PlayerSelection = ColorLiteral | 'Admin' | 'Host' | 'Promoted' | 'Everyone' | 'Colors' | 'Seated'
export type ColorTableSelection = Exclude<ColorLiteral | 'Dealer', 'Nobody' | 'Black' | 'Grey'>
export type SplitTableSelection = 'Split1' | 'Split2' | 'Split3' | 'Split4' | 'Split5' | 'Split6'
export type TableSelection = ColorTableSelection | SplitTableSelection

export type VisibilityColors = {
    [key in ColorLiteral]?: boolean
}

// Taken from https://api.tabletopsimulator.com/ui/attributes/
export enum ButtonInputs {
    LeftMouse = '-1',
    RightMouse = '-2',
    MiddleMouse = '-3',
    SingleTouch = '1',
    DoubleTouch = '2',
    TripleTouch = '3'
}

export type PowerupTarget = ColorTableSelection | 'Anyone' | 'Any Player' | 'Other Player' | 'Self' | 'Nobody'
export type PowerupEffect = 'Clear'
| 'AltClear'
| 'Redraw'
| 'RedrawAll'
| 'Swap'
| 'Clone'
| 'Destroy'
| 'Reveal'
| 'Stand'
| 'Draw1'
| 'PowerupDraw'
| 'RupeePull'
| 'RewardToken'
| 'RoyalToken'
| 'PrestigeToken'
| 'ResetTimer'
| 'CardMod'
| 'FifthCard'

/*
export const PowerupEffectsList: PowerupEffect[] = [
    'Clear',
    'AltClear',
    'Redraw',
    'RedrawAll',
    'Swap',
    'Clone',
    'Destroy',
    'Reveal',
    'Stand',
    'Draw1',
    'PowerupDraw',
    'RupeePull',
    'RewardToken',
    'RoyalToken',
    'PrestigeToken',
    'ResetTimer',
    'CardMod'
]
*/

export type RewardName = 'Help'
| 'GiveJokers'
| 'StealJokers'
| 'CopyJokers'
| 'FiveCardWin'
| 'FiveCardTwentyOne'
| 'SixCardWin'
| 'SixCardTwentyOne'
| 'Blackjack'
| 'DoubleJoker'
| 'SingleJoker'
| 'TripleSeven'
| 'Unused'

export type RewardMultipliers = 'FiveCardWin'
| 'FiveCardTwentyOne'
| 'SixCardWin'
| 'SixCardTwentyOne'
| 'Blackjack'
| 'DoubleJoker'
| 'SingleJoker'
| 'TripleSeven'
| 'TwentyOne'

export type ScriptCallableColor = ColorLiteral | 'Lua'

export type HandType = 'safe' | 'win' | 'lose' | 'bust' | 'clear'

export enum SpecialHands {
    LowEnd = 65,
    SingleJoker = 68,
    DoubleJoker = 71,
    Triple7 = 70,
    DealerBust = -69,
    Bust = 100,
    Blackjack = 69,
    HighEnd = 72
}

// Needs to be numbes to set the state of the in game object
export enum RoundState {
    Unknown = -1,
    Betting = 1,
    Playing = 2,
    Powerups = 3,
    Paused = 4
}
