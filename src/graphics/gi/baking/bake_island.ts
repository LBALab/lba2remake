import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

import {
    getPalette,
} from '../../../resources';
import { buildAtlas } from '../../uvAltas/atlas';
import Island from '../../../game/scenery/island/Island';
import IslandAmbience from '../../../ui/editor/areas/island/browser/ambience';
import { BakeObject, BakeParams } from './bake';

const cache: Record<string, BakeObject> = {};

export async function bakeIsland(name: string, params: BakeParams): Promise<BakeObject> {
    if (name in cache) {
        params.startProgress('Loading from cache').done();
        return cache[name];
    }
    // tslint:disable-next-line:no-console
    const glb = await exportIslandForBaking(name, params);
    const obj = {
        type: 'island' as const,
        glb,
        name,
    };
    cache[name] = obj;
    return obj;
}

export async function exportIslandForBaking(
    name: string,
    params?: BakeParams
) {
    const ambience = IslandAmbience[name];
    const island = await Island.loadForExport(name, ambience);
    let p = params?.startProgress('Patching island');
    const objToExport = island.threeObject;
    await patchIslandObject(objToExport);
    p?.done();
    p = params?.startProgress('Building atlas');
    if (params?.cancelled)
        throw new Error('Cancelled');
    await buildAtlas(objToExport);
    p?.progress(0.8);
    await patchTextureCoords(objToExport);
    p?.done();
    p = params?.startProgress('Preparing GLB file');
    if (params?.cancelled)
        throw new Error('Cancelled');
    const glb = exportAsGLB(objToExport);
    p?.done();
    return glb;
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

async function patchTextureCoords(islandObject: THREE.Object3D) {
    islandObject.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const geom = node.geometry;
            const uvGroup = geom.attributes.uvGroup;
            if (uvGroup) {
                const uv3 = new Uint16Array(uvGroup.count * 2);
                const uv4 = new Uint16Array(uvGroup.count * 2);
                for (let i = 0; i < uvGroup.count; i += 1) {
                    uv3[i * 2] = uvGroup.array[i * 4];
                    uv3[i * 2 + 1] = uvGroup.array[i * 4 + 1];
                    uv4[i * 2] = uvGroup.array[i * 4 + 2];
                    uv4[i * 2 + 1] = uvGroup.array[i * 4 + 3];
                }
                geom.attributes.TEXCOORD_2 = new THREE.BufferAttribute(uv3, 2);
                geom.attributes.TEXCOORD_3 = new THREE.BufferAttribute(uv4, 2);
            }
            delete geom.attributes.uvGroup;
        }
    });
}

async function exportAsGLB(threeObject: THREE.Object3D) {
    const exporter = new GLTFExporter();
    return new Promise<ArrayBuffer>((resolve) => {
        exporter.parse(threeObject, (glb: ArrayBuffer) => {
            resolve(glb);
        }, {
            binary: true,
            embedImages: true
        });
    });
}
