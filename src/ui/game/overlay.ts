import * as THREE from 'three';

import { get3DOrbitCamera } from '../editor/areas/model/utils/orbitCamera';
import Renderer from '../../renderer';
import { getAnim } from '../../model/entity';
import { loadAnim } from '../../model/anim';
import { updateKeyframeInterpolation, updateKeyframe } from '../../model/animState';
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
    return new Renderer(
        { webgl2: true },
        canvas,
        { alpha: true },
        type,
    );
};

const loadSceneModel = async (sce, b, bodyIndex, anims) => {
    const m = await loadModel(
        {},
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

const loadSceneInventoryModel = async (sce, b) => {
    const m = await loadInventoryModel(
        {},
        b,
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

const updateAnimModel = (m, anims, entityIdx, animIdx, time) => {
    const entity = m.entities[entityIdx];
    const entityAnim = getAnim(entity, animIdx);
    let interpolate = false;
    if (entityAnim !== null) {
        const realAnimIdx = entityAnim.animIndex;
        const anim = loadAnim(m, m.anims, realAnimIdx);
        anims.loopFrame = anim.loopFrame;
        if (anims.prevRealAnimIdx !== -1 && realAnimIdx !== anims.prevRealAnimIdx) {
            updateKeyframeInterpolation(anim, anims, time, realAnimIdx);
            interpolate = true;
        }
        if (realAnimIdx === anims.realAnimIdx || anims.realAnimIdx === -1) {
            updateKeyframe(anim, anims, time, realAnimIdx);
        }
        const q = new THREE.Quaternion();
        const delta = time.delta * 1000;
        let angle = 0;
        if (anims.keyframeLength > 0) {
            angle = (anims.rotation.y * delta) / anims.keyframeLength;
        }
        q.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            angle
        );
        m.mesh.quaternion.multiply(q);
    }
    return interpolate;
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
