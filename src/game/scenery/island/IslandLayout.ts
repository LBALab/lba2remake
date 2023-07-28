import { WORLD_SCALE, WORLD_SIZE } from '../../../utils/lba';
import { IslandOptions } from './Island';

export interface IslandObjectInfo {
    index: number;
    x: number;
    y: number;
    z: number;
    angle: number;
    iv: number;
    soundType: number;
    boundingBox?: THREE.Box3;
    label?: THREE.Object3D;
    flags: number;
    flagValue: number;
}

export interface RawGroundMesh {
    triangles: Uint32Array;
    heightmap: Uint16Array;
    intensity: Uint8Array;
}

export interface IslandSection {
    id: number;
    index: number;
    x: number;
    z: number;
    objects: IslandObjectInfo[];
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
    readonly groundSections: IslandSection[];
    readonly seaSections: SeaSection[];

    constructor(ile, options: IslandOptions) {
        this.groundSections = this.loadGroundSections(ile, options);
        this.seaSections = this.loadSeaSections();
    }

    private loadGroundSections(ile, options: IslandOptions): IslandSection[] {
        const layout_raw = new Uint8Array(ile.getEntry(0));
        const groundSections: IslandSection[] = [];
        let index = 0;
        for (let i = 0; i < 256; i += 1) {
            const sX = Math.floor(i / 16);
            const sZ = i % 16;
            if (layout_raw[i]) {
                const id = layout_raw[i];
                const objInfoDV = new DataView(ile.getEntry((id * 6) - 3));
                const objectsBuffer = ile.getEntry((id * 6) - 2);
                const objectsDV = objectsBuffer && new DataView(objectsBuffer);
                const numObjects = objInfoDV.getUint32(8, true);
                const x = (16 - sX) - 8;
                const z = sZ - 8;
                const objects: IslandObjectInfo[] = [];
                for (let j = 0; j < numObjects; j += 1) {
                    const obj = this.loadObjectInfo(objectsDV, x, z, j);
                    if (options.flags && obj.flags && options.flags[obj.flags] !== obj.flagValue) {
                        continue;
                    }
                    objects.push(obj);
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

    private loadObjectInfo(objectsDV, x, z, index): IslandObjectInfo {
        const offset = index * 48;
        const ox = objectsDV.getInt32(offset + 12, true);
        const oy = objectsDV.getInt32(offset + 8, true);
        const oz = objectsDV.getInt32(offset + 4, true);
        const angle = objectsDV.getUint8(offset + 21) >> 2;
        const flags = objectsDV.getUint8(offset + 22);
        const flagValue = objectsDV.getUint8(offset + 23);
        const soundType = objectsDV.getInt16(offset + 16, true);
        return {
            index: objectsDV.getUint32(offset, true),
            x: (((0x8000 - ox) + 512) * WORLD_SCALE) + (x * WORLD_SIZE * 2),
            y: oy * WORLD_SCALE,
            z: (oz * WORLD_SCALE) + (z * WORLD_SIZE * 2),
            angle,
            iv: 1,
            soundType,
            flags,
            flagValue,
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
