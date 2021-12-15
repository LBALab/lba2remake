import * as THREE from 'three';
import { GLTF, GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import LBABasicMaterial from '../materials/LBABasicMaterial';
import LBAStandardMaterial from '../materials/LBAStandardMaterial';

export default class LBAMaterialsPlugin implements GLTFLoaderPlugin {
    parser: GLTFParser;
    name = 'LBA2R_lba_materials';

    constructor(parser: GLTFParser) {
        this.parser = parser;
    }

    async afterRoot(result: GLTF) {
        result.scene.traverse((node) => {
            if (node instanceof THREE.Mesh) {
                const material = node.material;
                if (material instanceof LBAStandardMaterial ||
                    material instanceof LBABasicMaterial) {
                    const { useTextureAtlas, atlasMode } = material;
                    if (useTextureAtlas && atlasMode === 'island') {
                        const { attributes } = node.geometry;
                        if ('texcoord_2' in attributes && 'texcoord_3' in attributes) {
                            const texcoord_2 = attributes.texcoord_2.array;
                            const texcoord_3 = attributes.texcoord_3.array;
                            const uvGroup = new Uint16Array(texcoord_2.length * 2);
                            for (let i = 0; i < texcoord_2.length; i += 2) {
                                uvGroup[i * 2] = texcoord_2[i];
                                uvGroup[i * 2 + 1] = texcoord_2[i + 1];
                                uvGroup[i * 2 + 2] = texcoord_3[i];
                                uvGroup[i * 2 + 3] = texcoord_3[i + 1];
                            }
                            node.geometry.setAttribute(
                                'uvgroup',
                                new THREE.BufferAttribute(uvGroup, 4)
                            );
                            node.geometry.deleteAttribute('texcoord_2');
                            node.geometry.deleteAttribute('texcoord_3');
                        }
                    }
                }
            }
        });
    }

    getMaterialType(materialIndex) {
        const parser = this.parser;
        const materialDef = parser.json.materials[materialIndex];
        if (materialDef.extensions && materialDef.extensions[this.name]) {
            const details = materialDef.extensions[this.name];
            const { mixColorAndTexture, useTextureAtlas } = details;
            const unlit = materialDef.extensions.LBA2R_lightmaps;
            if (mixColorAndTexture || useTextureAtlas) {
                return unlit ? LBABasicMaterial : LBAStandardMaterial;
            }
        }
        return null;
    }

    async extendMaterialParams(materialIndex, materialParams): Promise<any> {
        const parser = this.parser;
        const materialDef = parser.json.materials[materialIndex];
        if (materialDef.extensions && materialDef.extensions[this.name]) {
            const details = materialDef.extensions[this.name];
            const { mixColorAndTexture, useTextureAtlas, atlasMode } = details;
            if (mixColorAndTexture) {
                materialParams.mixColorAndTexture = true;
            }
            if (useTextureAtlas) {
                materialParams.useTextureAtlas = true;
            }
            if (atlasMode) {
                materialParams.atlasMode = atlasMode;
            }
        }
        return;
    }
}
