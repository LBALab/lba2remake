import * as THREE from 'three';
import {each, filter, findKey} from 'lodash';
import IslandAmbience from '../editor/areas/island/browser/ambience';
import LocationsNode from '../editor/areas/gameplay/locator/LocationsNode';
import { loadIslandScenery } from '../../island';
import { createScreen } from './vrScreen';
import { handlePicking, performRaycasting } from './picking';
import { drawFrame } from './vrUtils';
import sceneMapping from '../../island/data/sceneMapping';
import islandOffsets from './data/islandOffsets';
import {tr} from '../../lang';
import { WORLD_SCALE_B, WORLD_SIZE } from '../../utils/lba';

let islandWrapper = null;
let activeIsland = null;
let loading = false;
let selectedPlanet = 0;
let selectedIsland = 0;
let sectionsPlanes = null;
let light = null;
const planetButtons = [];
const islandButtons = [];
const intersectObjects = [];
const arrow = createArrow();
const invWorldMat = new THREE.Matrix4();

const planets = LocationsNode.children;

export function createTeleportMenu(sceneLight) {
    const teleportMenu = new THREE.Object3D();

    for (let i = 0; i < 4; i += 1) {
        const p = createPlanetItem({
            idx: i,
            text: planets[i].name,
            icon: planets[i].icon,
            x: -(i - 1.5) * 240,
            y: 50,
            callback: () => {
                if (selectedPlanet !== i) {
                    selectedPlanet = i;
                    selectedIsland = 0;
                    each(planetButtons, pb => pb.draw());
                    refreshIslandButtons(teleportMenu);
                    loadIsland(planets[i].children[0].id);
                }
            }
        });
        teleportMenu.add(p.mesh);
        planetButtons.push(p);
        intersectObjects.push(p.mesh);
    }

    refreshIslandButtons(teleportMenu);

    const backButton = createButton({
        text: tr('backToMainMenu'),
        y: 230,
        callback: () => {
            history.back();
        }
    });
    teleportMenu.add(backButton);
    intersectObjects.push(backButton);

    islandWrapper = new THREE.Object3D();
    const scale = 0.5 / WORLD_SIZE;
    islandWrapper.scale.set(scale, scale, scale);

    teleportMenu.add(islandWrapper);

    arrow.visible = false;
    teleportMenu.add(arrow);

    light = sceneLight;

    return teleportMenu;
}

function refreshIslandButtons(teleportMenu) {
    const planet = planets[selectedPlanet];
    const islands = filter(planet.children, n => !n.name.match(/^\[DEMO\]/));
    // cleanup
    for (let i = 0; i < islandButtons.length; i += 1) {
        teleportMenu.remove(islandButtons[i].mesh);
        const idx = intersectObjects.indexOf(islandButtons[i].mesh);
        intersectObjects.splice(idx, 1);
    }
    islandButtons.length = 0;
    for (let i = 0; i < islands.length; i += 1) {
        let x;
        let y;
        if (islands.length <= 3) {
            const offset = (islands.length - 1) * 0.5;
            x = -(i - offset) * 320;
            y = -130;
        } else if (i < 3) {
            x = -(i - 1) * 320;
            y = -130;
        } else {
            const offset = (islands.length - 4) * 0.5;
            x = -((i - 3) - offset) * 320;
            y = -230;
        }

        const isl = createIslandItem({
            idx: i,
            text: islands[i].name,
            x,
            y,
            callback: () => {
                selectedIsland = i;
                each(islandButtons, ib => ib.draw());
                loadIsland(islands[i].id);
            }
        });
        teleportMenu.add(isl.mesh);
        islandButtons.push(isl);
        intersectObjects.push(isl.mesh);
    }
}

async function loadIsland(name) {
    loading = true;
    const ambience = IslandAmbience[name];
    const island = await loadIslandScenery({preview: true}, name, ambience);
    island.name = name;
    if (activeIsland) {
        islandWrapper.remove(activeIsland.threeObject);
    }
    activeIsland = island;
    islandWrapper.add(island.threeObject);
    sectionsPlanes = island.threeObject.getObjectByName('sectionsPlanes');
    light.position.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -(ambience.lightingAlpha * 2 * Math.PI) / 0x1000
    );
    light.position.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        (-(ambience.lightingBeta * 2 * Math.PI) / 0x1000) + Math.PI
    );
    const offset = islandOffsets[name];
    islandWrapper.position.set(offset.x, -1.4, offset.z);
    islandWrapper.quaternion.setFromEuler(
        new THREE.Euler(0, THREE.MathUtils.degToRad(offset.angle), 0)
    );
    islandWrapper.updateMatrixWorld();
    invWorldMat.getInverse(islandWrapper.matrixWorld);

    loading = false;
}

const clock = new THREE.Clock(false);
clock.start();

export function updateTeleportMenu(game, sceneManager, pickingTarget) {
    const time = {
        delta: Math.min(clock.getDelta(), 0.05),
        elapsed: clock.getElapsedTime()
    };
    if (activeIsland === null && !loading) {
        loadIsland('CITABAU');
    }
    const hit = handlePicking(intersectObjects, {
        game,
        pickingTarget
    });
    if (activeIsland) {
        activeIsland.update(null, null, time);
        arrow.visible = false;
        if (!hit) {
            performRaycasting(
                sectionsPlanes.children,
                {game, sceneManager},
                handleGroundIntersection
            );
        }
    }

    // The following commented code is used for adjusting the island offset
    /*
    const {controlsState} = game;
    const cv = controlsState.controlVector;
    angle += controlsState.angle * 0.01;
    islandWrapper.position.add(new THREE.Vector3(cv.x * 0.02, 0, -cv.y * 0.02));
    islandWrapper.quaternion.setFromEuler(new THREE.Euler(0, angle, 0));
    if (controlsState.action) {
        console.log(activeIsland.name, {
            x: islandWrapper.position.x,
            z: islandWrapper.position.z,
            angle: THREE.MathUtils.radToDeg(angle)
        });
    }
    */
}

const POS = new THREE.Vector3();

function handleGroundIntersection(intersect, triggered, {game, sceneManager}) {
    arrow.visible = true;
    arrow.position.copy(intersect.point);
    POS.copy(intersect.point);
    POS.applyMatrix4(invWorldMat);
    const groundInfo = activeIsland.physics.getGroundInfo(POS);
    arrow.position.y += groundInfo.height * (0.5 / WORLD_SIZE);
    POS.y = groundInfo.height;
    if (triggered) {
        const section = intersect.object.userData.info;
        const scene = findKey(
            sceneMapping,
            s => s.island === activeIsland.name && s.section === section.index
        );
        if (scene !== undefined) {
            game.resume();
            sceneManager.hideMenuAndGoto(Number(scene), false)
                .then((newScene) => {
                    const newHero = newScene.actors[0];
                    POS.add(new THREE.Vector3(
                        -((section.x * 64) + 1) * WORLD_SCALE_B,
                        0,
                        -(section.z * 64) * WORLD_SCALE_B
                    ));
                    newHero.physics.position.copy(POS);
                    newHero.threeObject.position.copy(POS);
                });
            game.setUiState({teleportMenu: false});
            history.pushState({id: 'game'}, '');
        }
    }
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

    let hovering = false;

    function draw() {
        const selected = idx === selectedPlanet;
        drawFrame(ctx, 0, 0, width, height, selected);
        ctx.font = '20px LBA';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = selected || hovering ? 'white' : 'grey';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(text, width / 2, 200);
        ctx.drawImage(icon, 20, 20, 160, 160);
        (mesh.material as THREE.MeshBasicMaterial).map.needsUpdate = true;
    }

    icon.onload = () => draw();

    mesh.visible = true;
    mesh.userData = {
        callback,
        onEnter: () => {
            hovering = true;
            draw();
        },
        onLeave: () => {
            hovering = false;
            draw();
        }
    };

    return {mesh, draw};
}

function createIslandItem({x, y, text, idx, callback}) {
    const width = 300;
    const height = 80;
    const {ctx, mesh} = createScreen({
        width,
        height,
        x,
        y,
    });

    const icon = new Image(40, 40);
    icon.src = 'editor/icons/locations/island.svg';

    let hovering = false;

    const draw = () => {
        const selected = idx === selectedIsland;
        drawFrame(ctx, 0, 0, width, height, selected);
        ctx.font = '20px LBA';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = selected || hovering ? 'white' : 'grey';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(text, 175, 40);
        const metrics = ctx.measureText(text);
        ctx.drawImage(icon, 115 - (metrics.width * 0.5), 20, 40, 40);
        (mesh.material as THREE.MeshBasicMaterial).map.needsUpdate = true;
    };

    icon.onload = () => draw();

    mesh.visible = true;
    mesh.userData = {
        callback,
        onEnter: () => {
            hovering = true;
            draw();
        },
        onLeave: () => {
            hovering = false;
            draw();
        }
    };

    return {mesh, draw};
}

interface ButtonOptions {
    x?: number;
    y?: number;
    text: string;
    callback?: Function;
}

function createButton({x, y, text, callback}: ButtonOptions) {
    const width = 500;
    const height = 75;
    const {ctx, mesh} = createScreen({
        width,
        height,
        x,
        y,
    });
    const draw = (hovering = false) => {
        drawFrame(ctx, 0, 0, width, height, hovering);
        ctx.font = '30px LBA';
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        (mesh.material as THREE.MeshBasicMaterial).map.needsUpdate = true;
    };
    draw();
    mesh.visible = true;
    mesh.userData = {
        callback,
        onEnter: () => draw(true),
        onLeave: () => draw()
    };

    return mesh;
}

function createArrow() {
    const newArrow = new THREE.Object3D();
    const material = new THREE.MeshPhongMaterial({color: 0xFF0000});

    const cnGeometry = new THREE.ConeGeometry(5, 12, 32);
    const cone = new THREE.Mesh(cnGeometry, material);
    cone.quaternion.setFromEuler(new THREE.Euler(Math.PI, 0, 0));
    cone.position.set(0, 6, 0);
    newArrow.add(cone);

    const clGeometry = new THREE.CylinderGeometry(1, 1, 10, 32);
    const cylinder = new THREE.Mesh(clGeometry, material);
    cylinder.position.set(0, 16, 0);
    newArrow.add(cylinder);

    newArrow.scale.set(0.01, 0.01, 0.01);

    return newArrow;
}
