const DebugData = {
    scope: {},
    selection: {
        actor: 0,
        point: -1,
        zone: -1
    },
    script: {
        life: {},
        move: {}
    },
    breakpoints: {
        life: {},
        move: {}
    },
    metadata: {
        game: {},
        scenes: {}
    },
    step: false
};

export default DebugData;

export function initSceneDebugData() {
    DebugData.selection = {
        actor: 0,
        point: -1,
        zone: -1
    };
    DebugData.script = {
        life: {},
        move: {}
    };
    DebugData.breakpoints = {
        life: {},
        move: {}
    };
}

export function renameVar(varDef, name) {
    if (varDef.type === 'vargame') {
        const game = DebugData.metadata.game;
        if (!game.vargames) {
            game.vargames = [];
        }
        game.vargames[varDef.idx] = name;
        saveGameMetaData();
    } else if (varDef.type === 'varcube') {
        const scenes = DebugData.metadata.scenes;
        const scene = DebugData.scope.scene;
        if (scene) {
            if (!(scene.index in scenes)) {
                scenes[scene.index] = {};
            }
            if (!('varcubes' in scenes[scene.index])) {
                scenes[scene.index].varcubes = [];
            }
            scenes[scene.index].varcubes[varDef.idx] = name;
            saveSceneMetaData(scene.index);
        }
    }
}

export function getVarName(varDef) {
    if (varDef.type === 'vargame') {
        const game = DebugData.metadata.game;
        if (game.vargames && game.vargames[varDef.idx]) {
            return game.vargames[varDef.idx];
        }
    } else if (varDef.type === 'varcube') {
        const scene = DebugData.scope.scene;
        if (scene) {
            const sceneMD = DebugData.metadata.scenes[scene.index];
            if (sceneMD && sceneMD.varcubes && sceneMD.varcubes[varDef.idx]) {
                return sceneMD.varcubes[varDef.idx];
            }
        }
    }
    return `${varDef.type}${varDef.idx}`;
}

export function renameObject(type, sceneIndex, objIndex, name) {
    const scenes = DebugData.metadata.scenes;
    if (!(sceneIndex in scenes)) {
        scenes[sceneIndex] = {};
    }
    const key = `${type}Names`;
    if (!(key in scenes[sceneIndex])) {
        scenes[sceneIndex][key] = [];
    }
    scenes[sceneIndex][key][objIndex] = name;
    saveSceneMetaData(sceneIndex);
}

export function getObjectName(type, sceneIndex, objIndex) {
    if (type === 'actor') {
        if (objIndex === 0) {
            return 'Twinsen';
        } else if (objIndex === 1) {
            return 'MecaPinguin';
        }
    }
    const key = `${type}Names`;
    if (sceneIndex in DebugData.metadata.scenes) {
        const sceneMetaData = DebugData.metadata.scenes[sceneIndex];
        if (sceneMetaData[key] && sceneMetaData[key][objIndex]) {
            return sceneMetaData[key][objIndex];
        }
    }
    return `${type}${objIndex}`;
}

export function loadSceneMetaData(sceneIndex, callback) {
    const request = new XMLHttpRequest();
    request.open('GET', `metadata/scene_${sceneIndex}.json`, true);

    request.onload = function() {
        if (this.status === 200) {
            try {
                DebugData.metadata.scenes[sceneIndex] = JSON.parse(request.response);
            } catch(e) {}
        }
        callback();
    };

    request.send(null);
}

function saveSceneMetaData(sceneIndex) {
    const request = new XMLHttpRequest();
    request.open('POST', `metadata/scene/${sceneIndex}`, true);
    request.onload = function() {
        console.log(`Saved scene ${sceneIndex} metadata`);
    };
    request.send(JSON.stringify(DebugData.metadata.scenes[sceneIndex]));
}

export function loadGameMetaData() {
    const request = new XMLHttpRequest();
    request.open('GET', 'metadata/game.json', true);

    request.onload = function() {
        if (this.status === 200) {
            try {
                DebugData.metadata.game = JSON.parse(request.response);
            } catch(e) {}
        }
    };

    request.send(null);
}

function saveGameMetaData() {
    const request = new XMLHttpRequest();
    request.open('POST', `metadata/game`, true);
    request.onload = function() {
        console.log(`Saved game metadata`);
    };
    request.send(JSON.stringify(DebugData.metadata.game));
}
