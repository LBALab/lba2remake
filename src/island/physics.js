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
    POSITION.copy(actor.physics.position);
    POSITION.applyMatrix4(scene.sceneNode.matrixWorld);
    const boxIntersection = processBoxIntersections(actor, layout, POSITION);
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
    const info = getGroundInfo(layout, POSITION.x, POSITION.z);
    actor.physics.position.y = info.height;
    if (actor.index == 0 && scene.isActive) {
        el.innerText = info.sound;
        if (tgtInfo && (tgtInfo.collision || boxIntersection)) {
            el.innerText += ' COLLISION' + (boxIntersection ? ' BOX' : '') + (tgtInfo.collision ? ' HEIGHTMAP' : '');
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

const ACTOR_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const ITRS_SIZE = new THREE.Vector3();
const CENTER1 = new THREE.Vector3();
const CENTER2 = new THREE.Vector3();
const DIFF = new THREE.Vector3();

function processBoxIntersections(actor, layout, position) {
    const boundingBox = actor.model.boundingBox;
    const section = findSection(layout, position.x, position.z);
    let intersected = false;
    if (section) {
        ACTOR_BOX.copy(boundingBox);
        ACTOR_BOX.translate(position);
        for (let i = 0; i < section.boundingBoxes.length; ++i) {
            const bb = section.boundingBoxes[i];
            if (ACTOR_BOX.intersectsBox(bb)) {
                intersected = true;
                INTERSECTION.copy(ACTOR_BOX);
                INTERSECTION.intersect(bb);
                INTERSECTION.size(ITRS_SIZE);
                ACTOR_BOX.center(CENTER1);
                bb.center(CENTER2);
                const dir = CENTER1.sub(CENTER2);
                if (ITRS_SIZE.x < ITRS_SIZE.y && ITRS_SIZE.x < ITRS_SIZE.z) {
                    DIFF.set(ITRS_SIZE.x * Math.sign(dir.x), 0, 0);
                } else if (ITRS_SIZE.y < ITRS_SIZE.x && ITRS_SIZE.y < ITRS_SIZE.z) {
                    DIFF.set(0, ITRS_SIZE.y * Math.sign(dir.y), 0);
                } else {
                    DIFF.set(0, 0, ITRS_SIZE.z * Math.sign(dir.z));
                }
                actor.physics.position.add(DIFF);
                position.add(DIFF);
                ACTOR_BOX.translate(DIFF);
            }
        }
    }
    return intersected;
}

const GRID_UNIT = 1 / 32;

function findSection(layout, x, z) {
    x = x - GRID_UNIT;
    return find(layout.groundSections, gs => x > gs.x * 2 && x <= gs.x * 2 + 2 && z >= gs.z * 2 && z <= gs.z * 2 + 2);
}