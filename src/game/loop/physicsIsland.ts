import * as THREE from 'three';
import {getTriangleFromPos} from '../../island/ground';

export function loadIslandPhysics(sections) {
    return {
        processCollisions: processCollisions.bind(null, sections),
        processCameraCollisions: processCameraCollisions.bind(null, sections),
        getGroundInfo: position => getGroundInfo(findSection(sections, position), position)
    };
}

const TGT = new THREE.Vector3();
const POSITION = new THREE.Vector3();
const FLAGS = {
    hitObject: false
};

function processCameraCollisions(sections, camPosition, groundOffset = 3.6, objOffset = 4.8) {
    const section = findSection(sections, camPosition);
    const ground = getGroundInfo(section, camPosition);
    camPosition.y = Math.max(ground.height + groundOffset, camPosition.y);
    if (section) {
        for (let i = 0; i < section.boundingBoxes.length; i += 1) {
            const bb = section.boundingBoxes[i];
            if (bb.containsPoint(camPosition)) {
                camPosition.y = bb.max.y + objOffset;
            }
        }
    }
}

function processCollisions(sections, scene, actor) {
    POSITION.copy(actor.physics.position);
    POSITION.applyMatrix4(scene.sceneNode.matrixWorld);

    const section = findSection(sections, POSITION);

    FLAGS.hitObject = false;
    const ground = getGround(section, POSITION);
    const height = ground.height;

    let isTouchingGround = true;
    if (actor.physics.position.y > height) {
        isTouchingGround = false;
    }
    actor.physics.position.y = Math.max(height, actor.physics.position.y);
    POSITION.y = actor.physics.position.y;
    actor.animState.floorSound = -1;

    if (section) {
        actor.animState.floorSound = ground.sound;

        isTouchingGround = processBoxIntersections(section, actor, POSITION, isTouchingGround);
        if (!FLAGS.hitObject) {
            TGT.copy(actor.physics.position);
            TGT.sub(actor.threeObject.position);
            TGT.setY(0);
            if (TGT.lengthSq() !== 0) {
                TGT.normalize();
                TGT.multiplyScalar(0.12);
                TGT.add(actor.threeObject.position);
                TGT.applyMatrix4(scene.sceneNode.matrixWorld);
                const gInfo = getGroundInfo(section, TGT);
                if (gInfo && gInfo.collision && isTouchingGround) {
                    actor.physics.position.copy(actor.threeObject.position);
                }
            }
        }
    }
}

const DEFAULT_GROUND = {
    height: 0,
    sound: null,
    collision: null
};

function getGround(section, position) {
    if (!section)
        return DEFAULT_GROUND;

    for (let i = 0; i < section.boundingBoxes.length; i += 1) {
        const bb = section.boundingBoxes[i];
        if (position.x >= bb.min.x && position.x <= bb.max.x
            && position.z >= bb.min.z && position.z <= bb.max.z
            && position.y <= bb.max.y && position.y > bb.max.y - 0.015) {
            FLAGS.hitObject = true;
            return {
                height: bb.max.y,
                sound: null,
                collision: null
            };
        }
    }
    return getGroundInfo(section, position);
}

const GRID_SCALE = 64 / 40;

function getGroundInfo(section, position) {
    if (!section) {
        return DEFAULT_GROUND;
    }
    const xLocal = ((40 - (position.x - (section.x * 40))) * GRID_SCALE) + 1;
    const zLocal = (position.z - (section.z * 40)) * GRID_SCALE;
    return getTriangleFromPos(section, xLocal, zLocal);
}

const ACTOR_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const ITRS_SIZE = new THREE.Vector3();
const CENTER1 = new THREE.Vector3();
const CENTER2 = new THREE.Vector3();
const DIFF = new THREE.Vector3();

function processBoxIntersections(section, actor, position, isTouchingGround) {
    const boundingBox = actor.model.boundingBox;
    ACTOR_BOX.copy(boundingBox);
    ACTOR_BOX.translate(position);
    for (let i = 0; i < section.boundingBoxes.length; i += 1) {
        const bb = section.boundingBoxes[i];
        if (ACTOR_BOX.intersectsBox(bb)) {
            INTERSECTION.copy(ACTOR_BOX);
            INTERSECTION.intersect(bb);
            INTERSECTION.getSize(ITRS_SIZE);
            ACTOR_BOX.getCenter(CENTER1);
            bb.getCenter(CENTER2);
            const dir = CENTER1.sub(CENTER2);
            if (ACTOR_BOX.min.y < bb.max.y - 0.16) {
                if (ITRS_SIZE.x < ITRS_SIZE.z) {
                    DIFF.set(ITRS_SIZE.x * Math.sign(dir.x), 0, 0);
                } else {
                    DIFF.set(0, 0, ITRS_SIZE.z * Math.sign(dir.z));
                }
            } else {
                DIFF.set(0, ITRS_SIZE.y * Math.sign(dir.y), 0);
                isTouchingGround = false;
            }
            actor.physics.position.add(DIFF);
            position.add(DIFF);
            ACTOR_BOX.translate(DIFF);
        }
    }
    return isTouchingGround;
}

const GRID_UNIT = 1 / 64;

function findSection(sections, position) {
    return sections[`${Math.floor((position.x / 40) - GRID_UNIT)},${Math.floor(position.z / 40)}`];
}
