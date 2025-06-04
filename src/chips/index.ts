// --[[                   Universal Chip Converter                   ]]--
// 
// -- Fomat arguments:
// --   1: String  - Object type (Custom_Model_Stack or Custom_Model)
// --   2: String  - Chip Name
// --   3: Integer - Stack Size
// --   4: String  - Chip Image

import { ChipSeperatorGUID, chipList, chipNameList, imageMissing } from "../constants";
import { generatePermissionString } from "../items/functions";
import Logger from "../logger"
import Zones from "../zones/zones";

const LOG_LABEL = "chips.index"

function getChipJSON(name: string, nickname: string, amount: number, image: string): string {
    return `{
        "Name": "${name}",
        "Transform": {
            "posX": 0,
            "posY": 0,
            "posZ": 0,
            "rotX": 0,
            "rotY": 0,
            "rotZ": 0,
            "scaleX": 0.825,
            "scaleY": 0.825,
            "scaleZ": 0.825
        },
        "Nickname": "${nickname}",
        "Description": "",
        "ColorDiffuse": { "r": 1, "g": 1, "b": 1 },
        "Locked": false,
        "Grid": true,
        "Snap": true,
        "IgnoreFoW": false,
        "Autoraise": true,
        "Sticky": true,
        "Tooltip": true,
        "GridProjection": false,
        "HideWhenFaceDown": false,
        "Hands": false,
        "MaterialIndex": -1,
        "MeshIndex": -1,
        "Number": ${amount},
        "CustomMesh": {
            "MeshURL": "https://raw.githubusercontent.com/KlutzyBubbles/tts-blackjack/main/assets/editedNames/chips/chip.obj",
            "DiffuseURL": "${image}",
            "NormalURL": "",
            "ColliderURL": "",
            "Convex": true,
            "MaterialIndex": 0,
            "TypeIndex": 5,
            "CustomShader": {
                "SpecularColor": { "r": 1.0, "g": 1.0, "b": 1.0 },
                "SpecularIntensity": 0.0,
                "SpecularSharpness": 7.0,
                "FresnelStrength": 0.4
            },
            "CastShadows": true
        },
        "XmlUI": "",
        "LuaScript": "",
        "LuaScriptState": "",
        "GUID": "5dbe11"
    }`;
}

// nameToIndex = {}
// for i = 1,#chipList do
// 	nameToIndex[chipList[i].name] = i
// end

// function onLoad()
// 	self.setLock(true)
// 	self.interactable = false
// end

function doChipSpawn(name?: string, pos?: Vector, image?: string, stack?: number) {
    Logger.trace(LOG_LABEL, `doChipSpawn(${name || 'UNDEFINED'}, ${pos || 'UNDEFINED'}, ${image || 'UNDEFINED'}, ${stack || 'UNDEFINED'})`)
	stack = math.max(math.floor(stack || 1), 1)
	
	let params = {
        json: getChipJSON(stack > 1 ? 'Custom_Model_Stack' : 'Custom_Model', name || '[CHIP NAME]', stack, image || imageMissing),
		// json: chipJSON:format( stack>1 and "Custom_Model_Stack" or "Custom_Model", name or "[CHIP NAME]", stack, img or imgMissing ),
		position: pos,
		sound: false,
	}
	
	return spawnObjectJSON(params)
}

function spawnChipID(id: number, pos: Vector, stack: number) {
	Logger.trace(LOG_LABEL, `spawnChipID(${id}, ${pos}, ${stack})`)
	let entry = chipList[id || -1]
	if (entry !== undefined)
		return doChipSpawn(entry.name, pos, entry.image, stack)
	else
		return doChipSpawn(undefined, pos, undefined, stack)
}

function spawnChipName(name: string, pos: Vector, stack: number) {
	Logger.trace(LOG_LABEL, `spawnChipName(${name}, ${pos}, ${stack})`)
	let id = chipNameList[name]
	if (id !== undefined) {
		let entry = chipList[id]
		if (entry !== undefined)
			return doChipSpawn(entry.name, pos, entry.image, stack)
    }
	
	return doChipSpawn(name, pos, undefined, stack)
}

function spawnChip(data: Record<string, any>) {
	Logger.trace(LOG_LABEL, `spawnChip(${data})`)
	if (data.id !== undefined) // Spawn by ID
		return spawnChipID(data.id, data.pos, data.num)
	else if (data.image !== undefined) // Spawn custom chip
		return doChipSpawn(data.name, data.pos, data.image, data.num)
	else if (data.name !== undefined) // Spawn by name
		return spawnChipName(data.name, data.pos, data.num)
	else // Spawn generic
		return doChipSpawn(undefined, data.pos, undefined, data.num)
}

export default class ChipConverter {

    public static chipSeparator: GObject | undefined = undefined;
    public static chipSeperators: GObject[] = [];

    public static initChipConverters() {
        Logger.trace(LOG_LABEL, `initChipConverters()`)
        let chipConverters = Zones.getChipContainers(true);
        for (let chipConverter of chipConverters) {
            ChipConverter.makeChipConverterButtons(chipConverter);
        }
        ChipConverter.chipSeparator = getObjectFromGUID(ChipSeperatorGUID);
    }

    public static makeChipConverterButtons(object: GObject) {
        Logger.trace(LOG_LABEL, `makeChipConverterButtons(${object.guid})`)
        object.createButton({
            click_function: 'doTradeUp',
            label: '\u{2191}',
            function_owner: Global,
            position: Vector(-0.27, 0, 1.23),
            rotation: Vector(0, 0, 0),
            width: 250,
            height: 200,
            font_size: 150,
            tooltip :  "Trade your chips up to the next tier.",
        })
        object.createButton({
            click_function: 'doTradeDown',
            label: '\u{2193}',
            function_owner: Global,
            position: Vector(0.27, 0, 1.23),
            rotation: Vector(0, 0, 0),
            width: 250,
            height: 200,
            font_size: 150,
            tooltip :  "Trade your chips down to the previous tier.",
        })
    }
}

function doTradeUp(object: GObject, color: ColorLiteral) {
	Logger.trace(LOG_LABEL, `doTradeUp(${object.guid}, ${color})`)
    doTrade(object, color, true);
}

function doTradeDown(object: GObject, color: ColorLiteral) {
	Logger.trace(LOG_LABEL, `doTradeDown(${object.guid}, ${color})`)
    doTrade(object, color, false);
}

function doTrade(object: GObject, color: ColorLiteral, isUp: boolean) {
    let ourColor = color === undefined ? false : object.getName().toLowerCase().indexOf(color.toLowerCase()) === -1 ? false : true;
    if (!ourColor && (color === undefined ? false : Player[color].admin)) {
        broadcastToColor('This does not belong to you!', color ?? 'Black', Color(1, 0.2, 0.2));
        return
    }

    let contents = object.getObjects();
    if (contents.length > 5 && !isUp) {
        broadcastToColor('Too many objects to trade down!', color, Color(1, 0.2, 0.2));
        return;
    }

    let chipConverter = Zones.getChipContainerByColor(color);
    if (chipConverter === undefined) {
        broadcastToColor('Chip converter is missing! Try again later.', color, Color(1, 0.2, 0.2));
        return;
    }

    let playerId = Player[color].steam_id
    let totalCount = 0;
    let params: CloneParameters = {};
    let chips: Record<number, number> = {};
    let foundObjects: GObject[] = [];
    for (let i = 0; i < contents.length; i++) {
        if (totalCount > 5 && !isUp)
            break;

        let item = contents[i] as ObjectData;
        if (chipNameList[item.name] !== undefined) {
            // params.index = item.index;

            let newObject = object.takeObject();
            if (newObject !== undefined) {
                Logger.trace(LOG_LABEL, `Starts with vlaues (${ourColor}, ${playerId}, ${item.description})`)
                if (ourColor && !item.description.startsWith(playerId || 'UNKNOWN_STEAM_ID') && item.description !== '') {
                    Logger.trace(LOG_LABEL, `Description starts with '${playerId}'`)
                    broadcastToColor(`Removed object \"${item.name}\" (Does not belong to you)`, color, Color(1, 0.2, 0.2));
                    newObject.destruct();
                } else {
                    if (item.description === '') {
                        newObject.setDescription(generatePermissionString(Player[color]))
                    }
                    let count = newObject.getQuantity()
                    if (count === -1) count = 1;

                    totalCount = totalCount + count;
                    chips[chipNameList[item.name]] = (chips[chipNameList[item.name]] || 0) + count;

                    foundObjects.push(newObject);
                }
            }
        }
    }

    if (totalCount > 5 && !isUp) {
        broadcastToColor('Too many chips to trade down!', color, Color(1, 0.2, 0.2));
        Wait.frames(() => {
            for (let foundObject of foundObjects) {
                object.putObject(foundObject);
                destroyObject(foundObject);
            }
        }, 1)
        return;
    }

    for (let foundObject of foundObjects) {
        destroyObject(foundObject);
    }

    if (isUp) {
        for (let i = 0; i < chipList.length; i++) {
            if (chips[i] !== undefined && chips[i] >= chipList[i].tierUp && chipList[i + 1] !== undefined) {
                chips[i + 1] = (chips[i + 1] || 0) + math.floor(chips[i] / chipList[i].tierUp);
                chips[i] = chips[i] % chipList[i].tierUp
            }
        }
    } else {
        for (let i = 0; i < chipList.length; i++) {
            if (chips[i] !== undefined && chipList[i - 1] !== undefined /* && !chipList[i].upOnly */) {
                chips[i - 1] = (chips[i - 1] || 0) + (chipList[i - 1].tierUp * (chips[i] || 0));
                //chips[i] = undefined;
                delete chips[i];
            }
        }
    }

    // Spawn chips

    // params.index = undefined;
    params.position = object.getPosition();
    params.position.y = params.position.y;
    params.callback_function = unlockObject;
    // params.smooth = false;

    for (let idString of Object.keys(chips)) {
        let id = parseInt(idString);
        let value = chips[id];
        if (params.position === undefined) {
            params.position = object.getPosition();
            params.position.y = params.position.y;
        }

        if (params.position.y === undefined) {
            params.position.y = 1;
        }

        if (params.position.y > 20) {
            params.position.y = (object.getPosition().y ?? 1) + 2
            params.position.x = params.position.z ?? 20
        }

        if (value !== undefined && value > 0) {
            params.position.y = params.position.y + 1;

            if (ChipConverter.chipSeparator !== undefined) {
                params.callback_function = undefined;

                let separator = ChipConverter.chipSeparator.clone(params);
                ChipConverter.chipSeperators.push(separator);

                separator.setLock(true);
                separator.interactable = false;

                params.position.y = params.position.y + 1;
                params.callback_function = unlockObject;
            }

            let newChip = spawnChip({
                id: id,
                num: value,
                pos: params.position
            });
            if (newChip !== undefined) {
                newChip.setDescription(generatePermissionString(Player[color]));
            }
        }
    }

    Wait.time(processTake, 1);
}

function processTake() {
    for (let i = 0; i < ChipConverter.chipSeperators.length; i++) {
        let separator = ChipConverter.chipSeperators.pop();
        if (separator !== undefined) {
            separator.destruct();
        }
    }
}

function unlockObject(object: GObject) {
    object.interactable = true
    object.setLock(false)
}

// _G.doChipSpawn = doChipSpawn;
// _G.spawnChipID = spawnChipID;
// _G.spawnChipName = spawnChipName;
// _G.spawnChip = spawnChip;