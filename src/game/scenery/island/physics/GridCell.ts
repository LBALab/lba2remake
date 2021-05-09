import * as THREE from 'three';
import { bits } from '../../../../utils';
import { WORLD_SCALE } from '../../../../utils/lba';
import { IslandSection } from '../IslandLayout';

class GridTriangle {
    readonly index: number;
    /** Can't walk on this triangle if collision is true */
    collision: boolean;
    points = [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
    ];

    constructor(index: number) {
        this.index = index;
    }
}

/**
 * Represents a cell in an island's heightmap.
 * A cell is a square in the heighmap's grid,
 * containing up to 2 triangles.
 */
export default class GridCell {
    valid: boolean;
    triangles = [
        new GridTriangle(0),
        new GridTriangle(1)
    ];

    /**
     * Sets the cell value to the cell found at the given
     * position in the current island section.
     */
    setFromPos(section: IslandSection, pos: THREE.Vector3) {
        this.setFrom(section, Math.floor(pos.x), Math.floor(pos.z));
    }

    /**
     * Sets the cell value to the cell found at the given x and z
     * offset in the current island section.
     * x and z must be integers between 0 and 64
     */
    setFrom(section: IslandSection, x: number, z: number) {
        const baseFlags = section.groundMesh.triangles[((x * 64) + z) * 2];
        if (baseFlags === undefined) {
            this.valid = false;
            return;
        }
        this.valid = true;
        const orientation = bits(baseFlags, 16, 1);
        for (let t = 0; t < 2; t += 1) {
            const triangle = this.triangles[t];
            const flags = section.groundMesh.triangles[(((x * 64) + z) * 2) + t];
            triangle.collision = bits(flags, 17, 1) === 1;
            const { points } = triangle;
            const src_pts = TRIANGLE_POINTS[orientation][t];
            for (let i = 0; i < 3; i += 1) {
                const pt = src_pts[i];
                const ptIdx = ((x + pt.x) * 65) + z + pt.z;
                points[i].set(
                    x + pt.x,
                    section.groundMesh.heightmap[ptIdx] * WORLD_SCALE,
                    z + pt.z
                );
            }
        }
    }
}

function makeTrianglePoints(orientation, idx) {
    const rOrientation = 1 - orientation;
    return [{
        x: idx,
        z: idx ? rOrientation : orientation
    }, {
        x: idx ? orientation : rOrientation,
        z: idx
    }, {
        x: 1 - idx,
        z: idx ? orientation : rOrientation,
    }];
}

const TRIANGLE_POINTS = [
    [
        makeTrianglePoints(0, 0),
        makeTrianglePoints(0, 1)
    ],
    [
        makeTrianglePoints(1, 0),
        makeTrianglePoints(1, 1)
    ]
];
