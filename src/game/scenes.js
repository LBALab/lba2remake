import async from 'async';
import THREE from 'three';
import {
    map,
    filter,
    each,
    find,
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
import {initSceneDebugData, loadSceneMetaData} from '../ui/editor/DebugData';

export function createSceneManager(params, game, renderer, callback: Function) {
    let scene = null;
    let sceneManager = {
        getScene: (index) => {
            if (scene && index && scene.sideScenes && index in scene.sideScenes) {
                return scene.sideScenes[index];
            }
            return scene;
        }
    };

    loadSceneMapData(sceneMap => {
        sceneManager.goto = function(index, pCallback = noop) {
            if ((scene && index === scene.index) || game.isLoading())
                return;

            ga('set', 'page', `/scene/${index}`);
            ga('send', 'pageview');

            if (scene)
                scene.isActive = false;

            game.setUiState({ text: null, cinema: false });

            const hash = window.location.hash;
            if (hash.match(/scene\=\d+/)) {
                window.location.hash = hash.replace(/scene\=\d+/, `scene=${index}`);
            }

            const musicSource = game.getAudioManager().getMusicSource();
            if (scene && scene.sideScenes && index in scene.sideScenes) {
                killActor(scene.getActor(0));
                const sideScene = scene.sideScenes[index];
                sideScene.sideScenes = scene.sideScenes;
                delete sideScene.sideScenes[index];
                delete scene.sideScenes;
                sideScene.sideScenes[scene.index] = scene;
                scene = sideScene;
                reviveActor(scene.getActor(0)); // Awake twinsen
                scene.isActive = true;
                if (!musicSource.isPlaying) {
                    musicSource.load(scene.data.ambience.musicIndex, () => {
                        musicSource.play();
                    });
                }
                initSceneDebugData();
                pCallback(scene);
            } else {
                game.loading(index);
                loadScene(this, params, game, renderer, sceneMap, index, null, (err, pScene) => {
                    renderer.applySceneryProps(pScene.scenery.props);
                    scene = pScene;
                    scene.isActive = true;
                    if (!musicSource.isPlaying) {
                        musicSource.load(scene.data.ambience.musicIndex, () => {
                            musicSource.play();
                        });
                    }
                    initSceneDebugData();
                    pCallback(scene);
                    scene.sceneNode.updateMatrixWorld();
                    initCameraMovement(game.controlsState, renderer, scene);
                    game.loaded();
                });
            }
        };

        sceneManager.next = function(pCallback) {
            if (scene) {
                const next = (scene.index + 1) % sceneMap.length;
                this.goto(next, pCallback);
            }
        };

        sceneManager.previous = function(pCallback) {
            if (scene) {
                const previous = scene.index > 0 ? scene.index - 1 : sceneMap.length - 1;
                this.goto(previous, pCallback);
            }
        };

        callback(sceneManager);
    });

    return sceneManager;
}

function loadScene(sceneManager, params, game, renderer, sceneMap, index, parent, callback) {
    loadSceneData(index, sceneData => {
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
            metadata: (callback) => params.editor ? loadSceneMetaData(index, callback) : callback(),
            actors: ['metadata', (data, callback) => { async.map(sceneData.actors, loadActor.bind(null, envInfo, sceneData.ambience), callback) }],
            points: ['metadata', (data, callback) => { async.map(sceneData.points, loadPoint, callback) }],
            zones: ['metadata', (data, callback) => { async.map(sceneData.zones, loadZone, callback) }],
        };

        if (!parent) {
            if (indexInfo.isIsland) {
                loadSteps.scenery = loadIslandScenery.bind(null, islandName, sceneData.ambience);
            } else {
                loadSteps.scenery = loadIsometricScenery.bind(null, renderer, indexInfo.index);
            }
            loadSteps.threeScene = ['scenery', (data, callback) => {
                const threeScene = new THREE.Scene();
                threeScene.name = `${indexInfo.isIsland ? '3D' : 'iso'}_scene`;
                threeScene.add(data.scenery.threeObject);
                callback(null, threeScene);
            }];
            if (indexInfo.isIsland) {
                loadSteps.sideScenes = ['scenery', 'threeScene', (data, callback) => {
                    loadSideScenes(sceneManager, params, game, renderer, sceneMap, index, data, callback);
                }];
            }
        } else {
            loadSteps.scenery = (callback) => { callback(null, parent.scenery); };
            loadSteps.threeScene = (callback) => { callback(null, parent.threeScene); };
        }

        if (params.noscripts === true) {
            delete loadSteps.actors;
            delete loadSteps.points;
            delete loadSteps.zones;
        }

        async.auto(loadSteps, function (err, data) {
            const sceneNode = loadSceneNode(index, indexInfo, data);
            data.threeScene.add(sceneNode);
            const scene = {
                index: index,
                data: sceneData,
                isIsland: indexInfo.isIsland,
                threeScene: data.threeScene,
                sceneNode: sceneNode,
                scenery: data.scenery,
                sideScenes: data.sideScenes,
                parentScene: data,
                actors: data.actors,
                points: data.points,
                zones: data.zones,
                isActive: false,
                variables: createSceneVariables(),
                zoneState: { listener: null, ended: false },
                getActor(index) {
                    return find(this.actors, function(obj) { return obj.index === index; });
                },
                getZone(index) {
                    return find(this.zones, function(obj) { return obj.index === index; });
                },
                getPoint(index) {
                    return find(this.points, function(obj) { return obj.index === index; });
                },
                goto: sceneManager.goto.bind(sceneManager)
            };
            if (scene.isIsland) {
                scene.section = islandSceneMapping[index].section;
            }
            loadScripts(params, game, scene);
            // Kill twinsen if side scene
            if (parent) {
                killActor(scene.getActor(0));
            }
            callback(null, scene);
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
    const addToSceneNode = obj => {
        if (obj.threeObject !== null) { // because of the sprite actors
            sceneNode.add(obj.threeObject);
        }
    };

    each(data.actors, addToSceneNode);
    each(data.zones, addToSceneNode);
    each(data.points, addToSceneNode);
    return sceneNode;
}

function loadSideScenes(sceneManager, params, game, renderer, sceneMap, index, parent, callback) {
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
        }),
        id => id !== undefined
    );
    async.map(sideIndices, (sideIndex, callback) => {
        loadScene(sceneManager, params, game, renderer, sceneMap, sideIndex, parent, callback);
    }, (err, sideScenes) => {
        const sideScenesMap = {};
        each(sideScenes, sideScene => {
            sideScenesMap[sideScene.index] = sideScene;
        });
        callback(null, sideScenesMap);
    });
}

function createSceneVariables() {
    const scene = [];
    for (let i = 0; i < 256; ++i) {
        scene[i] = 0;
    }
    return scene;
}

