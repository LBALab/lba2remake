import * as THREE from 'three';
import { getParams } from '../params';

// Number of game units equal to a single game brick.
export const BRICK_SIZE = 512;
// The length of half an outdoors section in meters.
export const WORLD_SIZE = 20;
export const WORLD_SCALE = WORLD_SIZE / 0x4000;
export const WORLD_SCALE_B = 0.03125 * WORLD_SIZE;

export const DOME_SCENES = [26, 202]; // 202 = demo version
export const DOME_ENTRIES = [26, 139]; // 139 = demo version

export const SPEED_ADJUSTMENT = 0.8;

const getAngleValues = () => {
    let midValue = 0x800;
    let maxValue = 0x1000;
    const { game } = getParams();

    if (game === 'lba1') {
        midValue = 0x200;
        maxValue = 0x400;
    }

    return { midValue, maxValue };
};

export const PolygonType = {
    SOLID: 0,
    FLAT: 1,
    TRANS: 2,
    TRAME: 3,
    GOURAUD: 4,
    DITHER: 5,
    GOURAUD_TABLE: 6,
    DITHER_TABLE: 7,
    TEXTURE: 8,
    TEXTURE_FLAT: 9,
    TEXTURE_GOURAUD: 10,
    TEXTURE_DITHER: 11,
    TEXTURE_INCRUST: 12,
    TEXTURE_INCRUST_FLAT: 13,
    TEXTURE_INCRUST_GOURAUD: 14,
    TEXTURE_INCRUST_DITHER: 15,
    TEXTURE_Z: 16,
    TEXTURE_Z_FLAT: 17,
    TEXTURE_Z_GOURAUD: 18,
    TEXTURE_Z_DITHER: 19,
    TEXTURE_Z_INCRUST: 20,
    TEXTURE_Z_INCRUST_FLAT: 21,
    TEXTURE_Z_INCRUST_GOURAUD: 22,
    TEXTURE_Z_INCRUST_DITHER: 23,
    TEXTURE_Z_FOG: 24,
    FLAG_ZBUFFER: 25,
};

export function getRotation(nextValue, currentValue, interpolation) {
    let angleDif = nextValue - currentValue;
    let computedAngle = 0;
    const { midValue, maxValue } = getAngleValues();

    if (angleDif) {
        if (angleDif < -midValue) {
            angleDif += maxValue;
        } else if (angleDif > midValue) {
            angleDif -= maxValue;
        }
        computedAngle = currentValue + (angleDif * interpolation);
    } else {
        computedAngle = currentValue;
    }

    computedAngle = (computedAngle * 360) / maxValue;

    return computedAngle;
}

export function lbaToDegrees(value) {
    const { maxValue } = getAngleValues();
    return Math.round(value * 360 / maxValue);
}

export function degreesToLBA(value) {
    const { maxValue } = getAngleValues();
    return Math.round(value * maxValue / 360);
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
    return frequency * 22050 / 0x2000;
}

export function getFrequencyRate(frequency) {
    return getFrequency(frequency) / 0x2000;
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

export function getHtmlColor(palette, index) {
    return `#${new THREE.Color(
        palette[index * 3] / 255,
        palette[(index * 3) + 1] / 255,
        palette[(index * 3) + 2] / 255
    ).getHexString()}`;
}
