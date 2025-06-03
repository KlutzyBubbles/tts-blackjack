import * as fs from 'fs';
// import * as jsonFile from './TS_Save_72.json';

let jsonFile = JSON.parse(fs.readFileSync('./TS_Save_72.json'));

let existingObjectStates = jsonFile.ObjectStates;
let newObjectStates = [];

for (const state of existingObjectStates) {
    if (state.GUID !== 'c29ea1') {
        newObjectStates.push(state);
    }
}

jsonFile.ObjectStates = newObjectStates;

fs.writeFileSync('./newSave.json', JSON.stringify(jsonFile, null, 4));
