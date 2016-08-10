import {GameEvents} from './events';
import {loadIslandManager} from '../island';

export function createSceneManager(hero) {
    const islandManager = loadIslandManager();

    function onIslandLoaded(island) {
        console.log('Loaded: ', island.name);
        GameEvents.scene.sceneLoaded(island);
    }

    function nextIsland() { islandManager.loadNext(onIslandLoaded); }

    function previousIsland() { islandManager.loadPrevious(onIslandLoaded); }

    function gotoIsland(islandName) { islandManager.loadIsland(islandName, onIslandLoaded); }

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
