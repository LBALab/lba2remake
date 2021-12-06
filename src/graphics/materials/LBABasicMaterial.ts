import * as THREE from 'three';
import { omit } from 'lodash';
import { registerShaderChunks } from './impl/ShaderChunks';
import lba_basic_frag from './impl/ShaderLib/lba_basic_frag.glsl';
import lba_basic_vert from './impl/ShaderLib/lba_basic_vert.glsl';
import { BoneBindings } from '../../model/anim/types';

const { UniformsLib } = THREE;

registerShaderChunks();

interface LBABasicMaterialParams extends THREE.MeshBasicMaterialParameters {
    mixColorAndTexture?: boolean;
    useTextureAtlas?: boolean;
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

    constructor(parameters: LBABasicMaterialParams = {}) {
        super(omit(parameters, ['mixColorAndTexture', 'useTextureAtlas']));

        this.type = 'LBABasicMaterial';

        if (parameters.mixColorAndTexture) {
            this.defines.USE_MIX_MAP_COLOR = '';
            this.defines.USE_COLOR = '';
        }
        if (parameters.useTextureAtlas) {
            this.defines.USE_TEXTURE_ATLAS = '';
        }

        this.mixColorAndTexture = !!parameters.mixColorAndTexture;
        this.useTextureAtlas = !!parameters.useTextureAtlas;
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

        this.useTextureAtlas = source.useTextureAtlas;
        this.mixColorAndTexture = source.mixColorAndTexture;

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
        UniformsLib.fog
    ]);
}
