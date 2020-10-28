import * as THREE from 'three';
import Scene from '../../game/Scene';
import Actor from '../../game/Actor';
import Zone from '../../game/Zone';
import Point from '../../game/Point';
import { getParams } from '../../params';

const DebugData = {
    scope: <any> {},
    selection: null,
    script: {
        life: {},
        move: {}
    },
    breakpoints: {
        life: {},
        move: {}
    },
    metadata: {
        game: <any> {},
        scenes: <any> {},
        entities: [],
        bodies: [],
        anims: [],
        islands: [],
        libraries: <any> {}
    },
    step: false,
    firstFrame: false,
    sceneManager: null
};

export default DebugData;

export function initSceneDebugData() {
    DebugData.selection = null;
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
        if (!game.vargames[varDef.idx]) {
            game.vargames[varDef.idx] = {};
        }
        if (game.vargames[varDef.idx].name !== name) {
            game.vargames[varDef.idx].name = name;
            saveMetaData({
                type: 'game',
                subType: 'vargames',
                subIndex: varDef.idx,
                value: game.vargames[varDef.idx]
            });
        }
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
            if (!scenes[scene.index].varcubes[varDef.idx]) {
                scenes[scene.index].varcubes[varDef.idx] = {};
            }
            if (scenes[scene.index].varcubes[varDef.idx].name !== name) {
                scenes[scene.index].varcubes[varDef.idx].name = name;
                saveMetaData({
                    type: 'scene',
                    index: scene.index,
                    subType: 'varcubes',
                    subIndex: varDef.idx,
                    value: scenes[scene.index].varcubes[varDef.idx]
                });
            }
        }
    }
}

export function getVarInfo(varDef) {
    if (!varDef)
        return null;

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
    return null;
}

export function getVarName(varDef) {
    const info = getVarInfo(varDef);
    if (info) {
        return info.name;
    }
    return `var_${varDef.idx}`;
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
    if (scenes[sceneIndex][key][objIndex] !== name) {
        scenes[sceneIndex][key][objIndex] = name;
        saveMetaData({
            type: 'scene',
            index: sceneIndex,
            subType: key,
            subIndex: objIndex,
            value: name
        });
    }
}

export function getObjectName(type, sceneIndex, objIndex) {
    if (type === 'actor') {
        if (objIndex === 0) {
            return 'Twinsen';
        }
        if (objIndex === 1) {
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
    return `${type}_${objIndex}`;
}

export function locateObject(object: Actor | Zone | Point) {
    const scene = DebugData.scope.scene;
    if (!object.threeObject || !scene)
        return;

    DebugData.selection = {type: object.type, index: object.props.index};

    const isHero = object.type === 'actor' && object.index === 0;
    const controlsState = DebugData.scope.game.controlsState;
    if (!controlsState.freeCamera) {
        controlsState.freeCamera = true;
    } else if (isHero && controlsState.freeCamera) {
        controlsState.freeCamera = false;
    }

    scene.camera.centerOn(object);
    resetCameraOrientation(controlsState, scene);
}

function resetCameraOrientation(controlsState, scene: Scene) {
    const controlNode = scene.camera.controlNode;
    if (!controlNode)
        return;

    const baseEuler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
    const headEuler = new THREE.Euler(0.0, 0.0, 0.0, 'YXZ');
    baseEuler.setFromQuaternion(controlNode.quaternion, 'YXZ');
    headEuler.copy(baseEuler);

    headEuler.y = 0;
    controlsState.cameraHeadOrientation.setFromEuler(headEuler);

    baseEuler.x = 0;
    controlsState.cameraOrientation.setFromEuler(baseEuler);
}

export async function loadModelsMetaData() {
    return new Promise((resolve) => {
        const { game } = getParams();
        const request = new XMLHttpRequest();
        request.open('GET', `metadata/${game}/models.json`, true);

        request.onload = function onload() {
            if (this.status === 200) {
                try {
                    const models = JSON.parse(request.response);
                    DebugData.metadata.entities = models.entities;
                    DebugData.metadata.bodies = models.bodies;
                    DebugData.metadata.anims = models.anims;
                } catch (e) {
                    // continue regardless of error
                }
            }
            resolve();
        };

        request.onerror = function onerror() {
            resolve();
        };

        request.send(null);
    });
}

export async function loadSceneMetaData(sceneIndex) {
    if (sceneIndex in DebugData.metadata.scenes) {
        return null;
    }

    return new Promise((resolve) => {
        const { game } = getParams();
        const request = new XMLHttpRequest();
        request.open('GET', `metadata/${game}/scene_${sceneIndex}.json`, true);

        request.onload = function onload() {
            if (this.status === 200) {
                try {
                    DebugData.metadata.scenes[sceneIndex] = JSON.parse(request.response);
                } catch (e) {
                    // continue regardless of error
                }
            }
            resolve();
        };

        request.onerror = function onerror() {
            resolve();
        };

        request.send(null);
    });
}

export async function saveMetaData(metadata) {
    if (!window.isLocalServer) {
        return;
    }
    const { game } = getParams();
    const request = new XMLHttpRequest();
    request.open('POST', `metadata/${game}`, true);
    request.onload = function onload() {
        if (this.status === 200) {
            // tslint:disable-next-line:no-console
            console.log('Saved metadata:', metadata);
        } else {
            // tslint:disable-next-line:no-console
            console.error('Failed to save metadata');
        }
    };
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(metadata));
}

export function loadGameMetaData() {
    const { game } = getParams();
    const request = new XMLHttpRequest();
    request.open('GET', `metadata/${game}/game.json`, true);

    request.onload = function onload() {
        if (this.status === 200) {
            try {
                DebugData.metadata.game = JSON.parse(request.response);
            } catch (e) {
                // continue regardless of error
            }
        }
    };

    request.send(null);
}

export async function loadIslandsMetaData() {
    return new Promise((resolve) => {
        const { game } = getParams();
        const request = new XMLHttpRequest();
        request.open('GET', `metadata/${game}/islands.json`, true);

        request.onload = function onload() {
            if (this.status === 200) {
                try {
                    const resp = JSON.parse(request.response);
                    DebugData.metadata.islands = resp.islands;
                } catch (e) {
                    // continue regardless of error
                }
            }
            resolve();
        };

        request.onerror = function onerror() {
            resolve();
        };

        request.send(null);
    });
}
