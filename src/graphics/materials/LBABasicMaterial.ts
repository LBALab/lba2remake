import * as THREE from 'three';
import { omit } from 'lodash';
import { registerShaderChunks } from './impl/ShaderChunks';
import lba_basic_frag from './impl/ShaderLib/lba_basic_frag.glsl';
import lba_basic_vert from './impl/ShaderLib/lba_basic_vert.glsl';
import { BoneBindings } from '../../model/anim/types';
import { paletteUniform, registerPalette } from './impl/PalUtils';

const { UniformsLib } = THREE;

registerShaderChunks();

interface LBABasicMaterialParams extends THREE.MeshBasicMaterialParameters {
    mixColorAndTexture?: boolean;
    useTextureAtlas?: boolean;
    atlasMode?: 'model' | 'island';
    useIndexedColors?: boolean;
    palExposure?: number;
    bones?: BoneBindings;
}

/**
 * This is similar to THREE.MeshBasicMaterial, but it also adds
 * extra capabilities such as mixing textures with vertex colors, and
 * texture atlas support.
 */
export default class LBABasicMaterial extends THREE.MeshBasicMaterial {
    mixColorAndTexture = false;
    useTextureAtlas = false;
    atlasMode: 'model' | 'island' = 'model';
    useIndexedColors = false;
    palExposure = 3;

    constructor(parameters: LBABasicMaterialParams = {}) {
        super(omit(parameters, [
            'mixColorAndTexture',
            'useTextureAtlas',
            'atlasMode',
            'useIndexedColors',
            'palExposure',
        ]));

        this.type = 'LBABasicMaterial';

        if ('palExposure' in parameters) {
            this.palExposure = parameters.palExposure;
        }

        if (parameters.mixColorAndTexture) {
            this.defines.USE_MIX_MAP_COLOR = '';
            this.defines.USE_COLOR = '';
        }
        if (parameters.useTextureAtlas) {
            this.defines.USE_TEXTURE_ATLAS = '';
        }
        if (parameters.atlasMode === 'island') {
            this.defines.USE_ATLAS_ISLAND_MODE = '';
        }
        if (parameters.useIndexedColors) {
            this.defines.USE_INDEXED_COLORS = '';
            this.defines.PAL_EXPOSURE = this.palExposure.toFixed(3);
        }

        this.mixColorAndTexture = !!parameters.mixColorAndTexture;
        this.useTextureAtlas = !!parameters.useTextureAtlas;
        this.useIndexedColors = !!parameters.useIndexedColors;
        this.atlasMode = parameters.atlasMode || 'model';

        registerPalette();
    }

    copy(source: LBABasicMaterial) {
        super.copy(source);

        if (source.mixColorAndTexture) {
            this.defines.USE_MIX_MAP_COLOR = '';
            this.defines.USE_COLOR = '';
        }
        if (source.useTextureAtlas) {
            this.defines.USE_TEXTURE_ATLAS = '';
        }
        if (source.atlasMode === 'island') {
            this.defines.USE_ATLAS_ISLAND_MODE = '';
        }
        if (source.useIndexedColors) {
            this.defines.USE_INDEXED_COLORS = '';
            this.defines.PAL_EXPOSURE = source.palExposure.toFixed(3);
        }

        this.useTextureAtlas = source.useTextureAtlas;
        this.mixColorAndTexture = source.mixColorAndTexture;
        this.atlasMode = source.atlasMode;
        this.useIndexedColors = source.useIndexedColors;
        this.palExposure = source.palExposure;

        return this;
    }

    defines: any = {};
    vertexShader = lba_basic_vert;
    fragmentShader = lba_basic_frag;
    uniforms = THREE.UniformsUtils.merge([
        UniformsLib.common,
        UniformsLib.specularmap,
        UniformsLib.envmap,
        UniformsLib.aomap,
        UniformsLib.lightmap,
        UniformsLib.fog,
        {
            palette: paletteUniform,
        }
    ]);
}
