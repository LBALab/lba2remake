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

export const SceneryType = {
    ISLAND: 0,
    ISOMETRIC: 1
};

export function createSceneManager(renderer, hero, callback) {
    let scene = null;

    loadSceneMapData(sceneMap => {
        callback({
            getScene: () => scene,
            goto: (index, debug = false) => {
                loadScene(sceneMap, index, null, debug, (err, pScene) => {
                    hero.physics.position.x = pScene.scenery.props.startPosition[0];
                    hero.physics.position.z = pScene.scenery.props.startPosition[1];
                    renderer.applySceneryProps(pScene.scenery.props);
                    scene = pScene;
                });
            }
        });
    });
}

function loadScene(sceneMap, index, parent, debug, callback) {
    loadSceneData(index, sceneData => {
        const indexInfo = sceneMap[index];
        const type = indexInfo.isIsland ? SceneryType.ISLAND : SceneryType.ISOMETRIC;
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
            if (type == SceneryType.ISLAND) {
                loadSteps.sideScenes = ['scenery', 'threeScene', (data, callback) => {
                    loadSideScenes(sceneMap, index, data, debug, callback);
                }];
            }
        } else {
            loadSteps.scenery = (callback) => { callback(null, parent.scenery); };
            loadSteps.threeScene = (callback) => { callback(null, parent.threeScene); };
        }

        async.auto(loadSteps, function (err, data) {
            const sceneNode = loadSceneNode(index, indexInfo, data, debug);
            data.threeScene.add(sceneNode);
            callback(null, {
                index: index,
                type: type,
                threeScene: data.threeScene,
                scenery: data.scenery,
                update: time => {
                    each(data.actors, actor => {
                        actor.update(time);
                    });
                }
            });
        });
    });
}

function loadSceneNode(index, indexInfo, data, debug) {
    const sceneNode = new THREE.Object3D();
    if (indexInfo.isIsland) {
        const sectionIdx = islandSceneMapping[index].section;
        const section = data.scenery.sections[sectionIdx];
        sceneNode.position.x = section.x * 2;
        sceneNode.position.z = section.z * 2;
    }
    const addToSceneNode = obj => {
        sceneNode.add(obj.threeObject);
    };

    each(data.actors, addToSceneNode);
    if (debug) {
        each(data.zones, addToSceneNode);
        each(data.points, addToSceneNode);
    }
    return sceneNode;
}

function loadSideScenes(sceneMap, index, parent, debug, callback) {
    const sideIndices = filter(
        map(sceneMap, (indexInfo, sideIndex) => {
            if (sideIndex != index && indexInfo.isIsland && sideIndex in islandSceneMapping) {
                if (islandSceneMapping[sideIndex].island == islandSceneMapping[index].island) {
                    return sideIndex;
                }
            }
        }),
        id => id != null
    );
    async.map(sideIndices, (sideIndex, callback) => {
        loadScene(sceneMap, sideIndex, parent, debug, callback);
    }, (err, sideScenes) => {
        const sideScenesMap = {};
        each(sideScenes, sideScene => {
            sideScenesMap[sideScene.index] = sideScene;
        });
        callback(null, sideScenesMap);
    });
}
