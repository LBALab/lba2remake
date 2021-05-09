import * as THREE from 'three';
import { times } from 'lodash';
import { WORLD_SIZE } from '../../../../utils/lba';
import { IslandSection } from '../IslandLayout';
import Scene from '../../../Scene';
import Actor from '../../../Actor';
import Extra from '../../../Extra';
import { scanGrid, intersect2DLines, pointInTriangle2D } from './math';
import GridCell from './GridCell';

const GRID_SCALE = 32 / WORLD_SIZE;
const WORLD_SIZE_M2 = WORLD_SIZE * 2;
const MAX_ITERATIONS = 4;

/** Line segment from actor starting position to target position (for this frame) */
const LINE = new THREE.Line3();
const TRIANGLE_SIDE = new THREE.Line3();
const CELL = new GridCell();
/** List of intersection points in the current cell */
const TGT_ITRS_PT = times(6).map(() => new THREE.Vector3());
/** List of projected target points in the current cell */
const TGT_PROJ_PT = times(6).map(() => new THREE.Vector3());
const VEC_TMP = new THREE.Vector3();
const OFFSET = new THREE.Vector3();

/**
 * The goal of this function is to test if the actor
 * intersects with any of the "solid" triangles of the
 * heightmap (such as rocks).
 * It translates the target position (actor.physics.position)
 * so as to maintain smooth movements.
 */
export function processHeightmapCollisions(
    scene: Scene,
    section: IslandSection,
    obj: Actor | Extra
) {
    toGridSpace(scene, section, obj.threeObject.position, LINE.start);
    toGridSpace(scene, section, obj.physics.position, LINE.end);
    let done = false;
    let iteration = 0;
    while (!done && iteration < MAX_ITERATIONS) {
        done = true;
        scanGrid(LINE, (x, z) => {
            CELL.setFrom(section, x, z);
            if (!CELL.valid) {
                return true;
            }
            let idx = 0;
            for (const tri of CELL.triangles) {
                if (tri.collision) {
                    const { points } = tri;
                    let intersect = false;
                    for (let i = 0; i < 3; i += 1) {
                        const pt0 = i;
                        const pt1 = (i + 1) % 3;
                        TRIANGLE_SIDE.set(points[pt0], points[pt1]);
                        const t = intersect2DLines(LINE, TRIANGLE_SIDE);
                        if (t !== -1) {
                            // Found some intersection.
                            // Push the intersection point and projected point
                            // (closest point to the target on the interesected edge).
                            TGT_ITRS_PT[idx].copy(LINE.start);
                            VEC_TMP.copy(LINE.end);
                            VEC_TMP.sub(LINE.start);
                            VEC_TMP.multiplyScalar(t);
                            TGT_ITRS_PT[idx].add(VEC_TMP);
                            TRIANGLE_SIDE.closestPointToPoint(
                                LINE.end,
                                true,
                                TGT_PROJ_PT[idx]
                            );
                            idx += 1;
                            intersect = true;
                        }
                    }
                    if (!intersect) {
                        if (pointInTriangle2D(points, LINE.start)) {
                            // If we have no intersection and the start of the
                            // directional vector is within a solid triangle,
                            // we should be siding down the slope.
                            return true;
                        }
                    }
                }
            }
            // Find the closest intersection
            let closestIdx = -1;
            let dist = Infinity;
            for (let i = 0; i < idx; i += 1) {
                const nDist = TGT_ITRS_PT[i].distanceToSquared(LINE.start);
                if (nDist < dist) {
                    closestIdx = i;
                    dist = nDist;
                }
            }
            if (closestIdx !== -1) {
                // Apply a little offset to the projected point
                // to push it out of the intersected triangle's edge.
                OFFSET.copy(TGT_PROJ_PT[closestIdx]);
                OFFSET.sub(LINE.end);
                OFFSET.normalize();
                OFFSET.multiplyScalar(0.01);
                LINE.end.copy(TGT_PROJ_PT[closestIdx]);
                LINE.end.add(OFFSET);
                toSceneSpace(scene, section, LINE.end, obj.physics.position);
                CELL.setFromPos(section, LINE.end);
                for (const tri of CELL.triangles) {
                    if (tri.collision && pointInTriangle2D(tri.points, LINE.end)) {
                        // If the new target position is within another solid triangle
                        // we should keep iterating until we're out.
                        // (otherwise we would jump into the solid triangles in the corners)
                        done = false;
                    }
                }
                return true;
            }
            return false;
        });
        iteration += 1;
    }
}

/**
 * Turns an input vector in local scene space
 * into an output vector in heightmap grid space
 * (for the local island section).
 * @param src Input vector in scene space
 * @param result Output vector in heightmap grid space
 */
function toGridSpace(
    scene: Scene,
    section: IslandSection,
    src: THREE.Vector3,
    result: THREE.Vector3
) {
    result.copy(src);
    result.add(scene.sceneNode.position);
    result.set(
        ((WORLD_SIZE_M2 - (result.x - (section.x * WORLD_SIZE_M2))) * GRID_SCALE) + 1,
        src.y,
        (result.z - (section.z * WORLD_SIZE_M2)) * GRID_SCALE
    );
}

/**
 * Turns an input vector in heightmap grid space
 * (for the local island section)
 * into an output vector in local scene space.
 * @param src Input vector in heightmap grid space
 * @param result Output vector in scene space
 */
function toSceneSpace(
    scene: Scene,
    section: IslandSection,
    src: THREE.Vector3,
    result: THREE.Vector3
) {
    result.copy(src);
    result.set(
        (section.x * WORLD_SIZE_M2) + (WORLD_SIZE_M2 - (((src.x - 1) / GRID_SCALE))),
        src.y,
        (section.z * WORLD_SIZE_M2) + (src.z / GRID_SCALE)
    );
    result.sub(scene.sceneNode.position);
}
