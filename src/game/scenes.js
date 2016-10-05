import async from 'async';
import THREE from 'three';
import _ from 'lodash';

import {GameEvents} from './events';
import {loadIslandManager} from '../island';
import {loadSceneData} from '../scene'
import {loadModel} from '../model' 
import {createActor} from './actors';

export function createSceneManager(hero) {
    const currentScene = {
        hasLoaded: false,
        hero: hero,
        sceneData: [],
        actors: [],
        zones: [],
        points: [],
        models: null,
        island: {},
        threeScene: new THREE.Scene()
    }

    initScene(currentScene);
    
    const islandManager = loadIslandManager(currentScene.threeScene);

    function onIslandLoaded(island) {
        console.log('Loaded: ', island.name);
        GameEvents.scene.sceneLoaded(island);

        gotoScene(currentScene, 42); // temporary
    }

    function resetThreeScene() {
        currentScene.threeScene = new THREE.Scene();
        islandManager.setThreeScene(currentScene.threeScene);
    }

    function nextIsland() { 
        resetThreeScene()
        islandManager.loadNext(onIslandLoaded); 
    }

    function previousIsland() { 
        resetThreeScene()
        islandManager.loadPrevious(onIslandLoaded); 
    }

    function gotoIsland(islandName) {
        resetThreeScene()
        islandManager.loadIsland(islandName, onIslandLoaded); 
    }

    function gotoScene(currentScene, index) { 
        loadScene(currentScene, index);
    }

    GameEvents.scene.nextIsland.addListener(nextIsland);
    GameEvents.scene.previousIsland.addListener(previousIsland);
    GameEvents.scene.gotoIsland.addListener(gotoIsland);

    //GameEvents.scene.nextScene.addListener(nextScene);
    //GameEvents.scene.previousScene.addListener(previousScene);
    GameEvents.scene.gotoScene.addListener(gotoScene);
        
    currentScene.update = function(time) {
        _.each(currentScene.actors, actor => {
            actor.update(time);
        });
    }

    return {
        dispose: () => {
            GameEvents.scene.nextIsland.removeListener(nextIsland);
            GameEvents.scene.previousIsland.removeListener(previousIsland);
            GameEvents.scene.gotoIsland.removeListener(gotoIsland);

            //GameEvents.scene.nextScene.removeListener(nextScene);
            //GameEvents.scene.previousScene.removeListener(previousScene);
            GameEvents.scene.gotoScene.removeListener(gotoScene);
        },
        currentScene: () => {
             currentScene.island = islandManager.currentIsland();
             return currentScene;
        }
    };
}


function loadScene(currentScene, index) {
    // load all scenes in the island - just testing for now

    let i = 0; // scene data index
    _.each(currentScene.island.data.layout.groundSections, section => {
        currentScene.sceneData[i] = {}; // init 
        loadSceneData(currentScene.sceneData[i], i + index, (sceneData) => { 
            currentScene.sceneData[i] = sceneData; 
            createScene(currentScene, section, i, sceneData); 
        });
        ++i;
    });

    currentScene.hasLoaded = true;
}

function createScene(currentScene, section, index, sceneData) {
    const prevLength = currentScene.actors.length;
    const numActors = currentScene.sceneData[index].actors.length;
    for (let i = 0; i < numActors; ++i) {
        const actorProps = currentScene.sceneData[index].actors[i];
        const actor = createActor(currentScene, i + index * prevLength, actorProps, section.x, section.z);

        currentScene.actors.push(actor);
    }
}

function initScene(currentScene) {
    loadModel(currentScene.models, 0, 0, 0, 0, (obj) => { 
        currentScene.models = obj;
    });
}
