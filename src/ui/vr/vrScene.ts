import * as THREE from 'three';
import { getVR3DCamera } from '../../cameras/vr/vr3d';
import { addVRGuiNode } from '../../ui/vr/vrGui';

export function loadVRScene(renderer) {
    const threeScene = new THREE.Scene();
    const camera = getVR3DCamera();
    addVRGuiNode(renderer, camera.controlNode);
    const handsOrientation = new THREE.Object3D();
    handsOrientation.name = 'RevAxisTransform';
    handsOrientation.rotation.set(0, -Math.PI, 0);
    handsOrientation.updateMatrix();
    const leftCtrl = renderer.threeRenderer.vr.getController(0);
    if (leftCtrl) {
        const leftHand = createHand('left');
        leftCtrl.add(leftHand);
        handsOrientation.add(leftCtrl);
    }
    const rightCtrl = renderer.threeRenderer.vr.getController(1);
    if (rightCtrl) {
        const rightHand = createHand('right');
        rightCtrl.add(rightHand);
        handsOrientation.add(rightCtrl);
    }
    threeScene.add(camera.controlNode);
    threeScene.add(handsOrientation);
    return { threeScene, camera };
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
