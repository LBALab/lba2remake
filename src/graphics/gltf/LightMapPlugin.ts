import * as THREE from 'three';
import { GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
interface GLTFParserExt extends GLTFParser {
    floatTextureCache?: {};
}

const exrLoader = new EXRLoader();

export default class LightMapPlugin implements GLTFLoaderPlugin {
    parser: GLTFParserExt;
    name = 'LBA2R_lightmaps';

    constructor(parser: GLTFParserExt) {
        this.parser = parser;
    }

    getMaterialType(materialIndex) {
        const parser = this.parser;
        const materialDef = parser.json.materials[materialIndex];
        if (!materialDef.extensions || !materialDef.extensions[this.name]) {
            return null;
        }
        if (materialDef.extensions && materialDef.extensions.LBA2R_lba_materials) {
            return null;
        }
        return THREE.MeshBasicMaterial;
    }

    async extendMaterialParams(materialIndex, materialParams): Promise<any> {
        const parser = this.parser;
        const materialDef = parser.json.materials[materialIndex];
        if (!materialDef.extensions || !materialDef.extensions[this.name]) {
            return;
        }
        const details = materialDef.extensions[this.name];
        if (!parser.floatTextureCache) {
            parser.floatTextureCache = {};
        }
        if ('exrImageIndex' in details) {
            const image = parser.json.images[details.exrImageIndex];
            if (image.bufferView in parser.floatTextureCache) {
                materialParams.lightMap = parser.floatTextureCache[image.bufferView];
            } else {
                const buffer = await parser.getDependency('bufferView', image.bufferView);
                const imageData = exrLoader.parse(buffer);
                const texture = new THREE.DataTexture(
                    imageData.data,
                    imageData.width,
                    imageData.height,
                    imageData.format,
                    imageData.type,
                );
                texture.flipY = true;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                materialParams.lightMap = texture;
                parser.floatTextureCache[image.bufferView] = texture;
            }
        } else if (details.bufferView in parser.floatTextureCache) {
            materialParams.lightMap = parser.floatTextureCache[details.bufferView];
        } else {
            const buffer = await parser.getDependency('bufferView', details.bufferView);
            const data = new Float32Array(buffer);
            const texture = new THREE.DataTexture(
                data,
                details.width,
                details.height,
                THREE.RGBAFormat,
                THREE.FloatType,
            );
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            parser.floatTextureCache[details.bufferView] = texture;
            materialParams.lightMap = texture;
        }
        delete materialParams.metalness;
        delete materialParams.roughness;
        return;
    }
}
