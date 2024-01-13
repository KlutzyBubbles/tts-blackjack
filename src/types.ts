export const ColorList: ColorLiteral[] = ['White', 'Brown', 'Black', 'Red', 'Orange', 'Green', 'Teal', 'Blue', 'Purple', 'Pink', 'Grey', 'Black', 'Nobody'] as const;

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