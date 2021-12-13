import * as THREE from 'three';
import { GLTFLoaderPlugin, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

interface GLTFParserExt extends GLTFParser {
    lightmapTextureCache?: {};
}

const exrLoader = new EXRLoader();
const rgbeLoader = new RGBELoader();

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
        if (!parser.lightmapTextureCache) {
            parser.lightmapTextureCache = {};
        }
        if ('exrImageIndex' in details || 'hdrImageIndex' in details) {
            const index = 'exrImageIndex' in details
                ? details.exrImageIndex
                : details.hdrImageIndex;
            const image = parser.json.images[index];
            if (image.bufferView in parser.lightmapTextureCache) {
                materialParams.lightMap = await parser.lightmapTextureCache[image.bufferView];
            } else {
                parser.lightmapTextureCache[image.bufferView] = new Promise((async (resolve) => {
                    const buffer = await parser.getDependency('bufferView', image.bufferView);
                    const imageData = 'exrImageIndex' in details
                        ? exrLoader.parse(buffer)
                        : rgbeLoader.parse(buffer);
                    const texture = new THREE.DataTexture(
                        imageData.data,
                        imageData.width,
                        imageData.height,
                        imageData.format,
                        imageData.type,
                    );
                    texture.flipY = 'exrImageIndex' in details;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    if ('hdrImageIndex' in details) {
                        texture.encoding = THREE.RGBEEncoding;
                    }
                    materialParams.lightMap = texture;
                    resolve(texture);
                }));
                await parser.lightmapTextureCache[image.bufferView];
            }
        }
        delete materialParams.metalness;
        delete materialParams.roughness;
        return;
    }
}
