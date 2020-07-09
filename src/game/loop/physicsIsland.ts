import * as THREE from 'three';
import {getTriangleFromPos} from '../../island/ground';
import { WORLD_SIZE } from '../../utils/lba';
import { BehaviourMode } from './hero';
import { AnimType } from '../data/animType';

export function loadIslandPhysics(sections) {
    return {
        processCollisions: processCollisions.bind(null, sections),
        processCameraCollisions: processCameraCollisions.bind(null, sections),
        getGroundInfo: position => getGroundInfo(findSection(sections, position), position),
        getDistFromFloor: getDistFromFloor.bind(null, sections),
    };
}

const TGT = new THREE.Vector3();
const POSITION = new THREE.Vector3();
const FLAGS = {
    hitObject: false
};

function processCameraCollisions(sections, camPosition, groundOffset = 0.15, objOffset = 0.2) {
    const section = findSection(sections, camPosition);
    const ground = getGroundInfo(section, camPosition);
    camPosition.y = Math.max(ground.height + groundOffset * WORLD_SIZE, camPosition.y);
    if (section) {
        for (let i = 0; i < section.boundingBoxes.length; i += 1) {
            const bb = section.boundingBoxes[i];
            if (bb.containsPoint(camPosition)) {
                camPosition.y = bb.max.y + objOffset * WORLD_SIZE;
            }
        }
    }
}

const DEFAULT_FLOOR_THRESHOLD = 0.001;

function getDistFromFloor(sections, scene, obj) {
    const originalPos = new THREE.Vector3();
    originalPos.copy(obj.physics.position);
    originalPos.applyMatrix4(scene.sceneNode.matrixWorld);
    const minFunc = (a, b) => a > b;
    const floorHeight = getFloorHeight(sections, scene, obj, minFunc, DEFAULT_FLOOR_THRESHOLD);
    return originalPos.y - floorHeight;
}

// getPositions returns the 4 points that form the bottom face of the provided
// bounding box.
function getPositions(bb) {
    const positions = [];
    positions.push(bb.min);
    positions.push(new THREE.Vector3(bb.min.x, bb.min.y, bb.max.z));
    positions.push(new THREE.Vector3(bb.max.x, bb.min.y, bb.min.z));
    positions.push(new THREE.Vector3(bb.max.x, bb.min.y, bb.max.z));
    return positions;
}

// getFloorHeight returns the distance Twinsen is from the "floor" where floor
// means any object which Twinsen could stand on between him and the ground, or
// the ground if none exist.
function getFloorHeight(sections, scene, obj, minFunc, floorThreshold) {
    const originalPos = new THREE.Vector3();
    originalPos.copy(obj.physics.position);
    originalPos.applyMatrix4(scene.sceneNode.matrixWorld);
    ACTOR_BOX.copy(obj.model.boundingBox);
    ACTOR_BOX.translate(originalPos);

    // It's not enough to just check for the exact position Twinsen is at.
    // There are cases where we run over a gap in the geometry so we need
    // to check all 4 points of Twinsens bounding box and take the max. I.e.
    // if any point is touching the floor we consider Twinsen touching the
    // floor.
    let overallHeight = -1;
    for (const pos of getPositions(ACTOR_BOX)) {
        const section = findSection(sections, pos);
        const ground = getGround(section, pos);
        if (minFunc(ground.height, overallHeight) || overallHeight === -1) {
            overallHeight = ground.height;
        }
    }
    // If Twinsen is touching the ground we don't need to check if any
    // objects are under him.
    if (originalPos.y - overallHeight <= floorThreshold) {
        return overallHeight;
    }

    // Otherwise, check to see if there are any objects under Twinsen which
    // would be considered the floor.
    POSITION.copy(obj.physics.position);
    POSITION.applyMatrix4(scene.sceneNode.matrixWorld);
    while (true) {
        if (POSITION.y < 0) {
            break;
        }

        ACTOR_BOX.copy(obj.model.boundingBox);
        ACTOR_BOX.translate(POSITION);
        const section = findSection(sections, POSITION);
        for (let i = 0; i < section.boundingBoxes.length; i += 1) {
            const bb = section.boundingBoxes[i];
            if (ACTOR_BOX.intersectsBox(bb)) {
                return bb.max.y;
            }
        }
        POSITION.y -= 0.1;
    }

    // No objects were under Twinsen, return distance from the ground.
    return overallHeight;
}

// Vertical height offsets for the jet/protopack.
const JETPACK_OFFSET = 0.5;
const PROTOPACK_OFFSET = 0.1;
// How fast we reach top vertical height when starting to jetpack.
const JETPACK_VERTICAL_SPEED = 7.5;

function processCollisions(sections, scene, obj, time) {
    POSITION.copy(obj.physics.position);
    POSITION.applyMatrix4(scene.sceneNode.matrixWorld);

    const section = findSection(sections, POSITION);

    FLAGS.hitObject = false;
    const ground = getGround(section, POSITION);
    let height = ground.height;
    obj.props.distFromGround = Math.max(obj.physics.position.y - height, 0);

    let isTouchingGround = true;
    if (obj.physics.position.y > height) {
        isTouchingGround = false;
    }

    const isUsingProtoOrJetpack = (obj.props.entityIndex === BehaviourMode.JETPACK ||
                                   obj.props.entityIndex === BehaviourMode.PROTOPACK) &&
                                   obj.props.animIndex === AnimType.FORWARD;
    if (isUsingProtoOrJetpack) {
        let heightOffset = PROTOPACK_OFFSET;
        if (obj.props.entityIndex === BehaviourMode.JETPACK) {
            heightOffset = JETPACK_OFFSET;
        }
        const minFunc = (a, b) => a < b;
        const floorHeight = getFloorHeight(sections, scene, obj, minFunc, heightOffset);

        // Only let Twinsen Jetpack over small objects.
        if (floorHeight - obj.physics.position.y < heightOffset) {
            height = floorHeight + heightOffset;
            // Gradually converge on the desired value of height. This means we
            // don't immediately jump to `height` but rather "fly" up to it.
            const diff = height - obj.physics.position.y;
            if (diff <= 0) {
                // We just let the gravity physics apply here.
                obj.physics.position.y = Math.max(height, obj.physics.position.y);
            } else {
                obj.physics.position.y += JETPACK_VERTICAL_SPEED * time.delta;
                obj.physics.position.y = Math.min(height, obj.physics.position.y);
            }
        }  else {
            obj.physics.position.y = Math.max(height, obj.physics.position.y);
        }
    } else {
        obj.physics.position.y = Math.max(height, obj.physics.position.y);
    }

    POSITION.y = obj.physics.position.y;

    if (obj.animState) { // if it's an actor
        obj.animState.floorSound = -1;
    }

    if (section) {
        if (obj.animState) { // if it's an actor
            obj.animState.floorSound = ground.sound;
        }

        isTouchingGround = processBoxIntersections(section, obj, POSITION, isTouchingGround);
        if (!FLAGS.hitObject) {
            TGT.copy(obj.physics.position);
            TGT.sub(obj.threeObject.position);
            TGT.setY(0);
            if (TGT.lengthSq() !== 0) {
                TGT.normalize();
                TGT.multiplyScalar(0.005 * WORLD_SIZE);
                TGT.add(obj.threeObject.position);
                TGT.applyMatrix4(scene.sceneNode.matrixWorld);
                const gInfo = getGroundInfo(section, TGT);
                if (gInfo && gInfo.collision && isTouchingGround) {
                    obj.physics.position.copy(obj.threeObject.position);
                }
            }
        }
    }
    obj.props.runtimeFlags.isTouchingGround = isTouchingGround;
    obj.props.runtimeFlags.isTouchingFloor = getDistFromFloor(sections, scene, obj) < 0.001;

    if (isTouchingGround && ground.liquid > 0) {
        obj.props.runtimeFlags.isDrowning = true;
    }
    return isTouchingGround;
}

const DEFAULT_GROUND = {
    height: 0,
    sound: null,
    collision: null,
    liquid: 0
};

const Y_THRESHOLD = WORLD_SIZE / 1600;

function getGround(section, position) {
    if (!section)
        return DEFAULT_GROUND;

    for (let i = 0; i < section.boundingBoxes.length; i += 1) {
        const bb = section.boundingBoxes[i];
        if (position.x >= bb.min.x && position.x <= bb.max.x
            && position.z >= bb.min.z && position.z <= bb.max.z
            && position.y <= bb.max.y && position.y > bb.max.y - Y_THRESHOLD) {
            FLAGS.hitObject = true;
            return {
                height: bb.max.y,
                sound: null,
                collision: null,
                liquid: 0,
            };
        }
    }
    return getGroundInfo(section, position);
}

const GRID_SCALE = 32 / WORLD_SIZE;
const WORLD_SIZE_M2 = WORLD_SIZE * 2;

export function getGroundInfo(section, position) {
    if (!section) {
        return DEFAULT_GROUND;
    }
    const xLocal = ((WORLD_SIZE_M2 - (position.x - (section.x * WORLD_SIZE_M2))) * GRID_SCALE) + 1;
    const zLocal = (position.z - (section.z * WORLD_SIZE_M2)) * GRID_SCALE;
    return getTriangleFromPos(section, xLocal, zLocal);
}

const ACTOR_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const ITRS_SIZE = new THREE.Vector3();
const CENTER1 = new THREE.Vector3();
const CENTER2 = new THREE.Vector3();
const DIFF = new THREE.Vector3();
const H_THRESHOLD = 0.007 * WORLD_SIZE;

function processBoxIntersections(section, actor, position, isTouchingGround) {
    const boundingBox = actor.model ? actor.model.boundingBox : actor.sprite.boundingBox;
    ACTOR_BOX.copy(boundingBox);
    ACTOR_BOX.translate(position);
    let collision = false;
    for (let i = 0; i < section.boundingBoxes.length; i += 1) {
        const bb = section.boundingBoxes[i];
        if (ACTOR_BOX.intersectsBox(bb)) {
            collision = true;
            isTouchingGround = true;
            INTERSECTION.copy(ACTOR_BOX);
            INTERSECTION.intersect(bb);
            INTERSECTION.getSize(ITRS_SIZE);
            ACTOR_BOX.getCenter(CENTER1);
            bb.getCenter(CENTER2);
            const dir = CENTER1.sub(CENTER2);
            if (ACTOR_BOX.min.y < bb.max.y - H_THRESHOLD) {
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
    actor.props.runtimeFlags.isColliding = collision;
    return isTouchingGround;
}

const GRID_UNIT = 1 / 64;

export function findSection(sections, position) {
    const x = Math.floor((position.x / WORLD_SIZE_M2) - GRID_UNIT);
    const z = Math.floor(position.z / WORLD_SIZE_M2);
    return sections[`${x},${z}`];
}
