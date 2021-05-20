import * as THREE from 'three';

import { get3DOrbitCamera } from '../editor/areas/model/utils/orbitCamera';
import Renderer from '../../renderer';
import AnimState from '../../model/anim/AnimState';
import { loadModel } from '../../model';
import { loadInventoryModel } from '../../model/inventory';

const envInfo = {
    skyColor: [0, 0, 0]
};

const ambience = {
    lightingAlpha: 309,
    lightingBeta: 2500
};

const createOverlayScene = (rval = -1) => {
    const camera = get3DOrbitCamera(0.3, rval);
    const scene = {
        camera,
        threeScene: new THREE.Scene()
    };
    scene.threeScene.add(camera.controlNode);
    return scene;
};

const createOverlayClock = () => {
    return new THREE.Clock(false);
};

const createOverlayCanvas = (className: string) => {
    const canvas = document.createElement('canvas');
    canvas.tabIndex = 0;
    canvas.className = className;
    return canvas;
};

const createOverlayRenderer = (canvas: any, type: string) => {
    return new Renderer(canvas, type, { alpha: true });
};

const loadSceneModel = async (sce, b, bodyIndex, anims) => {
    const m = await loadModel(
        b,
        bodyIndex,
        0,
        anims,
        envInfo,
        ambience
    );

    if (sce &&
        sce.threeScene &&
        sce.threeScene.children &&
        sce.threeScene.children.length > 1) {
        sce.threeScene.remove(sce.threeScene.children[1]);
    }
    sce.threeScene.add(m.mesh);

    return m;
};

const loadSceneInventoryModel = async (sce, invId) => {
    const m = await loadInventoryModel(
        {},
        invId,
        envInfo,
        ambience
    );

    if (sce &&
        sce.threeScene &&
        sce.threeScene.children &&
        sce.threeScene.children.length > 1) {
        sce.threeScene.remove(sce.threeScene.children[1]);
    }
    sce.threeScene.add(m.mesh);
    return m;
};

const updateAnimModel = (m, animState: AnimState, entityIdx, animIdx, time) => {
    animState.update(time, entityIdx, animIdx);
    const q = new THREE.Quaternion();
    const angle = animState.rotation.y * time.delta;
    q.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angle
    );
    m.mesh.quaternion.multiply(q);
};

export {
    createOverlayScene,
    createOverlayClock,
    createOverlayCanvas,
    createOverlayRenderer,
    loadSceneModel,
    updateAnimModel,
    loadSceneInventoryModel,
};
