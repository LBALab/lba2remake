import {GameEvents} from './events';
import {loadIslandManager} from '../island';
import {loadScene} from '../scene'

export function createSceneManager(hero) {
    const islandManager = loadIslandManager();
    let sceneData = {};
    let sceneIndex = 42; // outside tavern scene

    function onIslandLoaded(island) {
        console.log('Loaded: ', island.name);
        GameEvents.scene.sceneLoaded(island);
    }

    function nextIsland() { islandManager.loadNext(onIslandLoaded); }

    function previousIsland() { islandManager.loadPrevious(onIslandLoaded); }

    function gotoIsland(islandName) { 
        islandManager.loadIsland(islandName, onIslandLoaded);
        gotoScene(sceneIndex);  
    }

    function gotoScene(index) { 
        loadScene(sceneData, index, (obj) => { 
            sceneData = obj; 
        });
    }

    GameEvents.scene.nextIsland.addListener(nextIsland);
    GameEvents.scene.previousIsland.addListener(previousIsland);
    GameEvents.scene.gotoIsland.addListener(gotoIsland);

    return {
        dispose: () => {
            GameEvents.scene.nextIsland.removeListener(nextIsland);
            GameEvents.scene.previousIsland.removeListener(previousIsland);
            GameEvents.scene.gotoIsland.removeListener(gotoIsland);
        },
        currentScene: islandManager.currentIsland.bind(islandManager)
    };
}
