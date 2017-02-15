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
import {loadPosition} from './hero';
import {getQueryParams} from '../utils';
import {loadScripts} from '../scripting';
import {initSceneDebug, resetSceneDebug, hasStep, endStep} from '../scripting/debug';

export function createSceneManager(game, renderer, hero, callback: Function) {
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
                if (scene && index == scene.index)
                    return;

                const hash = window.location.hash;
                if (hash.match(/scene\=\d+/)) {
                    window.location.hash = hash.replace(/scene\=\d+/, `scene=${index}`);
                }

                if (scene && scene.sideScenes && index in scene.sideScenes) {
                    resetSceneDebug(scene);
                    const sideScene = scene.sideScenes[index];
                    sideScene.sideScenes = scene.sideScenes;
                    delete sideScene.sideScenes[index];
                    delete scene.sideScenes;
                    sideScene.sideScenes[scene.index] = scene;
                    scene = sideScene;
                    window.scene = scene;
                    loadPosition(hero.physics, scene);
                    initSceneDebug(scene);
                    pCallback();
                } else {
                    resetSceneDebug(scene);
                    loadScene(game, renderer, sceneMap, index, null, (err, pScene) => {
                        hero.physics.position.x = pScene.scenery.props.startPosition[0];
                        hero.physics.position.z = pScene.scenery.props.startPosition[1];
                        renderer.applySceneryProps(pScene.scenery.props);
                        scene = pScene;
                        window.scene = scene;
                        loadPosition(hero.physics, scene);
                        initSceneDebug(scene);
                        pCallback();
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
            actors: (callback) => { async.map(sceneData.actors, loadActor.bind(null, game, envInfo, sceneData.ambience), callback) },
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

        const params = getQueryParams();
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
                scenery: data.scenery,
                sideScenes: data.sideScenes,
                parentScene: data,
                actors: data.actors,
                points: data.points,
                zones: data.zones,
                update: time => {
                    const step = hasStep();
                    each(data.actors, actor => {
                        actor.update(time, step);
                    });
                    endStep();
                },
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
            loadScripts(game, scene);
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

