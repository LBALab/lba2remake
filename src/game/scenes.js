import THREE from 'three';
import {map, each} from 'lodash';

import {loadIslandScenery} from '../island';
import {loadIsometricGrid} from '../iso'
import {loadSceneData} from '../scene'
import {loadSceneMapData} from '../scene/map'
import {loadModels} from '../model'
import {createActor} from './actors';
import {createPoint} from './points';
import {createZone} from './zones';

export function createSceneManager(renderer, hero) {
    let scene = null;

    return {
        getScene: () => scene,
        goto: index => {
            loadScene(index, (pScene) => {
                console.log(pScene);
                hero.physics.position.x = pScene.scenery.props.startPosition[0];
                hero.physics.position.z = pScene.scenery.props.startPosition[1];
                renderer.applySceneryProps(pScene.scenery.props);
                scene = pScene;
            });
        }
    };
}


function loadScene2(index) {
    if (!currentScene.sceneMap || 
        currentScene.sceneMap[index].isIsland) { // island scenes
        let i = 0; // scene data index
        each(currentScene.island.data.layout.groundSections, section => {
            currentScene.sceneData[i] = {}; // init 
            loadSceneData(currentScene.sceneData[i], currentScene.island.sectionScene[section.id - 1], (sceneData) => { 
                currentScene.sceneData[i] = sceneData; 
                createScene(currentScene, section, i, sceneData); 
                currentScene.hasLoaded = true;
            });
            ++i;
        });
    } else { // iso grid
        const gridIdx = currentScene.sceneMap[index].index;
        currentScene.sceneData[0] = {}; // init 
        loadSceneData(currentScene.sceneData[0], index, (sceneData) => { 
            currentScene.sceneData[0] = sceneData; 
            createScene(currentScene, { x: 0, z: 0 }, 0, sceneData); 
            currentScene.hasLoaded = true;
        });
    }
}

function loadScene(index, callback) {
    loadSceneData(index, sceneData => {
        /*

        Use async here to load scenery first, then the subscenes for islands recursively, then actors, etc

         */
        const threeScene = new THREE.Scene();
        if (sceneData.isOutsideScene) {
            loadIslandScenery('CITABAU', scenery => {
                threeScene.add(scenery.threeObject);
                callback({
                    scenery: scenery,
                    threeScene: threeScene
                });
            });
        }
        console.log(sceneData);
        /*
        callback({
            actors: map(sceneData.actors, createActor)
        });
        */
    });
    /*
    const scene = {
        sceneMap: null,
        actors: [],
        zones: [],
        points: [],
        models: null,
        island: {},
        threeScene: new THREE.Scene()
    };

    const numActors = sceneData[index].actors.length;
    const numPoints = sceneData[index].points.length;
    const numZones = sceneData[index].zones.length;
    const actorsLength = scene.actors.length + 1;
    const pointsLength = scene.points.length + 1;
    const zonesLength = scene.zones.length + 1;

    for (let i = 0; i < numActors; ++i) {
        const actorProps = scene.sceneData[index].actors[i];
        const actor = createActor(scene, i + index * actorsLength, actorProps, section.x, section.z);

        scene.actors.push(actor);
    }
    for (let i = 0; i < numPoints; ++i) {
        const pointProps = scene.sceneData[index].points[i];
        const point = createPoint(scene, i + index * pointsLength, pointProps, section.x, section.z);

        scene.points.push(point);
    }
    for (let i = 0; i < numZones; ++i) {
        const zoneProps = scene.sceneData[index].zones[i];
        const zone = createZone(scene, i + index * zonesLength, zoneProps, section.x, section.z);

        scene.zones.push(zone);
    }

    loadSceneMapData((map) => {
        scene.sceneMap = map;
    });

    loadModels(scene.models, 0, 0, 0, 0, (obj) => {
        scene.models = obj;
    });

    callback({
        update: time => {
            _.each(scene.actors, actor => {
                actor.update(time);
            });
        }
    });
    */
}
