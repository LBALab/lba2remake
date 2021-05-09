import * as THREE from 'three';
import { times } from 'lodash';
import { WORLD_SIZE } from '../../../../utils/lba';
import IslandLayout, { IslandSection } from '../IslandLayout';
import Scene from '../../../Scene';
import Actor from '../../../Actor';
import Extra from '../../../Extra';
import { scanGrid, intersect2DLines, pointInTriangle2D } from './math';
import HeightMapCell from './HeightMapCell';

const MAX_ITERATIONS = 4;

export default class HeightMap {
    private sections: IslandSection[] = [];

    /** Line segment from actor starting position to target position (for this frame) */
    private line = new THREE.Line3();
    private triangle_side = new THREE.Line3();
    private cell = new HeightMapCell();
    /** List of intersection points in the current cell */
    private intersect_points = times(6).map(() => new THREE.Vector3());
    /** List of projected target points in the current cell */
    private projection_points = times(6).map(() => new THREE.Vector3());

    private vec_tmp = new THREE.Vector3();
    private proj_offset = new THREE.Vector3();

    constructor(layout: IslandLayout) {
        for (const section of layout.groundSections) {
            const { x, z } = section;
            const sX = 16 - (x + 8);
            const sZ = z + 8;
            this.sections[sX * 16 + sZ] = section;
        }
    }

    /**
     * The goal of this function is to test if the actor
     * intersects with any of the "solid" triangles of the
     * heightmap (such as rocks).
     * It translates the target position (actor.physics.position)
     * so as to maintain smooth movements.
     */
    processCollisions(scene: Scene, obj: Actor | Extra) {
        toGridSpace(scene, obj.threeObject.position, this.line.start);
        toGridSpace(scene, obj.physics.position, this.line.end);
        let done = false;
        let iteration = 0;
        while (!done && iteration < MAX_ITERATIONS) {
            done = true;
            scanGrid(this.line, (x, z) => {
                this.cell.setFrom(this.sections, x, z);
                if (!this.cell.valid) {
                    return true;
                }
                let idx = 0;
                for (const tri of this.cell.triangles) {
                    if (tri.collision) {
                        const { points } = tri;
                        let intersect = false;
                        for (let i = 0; i < 3; i += 1) {
                            const pt0 = i;
                            const pt1 = (i + 1) % 3;
                            this.triangle_side.set(points[pt0], points[pt1]);
                            const t = intersect2DLines(this.line, this.triangle_side);
                            if (t !== -1) {
                                // Found some intersection.
                                // Push the intersection point and projected point
                                // (closest point to the target on the interesected edge).
                                this.intersect_points[idx].copy(this.line.start);
                                this.vec_tmp.copy(this.line.end);
                                this.vec_tmp.sub(this.line.start);
                                this.vec_tmp.multiplyScalar(t);
                                this.intersect_points[idx].add(this.vec_tmp);
                                this.triangle_side.closestPointToPoint(
                                    this.line.end,
                                    true,
                                    this.projection_points[idx]
                                );
                                idx += 1;
                                intersect = true;
                            }
                        }
                        if (!intersect) {
                            if (pointInTriangle2D(points, this.line.start)) {
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
                    const nDist = this.intersect_points[i].distanceToSquared(this.line.start);
                    if (nDist < dist) {
                        closestIdx = i;
                        dist = nDist;
                    }
                }
                if (closestIdx !== -1) {
                    // Apply a little offset to the projected point
                    // to push it out of the intersected triangle's edge.
                    this.proj_offset.copy(this.projection_points[closestIdx]);
                    this.proj_offset.sub(this.line.end);
                    this.proj_offset.normalize();
                    this.proj_offset.multiplyScalar(0.01);
                    this.line.end.copy(this.projection_points[closestIdx]);
                    this.line.end.add(this.proj_offset);
                    toSceneSpace(scene, this.line.end, obj.physics.position);
                    this.cell.setFromPos(this.sections, this.line.end);
                    for (const tri of this.cell.triangles) {
                        if (tri.collision && pointInTriangle2D(tri.points, this.line.end)) {
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
}

const GRID_SCALE = 32 / WORLD_SIZE;
const INV_GRID_SCALE = WORLD_SIZE / 32;

/**
 * Turns an input vector in local scene space
 * into an output vector in heightmap grid space
 * @param src Input vector in scene space
 * @param tgt Output vector in heightmap grid space
 */
function toGridSpace(
    scene: Scene,
    src: THREE.Vector3,
    tgt: THREE.Vector3
) {
    tgt.copy(src);
    tgt.add(scene.sceneNode.position);
    tgt.set(tgt.x * GRID_SCALE, src.y, tgt.z * GRID_SCALE);
}

/**
 * Turns an input vector in heightmap grid space
 * into an output vector in local scene space.
 * @param src Input vector in heightmap grid space
 * @param tgt Output vector in scene space
 */
function toSceneSpace(
    scene: Scene,
    src: THREE.Vector3,
    tgt: THREE.Vector3
) {
    tgt.set(src.x * INV_GRID_SCALE, src.y, src.z * INV_GRID_SCALE);
    tgt.sub(scene.sceneNode.position);
}
