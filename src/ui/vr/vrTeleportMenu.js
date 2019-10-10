import * as THREE from 'three';
import {each} from 'lodash';
import IslandAmbience from '../editor/areas/island/browser/ambience';
import LocationsNode from '../editor/areas/gameplay/locator/LocationsNode';
import { loadIslandScenery } from '../../island';
import { createScreen } from './vrScreen';
import { handlePicking } from './vrHands';
import { drawFrame } from './vrUtils';

let islandWrapper = null;
let activeIsland = null;
let loading = false;
let selectedPlanet = 0;
const planetButtons = [];
const planetButtonObjects = [];

const planets = LocationsNode.children;

const planetDefaultIsland = [
    'CITABAU',
    'EMERAUDE',
    'OTRINGAL',
    'PLATFORM'
];

export function createTeleportMenu() {
    const teleportMenu = new THREE.Object3D();

    for (let i = 0; i < 4; i += 1) {
        const p = createPlanetItem({
            idx: i,
            text: planets[i].name,
            icon: planets[i].icon,
            x: -(i - 1.5) * 240,
            y: 100,
            // eslint-disable-next-line no-loop-func
            callback: () => {
                selectedPlanet = i;
                each(planetButtons, pb => pb.draw());
                loadIsland(planetDefaultIsland[i]);
            }
        });
        teleportMenu.add(p.mesh);
        planetButtons.push(p);
        planetButtonObjects.push(p.mesh);
    }

    islandWrapper = new THREE.Object3D();
    islandWrapper.scale.set(0.02, 0.02, 0.02);
    islandWrapper.quaternion.setFromEuler(new THREE.Euler(0, Math.PI, 0));
    islandWrapper.position.set(0, -1.4, 1.4);

    teleportMenu.add(islandWrapper);

    return teleportMenu;
}

async function loadIsland(name) {
    loading = true;
    const ambience = IslandAmbience[name];
    const island = await loadIslandScenery({skipSky: true}, name, ambience);
    island.name = name;
    if (activeIsland) {
        islandWrapper.remove(activeIsland.threeObject);
    }
    activeIsland = island;
    islandWrapper.add(island.threeObject);
    loading = false;
}

const clock = new THREE.Clock(false);
clock.start();

export function updateTeleportMenu(game) {
    const time = {
        delta: Math.min(clock.getDelta(), 0.05),
        elapsed: clock.getElapsedTime()
    };
    if (activeIsland === null && !loading) {
        loadIsland('CITABAU');
    }
    if (activeIsland) {
        activeIsland.update(null, null, time);
    }
    handlePicking(planetButtonObjects, {game});
}

function createPlanetItem({x, y, text, icon: iconSrc, idx, callback}) {
    const width = 200;
    const height = 220;
    const {ctx, mesh} = createScreen({
        width,
        height,
        x,
        y,
    });

    const icon = new Image(160, 160);
    icon.src = iconSrc;

    function draw() {
        const selected = idx === selectedPlanet;
        drawFrame(ctx, 0, 0, width, height, selected);
        ctx.font = '20px LBA';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = selected ? 'white' : 'grey';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(text, width / 2, 200);
        ctx.drawImage(icon, 20, 20, 160, 160);
        mesh.material.map.needsUpdate = true;
    }

    icon.onload = () => draw();

    mesh.visible = true;
    mesh.userData = { callback };

    return {mesh, draw};
}
