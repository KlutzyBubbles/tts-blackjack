import { TableSelection } from "./types"

export enum Tag {
    Chip = 'Chip',
    Deck = 'Deck',
    Card = 'Card',
    Powerup = 'Powerup',
    BetBag = 'BetBag',
    Permissionable = 'Permable'
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