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

    getMaterialType(materialIndex) {
        const parser = this.parser;
        const materialDef = parser.json.materials[materialIndex];
        if (materialDef.extras) {
            const { mixColorAndTexture, useTextureAtlas } = materialDef.extras;
            if (mixColorAndTexture || useTextureAtlas) {
                return LBAStandardMaterial;
            }
        }
        if (materialDef.extensions && materialDef.extensions[this.name]) {
            const details = materialDef.extensions[this.name];
            const { mixColorAndTexture, useTextureAtlas, unlit } = details;
            if (mixColorAndTexture || useTextureAtlas) {
                return unlit ? LBABasicMaterial : LBAStandardMaterial;
            }
        }
        return null;
    }

    async afterRoot(result: GLTF) {
        result.scene.traverse((node) => {
            if (node instanceof THREE.Mesh &&
                (node.material instanceof LBABasicMaterial ||
                    node.material instanceof LBAStandardMaterial)) {
                const attributes = node.geometry.attributes;
                if ('_uvgroup' in attributes) {
                    attributes.uvgroup = attributes._uvgroup;
                    delete attributes._uvgroup;
                }
            }
        });
    }

    async extendMaterialParams(materialIndex, materialParams): Promise<any> {
        const parser = this.parser;
        const materialDef = parser.json.materials[materialIndex];
        if (materialDef.extras) {
            const { mixColorAndTexture, useTextureAtlas } = materialDef.extras;
            if (mixColorAndTexture) {
                materialParams.mixColorAndTexture = true;
            }
            if (useTextureAtlas) {
                materialParams.useTextureAtlas = true;
            }
        }
        if (materialDef.extensions && materialDef.extensions[this.name]) {
            const details = materialDef.extensions[this.name];
            const { mixColorAndTexture, useTextureAtlas } = details;
            if (mixColorAndTexture) {
                materialParams.mixColorAndTexture = true;
            }
            if (useTextureAtlas) {
                materialParams.useTextureAtlas = true;
            }
        }
        return;
    }
}
