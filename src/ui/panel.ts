import { ColorList, VisibilityColors } from "../types"

export class UIPanel {

    public name: string;
    private visibility: VisibilityColors;
    private disabled: VisibilityColors;
    private panelId: string;

    constructor(name: string, visibility: VisibilityColors, disabled: VisibilityColors, panelId: string) {
        this.name = name;
        this.visibility = visibility;
        this.disabled = disabled;
        this.panelId = panelId;
        this.updateVisibility()
    }

    public toggleVisibility(color: ColorLiteral): boolean {
        this.visibility[color] = this.disabled[color] === true ? false : !this.visibility[color]
        if (this.visibility[color] === undefined){
            this.visibility[color] = false
            return false
        }
        return true
    }

    public setVisibility(color: ColorLiteral, visibility: boolean): void {
        this.visibility[color] = visibility
    }

    public defaultVisibility(color: ColorLiteral): void {
        this.visibility[color] = !this.disabled.hasOwnProperty(color) || !this.disabled[color]
        this.updateVisibility()
    }

    public updateVisibility(): void {
        let visible: ColorLiteral[] = []
        for (let color of Object.keys(this.visibility)) {
            if (this.visibility[color as ColorLiteral])
                visible.push(color as ColorLiteral)
        }
        UI.setAttribute(this.panelId, "visibility", visible.join('|'))
    }

    public clickUIButton(color: ColorLiteral) {
        this.toggleVisibility(color)
        this.updateVisibility()
    }

    public static getVisibilityFromDisabled(disabled: VisibilityColors): VisibilityColors {
        let output: VisibilityColors = {}
        for (let color of ColorList) {
            if (!disabled.hasOwnProperty(color) || !disabled[color]) {
                output[color] = true
            }
        }
        return output
    }
}
