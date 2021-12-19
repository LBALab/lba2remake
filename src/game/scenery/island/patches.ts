import * as THREE from 'three';
import { IslandProps } from './data/islands';
import { IslandOptions } from './Island';
import { IslandObjectInfo } from './IslandLayout';
import { IslandModel } from './model';
import { IslandObjectSection } from './objects';

let DEBUG_OBJECTS = false;

const emeraldRoofLampMat = new THREE.MeshPhysicalMaterial({
    emissive: 0x00ff77,
    emissiveIntensity: 20.0,
});

const patchesPerIsland: Record<string, PatchDefinition[]> = {
    CITADEL: [
        {
            model: 26,
            sections: [3, 4],
            data: {
                group: 'lamps',
                getMaterial: () => new THREE.MeshPhysicalMaterial({
                    emissive: 0xffff88,
                    emissiveIntensity: 10.0,
                }),
            },
            addObjects: () => {
                const lamp = new THREE.PointLight();
                lamp.color.set(0xffffbb);
                lamp.intensity = 500.0;
                lamp.decay = 2;
                lamp.userData.radius = 0.6;
                lamp.position.set(0, 3, 0);
                return [lamp];
            }
        },
        {
            model: 74,
            sections: [1],
            data: {
                group: 'objects_textured_lighthouse_lamp',
                getMaterial: baseGeom => new THREE.MeshPhysicalMaterial({
                    emissive: 0xffff88,
                    emissiveIntensity: 10.0,
                    map: baseGeom.material.uniforms.uTexture.value,
                    userData: {
                        useTextureAtlas: true,
                    }
                }),
                onlyIf: ({faceNormal}) => Math.abs(faceNormal[1]) < 0.000001,
            }
        },
        {
            model: 31,
            sections: [0],
            data: {
                group: 'windows',
                getMaterial: () => new THREE.MeshPhysicalMaterial({
                    emissive: 0xffff88,
                    emissiveIntensity: 2.0,
                }),
            }
        }
    ],
    EMERAUDE: [
        {
            model: 17,
            sections: [2],
            data: {
                group: 'ground_lamps',
                getMaterial: () => new THREE.MeshPhysicalMaterial({
                    emissive: 0xffffcc,
                    emissiveIntensity: 10.0,
                }),
            }
        },
        {
            model: 20,
            sections: [2, 3],
            data: {
                group: 'spaceship_windows',
                getMaterial: () => new THREE.MeshPhysicalMaterial({
                    color: 0x2787A7,
                    emissive: 0x2787A7,
                    emissiveIntensity: 1.0,
                }),
            }
        },
        {
            model: 21,
            sections: [2],
            data: {
                group: 'spaceship_windows',
                getMaterial: () => new THREE.MeshPhysicalMaterial({
                    color: 0x2787A7,
                    emissive: 0x2787A7,
                    emissiveIntensity: 1.0,
                }),
                onlyIf: ({basePos}) => basePos[0] > -1
            }
        },
        {
            model: 0,
            sections: [2],
            data: {
                group: 'roof_lamps',
                getMaterial: () => emeraldRoofLampMat,
            }
        },
        {
            model: 2,
            sections: [1],
            data: {
                group: 'roof_lamps',
                getMaterial: () => emeraldRoofLampMat,
            }
        },
        {
            model: 3,
            sections: [0],
            data: {
                group: 'roof_lamps',
                getMaterial: () => emeraldRoofLampMat,
            }
        },
        {
            model: 4,
            sections: [0],
            data: {
                group: 'roof_lamps',
                getMaterial: () => emeraldRoofLampMat,
            }
        },
        {
            model: 12,
            sections: [0, 1],
            data: {
                group: 'roof_lamps',
                getMaterial: () => emeraldRoofLampMat,
            }
        }
    ],
    OTRINGAL: [
        {
            model: 2,
            sections: [0],
            data: {
                group: 'lamps',
                getMaterial: () => new THREE.MeshPhysicalMaterial({
                    emissive: 0xffffdd,
                    emissiveIntensity: 100.0,
                }),
            }
        },
    ]
};

export interface IslandObjectPatch {
    group: string;
    getMaterial: (baseGeomGroup) => THREE.Material;
    onlyIf?: (info) => boolean;
}

interface PatchDefinition {
    model: number;
    sections: number[];
    data: IslandObjectPatch;
    addObjects?: () => THREE.Object3D[];
}

export function getObjectPatch(
    island: IslandProps,
    model: IslandModel,
    section: IslandObjectSection,
    options: IslandOptions,
): IslandObjectPatch {
    if ((options.export || DEBUG_OBJECTS) && island.name in patchesPerIsland) {
        const patches = patchesPerIsland[island.name];
        for (const patch of patches) {
            if (patch.model === model.index && patch.sections.includes(section.index)) {
                return patch.data;
            }
        }
    }
}

export function addObjects(island: string, obj: IslandObjectInfo): THREE.Object3D[] {
    if (island in patchesPerIsland) {
        const patches = patchesPerIsland[island];
        for (const patch of patches) {
            if (patch.model === obj.index && patch.addObjects) {
                return patch.addObjects();
            }
        }
    }
    return [];
}

// @ts-ignore
function debugObject(island: string, model: number) {
    DEBUG_OBJECTS = true;
    const colors = [
        0x00ff00,
        0x0000ff,
        0xffff00,
        0xff0000,
        0x00ffff,
        0xffffff,
        0xaaffaa,
        0xaaaaff,
        0xffffaa,
        0xffaaaa,
        0xaaffff,
        0xaaaaaa,
    ];
    if (!(island in patchesPerIsland)) {
        patchesPerIsland[island] = [];
    }
    for (let i = 0; i < colors.length; i += 1) {
        patchesPerIsland[island].push({
            model,
            sections: [i],
            data: {
                group: `DBG_${model}_${i}`,
                getMaterial: () => new THREE.MeshBasicMaterial({
                    color: colors[i],
                    fog: false,
                }),
            }
        });
    }
}
