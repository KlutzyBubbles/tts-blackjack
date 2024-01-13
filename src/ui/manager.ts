import { EventManager } from "../events/manager";
import { ButtonInputs, VisibilityColors } from "../types"
import { UIPanel } from "./panel";

const defaultDisabled: VisibilityColors = {
    Black: true,
    Grey: true,
    Nobody: true
}

export class UIPanelManager {

    public static panels: UIPanel[] = [];

    public static addPanel(name: string, subMenuId: string) {
        UIPanelManager.panels.push(new UIPanel(name, UIPanel.getVisibilityFromDisabled(defaultDisabled), defaultDisabled, subMenuId))
    }

    public static getPanel(name: string): UIPanel | undefined {
        for (let panel of UIPanelManager.panels) {
            if (name === panel.name) {
                return panel
            }
        }
        return undefined
    }

    public static playerChangedColor(color: ColorLiteral | undefined) {
        if (color !== undefined) {
            for (let panel of UIPanelManager.panels) {
                panel.defaultVisibility(color)
            }
        }
    }

}

UIPanelManager.addPanel('buttonsLayout', 'buttonsGrid')

EventManager.onPlayerChangeColor((color) => UIPanelManager.playerChangedColor(color))

function clickUiButton(player: Player, mouseButton: ButtonInputs, id: string): void {
    if (mouseButton == ButtonInputs.LeftMouse || mouseButton == ButtonInputs.SingleTouch) {
        UIPanelManager.getPanel(id)?.clickUIButton(player.color)
    }
}