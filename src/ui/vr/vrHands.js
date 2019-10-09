import * as THREE from 'three';

const controllers = [];
const targets = [];

const raycaster = new THREE.Raycaster();
const direction = new THREE.Vector3();
const position = new THREE.Vector3();
const offset = new THREE.Vector3();
const worldOrientation = new THREE.Euler(0, -Math.PI, 0);

export function createHands(renderer) {
    const handsRoot = new THREE.Object3D();
    handsRoot.name = 'Hands';

    const revTransform = new THREE.Object3D();
    revTransform.name = 'HandsRevTransform';
    revTransform.rotation.set(0, -Math.PI, 0);
    revTransform.updateMatrix();
    handsRoot.add(revTransform);

    for (let i = 0; i < 2; i += 1) {
        const controller = renderer.threeRenderer.vr.getController(i);
        if (controller) {
            const hand = createHand(i === 0 ? 'left' : 'right');
            controller.add(hand);
            revTransform.add(controller);

            const target = makeTgt();
            handsRoot.add(target);

            targets.push(target);
            controllers.push(controller);
        }
    }

    return handsRoot;
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

export function handlePicking(objects, ctx) {
    const {controlsState} = ctx.game;
    for (let i = 0; i < controllers.length; i += 1) {
        raycastCtrl(controllers[i], targets[i], controlsState.ctrlTriggers[i], objects, ctx);
    }
}

function raycastCtrl(controller, tgt, triggered, objects, ctx) {
    tgt.visible = false;
    if (controller) {
        direction.set(0, 0, -1);
        direction.applyQuaternion(controller.quaternion);
        direction.applyEuler(worldOrientation);
        offset.set(0, 0.02, 0);
        offset.applyQuaternion(controller.quaternion);
        position.setFromMatrixPosition(controller.matrixWorld);
        position.add(offset);
        raycaster.set(position, direction);
        const intersects = raycaster.intersectObjects(objects, true);
        if (intersects.length > 0) {
            const intersect = intersects[0];
            tgt.visible = true;
            tgt.position.copy(intersect.point);
            if (triggered) {
                const userData = intersect.object.userData;
                if (userData && userData.callback) {
                    userData.callback(ctx);
                }
            }
        }
    }
}
