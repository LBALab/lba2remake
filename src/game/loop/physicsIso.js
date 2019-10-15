import * as THREE from 'three';

export function processCollisions(grid, scene, actor) {
    const basePos = actor.threeObject.position.clone();
    basePos.multiplyScalar(1 / 24);
    const position = actor.physics.position.clone();
    position.multiplyScalar(1 / 24);
    const savedY = position.y;
    position.y = basePos.y;
    let dx = 64 - Math.floor(position.x * 32);
    let dz = Math.floor(position.z * 32);
    if (actor.props.flags.hasCollisionBricks) {
        processBoxIntersections(grid, actor, position, dx, dz);
    }
    dx = 64 - Math.floor(position.x * 32);
    dz = Math.floor(position.z * 32);
    const cell = grid.cells[(dx * 64) + dz];
    actor.floorSound = -1;
    position.y = savedY;
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
            const minY = i > 0 ? bb.min.y : -Infinity;
            if (basePos.y > minY && position.y < y) {
                position.y = Math.max(y, position.y);
                break;
            }
        }
    }
    position.y = Math.max(0, position.y);
    position.multiplyScalar(24);
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
    ACTOR_BOX.min.multiplyScalar(1 / 24);
    ACTOR_BOX.max.multiplyScalar(1 / 24);
    ACTOR_BOX.translate(position);
    DIFF.set(0, 1 / 128, 0);
    ACTOR_BOX.translate(DIFF);
    for (let ox = -1; ox < 2; ox += 1) {
        for (let oz = -1; oz < 2; oz += 1) {
            if (!(ox === 0 && oz === 0)) {
                const cell = grid.cells[((dx + ox) * 64) + (dz + oz)];
                if (cell) {
                    for (let i = 0; i < cell.columns.length; i += 1) {
                        const column = cell.columns[i];
                        BB.copy(column.box);
                        if (column.shape !== 1) {
                            BB.max.y -= 1 / 24;
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
