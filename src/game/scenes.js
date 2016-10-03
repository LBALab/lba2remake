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
        threeScene: new THREE.Scene(),
        sceneData: {},
        sceneIndex: 42, // outside tavern scene (Island)
        island: {},
        hero: hero,
        actors: [],
        zones: [],
        points: [],
        models: null
    }

    initScene(currentScene);
    
    const islandManager = loadIslandManager(currentScene.threeScene);

    function onIslandLoaded(island) {
        console.log('Loaded: ', island.name);
        GameEvents.scene.sceneLoaded(island);
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

    gotoScene(currentScene, currentScene.sceneIndex); // temporary

    GameEvents.scene.nextIsland.addListener(nextIsland);
    GameEvents.scene.previousIsland.addListener(previousIsland);
    GameEvents.scene.gotoIsland.addListener(gotoIsland);

    //GameEvents.scene.nextScene.addListener(nextScene);
    //GameEvents.scene.previousScene.addListener(previousScene);
    GameEvents.scene.gotoScene.addListener(gotoScene);
        
    currentScene.update = function(time) {
        const numActors = currentScene.actors.length;
        for (let i = 0; i < numActors; ++i) {
            currentScene.actors[i].update(time);
        }
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
    loadSceneData(currentScene.sceneData, index, (sceneData) => { 
        createScene(sceneData, currentScene); 
    });
}

function createScene(sceneData, currentScene) {
    currentScene.sceneData = sceneData; 
    const numActors = currentScene.sceneData.actors.length;
    for (let i = 0; i < numActors; ++i) {
        const actorProps = currentScene.sceneData.actors[i];
        const actor = createActor(currentScene.models, i, actorProps);
        
        if (actor.isVisible()) {
            actor.load(i, (threeObject, models) => {
                currentScene.threeScene.add(threeObject);
            });
        }

        currentScene.actors.push(actor);
    }
}

function initScene(currentScene) {
    loadModel(currentScene.models, 0, 0, 0, 0, (obj) => { 
        currentScene.models = obj;
    });
}
