import { WORLD_SCALE, WORLD_SIZE } from '../../../utils/lba';

interface ObjectInfo {
    index: number;
    x: number;
    y: number;
    z: number;
    angle: number;
    iv: number;
    soundType: number;
    boundingBox?: THREE.Box3;
}

interface RawGroundMesh {
    triangles: Uint32Array;
    heightmap: Uint16Array;
    intensity: Uint8Array;
}

export interface IslandSection {
    id: number;
    index: number;
    x: number;
    z: number;
    objects: ObjectInfo[];
    groundMesh: RawGroundMesh;
    textureInfo: Uint8Array;
}

export interface SeaSection {
    x: number;
    z: number;
    lod: number;
    reduceEdges: string[];
}

export default class IslandLayout {
    groundSections: IslandSection[];
    seaSections: SeaSection[];

    constructor(ile) {
        this.groundSections = this.loadGroundSections(ile);
        this.seaSections = this.loadSeaSections();
    }

    private loadGroundSections(ile): IslandSection[] {
        const layout_raw = new Uint8Array(ile.getEntry(0));
        const groundSections: IslandSection[] = [];
        let index = 0;
        for (let i = 0; i < 256; i += 1) {
            const sX = Math.floor(i / 16);
            const sZ = i % 16;
            if (layout_raw[i]) {
                const id = layout_raw[i];
                const objInfoDV = new DataView(ile.getEntry((id * 6) - 3));
                const objectsDV = new DataView(ile.getEntry((id * 6) - 2));
                const numObjects = objInfoDV.getUint32(8, true);
                const x = (16 - sX) - 8;
                const z = sZ - 8;
                const objects: ObjectInfo[] = [];
                for (let j = 0; j < numObjects; j += 1) {
                    objects.push(this.loadObjectInfo(objectsDV, x, z, j));
                }
                groundSections.push({
                    id,
                    index,
                    x,
                    z,
                    objects,
                    groundMesh: {
                        triangles: new Uint32Array(ile.getEntry((id * 6) - 1)),
                        heightmap: new Uint16Array(ile.getEntry((id * 6) + 1)),
                        intensity: new Uint8Array(ile.getEntry((id * 6) + 2))
                    },
                    textureInfo: new Uint8Array(ile.getEntry(id * 6)),
                });
                index += 1;
            }
        }
        return groundSections;
    }

    private loadObjectInfo(objectsDV, x, z, index): ObjectInfo {
        const offset = index * 48;
        const ox = objectsDV.getInt32(offset + 12, true);
        const oy = objectsDV.getInt32(offset + 8, true);
        const oz = objectsDV.getInt32(offset + 4, true);
        const angle = objectsDV.getUint8(offset + 21) >> 2;
        const soundType = objectsDV.getInt16(offset + 16, true);
        return {
            index: objectsDV.getUint32(offset, true),
            x: (((0x8000 - ox) + 512) * WORLD_SCALE) + (x * WORLD_SIZE * 2),
            y: oy * WORLD_SCALE,
            z: (oz * WORLD_SCALE) + (z * WORLD_SIZE * 2),
            angle,
            iv: 1,
            soundType,
        };
    }

    private loadSeaSections(): SeaSection[] {
        const seaSections: SeaSection[] = [];
        const indexedSections = new Map<string, SeaSection>();
        for (let x = -20; x <= 20; x += 1) {
            for (let z = -20; z <= 20; z += 1) {
                const distanceFromGround = this.computeDistanceFromGround(x, z);
                if (distanceFromGround < 12) {
                    const section = {
                        x,
                        z,
                        lod: Math.min(distanceFromGround, 5),
                        reduceEdges: []
                    };
                    seaSections.push(section);
                    indexedSections[[x, z].join(',')] = section;
                }
            }
        }
        const nbs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        indexedSections.forEach((section) => {
            if (section.lod === 0)
                return;

            for (const nb of nbs) {
                const index = [section.x - nb[0], section.z + nb[1]].toString();
                const nearSection = indexedSections.get(index);
                if (nearSection && nearSection.lod < section.lod) {
                    section.reduceEdges.push(nb.join(','));
                }
            }
        });
        return seaSections;
    }

    private computeDistanceFromGround(x, z) {
        let minLength = 32;
        for (const section of this.groundSections) {
            const sx = section.x * 2;
            const sz = section.z * 2;
            for (let i = 0; i < 4; i += 1) {
                const dx = Math.floor(i / 2);
                const dz = i % 2;
                const length = Math.sqrt(Math.pow((sx + dx) - x, 2) + Math.pow((sz + dz) - z, 2));
                minLength = Math.min(minLength, Math.floor(length));
            }
        }
        return minLength;
    }
}
