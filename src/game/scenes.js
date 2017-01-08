import async from 'async';
import THREE from 'three';
import {
    map,
    filter,
    each
} from 'lodash';

import islandSceneMapping from '../island/data/sceneMapping';
import {loadIslandScenery} from '../island';
import {loadIsometricScenery} from '../iso';
import {loadSceneData} from '../scene';
import {loadSceneMapData} from '../scene/map';
import {loadActor} from './actors';
import {loadPoint} from './points';
import {loadZone} from './zones';
import {
    DISPLAY_ZONES,
    DISPLAY_POINTS,
    ONLY_LOAD_SCENERY
} from '../debugFlags';

export type SceneManager = {
    getScene: Function,
    goto: Function,
    next: Function,
    previous: Function
}

export function createSceneManager(game, renderer, hero, callback: Function) {
    let scene = null;

    loadSceneMapData(sceneMap => {
        callback({
            getScene: () => scene,
            goto: (index, pCallback) => {
                if (scene && index == scene.index)
                    return;

                if (scene && scene.sideScenes && index in scene.sideScenes) {
                    const sideScene = scene.sideScenes[index];
                    sideScene.sideScenes = scene.sideScenes;
                    delete sideScene.sideScenes[index];
                    delete scene.sideScenes;
                    sideScene.sideScenes[scene.index] = scene;
                    scene = sideScene;
                    pCallback();
                } else {
                    loadScene(game, sceneMap, index, null, (err, pScene) => {
                        hero.physics.position.x = pScene.scenery.props.startPosition[0];
                        hero.physics.position.z = pScene.scenery.props.startPosition[1];
                        renderer.applySceneryProps(pScene.scenery.props);
                        scene = pScene;
                        pCallback();
                    });
                }
            },
            next: (pCallback) => {
                if (scene) {
                    const next = (scene.index + 1) % sceneMap.length;
                    this.goto(next, pCallback);
                }
            },
            previous: (pCallback) => {
                if (scene) {
                    const previous = scene.index > 0 ? scene.index - 1 : sceneMap.length - 1;
                    this.goto(previous, pCallback);
                }
            }
        });
    });
}

function loadScene(game, sceneMap, index, parent, callback) {
    loadSceneData(index, sceneData => {
        const indexInfo = sceneMap[index];
        const loadSteps = {
            actors: (callback) => { async.map(sceneData.actors, loadActor, callback) },
            points: (callback) => { async.map(sceneData.points, loadPoint, callback) },
            zones: (callback) => { async.map(sceneData.zones, loadZone, callback) }
        };

        if (!parent) {
            loadSteps.scenery = indexInfo.isIsland
                ? loadIslandScenery.bind(null, islandSceneMapping[index].island)
                : loadIsometricScenery.bind(null, indexInfo.index);
            loadSteps.threeScene = ['scenery', (data, callback) => {
                const threeScene = new THREE.Scene();
                threeScene.add(data.scenery.threeObject);
                callback(null, threeScene);
            }];
            if (indexInfo.isIsland) {
                loadSteps.sideScenes = ['scenery', 'threeScene', (data, callback) => {
                    loadSideScenes(game, sceneMap, index, data, callback);
                }];
            }
        } else {
            loadSteps.scenery = (callback) => { callback(null, parent.scenery); };
            loadSteps.threeScene = (callback) => { callback(null, parent.threeScene); };
        }

        if (ONLY_LOAD_SCENERY) {
            delete loadSteps.actors;
            delete loadSteps.points;
            delete loadSteps.zones;
        }

        async.auto(loadSteps, function (err, data) {
            const sceneNode = loadSceneNode(index, indexInfo, data);
            data.threeScene.add(sceneNode);
            callback(null, {
                index: index,
                isIsland: indexInfo.isIsland,
                threeScene: data.threeScene,
                scenery: data.scenery,
                sideScenes: data.sideScenes,
                update: time => {
                    each(data.actors, actor => {
                        actor.update(time);
                    });
                }
            });
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
    if (DISPLAY_ZONES) {
        each(data.zones, addToSceneNode);
    }
    if (DISPLAY_POINTS) {
        each(data.points, addToSceneNode);
    }
    return sceneNode;
}

function loadSideScenes(game, sceneMap, index, parent, callback) {
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
        loadScene(game, sceneMap, sideIndex, parent, callback);
    }, (err, sideScenes) => {
        const sideScenesMap = {};
        each(sideScenes, sideScene => {
            sideScenesMap[sideScene.index] = sideScene;
        });
        callback(null, sideScenesMap);
    });
}

