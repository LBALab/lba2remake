import * as THREE from 'three';
import { omit } from 'lodash';
import { registerShaderChunks } from './impl/ShaderChunks';
import lba_physical_frag from './impl/ShaderLib/lba_physical_frag.glsl';
import lba_physical_vert from './impl/ShaderLib/lba_physical_vert.glsl';
import { BoneBindings } from '../../model/anim/types';

const { UniformsLib } = THREE;

registerShaderChunks();

interface LBAStandardMaterialParams extends THREE.MeshStandardMaterialParameters {
    mixColorAndTexture?: boolean;
    useTextureAtlas?: boolean;
    atlasMode?: 'model' | 'island';
    bones?: BoneBindings;
}

/**
 * This is similar to THREE.MeshStandardMaterial, but it also adds
 * extra capabilities such as mixing textures with vertex colors, and
 * texture atlas support.
 */
export default class LBAStandardMaterial extends THREE.MeshStandardMaterial {
    mixColorAndTexture = false;
    useTextureAtlas = false;
    atlasMode: 'model' | 'island' = 'model';
    bones: BoneBindings;

    constructor(parameters: LBAStandardMaterialParams = {}) {
        super(omit(parameters, [
            'mixColorAndTexture',
            'useTextureAtlas',
            'atlasMode',
            'bones'
        ]));

        this.roughness = 0.75;

        this.type = 'LBAStandardMaterial';

        if (parameters.mixColorAndTexture) {
            this.defines.USE_MIX_MAP_COLOR = '';
        }
        if (parameters.useTextureAtlas) {
            this.defines.USE_TEXTURE_ATLAS = '';
        }
        if (parameters.atlasMode === 'island') {
            this.defines.USE_ATLAS_ISLAND_MODE = '';
        }
        if (parameters.bones) {
            this.defines.USE_LBA_BONES = '';
            this.uniforms.bonePos.value = parameters.bones.position;
            this.uniforms.boneRot.value = parameters.bones.rotation;
        }

        this.mixColorAndTexture = !!parameters.mixColorAndTexture;
        this.useTextureAtlas = !!parameters.useTextureAtlas;
        this.atlasMode = parameters.atlasMode || 'model';
        this.bones = parameters.bones;
    }

    copy(source: LBAStandardMaterial) {
        super.copy(source);

        if (source.mixColorAndTexture) {
            this.defines.USE_MIX_MAP_COLOR = '';
        }
        if (source.useTextureAtlas) {
            this.defines.USE_TEXTURE_ATLAS = '';
        }
        if (source.atlasMode === 'island') {
            this.defines.USE_ATLAS_ISLAND_MODE = '';
        }
        if (source.bones) {
            this.defines.USE_LBA_BONES = '';
            this.uniforms.bonePos.value = source.bones.position;
            this.uniforms.boneRot.value = source.bones.rotation;
        }

        this.useTextureAtlas = source.useTextureAtlas;
        this.mixColorAndTexture = source.mixColorAndTexture;
        this.atlasMode = source.atlasMode;
        this.bones = source.bones;

        return this;
    }

    vertexShader = lba_physical_vert;
    fragmentShader = lba_physical_frag;
    uniforms = THREE.UniformsUtils.merge([
        UniformsLib.common,
        UniformsLib.envmap,
        UniformsLib.aomap,
        UniformsLib.lightmap,
        UniformsLib.emissivemap,
        UniformsLib.bumpmap,
        UniformsLib.normalmap,
        UniformsLib.displacementmap,
        UniformsLib.roughnessmap,
        UniformsLib.metalnessmap,
        UniformsLib.fog,
        UniformsLib.lights,
        {
            emissive: { value: new THREE.Color(0x000000) },
            roughness: { value: 1.0 },
            metalness: { value: 0.0 },
            envMapIntensity: { value: 1 },
            bonePos: { value: [] },
            boneRot: { value: [] },
        }
    ]);
}
