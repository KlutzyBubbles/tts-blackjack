import { PlayerSelection } from "./types"

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