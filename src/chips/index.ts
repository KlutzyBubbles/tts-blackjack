// --[[                   Universal Chip Converter                   ]]--
// 
// -- Fomat arguments:
// --   1: String  - Object type (Custom_Model_Stack or Custom_Model)
// --   2: String  - Chip Name
// --   3: Integer - Stack Size
// --   4: String  - Chip Image

import { chipList, chipNameList, imageMissing } from "../constants";

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
	let entry = chipList[id || -1]
	if (entry !== undefined)
		return doChipSpawn(entry.name, pos, entry.image, stack)
	else
		return doChipSpawn(undefined, pos, undefined, stack)
}

function spawnChipName(name: string, pos: Vector, stack: number) {
	let id = chipNameList[name]
	if (id !== undefined) {
		let entry = chipList[id]
		if (entry !== undefined)
			return doChipSpawn(entry.name, pos, entry.image, stack)
    }
	
	return doChipSpawn(name, pos, undefined, stack)
}

function spawnChip(data: Record<string, any>) {
	if (data.id !== undefined) // Spawn by ID
		return spawnChipID(data.id, data.pos, data.num)
	else if (data.image !== undefined) // Spawn custom chip
		return doChipSpawn(data.name, data.pos, data.image, data.num)
	else if (data.name !== undefined) // Spawn by name
		return spawnChipName(data.name, data.pos, data.num)
	else // Spawn generic
		return doChipSpawn(undefined, data.pos, undefined, data.num)
}

// _G.doChipSpawn = doChipSpawn;
// _G.spawnChipID = spawnChipID;
// _G.spawnChipName = spawnChipName;
// _G.spawnChip = spawnChip;