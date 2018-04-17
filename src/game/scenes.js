import async from 'async';
import * as THREE from 'three';
import {
    map,
    filter,
    each,
    noop
} from 'lodash';

import islandSceneMapping from '../island/data/sceneMapping';
import {loadIslandScenery, getEnvInfo} from '../island';
import {loadIsometricScenery} from '../iso';
import {loadSceneData} from '../scene';
import {loadSceneMapData} from '../scene/map';
import {loadActor} from './actors';
import {loadPoint} from './points';
import {loadZone} from './zones';
import {loadScripts, killActor, reviveActor} from '../scripting';
import {initCameraMovement} from './loop/cameras';
import DebugData, * as DBG from '../ui/editor/DebugData';

const {initSceneDebugData, loadSceneMetaData} = DBG;

export function createSceneManager(params, game, renderer, callback: Function, hideMenu: Function) {
    let scene = null;
    const sceneManager = {
        getScene: (index) => {
            if (scene && index && scene.sideScenes && index in scene.sideScenes) {
                return scene.sideScenes[index];
            }
            return scene;
        }
    };

    loadSceneMapData((sceneMap) => {
        sceneManager.hideMenuAndGoto = function hideMenuAndGoto(index, wasPaused) {
            hideMenu(wasPaused);
            this.goto(index, noop, false, wasPaused);
        };

        sceneManager.goto = function goto(index, onLoad = noop, force = false, wasPaused = false) {
            if ((!force && scene && index === scene.index) || game.isLoading())
                return;

            ga('set', 'page', `/scene/${index}`);
            ga('send', 'pageview');

            if (scene)
                scene.isActive = false;

            game.setUiState({ text: null, cinema: false });

            const hash = window.location.hash;
            if (hash.match(/scene=\d+/)) {
                window.location.hash = hash.replace(/scene=\d+/, `scene=${index}`);
            }

            const musicSource = game.getAudioManager().getMusicSource();
            const menuMusicSource = game.getAudioMenuManager().getMusicSource();
            if (scene && scene.sideScenes && index in scene.sideScenes) {
                killActor(scene.actors[0]);
                const sideScene = scene.sideScenes[index];
                sideScene.sideScenes = scene.sideScenes;
                delete sideScene.sideScenes[index];
                delete scene.sideScenes;
                sideScene.sideScenes[scene.index] = scene;
                scene = sideScene;
                reviveActor(scene.actors[0]); // Awake twinsen
                scene.isActive = true;
                if (!musicSource.isPlaying) {
                    musicSource.load(scene.data.ambience.musicIndex, () => {
                        menuMusicSource.stop(); // if menu music is start playing during load
                        musicSource.play();
                    });
                }
                initSceneDebugData();
                onLoad(scene);
            } else {
                game.loading(index);
                loadScene(this, params, game, renderer, sceneMap, index, null, (err, pScene) => {
                    renderer.applySceneryProps(pScene.scenery.props);
                    scene = pScene;
                    scene.isActive = true;
                    if (!musicSource.isPlaying) {
                        musicSource.load(scene.data.ambience.musicIndex, () => {
                            menuMusicSource.stop(); // if menu music is start playing during load
                            musicSource.play();
                        });
                    }
                    initSceneDebugData();
                    onLoad(scene);
                    scene.sceneNode.updateMatrixWorld();
                    initCameraMovement(game.controlsState, renderer, scene);
                    game.loaded(wasPaused);
                });
            }
        };

        sceneManager.next = function next(pCallback) {
            if (scene) {
                const nextIdx = (scene.index + 1) % sceneMap.length;
                this.goto(nextIdx, pCallback);
            }
        };

        sceneManager.previous = function previous(pCallback) {
            if (scene) {
                const previousIdx = scene.index > 0 ? scene.index - 1 : sceneMap.length - 1;
                this.goto(previousIdx, pCallback);
            }
        };

        callback(sceneManager);
    });

    return sceneManager;
}

function loadScene(sceneManager, params, game, renderer, sceneMap, index, parent, mainCallback) {
    loadSceneData(game.getState().config.language, index, (sceneData) => {
        const indexInfo = sceneMap[index];
        let islandName;
        if (indexInfo.isIsland) {
            islandName = islandSceneMapping[index].island;
            if (game.getState().flags.quest[152] && islandName === 'CITABAU') {
                islandName = 'CITADEL';
            }
        }
        const envInfo = indexInfo.isIsland ? getEnvInfo(islandName) : {
            skyColor: [0, 0, 0],
            fogDensity: 0,
        };
        const loadSteps = {
            metadata: callback => (params.editor ? loadSceneMetaData(index, callback) : callback()),
            actors: ['metadata', (data, callback) => { async.map(sceneData.actors, loadActor.bind(null, params, envInfo, sceneData.ambience), callback); }],
            points: ['metadata', (data, callback) => { async.map(sceneData.points, loadPoint, callback); }],
            zones: ['metadata', (data, callback) => { async.map(sceneData.zones, loadZone, callback); }],
        };

        if (!parent) {
            if (indexInfo.isIsland) {
                loadSteps.scenery =
                    loadIslandScenery.bind(null, params, islandName, sceneData.ambience);
            } else {
                loadSteps.scenery =
                    loadIsometricScenery.bind(null, renderer, indexInfo.index);
            }
            loadSteps.threeScene = ['scenery', (data, callback) => {
                const threeScene = new THREE.Scene();
                threeScene.name = `${indexInfo.isIsland ? '3D' : 'iso'}_scene`;
                threeScene.add(data.scenery.threeObject);
                callback(null, threeScene);
            }];
            if (indexInfo.isIsland) {
                loadSteps.sideScenes = ['scenery', 'threeScene', (data, callback) => {
                    loadSideScenes(
                        sceneManager,
                        params,
                        game,
                        renderer,
                        sceneMap,
                        index,
                        data,
                        callback);
                }];
            }
        } else {
            loadSteps.scenery = (callback) => { callback(null, parent.scenery); };
            loadSteps.threeScene = (callback) => { callback(null, parent.threeScene); };
        }

        async.auto(loadSteps, (err, data) => {
            const sceneNode = loadSceneNode(index, indexInfo, data);
            data.threeScene.add(sceneNode);
            const scene = {
                index,
                data: sceneData,
                isIsland: indexInfo.isIsland,
                threeScene: data.threeScene,
                sceneNode,
                scenery: data.scenery,
                sideScenes: data.sideScenes,
                parentScene: data,
                actors: data.actors,
                points: data.points,
                zones: data.zones,
                isActive: false,
                zoneState: { listener: null, ended: false },
                goto: sceneManager.goto.bind(sceneManager),
                reset() {
                    each(this.actors, (actor) => {
                        actor.reset();
                    });
                    loadScripts(params, game, scene);
                    initCameraMovement(game.controlsState, renderer, scene);
                    if (game.isPaused()) {
                        DebugData.step = true;
                    }
                    scene.variables = createSceneVariables(scene);
                },
                removeMesh(threeObject) {
                    this.threeScene.remove(threeObject);
                },
                addMesh(threeObject) {
                    this.threeScene.add(threeObject);
                }
            };
            if (scene.isIsland) {
                scene.section = islandSceneMapping[index].section;
            }
            loadScripts(params, game, scene);
            scene.variables = createSceneVariables(scene);
            scene.usedVarGames = findUsedVarGames(scene);
            // Kill twinsen if side scene
            if (parent) {
                killActor(scene.actors[0]);
            }
            mainCallback(null, scene);
        });
    });
}

function loadSceneNode(index, indexInfo, data) {
    const sceneNode = indexInfo.isIsland ? new THREE.Object3D() : new THREE.Scene();
    sceneNode.name = `scene_${index}`;
    if (indexInfo.isIsland) {
        const sectionIdx = islandSceneMapping[index].section;
        const section = data.scenery.sections[sectionIdx];
        sceneNode.position.x = section.x * 2;
        sceneNode.position.z = section.z * 2;
    }
    const addToSceneNode = (obj) => {
        if (obj.threeObject !== null) { // because of the sprite actors
            sceneNode.add(obj.threeObject);
        }
    };

    each(data.actors, addToSceneNode);
    each(data.zones, addToSceneNode);
    each(data.points, addToSceneNode);
    return sceneNode;
}

function loadSideScenes(sceneManager,
                        params,
                        game,
                        renderer,
                        sceneMap,
                        index,
                        parent,
                        mainCallback) {
    const sideIndices = filter(
        map(sceneMap, (indexInfo, sideIndex) => {
            if (sideIndex !== index
                && indexInfo.isIsland
                && sideIndex in islandSceneMapping) {
                const sideMapping = islandSceneMapping[sideIndex];
                const mainMapping = islandSceneMapping[index];
                if (sideMapping.island === mainMapping.island
                    && sideMapping.variant === mainMapping.variant) {
                    return sideIndex;
                }
            }
            return null;
        }),
        id => id !== null
    );
    async.map(sideIndices, (sideIndex, callback) => {
        loadScene(sceneManager, params, game, renderer, sceneMap, sideIndex, parent, callback);
    }, (err, sideScenes) => {
        const sideScenesMap = {};
        each(sideScenes, (sideScene) => {
            sideScenesMap[sideScene.index] = sideScene;
        });
        mainCallback(null, sideScenesMap);
    });
}

function createSceneVariables(scene) {
    let maxVarCubeIndex = -1;
    each(scene.actors, (actor) => {
        const commands = actor.scripts.life.commands;
        each(commands, (cmd) => {
            if (cmd.op.command === 'SET_VAR_CUBE') {
                maxVarCubeIndex = Math.max(cmd.args[0].value, maxVarCubeIndex);
            }
            if (cmd.condition && cmd.condition.op.command === 'VAR_CUBE') {
                maxVarCubeIndex = Math.max(cmd.condition.param.value, maxVarCubeIndex);
            }
        });
    });
    const variables = [];
    for (let i = 0; i <= maxVarCubeIndex; i += 1) {
        variables.push(0);
    }
    return variables;
}

function findUsedVarGames(scene) {
    const usedVars = [];
    each(scene.actors, (actor) => {
        const commands = actor.scripts.life.commands;
        each(commands, (cmd) => {
            let value = null;
            if (cmd.op.command === 'SET_VAR_GAME') {
                value = cmd.args[0].value;
            } else if (cmd.condition && cmd.condition.op.command === 'VAR_GAME') {
                value = cmd.condition.param.value;
            }
            if (value !== null && usedVars.indexOf(value) === -1) {
                usedVars.push(value);
            }
        });
    });
    usedVars.sort((a, b) => a - b);
    return usedVars;
}
