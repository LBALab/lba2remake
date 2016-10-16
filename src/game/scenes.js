import async from 'async';
import THREE from 'three';
import {map, each, extend} from 'lodash';

import {loadIslandScenery} from '../island';
import sceneMapping from '../island/data/sceneMapping';
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
            loadIslandScenery.bind(null, sceneMapping[indexInfo.index].island) :
            loadIsometricScenery.bind(null, indexInfo.index);

        const loadActors = callback => { async.map(sceneData.actors, loadActor, callback) };
        const loadPoints = callback => { async.map(sceneData.points, loadPoint, callback) };
        const loadZones = callback => { async.map(sceneData.zones, loadZone, callback) };

        async.auto({
            scenery: loadScenery,
            actors: loadActors,
            points: loadPoints,
            zones: loadZones
        }, function (err, data) {
            const threeSection = new THREE.Object3D();
            if (indexInfo.isIsland) {
                const sectionIdx = sceneMapping[indexInfo.index].section;
                const section = data.scenery.sections[sectionIdx];
                threeSection.position.x = section.x * 2;
                threeSection.position.z = section.z * 2;
            }
            const addToScene = obj => {
                threeSection.add(obj.threeObject);
            };
            threeScene.add(data.scenery.threeObject);
            threeScene.add(threeSection);
            each(data.actors, addToScene);
            // For debug purposes
            /*
            each(data.zones, addToScene);
            each(data.points, addToScene);
            */
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
