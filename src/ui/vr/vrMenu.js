import * as THREE from 'three';
import { createScreen } from './vrScreen';

let leftCtrl = null;
let rightCtrl = null;
const menuItems = [];
const tgtLeft = makeTgt();
const tgtRight = makeTgt();

export function createMainMenu(renderer) {
    const newGame = createMenuItem({id: 'newgame', text: 'New Game', y: 75});
    menuItems.push(newGame);
    const teleport = createMenuItem({id: 'teleport', text: 'Teleport', y: -75});
    menuItems.push(teleport);
    const menu = new THREE.Object3D();
    const skybox = createSkybox();
    menu.add(skybox);
    menu.add(newGame);
    menu.add(teleport);
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
    menu.add(handsOrientation);
    menu.add(tgtLeft);
    menu.add(tgtRight);
    return menu;
}

export function updateMenu() {
    raycast(leftCtrl, tgtLeft);
    raycast(rightCtrl, tgtRight);
}

const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const position = new THREE.Vector3();
const offset = new THREE.Vector3();
const worldOrientation = new THREE.Euler(0, -Math.PI, 0);

function raycast(controller, tgt) {
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
