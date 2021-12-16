import * as THREE from 'three';
import IsoScenery from '../../game/scenery/isometric/IsoScenery';
import { getScene } from '../../resources';
import { BakeObject, BakeState } from './bake';
import { exportAsGLB, patchTextureCoords } from './utils';
import { buildAtlas } from './xatlas/atlas';

export async function bakeIsoGrid(isoGridIdx: number, params: BakeState): Promise<BakeObject> {
    const sceneData = await getScene(isoGridIdx);
    const isoScenery = await IsoScenery.loadForExport(sceneData);
    const objToExport = isoScenery.threeObject;
    await patchIsoScenery(objToExport);
    await buildAtlas(objToExport, params);
    await patchTextureCoords(objToExport);
    return {
        type: 'iso_scene' as const,
        glb: await exportAsGLB(objToExport, params),
        name: sceneData.sceneryIndex.toString(),
    };
}

function patchIsoScenery(threeObject: THREE.Object3D) {
    threeObject.traverse((node) => {
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
            if (node.name === 'iso_grid_standard') {
                const mat = node.material as THREE.RawShaderMaterial;
                node.material = new THREE.MeshStandardMaterial({
                    map: mat.uniforms.library.value,
                });
            } else if (node.name.startsWith('textured_')
                    && node.material instanceof THREE.RawShaderMaterial) {
                const mat = node.material as THREE.RawShaderMaterial;
                node.material = new THREE.MeshStandardMaterial({
                    map: mat.uniforms.uTexture.value,
                    transparent: mat.transparent
                });
            } else if (!(node.material instanceof THREE.MeshStandardMaterial)) {
                node.material = new THREE.MeshStandardMaterial();
            }
        }
    });
}
