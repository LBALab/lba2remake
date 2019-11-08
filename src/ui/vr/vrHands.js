import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { find } from 'lodash';

let handsRoot = null;

const controllers = [];
const targets = [];

const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const position = new THREE.Vector3();
const offset = new THREE.Vector3();
const hovering = new Set();
const hitOnFrame = new Set();

const loader = new GLTFLoader();

export function getOrCreateHands(renderer) {
    if (!handsRoot) {
        handsRoot = new THREE.Object3D();
        handsRoot.name = 'Hands';

        const revTransform = new THREE.Object3D();
        revTransform.name = 'HandsRevTransform';
        revTransform.rotation.set(0, -Math.PI, 0);
        revTransform.updateMatrix();
        handsRoot.add(revTransform);

        for (let i = 0; i < 2; i += 1) {
            const controller = renderer.threeRenderer.vr.getController(i);
            if (controller) {
                const hand = createHand(i === 0 ? 'right' : 'left');
                controller.add(hand);
                revTransform.add(controller);

                const target = makeTgt();
                handsRoot.add(target);

                targets.push(target);
                controllers.push(controller);
            }
        }
    }

    return handsRoot;
}

function createHand(type) {
    const pointerGeom = new THREE.ConeGeometry(0.005, 0.3, 4);
    const pointerMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.5
    });
    const pointer = new THREE.Mesh(pointerGeom, pointerMaterial);
    pointer.position.set(0, 0.02, -0.15);
    pointer.rotation.x = -Math.PI / 2;
    const hand = new THREE.Object3D();
    loader.load('models/hands.glb', (gltf) => {
        const mesh = gltf.scene.getObjectByName(`${type}_hand`);
        hand.add(mesh);
    });

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

export function handlePicking(objects, ctx) {
    hitOnFrame.clear();
    for (let i = 0; i < targets.length; i += 1) {
        targets[i].visible = false;
    }
    performRaycasting(objects, ctx, menuHandler);
    hovering.forEach((uuid) => {
        if (!hitOnFrame.has(uuid)) {
            hovering.delete(uuid);
            const object = find(objects, o => o.uuid === uuid);
            if (object && object.userData && object.userData.onLeave) {
                object.userData.onLeave();
            }
        }
    });
}

function menuHandler(idx, intersect, triggered, ctx) {
    const tgt = targets[idx];
    const object = intersect.object;
    tgt.visible = true;
    tgt.position.copy(intersect.point);
    if (triggered) {
        if (object.userData && object.userData.callback) {
            object.userData.callback(ctx);
        }
    }
    if (!hovering.has(object.uuid)) {
        hovering.add(object.uuid);
        if (object.userData && object.userData.onEnter) {
            object.userData.onEnter();
        }
    }
}

export function performRaycasting(objects, ctx, handler) {
    for (let i = 0; i < controllers.length; i += 1) {
        if (controllers[i]) {
            raycastCtrl(
                i,
                objects,
                handler,
                ctx
            );
        }
    }
}

const rotation = new THREE.Matrix4();

function raycastCtrl(idx, objects, handler, ctx) {
    const {controlsState} = ctx.game;
    const triggered = controlsState.ctrlTriggers[idx];
    const controller = controllers[idx];

    direction.set(0, 0, -1);
    rotation.extractRotation(controller.matrixWorld);
    direction.applyMatrix4(rotation);
    offset.set(0, 0.02, 0);
    offset.applyMatrix4(rotation);
    position.setFromMatrixPosition(controller.matrixWorld);
    position.add(offset);
    raycaster.set(position, direction);
    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];
        hitOnFrame.add(intersect.object.uuid);
        handler(idx, intersect, triggered, ctx);
    }
}
