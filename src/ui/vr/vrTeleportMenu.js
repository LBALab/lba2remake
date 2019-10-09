import * as THREE from 'three';
import IslandAmbience from '../editor/areas/island/browser/ambience';
import { loadIslandScenery } from '../../island';
// import { createScreen } from './vrScreen';

let islandWrapper = null;
let activeIsland = null;
let loading = false;

export function createTeleportMenu() {
    const teleportMenu = new THREE.Object3D();

    islandWrapper = new THREE.Object3D();
    islandWrapper.scale.set(0.015, 0.015, 0.015);
    islandWrapper.quaternion.setFromEuler(new THREE.Euler(0, Math.PI, 0));
    islandWrapper.position.set(0, -1.4, 1.4);

    teleportMenu.add(islandWrapper);

    return teleportMenu;
}

async function loadIsland(name) {
    const ambience = IslandAmbience[name];
    const island = await loadIslandScenery({skipSky: true}, name, ambience);
    return island;
}

const clock = new THREE.Clock(false);
clock.start();

export function updateTeleportMenu() {
    const time = {
        delta: Math.min(clock.getDelta(), 0.05),
        elapsed: clock.getElapsedTime()
    };
    if (activeIsland === null && !loading) {
        loading = true;
        loadIsland('CITABAU').then((island) => {
            if (activeIsland) {
                islandWrapper.remove(activeIsland.threeObject);
            }
            activeIsland = island;
            islandWrapper.add(island.threeObject);
            loading = false;
        });
    }
    if (activeIsland) {
        activeIsland.update(null, null, time);
    }
}
