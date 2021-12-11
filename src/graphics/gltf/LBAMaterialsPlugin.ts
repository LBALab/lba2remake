import { GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
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
