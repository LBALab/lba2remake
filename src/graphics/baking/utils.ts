import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { BakeState } from './bake';

export async function exportAsGLB(threeObject: THREE.Object3D, params: BakeState) {
    const p = params?.startProgress('Exporting model');
    const exporter = new GLTFExporter();
    const glb = await new Promise<ArrayBuffer>((resolve) => {
        exporter.parse(threeObject, (buffer: ArrayBuffer) => {
            resolve(buffer);
        }, {
            binary: true,
            embedImages: true
        });
    });
    p?.done();
    return glb;
}

export async function patchTextureCoords(islandObject: THREE.Object3D) {
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
