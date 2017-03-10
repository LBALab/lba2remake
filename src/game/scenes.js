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
import {parseQueryParams} from '../utils';
import {loadScripts, killActor, reviveActor} from '../scripting';
import {initSceneDebug, resetSceneDebug} from '../scripting/debug';

export function createSceneManager(game, renderer, callback: Function) {
    let scene = null;

    loadSceneMapData(sceneMap => {
        callback({
            getScene: (index) => {
                if (scene && index && scene.sideScenes && index in scene.sideScenes) {
                    return scene.sideScenes[index];
                }
                return scene;
            },
            goto: (index, pCallback = noop) => {
                if ((scene && index == scene.index) || game.isLoading())
                    return;

                ga('set', 'page', `/scene/${index}`);
                ga('send', 'pageview');

                if (scene)
                    scene.isActive = false;

                const textBox = document.getElementById('smallText');
                textBox.style.display = 'none';

                const hash = window.location.hash;
                if (hash.match(/scene\=\d+/)) {
                    window.location.hash = hash.replace(/scene\=\d+/, `scene=${index}`);
                }

                const musicSource = game.getAudioManager().getMusicSource();
                if (scene && scene.sideScenes && index in scene.sideScenes) {
                    resetSceneDebug(scene);
                    killActor(scene.getActor(0));
                    const sideScene = scene.sideScenes[index];
                    sideScene.sideScenes = scene.sideScenes;
                    delete sideScene.sideScenes[index];
                    delete scene.sideScenes;
                    sideScene.sideScenes[scene.index] = scene;
                    scene = sideScene;
                    window.scene = scene;
                    initSceneDebug(scene);
                    reviveActor(scene.getActor(0)); // Awake twinsen
                    scene.isActive = true;
                    if (!musicSource.isPlaying) {
                        musicSource.load(scene.data.ambience.musicIndex, () => {
                            musicSource.play();
                        });
                    }
                    pCallback(scene);
                } else {
                    game.loading(index);
                    resetSceneDebug(scene);
                    loadScene(game, renderer, sceneMap, index, null, (err, pScene) => {
                        renderer.applySceneryProps(pScene.scenery.props);
                        scene = pScene;
                        window.scene = scene;
                        initSceneDebug(scene);
                        scene.isActive = true;
                        musicSource.load(scene.data.ambience.musicIndex, () => {
                            musicSource.play();
                        });
                        pCallback(scene);
                        game.loaded();
                    });
                }
            },
            next: function(pCallback) {
                if (scene) {
                    const next = (scene.index + 1) % sceneMap.length;
                    this.goto(next, pCallback);
                }
            },
            previous: function(pCallback) {
                if (scene) {
                    const previous = scene.index > 0 ? scene.index - 1 : sceneMap.length - 1;
                    this.goto(previous, pCallback);
                }
            }
        });
    });
}

function loadScene(game, renderer, sceneMap, index, parent, callback) {
    loadSceneData(index, sceneData => {
        const indexInfo = sceneMap[index];
        let islandName;
        if (indexInfo.isIsland) {
            islandName = islandSceneMapping[index].island;
            if (game.getState().flags.quest[152] && islandName == 'CITABAU') {
                islandName = 'CITADEL';
            }
        }
        const envInfo = indexInfo.isIsland ? getEnvInfo(islandName) : {
            skyColor: [0, 0, 0],
            fogDensity: 0,
        };
        const loadSteps = {
            actors: (callback) => { async.map(sceneData.actors, loadActor.bind(null, envInfo, sceneData.ambience), callback) },
            points: (callback) => { async.map(sceneData.points, loadPoint, callback) },
            zones: (callback) => { async.map(sceneData.zones, loadZone, callback) }
        };

        if (!parent) {
            if (indexInfo.isIsland) {
                loadSteps.scenery = loadIslandScenery.bind(null, islandName, sceneData.ambience);
            } else {
                loadSteps.scenery = loadIsometricScenery.bind(null, renderer, indexInfo.index);
            }
            loadSteps.threeScene = ['scenery', (data, callback) => {
                const threeScene = new THREE.Scene();
                threeScene.add(data.scenery.threeObject);
                callback(null, threeScene);
            }];
            if (indexInfo.isIsland) {
                loadSteps.sideScenes = ['scenery', 'threeScene', (data, callback) => {
                    loadSideScenes(game, renderer, sceneMap, index, data, callback);
                }];
            }
        } else {
            loadSteps.scenery = (callback) => { callback(null, parent.scenery); };
            loadSteps.threeScene = (callback) => { callback(null, parent.threeScene); };
        }

        const params = parseQueryParams();
        if (params.NOSCRIPTS == 'true') {
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
                getActor(index) {
                    return find(this.actors, function(obj) { return obj.index == index; });
                },
                getZone(index) {
                    return find(this.zones, function(obj) { return obj.index == index; });
                },
                getPoint(index) {
                    return find(this.points, function(obj) { return obj.index == index; });
                },
            };
            if (scene.isIsland) {
                scene.section = islandSceneMapping[index].section;
            }
            loadScripts(game, scene);
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
    if (indexInfo.isIsland) {
        const sectionIdx = islandSceneMapping[index].section;
        const section = data.scenery.sections[sectionIdx];
        sceneNode.position.x = section.x * 2;
        sceneNode.position.z = section.z * 2;
    }
    const addToSceneNode = obj => {
        if (obj.threeObject != null) { // because of the sprite actors
            sceneNode.add(obj.threeObject);
        }
    };

    each(data.actors, addToSceneNode);
    each(data.zones, addToSceneNode);
    each(data.points, addToSceneNode);
    return sceneNode;
}

function loadSideScenes(game, renderer, sceneMap, index, parent, callback) {
    const sideIndices = filter(
        map(sceneMap, (indexInfo, sideIndex) => {
            if (sideIndex != index
                && indexInfo.isIsland
                && sideIndex in islandSceneMapping) {
                const sideMapping = islandSceneMapping[sideIndex];
                const mainMapping = islandSceneMapping[index];
                if (sideMapping.island == mainMapping.island
                    && sideMapping.variant == mainMapping.variant) {
                    return sideIndex;
                }
            }
        }),
        id => id != null
    );
    async.map(sideIndices, (sideIndex, callback) => {
        loadScene(game, renderer, sceneMap, sideIndex, parent, callback);
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

