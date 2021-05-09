import * as THREE from 'three';
import { bits } from '../../../../utils';
import { WORLD_SCALE } from '../../../../utils/lba';
import { IslandSection } from '../IslandLayout';

class HeightMapTriangle {
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

const INV_64 = 1 / 64;

/**
 * Represents a cell in an island's heightmap.
 * A cell is a square in the heighmap's grid,
 * containing up to 2 triangles.
 */
export default class HeightMapCell {
    valid: boolean;
    triangles = [
        new HeightMapTriangle(0),
        new HeightMapTriangle(1)
    ];

    /**
     * Sets the cell value to the cell found at the given
     * position in the current island section.
     */
    setFromPos(sections: IslandSection[], pos: THREE.Vector3): HeightMapCell {
        return this.setFrom(sections, Math.floor(pos.x), Math.floor(pos.z));
    }

    /**
     * Sets the cell value to the cell found at the given x and z
     * offset in the current island section.
     * x and z must be integers between 0 and 64
     */
    setFrom(sections: IslandSection[], x: number, z: number): HeightMapCell {
        const sX = Math.floor((x - 1) * INV_64);
        const sZ = Math.floor(z * INV_64);
        const iX = 16 - (sX + 8);
        const iZ = sZ + 8;
        const xLocal = 64 - (x - (sX * 64));
        const zLocal = z - (sZ * 64);
        return this.setFromSection(sections[iX * 16 + iZ], xLocal, zLocal);
    }

    private setFromSection(section: IslandSection, x: number, z: number) {
        if (!section) {
            return this.setInvalid();
        }
        const baseIdx = ((x * 64) + z) * 2;
        const sOffsetX = section.x * 64;
        const sOffsetZ = section.z * 64;
        const baseFlags = section.groundMesh.triangles[baseIdx];
        if (baseFlags === undefined) {
            return this.setInvalid();
        }
        const orientation = bits(baseFlags, 16, 1);
        for (let t = 0; t < 2; t += 1) {
            const triangle = this.triangles[t];
            const flags = section.groundMesh.triangles[baseIdx + t];
            triangle.collision = bits(flags, 17, 1) === 1;
            const { points } = triangle;
            const src_pts = TRIANGLE_POINTS[orientation][t];
            for (let i = 0; i < 3; i += 1) {
                const pt = src_pts[i];
                const ptIdx = ((x + pt.x) * 65) + z + pt.z;
                points[i].set(
                    sOffsetX + (65 - (x + pt.x)),
                    section.groundMesh.heightmap[ptIdx] * WORLD_SCALE,
                    sOffsetZ + z + pt.z
                );
            }
        }
        this.valid = true;
        return this;
    }

    private setInvalid(): HeightMapCell {
        this.valid = false;
        return this;
    }
}

const TRIANGLE_POINTS = [
    [ // Orientation: 0
        [
            { x: 0, z: 0 },
            { x: 1, z: 0 },
            { x: 1, z: 1 }
        ],
        [
            { x: 1, z: 1 },
            { x: 0, z: 1 },
            { x: 0, z: 0 }
        ]
    ],
    [ // Orientation: 1
        [
            { x: 0, z: 1 },
            { x: 0, z: 0 },
            { x: 1, z: 0 }
        ],
        [
            { x: 1, z: 0 },
            { x: 1, z: 1 },
            { x: 0, z: 1 }
        ]
    ]
];
