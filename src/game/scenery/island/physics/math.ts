import * as THREE from 'three';

/**
 * This scans all grid cells that the
 * given line segment goes through.
 * Stops iterating if the callback
 * returns true.
 * Using a variant of the DDA line
 * algorithm found here:
 * https://jsfiddle.net/6x7t4q1o/5
 */
export function scanGrid(line: THREE.Line3, callback: (x: number, z: number) => boolean) {
    const { start, end } = line;
    let x = Math.floor(start.x);
    let z = Math.floor(start.z);
    const diffX = end.x - start.x;
    const diffZ = end.z - start.z;
    const stepX = Math.sign(diffX);
    const stepZ = Math.sign(diffZ);

    const xOffset = end.x > start.x
        ? Math.ceil(start.x) - start.x
        : start.x - Math.floor(start.x);
    const zOffset = end.z > start.z
        ? Math.ceil(start.z) - start.z
        : start.z - Math.floor(start.z);
    const angle = Math.atan2(-diffZ, diffX);
    let tMaxX = xOffset / Math.cos(angle);
    let tMaxY = zOffset / Math.sin(angle);
    const tDeltaX = 1.0 / Math.cos(angle);
    const tDeltaZ = 1.0 / Math.sin(angle);

    const manhattanDistance =
        Math.abs(Math.floor(end.x) - Math.floor(start.x)) +
        Math.abs(Math.floor(end.z) - Math.floor(start.z));
    for (let t = 0; t <= manhattanDistance; t += 1) {
        if (callback(x, z)) {
            return true;
        }
        if (Math.abs(tMaxX) < Math.abs(tMaxY)) {
            tMaxX += tDeltaX;
            x += stepX;
        } else {
            tMaxY += tDeltaZ;
            z += stepZ;
        }
    }
    return false;
}

const CMP = new THREE.Vector3();
const R = new THREE.Vector3();
const S = new THREE.Vector3();

/**
 * Intersects two line segments in 2D space
 * based on the (x, z) coordinates of the given
 * 3D points. Inspired by:
 * https://stackoverflow.com/a/565282
 */
export function intersect2DLines(l1: THREE.Line3, l2: THREE.Line3): number {
    CMP.set(l2.start.x - l1.start.x, 0, l2.start.z - l1.start.z);
    R.set(l1.end.x - l1.start.x, 0, l1.end.z - l1.start.z);
    S.set(l2.end.x - l2.start.x, 0, l2.end.z - l2.start.z);

    const cmPxr = CMP.x * R.z - CMP.z * R.x;
    const cmPxs = CMP.x * S.z - CMP.z * S.x;
    const rxs = R.x * S.z - R.z * S.x;

    if (cmPxr === 0) {
        // Lines are colinear
        return (l2.start.x - l1.start.x < 0) !== (l2.start.x - l1.end.x < 0)
            || ((l2.start.z - l1.start.z < 0) !== (l2.start.z - l1.end.z < 0))
            ? 0
            : -1;
    }

    if (rxs === 0) {
        // Lines are parallel
        return -1;
    }

    const rxsr = 1 / rxs;
    const t = cmPxs * rxsr;
    const u = cmPxr * rxsr;

    return (t >= 0 && t <= 1 && u >= 0 && u <= 1) ? t : -1;
}

/**
 * Checks if the given point is inside the
 * triangle in 2D space, using 3D vectors
 * as input.
 * Based on: https://stackoverflow.com/a/2049593
 */
export function pointInTriangle2D(tri: THREE.Vector3[], pt: THREE.Vector3) {
    const d1 = sign(pt, tri[0], tri[1]);
    const d2 = sign(pt, tri[1], tri[2]);
    const d3 = sign(pt, tri[2], tri[0]);

    const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
}

function sign(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) {
    return (p1.x - p3.x) * (p2.z - p3.z) - (p2.x - p3.x) * (p1.z - p3.z);
}
