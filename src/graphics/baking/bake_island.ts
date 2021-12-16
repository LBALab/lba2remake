import * as THREE from 'three';

import {
    getPalette,
} from '../../resources';
import { buildAtlas } from './xatlas/atlas';
import Island from '../../game/scenery/island/Island';
import IslandAmbience from '../../ui/editor/areas/island/browser/ambience';
import { BakeObject, BakeState } from './bake';
import { exportAsGLB, patchTextureCoords } from './utils';

export async function bakeIsland(name: string, params: BakeState): Promise<BakeObject> {
    const ambience = IslandAmbience[name];
    const island = await Island.loadForExport(name, ambience);
    const objToExport = island.threeObject;
    await patchIslandObject(objToExport);
    await buildAtlas(objToExport, params);
    await patchTextureCoords(objToExport);
    return {
        type: 'island' as const,
        glb: await exportAsGLB(objToExport, params),
        name,
    };
}

async function patchIslandObject(islandObject: THREE.Object3D) {
    const palette = await getPalette();
    islandObject.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const geom = node.geometry.clone() as THREE.BufferGeometry;
            node.geometry = geom;
            if (!geom.index) {
                const numVertex = geom.attributes.position.count;
                const indexArray = new Uint32Array(numVertex);
                for (let i = 0; i < numVertex; i += 1) {
                    indexArray[i] = i;
                }
                geom.setIndex(new THREE.BufferAttribute(
                    indexArray,
                    1
                ));
            }
            const transformTexture = () => {
                const mat = node.material as THREE.RawShaderMaterial;
                node.material = new THREE.MeshStandardMaterial({
                    map: mat.uniforms.uTexture.value,
                    transparent: mat.transparent
                });
            };
            switch (node.name) {
                case 'ground_textured': {
                    transformTexture();
                    node.material.userData.mixColorAndTexture = true;
                    geom.attributes.uv.normalized = true;
                    break;
                }
                case 'objects_textured':
                case 'objects_textured_transparent': {
                    transformTexture();
                    node.material.userData.useTextureAtlas = true;
                    break;
                }
                default: {
                    if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                        node.material = new THREE.MeshStandardMaterial();
                    }
                    break;
                }
            }
            if (geom.attributes.color) {
                const numVertex = geom.attributes.color.count;
                const colorArray = new Uint8Array(numVertex * 3);
                for (let i = 0; i < numVertex; i += 1) {
                    const p = geom.attributes.color.array[i];
                    if (p > 0) {
                        const pal = p * 16 + 7;
                        colorArray[i * 3] = palette[pal * 3];
                        colorArray[i * 3 + 1] = palette[pal * 3 + 1];
                        colorArray[i * 3 + 2] = palette[pal * 3 + 2];
                    } else {
                        colorArray[i * 3] = 0xFF;
                        colorArray[i * 3 + 1] = 0xFF;
                        colorArray[i * 3 + 2] = 0xFF;
                    }
                }
                geom.attributes.color = new THREE.BufferAttribute(
                    colorArray,
                    3,
                    true
                );
            }
        }
    });
}
