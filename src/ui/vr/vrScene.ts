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
        const leftHand = createHand(0x0000FF);
        leftCtrl.add(leftHand);
        handsOrientation.add(leftCtrl);
    }
    const rightCtrl = renderer.threeRenderer.vr.getController(1);
    if (rightCtrl) {
        const rightHand = createHand(0xFF0000);
        rightCtrl.add(rightHand);
        handsOrientation.add(rightCtrl);
    }
    threeScene.add(camera.controlNode);
    threeScene.add(handsOrientation);
    return { threeScene, camera };
}

function createHand(color) {
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({color});
    return new THREE.Mesh(geometry, material);
}
