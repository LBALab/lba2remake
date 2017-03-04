import {find, each} from 'lodash';
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
    const itrs = getBoxIntersections(layout, POSITION);
    if (itrs.length > 0) {
        actor.physics.position.copy(actor.threeObject.position);
    }
    const info = getGroundInfo(layout, POSITION.x, POSITION.z);
    actor.physics.position.y = info.height;
    if (actor.index == 0 && scene.isActive) {
        el.innerText = info.sound;
        if (tgtInfo && (tgtInfo.collision || itrs.length > 0)) {
            el.innerText += ' COLLISION ' + itrs.join(',');
        }
    }
}

function getGroundInfo(layout, x, z) {
    const section = findSection(layout, x, z);
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

function getBoxIntersections(layout, position) {
    const intersections = [];
    const section = findSection(layout, position.x, position.z);
    if (section) {
        each(section.boundingBoxes, (bb, idx) => {
           if (bb.containsPoint(position)) {
               intersections.push(idx);
           }
        });
    }
    return intersections;
}

const GRID_UNIT = 1 / 32;

function findSection(layout, x, z) {
    x = x - GRID_UNIT;
    return find(layout.groundSections, gs => x > gs.x * 2 && x <= gs.x * 2 + 2 && z >= gs.z * 2 && z <= gs.z * 2 + 2);
}