import THREE from 'three';
import {map} from 'lodash';
import {loadIsland} from '../island';
import {GameEvents} from './events';
import islandInfo from '../data/islands';

const islands = map(islandInfo, island => island.name);

const dummyScene = {
    name: 'dummy',
    threeScene: new THREE.Scene()
};

export function createSceneManager(camera) {
    const manager = {
        scene: dummyScene,
        dispose: () => {
            GameEvents.Scene.NextIsland.removeListener(nextIsland);
            GameEvents.Scene.PreviousIsland.removeListener(previousIsland);
            GameEvents.Scene.GotoIsland.removeListener(gotoIsland);
        }
    };

    function nextIsland() {
        const idx = (islands.indexOf(manager.scene.name) + 1) % islands.length;
        gotoIsland(islands[idx]);
    }

    function previousIsland() {
        let idx = islands.indexOf(manager.scene.name) - 1;
        if (idx < 0)
            idx = islands.length - 1;
        gotoIsland(islands[idx]);
    }

    function gotoIsland(islandName) {
        loadIsland(islandName, island => {
            console.log('Loaded: ', islandName);
            manager.scene.name = islandName;
            manager.scene.threeScene = island.scene;
            manager.scene.physics = island.physics;
            camera.position.x = island.startPosition[0];
            camera.position.z = island.startPosition[1];
        });
    }

    GameEvents.Scene.NextIsland.addListener(nextIsland);
    GameEvents.Scene.PreviousIsland.addListener(previousIsland);
    GameEvents.Scene.GotoIsland.addListener(gotoIsland);

    return manager;
}
