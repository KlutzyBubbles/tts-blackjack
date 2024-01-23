import { PlayerSelection, ScriptCallableColor, SpecialHands } from "./types"

export function colorToHex(color: Color, includeHash = false): string {
    return `${includeHash ? '#' : ''}${componentToHex(convertTo255(color.r))}${componentToHex(convertTo255(color.g))}${componentToHex(convertTo255(color.b))}`
}

export function convertTo255(value?: number) {
    return Math.floor((value ?? 0) * 255)
}

export function componentToHex(component: number) {
    let hex = component.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

export function checkPermissions(permissions: PlayerSelection[], player: Player): boolean {
    if (permissions.includes('Everyone')) {
        return true
    }
    if (permissions.includes('Nobody')) {
        return false
    }
    let hasPermission = false
    if (permissions.includes('Admin') && player.admin) {
        hasPermission = true
    }
    if (permissions.includes('Host') && player.host) {
        hasPermission = true
    }
    if (permissions.includes('Promoted') && player.promoted) {
        hasPermission = true
    }
    if (permissions.includes('Colors') && player.color !== 'Nobody') {
        hasPermission = true
    }
    if (permissions.includes('Seated') && player.seated) {
        hasPermission = true
    }
    if (permissions.includes(player.color)) {
        hasPermission = true
    }
    return hasPermission
}

export function isSpecialValue(value: number) {
    return value === SpecialHands.Blackjack
        || value === SpecialHands.Bust
        || value === SpecialHands.DealerBust
        || value === SpecialHands.DoubleJoker
        || value === SpecialHands.SingleJoker
        || value === SpecialHands.Triple7
}

export function getObjects(objectsGuids: string[]) {
    let objects: GObject[] = []
    for (let guid of objectsGuids) {
        objects.push(getObjectFromGUID(guid) as GObject)
    }
    return objects
}

export function hasPermission(color: ScriptCallableColor | ColorLiteral): boolean {
    return color === 'Lua' || color === 'Black' || Player[color].promoted || Player[color].host || Player[color].admin
}

export function bulkSetInteractable(objects: GObject[], interactable: boolean): void {
    for (let object of objects) {
        object.interactable = interactable
    }
}