import * as THREE from 'three';
import { WORLD_SIZE, getPositions, DOME_SCENES } from '../../../utils/lba';
import { GROUND_TYPES } from './grid';
import { BehaviourMode } from '../../loop/hero';
import { AnimType } from '../../data/animType';
import Actor from '../../Actor';
import { Time } from '../../../datatypes';
import Scene from '../../Scene';

const STEP = 1 / WORLD_SIZE;
const ESCALATOR_SPEED = 0.05;

// Vertical height offsets for the jet/protopack.
const JETPACK_OFFSET = 0.03;
const PROTOPACK_OFFSET = 0.0075;
// How fast we reach top vertical height when starting to jetpack.
const JETPACK_VERTICAL_SPEED = 0.275;

export default class IsoSceneryPhysics {
    grid: any;

    constructor(grid) {
        this.grid = grid;
    }

    processCollisions(scene: Scene, obj, time: Time) {
        const isUsingProtoOrJetpack = (obj.props.entityIndex === BehaviourMode.JETPACK ||
            obj.props.entityIndex === BehaviourMode.PROTOPACK) &&
            obj.props.animIndex === AnimType.FORWARD;

        const basePos = obj.threeObject.position.clone();
        const position = obj.physics.position.clone();
        basePos.multiplyScalar(STEP);
        position.multiplyScalar(STEP);

        const dx = 64 - Math.floor(position.x * 32);
        const dz = Math.floor(position.z * 32);
        const cell = this.grid.cells[(dx * 64) + dz];

        if (obj.animState) { // if it's an actor
            obj.floorSound = -1;
        }

        let isTouchingGround = false;
        let groundHeight = -1;
        if (cell
            && (obj.props.flags.hasCollisionFloor
                || obj.props.flags.canFall)) {
            for (let i = cell.columns.length - 1; i >= 0; i -= 1) {
                const column = cell.columns[i];
                const bb = column.box;
                const y = getColumnY(column, position);

                if (obj.animState) { // if it's an actor
                    obj.animState.floorSound = column.sound;
                }
                const minY = i > 0 ? bb.min.y : -Infinity;
                if (basePos.y >= minY) {
                    groundHeight = y;
                    if (position.y < y) {
                        const newY = Math.max(y, position.y);
                        if (newY - position.y < 0.12 && !isUsingProtoOrJetpack) {
                            position.y = newY;
                            isTouchingGround = true;
                            switch (column.groundType) {
                                case GROUND_TYPES.WATER:
                                    if (DOME_SCENES.includes(scene.index)) { // Dome of the slate
                                        obj.state.isDrowningStars = true;
                                    } else {
                                        obj.state.isDrowning = true;
                                    }
                                    break;
                                case GROUND_TYPES.LAVA:
                                    obj.state.isDrowningLava = true;
                                    break;
                            }
                        }
                        processEscalator(column, position, time);
                        break;
                    }
                }
            }
        }

        let height = groundHeight;
        if (!isTouchingGround && obj instanceof Actor && obj.index === 0) {
            ACTOR_BOX.copy(obj.model.boundingBox);
            ACTOR_BOX.min.multiplyScalar(STEP);
            ACTOR_BOX.max.multiplyScalar(STEP);
            ACTOR_BOX.translate(position);
            let floorHeight = null;
            for (const pos of getPositions(ACTOR_BOX)) {
                const fh = getFloorHeight(this.grid, obj, pos);
                if (floorHeight === null || fh < floorHeight) {
                    floorHeight = fh;
                }
            }
            if (floorHeight > 0) {
                height = floorHeight;
            }
        }
        obj.state.distFromGround = Math.max(position.y - groundHeight, 0) * WORLD_SIZE;
        obj.state.distFromFloor = Math.max(position.y - height, 0) * WORLD_SIZE;
        obj.state.isTouchingGround = isTouchingGround;
        obj.state.isUsingProtoOrJetpack = isUsingProtoOrJetpack;

        if (isUsingProtoOrJetpack) {
            let heightOffset = PROTOPACK_OFFSET;
            if (obj.props.entityIndex === BehaviourMode.JETPACK) {
                heightOffset = JETPACK_OFFSET;
            }
            if (height - position.y < heightOffset) {
                const wantHeight = height + heightOffset;
                const diff = wantHeight - position.y;
                if (diff <= 0) {
                    position.y -= JETPACK_VERTICAL_SPEED * time.delta;
                    position.y = Math.max(wantHeight, position.y);
                } else {
                    position.y += JETPACK_VERTICAL_SPEED * time.delta;
                    position.y = Math.min(wantHeight, position.y);
                }
            }
        }

        position.y = Math.max(0, position.y);
        if (obj.props.flags.hasCollisionBricks) {
            isTouchingGround = processBoxIntersections(
                this.grid,
                obj,
                position,
                dx,
                dz,
                isTouchingGround
            );
        }
        position.multiplyScalar(WORLD_SIZE);
        obj.physics.position.copy(position);

        return isTouchingGround;
    }

    processCameraCollisions() {
        // TODO
    }
}

function getColumnY(column, position: THREE.Vector3) {
    const bb = column.box;
    switch (column.shape) {
        case 2:
            return bb.max.y - ((1 - ((position.z * 32) % 1)) / 64);
        case 3:
            return bb.max.y - (((position.x * 32) % 1) / 64);
        case 4:
            return bb.max.y - ((1 - ((position.x * 32) % 1)) / 64);
        case 5:
            return bb.max.y - (((position.z * 32) % 1) / 64);
        case 1:
        default:
            return bb.max.y;
    }
}

const POSITION = new THREE.Vector3();
const ACTOR_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const ITRS_SIZE = new THREE.Vector3();
const CENTER1 = new THREE.Vector3();
const CENTER2 = new THREE.Vector3();
const DIFF = new THREE.Vector3();
const BB = new THREE.Box3();

function getFloorHeight(grid, actor: Actor, position: THREE.Vector3) {
    POSITION.copy(position);

    const dx = 64 - Math.floor(position.x * 32);
    const dz = Math.floor(position.z * 32);
    const groundCell = grid.cells[(dx * 64) + dz];

    while (true) {
        if (POSITION.y <= -1) {
            return -1;
        }

        for (let i = groundCell.columns.length - 1; i >= 0; i -= 1) {
            const column = groundCell.columns[i];
            const bb = column.box;
            const y = getColumnY(column, POSITION);
            const minY = i > 0 ? bb.min.y : -Infinity;
            if (POSITION.y >= minY && POSITION.y < y) {
                if (Math.max(y, POSITION.y) - POSITION.y < 0.12) {
                    return y;
                }
            }
        }

        ACTOR_BOX.copy(actor.model.boundingBox);
        ACTOR_BOX.min.multiplyScalar(STEP);
        ACTOR_BOX.max.multiplyScalar(STEP);
        ACTOR_BOX.translate(POSITION);
        DIFF.set(0, 1 / 128, 0);
        ACTOR_BOX.translate(DIFF);
        for (let ox = -1; ox < 2; ox += 1) {
            for (let oz = -1; oz < 2; oz += 1) {
                const cell = grid.cells[((dx + ox) * 64) + (dz + oz)];
                if (cell && cell.columns.length > 0) {
                    for (let i = 0; i < cell.columns.length; i += 1) {
                        const column = cell.columns[i];
                        BB.copy(column.box);
                        if (column.shape !== 1) {
                            BB.max.y -= STEP;
                        }
                        if (ACTOR_BOX.intersectsBox(BB)) {
                            return BB.max.y;
                        }
                    }
                }
            }
        }
        POSITION.y -= 0.01;
    }
}

function processBoxIntersections(
    grid,
    actor: Actor,
    position: THREE.Vector3,
    dx: number,
    dz: number,
    isTouchingGround: boolean
) {
    const boundingBox = actor.model.boundingBox;
    ACTOR_BOX.copy(boundingBox);
    ACTOR_BOX.min.multiplyScalar(STEP);
    ACTOR_BOX.max.multiplyScalar(STEP);
    ACTOR_BOX.translate(position);
    DIFF.set(0, 1 / 128, 0);
    ACTOR_BOX.translate(DIFF);
    let collision = false;
    for (let ox = -1; ox < 2; ox += 1) {
        for (let oz = -1; oz < 2; oz += 1) {
            const cell = grid.cells[((dx + ox) * 64) + (dz + oz)];
            if (cell && cell.columns.length > 0) {
                for (let i = 0; i < cell.columns.length; i += 1) {
                    const column = cell.columns[i];
                    BB.copy(column.box);
                    if (column.shape !== 1) {
                        BB.max.y -= STEP;
                    }
                    if (intersectBox(actor, position)) {
                        collision = true;
                    }
                }
            } else {
                BB.min.set((64 - (dx + ox)) / 32, -Infinity, (dz + oz) / 32);
                BB.max.set((65 - (dx + ox)) / 32, Infinity, (dz + oz + 1) / 32);
                if (intersectBox(actor, position)) {
                    collision = true;
                }
                isTouchingGround = false;
            }
        }
    }
    actor.state.isColliding = collision;
    return isTouchingGround;
}

function intersectBox(actor: Actor, position: THREE.Vector3) {
    if (ACTOR_BOX.intersectsBox(BB)) {
        INTERSECTION.copy(ACTOR_BOX);
        INTERSECTION.intersect(BB);
        INTERSECTION.getSize(ITRS_SIZE);
        ACTOR_BOX.getCenter(CENTER1);
        BB.getCenter(CENTER2);
        const dir = CENTER1.sub(CENTER2);
        if (ITRS_SIZE.x < ITRS_SIZE.z) {
            DIFF.set(ITRS_SIZE.x * Math.sign(dir.x), 0, 0);
        } else {
            DIFF.set(0, 0, ITRS_SIZE.z * Math.sign(dir.z));
        }
        actor.physics.position.add(DIFF);
        position.add(DIFF);
        ACTOR_BOX.translate(DIFF);
        return true;
    }
    return false;
}

function processEscalator(column, position: THREE.Vector3, time: Time) {
    switch (column.groundType) {
        case GROUND_TYPES.ESCALATOR_BOTTOM_RIGHT_TOP_LEFT:
            position.z -= ESCALATOR_SPEED * time.delta;
            break;
        case GROUND_TYPES.ESCALATOR_TOP_LEFT_BOTTOM_RIGHT:
            position.z += ESCALATOR_SPEED * time.delta;
            break;
        case GROUND_TYPES.ESCALATOR_BOTTOM_LEFT_TOP_RIGHT:
            position.x += ESCALATOR_SPEED * time.delta;
            break;
        case GROUND_TYPES.ESCALATOR_TOP_RIGHT_BOTTOM_LEFT:
            position.x -= ESCALATOR_SPEED * time.delta;
            break;
    }
}
