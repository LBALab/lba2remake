import * as THREE from 'three';
import { createScreen } from './vrScreen';

let mainMenu = null;
let leftCtrl = null;
let rightCtrl = null;
const menuItems = [];
const tgtLeft = makeTgt();
const tgtRight = makeTgt();

export function createMenu(renderer) {
    const newGame = createMenuItem({id: 'newgame', text: 'New Game', y: 75});
    menuItems.push(newGame);
    const teleport = createMenuItem({id: 'teleport', text: 'Teleport', y: -75});
    menuItems.push(teleport);
    mainMenu = new THREE.Object3D();
    const skybox = createSkybox();
    mainMenu.add(skybox);
    mainMenu.add(newGame);
    mainMenu.add(teleport);
    const handsOrientation = new THREE.Object3D();
    handsOrientation.name = 'RevAxisTransform';
    handsOrientation.rotation.set(0, -Math.PI, 0);
    handsOrientation.updateMatrix();
    leftCtrl = renderer.threeRenderer.vr.getController(0);
    if (leftCtrl) {
        const leftHand = createHand('left');
        leftCtrl.add(leftHand);
        handsOrientation.add(leftCtrl);
    }
    rightCtrl = renderer.threeRenderer.vr.getController(1);
    window.rightCtrl = rightCtrl;
    if (rightCtrl) {
        const rightHand = createHand('right');
        rightCtrl.add(rightHand);
        handsOrientation.add(rightCtrl);
    }
    mainMenu.add(handsOrientation);
    mainMenu.add(tgtLeft);
    mainMenu.add(tgtRight);
    return mainMenu;
}

export function updateMenu(game, sceneManager) {
    const showMenu = game.getUiState().showMenu;
    mainMenu.visible = showMenu;
    if (showMenu) {
        raycast(leftCtrl, tgtLeft, game, sceneManager);
        raycast(rightCtrl, tgtRight, game, sceneManager);
    }
}

const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const position = new THREE.Vector3();
const offset = new THREE.Vector3();
const worldOrientation = new THREE.Euler(0, -Math.PI, 0);

function raycast(controller, tgt, game, sceneManager) {
    tgt.visible = false;
    if (controller) {
        direction.set(0, 0, -1);
        direction.applyQuaternion(controller.quaternion);
        direction.applyEuler(worldOrientation);
        // offset.set(0, 0, -0.05);
        // offset.applyQuaternion(controller.quaternion);
        position.setFromMatrixPosition(controller.matrixWorld);
        position.add(offset);
        raycaster.set(position, direction);
        const intersects = raycaster.intersectObjects(menuItems, true);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            tgt.visible = true;
            tgt.position.copy(intersect.point);
            if (game.controlsState.menuTapped) {
                if (intersect.object.name === 'newgame') {
                    game.resume();
                    game.resetState();
                    sceneManager.hideMenuAndGoto(0, false);
                } else if (intersect.object.name === 'teleport') {
                    game.setUiState({ teleportMenu: true });
                }
            }
        }
    }
}

function createMenuItem({x, y, text, id}) {
    const width = 800;
    const height = 100;
    const {ctx, mesh} = createScreen({
        width,
        height,
        x,
        y,
    });

    ctx.font = '48px LBA';
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(97, 206, 206, 0.8)';
    ctx.fillStyle = 'rgba(32, 162, 255, 0.5)';
    ctx.lineWidth = 4;
    roundRect(ctx, 2, 2, width - 4, height - 4, 20);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText(text, width / 2, height / 2);
    mesh.material.map.needsUpdate = true;
    mesh.visible = true;
    mesh.name = id;

    return mesh;
}

function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.strokeStyle = 'rgb(65,174,174)';
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function createSkybox() {
    const geometry = new THREE.BoxBufferGeometry(4, 4, 4);
    const material = new THREE.MeshBasicMaterial({
        color: 0x1E3F43,
        side: THREE.BackSide,
    });
    return new THREE.Mesh(geometry, material);
}

function createHand(type) {
    const color = type === 'left' ? 0x0000FF : 0xFF0000;
    const geometry = new THREE.BoxGeometry(0.02, 0.06, 0.06);
    const material = new THREE.MeshBasicMaterial({color});
    const fingerGeom = new THREE.BoxGeometry(0.02, 0.02, 0.04);
    const pointerGeom = new THREE.ConeGeometry(0.005, 0.3, 4);
    const pointerMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.5
    });
    const palm = new THREE.Mesh(geometry, material);
    const finger = new THREE.Mesh(fingerGeom, material);
    const pointer = new THREE.Mesh(pointerGeom, pointerMaterial);
    finger.position.set(0, 0.02, -0.05);
    pointer.position.set(0, 0.02, -0.15);
    pointer.rotation.x = -Math.PI / 2;
    const hand = new THREE.Object3D();
    hand.add(palm);
    hand.add(finger);
    hand.add(pointer);
    return hand;
}

function makeTgt() {
    const geom = new THREE.SphereGeometry(0.01, 6, 4);
    const mat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8
    });
    const tgt = new THREE.Mesh(geom, mat);
    tgt.visible = false;
    return tgt;
}
