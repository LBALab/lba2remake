import THREE from 'three';
import _ from 'lodash';

import {loadIslandManager} from '../island';
import {loadIsoSceneManager} from '../iso'
import {loadSceneData} from '../scene'
import {loadSceneMapData} from '../scene/map'
import {loadModel} from '../model' 
import {createActor} from './actors';
import {createPoint} from './points';
import {createZone} from './zones';

export function createSceneManager(renderer, hero) {
    const currentScene = {
        hasLoaded: false,
        hero: hero,
        sceneData: [],
        sceneMap: null,
        actors: [],
        zones: [],
        points: [],
        models: null,
        island: {},
        threeScene: new THREE.Scene()
    };

    initScene(currentScene);
    
    const islandManager = loadIslandManager(currentScene.threeScene);
    const isoSceneManager = loadIsoSceneManager();

    function onIslandLoaded(island) {
        console.log('Loaded: ', island.name);
        renderer.initScene(island);
        hero.physics.position.x = island.startPosition[0];
        hero.physics.position.z = island.startPosition[1];
        gotoScene(currentScene, 42); // temporary
    }

    function resetThreeScene() {
        currentScene.threeScene = new THREE.Scene();
        islandManager.setThreeScene(currentScene.threeScene);
    }

    function gotoScene(currentScene, index) { 
        loadScene(currentScene, index);
    }
        
    currentScene.update = function(time) {
        _.each(currentScene.actors, actor => {
            actor.update(time);
        });
    };

    return {
        currentScene: () => {
             currentScene.island = islandManager.currentIsland();
             return currentScene;
        },
        gotoIsland: islandName => {
            resetThreeScene();
            islandManager.loadIsland(islandName, onIslandLoaded);
        }
    };
}


function loadScene(currentScene, index) {
    if (!currentScene.sceneMap || 
        currentScene.sceneMap[index].isIsland) { // island scenes
        let i = 0; // scene data index
        _.each(currentScene.island.data.layout.groundSections, section => {
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

function createScene(currentScene, section, index, sceneData) {
    const numActors = currentScene.sceneData[index].actors.length;
    const numPoints = currentScene.sceneData[index].points.length;
    const numZones = currentScene.sceneData[index].zones.length;
    const actorsLength = currentScene.actors.length + 1;
    const pointsLength = currentScene.points.length + 1;
    const zonesLength = currentScene.zones.length + 1;

    for (let i = 0; i < numActors; ++i) {
        const actorProps = currentScene.sceneData[index].actors[i];
        const actor = createActor(currentScene, i + index * actorsLength, actorProps, section.x, section.z);

        currentScene.actors.push(actor);
    }
    for (let i = 0; i < numPoints; ++i) {
        const pointProps = currentScene.sceneData[index].points[i];
        const point = createPoint(currentScene, i + index * pointsLength, pointProps, section.x, section.z);

        currentScene.points.push(point);
    }
    for (let i = 0; i < numZones; ++i) {
        const zoneProps = currentScene.sceneData[index].zones[i];
        const zone = createZone(currentScene, i + index * zonesLength, zoneProps, section.x, section.z);

        currentScene.zones.push(zone);
    }
}

function initScene(currentScene) {
    loadSceneMapData((map) => { 
        currentScene.sceneMap = map; 
    });

    loadModel(currentScene.models, 0, 0, 0, 0, (obj) => { 
        currentScene.models = obj;
    });
}
