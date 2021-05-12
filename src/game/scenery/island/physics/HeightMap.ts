import * as THREE from 'three';
import { times } from 'lodash';
import { WORLD_SIZE, normalizeAngle } from '../../../../utils/lba';
import { IslandSection } from '../IslandLayout';
import Scene from '../../../Scene';
import Actor, { SlideWay } from '../../../Actor';
import Extra from '../../../Extra';
import { scanGrid, intersect2DLines, pointInTriangle2D, interpolateY } from './math';
import HeightMapCell, { HeightMapTriangle } from './HeightMapCell';
import GroundInfo from './GroundInfo';
import { AnimType } from '../../../data/animType';
import { Time } from '../../../../datatypes';

const MAX_ITERATIONS = 4;

enum SlidingStatus {
    SLIDING,
    STUCK,
    NONE
}

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

    constructor(sections: IslandSection[]) {
        this.sections = sections;
    }

    /**
     * The goal of this function is to test if the actor
     * intersects with any of the "solid" triangles of the
     * heightmap (such as rocks).
     * It translates the target position (actor.physics.position)
     * so as to maintain smooth movements.
     * @returns Whether we're touching ground or not.
     */
    processCollisions(
        scene: Scene,
        obj: Actor | Extra,
        isTouchingGround: boolean,
        time: Time
    ): boolean {
        if (obj instanceof Actor
            && obj.state.isJumping
            && obj.physics.temp.position.y >= 0
            && obj.threeObject.position.y - obj.state.jumpStartHeight < 0.8) {
            return isTouchingGround;
        }
        sceneSpaceToGridSpace(scene, obj.threeObject.position, this.line.start);
        sceneSpaceToGridSpace(scene, obj.physics.position, this.line.end);
        let done = false;
        let iteration = 0;
        let isSliding = false;
        let isStuck = false;
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
                        if (!(obj instanceof Actor && obj.state.isSliding)) {
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
                        }
                        if (!intersect) {
                            if (obj instanceof Actor
                                && pointInTriangle2D(points, this.line.start)) {
                                // If we have no intersection and the start of the
                                // directional vector is within a solid triangle,
                                // we should be sliding down the slope.
                                switch (this.processSliding(scene, tri, obj, time)) {
                                    case SlidingStatus.SLIDING:
                                        isSliding = true;
                                        break;
                                    case SlidingStatus.STUCK:
                                        isStuck = true;
                                        break;
                                }
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
                    gridSpaceToSceneSpace(scene, this.line.end, obj.physics.position);
                    this.cell.setFromPos(this.sections, this.line.end);
                    for (const tri of this.cell.triangles) {
                        if (tri.collision && pointInTriangle2D(tri.points, this.line.end)) {
                            // If the new target position is within another solid triangle
                            // we should keep iterating until we're out.
                            // (otherwise we would jump into the solid triangles in the corners)
                            done = false;
                        }
                    }
                    isTouchingGround = true;
                    return true;
                }
                return false;
            });
            iteration += 1;
        }
        if (obj instanceof Actor) {
            obj.state.isSliding = isSliding;
            obj.state.isStuck = isStuck;
            if (isSliding || isStuck) {
                obj.state.isJumping = false;
                obj.state.hasGravityByAnim = false;
            }
        }
        return isTouchingGround;
    }

    getGroundInfo(position: THREE.Vector3, result: GroundInfo) {
        this.vec_tmp.set(position.x * GRID_SCALE, position.y, position.z * GRID_SCALE);
        this.getGroundInfoInGridSpace(this.vec_tmp, result);
    }

    private getGroundInfoInGridSpace(position: THREE.Vector3, result: GroundInfo) {
        this.cell.setFromPos(this.sections, position);
        if (this.cell.valid) {
            for (const tri of this.cell.triangles) {
                if (pointInTriangle2D(tri.points, position)) {
                    result.valid = true;
                    result.collision = tri.collision;
                    result.sound = tri.sound;
                    result.liquid = tri.liquid;
                    result.height = interpolateY(tri.points, position);
                    result.section = this.cell.section;
                    for (let i = 0; i < 3; i += 1) {
                        const pt = tri.points[i];
                        result.points[i].set(
                            pt.x * INV_GRID_SCALE,
                            pt.y,
                            pt.z * INV_GRID_SCALE
                        );
                    }
                    return;
                }
            }
        }
        result.setDefault();
    }

    private lowSlideIdx = [-1, -1, -1];
    private highSlideIdx = [-1, -1, -1];
    private slideSrc = new THREE.Vector3();
    private slideTgt = new THREE.Vector3();
    private groundTmp = new GroundInfo();

    private processSliding(
        scene: Scene,
        tri: HeightMapTriangle,
        actor: Actor,
        time: Time
    ): SlidingStatus {
        if (actor.state.isStuck) {
            return SlidingStatus.STUCK;
        }
        const { points } = tri;
        // Find the triangle's slope by finding the set of
        // lowest points. If all 3 points are the same height,
        // it means the triangle is flat.
        let lowCount = 0;
        let highCount = 0;
        let lowest = Infinity;
        let highest = -Infinity;
        for (let i = 0; i < 3; i += 1) {
            const pt = points[i];
            if (pt.y < lowest) {
                this.lowSlideIdx[0] = i;
                lowCount = 1;
                lowest = pt.y;
            } else if (pt.y === lowest) {
                this.lowSlideIdx[lowCount] = i;
                lowCount += 1;
            }
            if (pt.y > highest) {
                this.highSlideIdx[0] = i;
                highCount = 1;
                highest = pt.y;
            } else if (pt.y === highest) {
                this.highSlideIdx[highCount] = i;
                highCount += 1;
            }
        }
        // Triangle has a slope, let's slide down
        // in that slope's direction.
        if (lowCount < 3 && !actor.state.isStuck) {
            if (!actor.state.isSliding) {
                actor.slideState.startTime = time.elapsed,
                actor.slideState.startPos.copy(this.line.start);
            } else if (time.elapsed - actor.slideState.startTime > 0.5) {
                if (this.line.start.distanceToSquared(actor.slideState.startPos) < 1) {
                    // Get stuck if we didn't travel enough in half a second
                    actor.physics.position.copy(actor.threeObject.position);
                    return SlidingStatus.STUCK;
                }
                actor.slideState.startTime = time.elapsed;
                actor.slideState.startPos.copy(this.line.start);
            }
            // Slide origin is the average of the high
            // points of the triangle.
            this.slideSrc.set(0, 0, 0);
            for (let i = 0; i < highCount; i += 1) {
                this.slideSrc.add(points[this.highSlideIdx[i]]);
            }
            this.slideSrc.divideScalar(highCount);
            // Slide target is the average of the low
            // points of the triangle.
            this.slideTgt.set(0, 0, 0);
            for (let i = 0; i < lowCount; i += 1) {
                this.slideTgt.add(points[this.lowSlideIdx[i]]);
            }
            this.slideTgt.divideScalar(lowCount);
            // Compute normalized vector from high to low point
            this.proj_offset.copy(this.slideTgt);
            this.proj_offset.sub(this.slideSrc);
            this.proj_offset.normalize();
            actor.slideState.direction.copy(this.proj_offset);
            this.proj_offset.multiplyScalar(time.delta * 4);
            if (!actor.state.isSliding) {
                this.vec_tmp.copy(this.line.end);
                this.vec_tmp.sub(this.line.start);
                const way = this.vec_tmp.dot(this.proj_offset) > 0
                    ? SlideWay.FORWARD
                    : SlideWay.BACKWARD;
                actor.slideState.way = way;
                actor.setAnim(way === SlideWay.FORWARD
                    ? AnimType.SLIDE_FORWARD
                    : AnimType.SLIDE_BACKWARD);
            }
            this.applyTargetPos(scene, actor, this.proj_offset, time);
            return SlidingStatus.SLIDING;
        }
        // Triangle is flat, we were sliding in the previous frame,
        // let's keep sliding in the same direction.
        if (actor.state.isSliding && !actor.state.isStuck) {
            this.proj_offset.copy(actor.slideState.direction);
            this.proj_offset.normalize();
            this.proj_offset.multiplyScalar(time.delta * 4);
            this.applyTargetPos(scene, actor, this.proj_offset, time);
            return SlidingStatus.SLIDING;
        }
        // Triangle is flat and we weren't sliding. Stop where we are.
        if (!actor.state.isJumping) {
            actor.physics.position.copy(actor.threeObject.position);
            return SlidingStatus.STUCK;
        }
        return SlidingStatus.NONE;
    }

    private euler = new THREE.Euler();
    private tgtQuat = new THREE.Quaternion();

    private applyTargetPos(scene: Scene, actor: Actor, tgt: THREE.Vector3, time: Time) {
        this.line.end.copy(this.line.start);
        this.line.end.add(tgt);
        let angle = Math.atan2(tgt.x, tgt.z);
        if (actor.slideState.way === SlideWay.BACKWARD) {
            angle = normalizeAngle(angle + Math.PI);
        }
        actor.physics.temp.angle = angle;
        this.euler.set(0, angle, 0, 'YXZ');
        this.tgtQuat.setFromEuler(this.euler);
        actor.physics.orientation.slerp(this.tgtQuat, time.delta * 4);
        this.getGroundInfoInGridSpace(this.line.end, this.groundTmp);
        this.line.end.y = this.groundTmp.height;
        gridSpaceToSceneSpace(
            scene,
            this.line.end,
            actor.physics.position
        );
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
function sceneSpaceToGridSpace(
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
function gridSpaceToSceneSpace(
    scene: Scene,
    src: THREE.Vector3,
    tgt: THREE.Vector3
) {
    tgt.set(src.x * INV_GRID_SCALE, src.y, src.z * INV_GRID_SCALE);
    tgt.sub(scene.sceneNode.position);
}
