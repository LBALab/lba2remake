import * as THREE from 'three';

import mix_map_color_fragment from './ShaderChunks/mix_map_color_fragment.glsl';
import lba_bones_pars_vertex from './ShaderChunks/lba_bones_pars_vertex.glsl';
import lba_bones_vertex from './ShaderChunks/lba_bones_vertex.glsl';
import uvgroup_pars_vertex from './ShaderChunks/uvgroup_pars_vertex.glsl';
import uvgroup_vertex from './ShaderChunks/uvgroup_vertex.glsl';
import uvgroup_pars_fragment from './ShaderChunks/uvgroup_pars_fragment.glsl';
import lba_map_fragment from './ShaderChunks/lba_map_fragment.glsl';

let registered = false;

export function registerShaderChunks()  {
    if (registered) {
        return;
    }

    Object.assign(THREE.ShaderChunk, {
        mix_map_color_fragment,
        lba_bones_pars_vertex,
        lba_bones_vertex,
        uvgroup_pars_vertex,
        uvgroup_vertex,
        uvgroup_pars_fragment,
        lba_map_fragment,
    });
    registered = true;
}
