import async from 'async';
import THREE from 'three';
import {map, each, extend} from 'lodash';

import sceneMapping from '../island/data/sceneMapping';
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
                loadScene(sceneMap, index, null, debug, (pScene) => {
                    hero.physics.position.x = pScene.scenery.props.startPosition[0];
                    hero.physics.position.z = pScene.scenery.props.startPosition[1];
                    renderer.applySceneryProps(pScene.scenery.props);
                    scene = pScene;
                });
            }
        });
    });
}

function loadScene(sceneMap, index, threeScene, debug, callback) {
    loadSceneData(index, sceneData => {
        const indexInfo = sceneMap[index];
        const loadSteps = {
            actors: callback => { async.map(sceneData.actors, loadActor, callback) },
            points: callback => { async.map(sceneData.points, loadPoint, callback) },
            zones: callback => { async.map(sceneData.zones, loadZone, callback) }
        };

        if (!threeScene) {
            threeScene = new THREE.Scene();
            loadSteps.scenery = indexInfo.isIsland
                ? loadIslandScenery.bind(null, sceneMapping[indexInfo.index].island)
                : loadIsometricScenery.bind(null, indexInfo.index);
        }

        async.auto(loadSteps, function (err, data) {
            const sceneNode = loadSceneNode(indexInfo, data);
            const addToSceneNode = obj => {
                sceneNode.add(obj.threeObject);
            };
            threeScene.add(data.scenery.threeObject);
            threeScene.add(sceneNode);
            each(data.actors, addToSceneNode);
            if (debug) {
                each(data.zones, addToSceneNode);
                each(data.points, addToSceneNode);
            }
            callback(extend({
                index: index,
                type: indexInfo.isIsland ? SceneryType.ISLAND : SceneryType.ISOMETRIC,
                threeScene: threeScene,
                update: time => {
                    each(data.actors, actor => {
                        actor.update(time);
                    });
                }
            }, data));
        });
    });
}

function loadSceneNode(indexInfo, data) {
    const sceneNode = new THREE.Object3D();
    if (indexInfo.isIsland) {
        const sectionIdx = sceneMapping[indexInfo.index].section;
        const section = data.scenery.sections[sectionIdx];
        sceneNode.position.x = section.x * 2;
        sceneNode.position.z = section.z * 2;
    }
    return sceneNode;
}