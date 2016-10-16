import async from 'async';
import THREE from 'three';
import {map, each, extend} from 'lodash';

import {loadIslandScenery} from '../island';
import {loadIsometricScenery} from '../iso'
import {loadSceneData} from '../scene'
import {loadSceneMapData} from '../scene/map'
import {loadModel} from '../model'
import {createActor} from './actors';
import {createPoint} from './points';
import {createZone} from './zones';

export const SceneryType = {
    ISLAND: 0,
    ISOMETRIC: 1
};

export function createSceneManager(renderer, hero, callback) {
    let scene = null;

    loadSceneMapData(sceneMap => {
        callback({
            getScene: () => scene,
            goto: index => {
                loadScene(sceneMap, index, (pScene) => {
                    hero.physics.position.x = pScene.scenery.props.startPosition[0];
                    hero.physics.position.z = pScene.scenery.props.startPosition[1];
                    renderer.applySceneryProps(pScene.scenery.props);
                    scene = pScene;
                });
            }
        });
    });
}

function loadScene(sceneMap, index, callback) {
    loadSceneData(index, sceneData => {
        const threeScene = new THREE.Scene();
        const indexInfo = sceneMap[index];
        let loadScenery = indexInfo.isIsland ?
            loadIslandScenery.bind(null, 'CITABAU') :
            loadIsometricScenery.bind(null, indexInfo.index);

        async.auto({
            scenery: loadScenery,
            actors: loadActors.bind(null, sceneData.actors),
            points: loadPoints.bind(null, sceneData.points),
            zones: loadZones.bind(null, sceneData.zones),
            models: loadModels2.bind(null, sceneData.actors)
        }, function (err, data) {
            threeScene.add(data.scenery.threeObject);
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

function loadActors(actorProps, callback) {
    callback(null, map(actorProps, createActor));
}

function loadPoints(pointProps, callback) {
    callback(null, []);
}

function loadZones(zoneProps, callback) {
    callback(null, []);
}

function loadModels2(modelProps, callback) {
    callback(null, []);
}
