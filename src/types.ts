const OnlyPlayable: ColorLiteral[] = ['White', 'Brown', 'Red', 'Orange', 'Green', 'Teal', 'Blue', 'Purple', 'Pink']
export const ColorList: ColorLiteral[] = OnlyPlayable.concat(['Grey', 'Black', 'Nobody']);
export const TableColorList: TableSelection[] = (OnlyPlayable as TableSelection[]).concat(['Dealer', 'Split1', 'Split2', 'Split3', 'Split4', 'Split5', 'Split6']);

export type PlayerSelection = ColorLiteral | 'Admin' | 'Host' | 'Promoted' | 'Everyone' | 'Colors' | 'Seated'
export type TableSelection = Exclude<ColorLiteral | 'Dealer' | 'Split1' | 'Split2' | 'Split3' | 'Split4' | 'Split5' | 'Split6', 'Nobody' | 'Black' | 'Grey'>

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