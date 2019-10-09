import * as THREE from 'three';
import {map} from 'lodash';
import IslandAmbience from '../editor/areas/island/browser/ambience';
import LocationsNode from '../editor/areas/gameplay/locator/LocationsNode';
import { loadIslandScenery } from '../../island';
import { createScreen } from './vrScreen';

let islandWrapper = null;
let activeIsland = null;
let loading = false;

const islands = map(IslandAmbience, (c, key) => key);
const planets = LocationsNode.children;

export function createTeleportMenu() {
    const teleportMenu = new THREE.Object3D();

    for (let i = 0; i < 4; i += 1) {
        const p = createPlanetItem({
            text: planets[i].name,
            icon: planets[i].icon,
            x: (i - 1.5) * 240,
            y: 100
        });
        teleportMenu.add(p);
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
        loadIsland(islands[0]);
    }
    if (game.controlsState.rightTrigger && !loading) {
        let idx = 0;
        if (activeIsland) {
            idx = islands.indexOf(activeIsland.name);
        }
        idx = (idx + 1) % islands.length;
        loadIsland(islands[idx]);
    }
    if (activeIsland) {
        activeIsland.update(null, null, time);
    }
}

function createPlanetItem({x, y, text, icon: iconSrc, callback}) {
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

    ctx.font = '20px LBA';
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgb(97, 206, 206)';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 4;
    roundRect(ctx, 2, 2, width - 4, height - 4, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText(text, width / 2, 200);

    mesh.material.map.needsUpdate = true;
    mesh.visible = true;
    mesh.userData = { callback };

    icon.onload = () => {
        ctx.drawImage(icon, 20, 20, 160, 160);
        mesh.material.map.needsUpdate = true;
    };

    return mesh;
}

function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
