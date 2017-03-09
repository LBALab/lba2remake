import THREE from 'three';

export function processCollisions(grid, scene, actor) {
    const basePos = actor.threeObject.position;
    const position = actor.physics.position;
    const dx = 64 - Math.floor(position.x * 32);
    const dz = Math.floor(position.z * 32);
    const cell = grid.cells[dx * 64 + dz];
    let height = 0;
    if (cell) {
        for (let i = cell.columns.length - 1; i >= 0; --i) {
            const column = cell.columns[i];
            const bb = column.box;
            let y;
            switch (column.shape) {
                case 2:
                    y = bb.max.y - (1 - ((position.z * 32) % 1)) / 64;
                    break;
                case 3:
                    y = bb.max.y - ((position.x * 32) % 1) / 64;
                    break;
                case 4:
                    y = bb.max.y - (1 - ((position.x * 32) % 1)) / 64;
                    break;
                case 5:
                    y = bb.max.y - ((position.z * 32) % 1) / 64;
                    break;
                case 1:
                default:
                    y = bb.max.y;
                    break;
            }
            if (basePos.y > y - 1 / 64 && position.y < y) {
                height = y;
                break;
            }
        }
    }
    position.y = Math.max(height, position.y);
    processBoxIntersections(grid, actor, position, dx, dz);
}

const ACTOR_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const ITRS_SIZE = new THREE.Vector3();
const CENTER1 = new THREE.Vector3();
const CENTER2 = new THREE.Vector3();
const DIFF = new THREE.Vector3();

function processBoxIntersections(grid, actor, position, dx, dz) {
    const boundingBox = actor.model.boundingBox;
    ACTOR_BOX.copy(boundingBox);
    ACTOR_BOX.translate(position);
    DIFF.set(0, 1 / 128, 0);
    ACTOR_BOX.translate(DIFF);
    for (let ox = -1; ox < 2; ++ox) {
        for (let oz = -1; oz < 2; ++oz) {
            if (!(ox == 0 && oz == 0)) {
                const cell = grid.cells[(dx + ox) * 64 + (dz + oz)];
                if (cell) {
                    for (let i = 0; i < cell.columns.length; ++i) {
                        const column = cell.columns[i];
                        const bb = column.box;
                        if ((column.shape == 1 || column.shape > 5) && ACTOR_BOX.intersectsBox(bb)) {
                            INTERSECTION.copy(ACTOR_BOX);
                            INTERSECTION.intersect(bb);
                            INTERSECTION.size(ITRS_SIZE);
                            ACTOR_BOX.center(CENTER1);
                            bb.center(CENTER2);
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
                }

            }
        }
    }
}
