import * as THREE from 'three';

// Number of game units equal to a single game brick.
export const BRICK_SIZE = 512;
// The length of half an outdoors section in meters.
export const WORLD_SIZE = 20;
export const WORLD_SCALE = WORLD_SIZE / 0x4000;
export const WORLD_SCALE_B = 0.03125 * WORLD_SIZE;

export const DOME_SCENES = [26, 202]; // 202 = demo version
export const DOME_ENTRIES = [26, 139]; // 139 = demo version

export function getRotation(nextValue, currentValue, interpolation) {
    let angleDif = nextValue - currentValue;
    let computedAngle = 0;

    if (angleDif) {
        if (angleDif < -0x800) {
            angleDif += 0x1000;
        } else if (angleDif > 0x800) {
            angleDif -= 0x1000;
        }
        computedAngle = currentValue + (angleDif * interpolation);
    } else {
        computedAngle = currentValue;
    }

    computedAngle = (computedAngle * 360) / 0x1000;

    return computedAngle;
}

export function lbaToDegrees(value) {
    return Math.round(value * 360 / 0x1000);
}

export function degreesToLBA(value) {
    return Math.round(value * 0x1000 / 360);
}

export function getStep(nextValue, currentValue, interpolation) {
    const stepDif = nextValue - currentValue;
    let computedStep = 0;
    if (stepDif) {
        computedStep = currentValue + (stepDif * interpolation);
    } else {
        computedStep = currentValue;
    }
    return computedStep;
}

export function setStaticFlag(flags, value, isActive) {
    let f = flags;
    f |= value;
    if (!isActive) {
        f &= ~value;
    }
    return f;
}

export function distance2D(from, to) {
    const dx = from.x - to.x;
    const dz = from.z - to.z;
    const distsquared = (dx * dx) + (dz * dz);
    return Math.sqrt(distsquared);
}

const distanceThreeJs = WORLD_SIZE / 32;

export function getDistance(value) {
    return (value * distanceThreeJs) / 500;
}

export function getDistanceLba(value) {
    return (value * 500) / distanceThreeJs;
}

export function angleTo(v1, v2) {
    const xdiff = v2.x - v1.x;
    const zdiff = v2.z - v1.z;

    return Math.atan2(xdiff, zdiff);
}

export function distAngle(angle1, angle2) {
    const clockwiseDist = Math.abs(angle1 - angle2);
    return Math.min(clockwiseDist, 2 * Math.PI - clockwiseDist);
}

export function normalizeAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function angleToRad(angle) {
    let rads = THREE.MathUtils.degToRad(getRotation(angle, 0, 1) - 90);
    if (rads < 0) {
        rads += Math.PI * 2;
    }
    return rads;
}

export function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

export function getFrequency(frequency) {
    return (frequency * 2) / 100;
}

// getPositions returns the 4 points that form the bottom face of the provided
// bounding box.
export function getPositions(bb) {
    const positions = [];
    positions.push(bb.min);
    positions.push(new THREE.Vector3(bb.min.x, bb.min.y, bb.max.z));
    positions.push(new THREE.Vector3(bb.max.x, bb.min.y, bb.min.z));
    positions.push(new THREE.Vector3(bb.max.x, bb.min.y, bb.max.z));
    return positions;
}
