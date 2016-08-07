import {GameEvents} from './events';
import {loadIslandManager} from '../island';

export function createSceneManager(hero) {
    const islandManager = loadIslandManager();

    function onIslandLoaded(island) {
        console.log('Loaded: ', island.name);
        GameEvents.Scene.SceneLoaded.trigger(island);
    }

    function nextIsland() { islandManager.loadNext(onIslandLoaded); }

    function previousIsland() { islandManager.loadPrevious(onIslandLoaded); }

    function gotoIsland(islandName) { islandManager.loadIsland(islandName, onIslandLoaded); }

    GameEvents.Scene.NextIsland.addListener(nextIsland);
    GameEvents.Scene.PreviousIsland.addListener(previousIsland);
    GameEvents.Scene.GotoIsland.addListener(gotoIsland);

    return {
        dispose: () => {
            GameEvents.Scene.NextIsland.removeListener(nextIsland);
            GameEvents.Scene.PreviousIsland.removeListener(previousIsland);
            GameEvents.Scene.GotoIsland.removeListener(gotoIsland);
        },
        currentScene: islandManager.currentIsland.bind(islandManager)
    };
}
