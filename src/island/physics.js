import {find} from 'lodash';
import THREE from 'three';
import {getTriangleFromPos} from './ground';

export function loadIslandPhysics(layout) {
    return {
        getGroundInfo: getGroundInfo.bind(null, layout),
        processCollisions: processCollisions.bind(null, layout)
    }
}

const TGT = new THREE.Vector3();
const POSITION = new THREE.Vector3();

const el = document.createElement('div');
el.style.background = 'black';
el.style.color = 'white';
el.style.position = 'fixed';
document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(el);
});

function processCollisions(layout, scene, actor) {
    TGT.copy(actor.physics.position);
    TGT.sub(actor.threeObject.position);
    TGT.setY(0);
    let tgtInfo = null;
    if (TGT.lengthSq() != 0) {
        TGT.normalize();
        TGT.multiplyScalar(0.02);
        TGT.add(actor.threeObject.position);
        TGT.applyMatrix4(scene.sceneNode.matrixWorld);
        tgtInfo = getGroundInfo(layout, TGT.x, TGT.z);
        if (tgtInfo.collision) {
            actor.physics.position.copy(actor.threeObject.position);
        }
    }
    POSITION.copy(actor.physics.position);
    POSITION.applyMatrix4(scene.sceneNode.matrixWorld);
    const info = getGroundInfo(layout, POSITION.x, POSITION.z);
    const height = info.height;
    actor.physics.position.y = height;
    actor.threeObject.position.y = height;
    if (actor.model) {
        actor.model.flag.value = tgtInfo && tgtInfo.collision || 0.0;
    }
    if (actor.index == 0 && scene.isActive) {
        el.innerText = info.sound;
        if (tgtInfo) {
            el.innerText += ` [${TGT.x.toFixed(2)}, ${TGT.z.toFixed(2)}] [${POSITION.x.toFixed(2)}, ${POSITION.z.toFixed(2)}]`;
        }
    }
}

function getGroundInfo(layout, x, z) {
    const e = 1 / 32;
    const section = find(layout.groundSections, gs => x - e > gs.x * 2 && x - e <= gs.x * 2 + 2 && z >= gs.z * 2 && z <= gs.z * 2 + 2);
    if (section) {
        const xLocal = (2.0 - (x - section.x * 2)) * 32 + 1;
        const zLocal = (z - section.z * 2) * 32;
        return getTriangleFromPos(section, xLocal, zLocal);
    } else {
        return {
            height: 0,
            sound: 0,
            collision: 0
        };
    }
}