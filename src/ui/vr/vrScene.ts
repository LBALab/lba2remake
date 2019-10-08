import * as THREE from 'three';
import { getVR3DCamera } from '../../cameras/vr/vr3d';
import { addVRGuiNode } from '../../ui/vr/vrGui';

export function loadVRScene(renderer) {
    const threeScene = new THREE.Scene();
    const camera = getVR3DCamera();
    addVRGuiNode(renderer, camera.controlNode);
    threeScene.add(camera.controlNode);
    return { threeScene, camera };
}
