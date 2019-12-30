import * as THREE from 'three';
import { WORLD_SIZE } from '../../utils/lba';

const STEP = 1 / WORLD_SIZE;

export function processCollisions(grid, _scene, actor) {
    const basePos = actor.threeObject.position.clone();
    const position = actor.physics.position.clone();
    basePos.multiplyScalar(STEP);
    position.multiplyScalar(STEP);
    const dx = 64 - Math.floor(position.x * 32);
    const dz = Math.floor(position.z * 32);
    const cell = grid.cells[(dx * 64) + dz];
    actor.floorSound = -1;
    if (cell
        && (actor.props.flags.hasCollisionFloor
            || actor.props.flags.canFall)) {
        for (let i = cell.columns.length - 1; i >= 0; i -= 1) {
            const column = cell.columns[i];
            const bb = column.box;
            let y;
            actor.animState.floorSound = column.sound;
            switch (column.shape) {
                case 2:
                    y = bb.max.y - ((1 - ((position.z * 32) % 1)) / 64);
                    break;
                case 3:
                    y = bb.max.y - (((position.x * 32) % 1) / 64);
                    break;
                case 4:
                    y = bb.max.y - ((1 - ((position.x * 32) % 1)) / 64);
                    break;
                case 5:
                    y = bb.max.y - (((position.z * 32) % 1) / 64);
                    break;
                case 1:
                default:
                    y = bb.max.y;
                    break;
            }
            const minY = i > 0 ? bb.min.y - (2 * STEP) : -Infinity;
            if (basePos.y >= minY && position.y < y) {
                const newY = Math.max(y, position.y);
                if (newY - position.y < 0.12) {
                    position.y = newY;
                }
                break;
            }
        }
    }
    position.y = Math.max(0, position.y);
    if (actor.props.flags.hasCollisionBricks) {
        processBoxIntersections(grid, actor, position, dx, dz);
    }
    position.multiplyScalar(WORLD_SIZE);
    actor.physics.position.copy(position);
}

const ACTOR_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const ITRS_SIZE = new THREE.Vector3();
const CENTER1 = new THREE.Vector3();
const CENTER2 = new THREE.Vector3();
const DIFF = new THREE.Vector3();
const BB = new THREE.Box3();

function processBoxIntersections(grid, actor, position, dx, dz) {
    const boundingBox = actor.model.boundingBox;
    ACTOR_BOX.copy(boundingBox);
    ACTOR_BOX.min.multiplyScalar(STEP);
    ACTOR_BOX.max.multiplyScalar(STEP);
    ACTOR_BOX.translate(position);
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
                    intersectBox(actor, position);
                }
            } else {
                BB.min.set((64 - (dx + ox)) / 32, -Infinity, (dz + oz) / 32);
                BB.max.set((65 - (dx + ox)) / 32, Infinity, (dz + oz + 1) / 32);
                intersectBox(actor, position);
            }
        }
    }
}

function intersectBox(actor, position) {
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
    }
}
