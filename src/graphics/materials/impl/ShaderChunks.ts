import * as THREE from 'three';

import lba_bones_pars_vertex from './ShaderChunks/lba_bones_pars_vertex.glsl';
import lba_bones_vertex from './ShaderChunks/lba_bones_vertex.glsl';
import lba_map_pars_fragment from './ShaderChunks/lba_map_pars_fragment.glsl';
import lba_map_fragment from './ShaderChunks/lba_map_fragment.glsl';
import mix_map_color_fragment from './ShaderChunks/mix_map_color_fragment.glsl';
import uvgroup_pars_vertex from './ShaderChunks/uvgroup_pars_vertex.glsl';
import uvgroup_vertex from './ShaderChunks/uvgroup_vertex.glsl';
import uvgroup_pars_fragment from './ShaderChunks/uvgroup_pars_fragment.glsl';

let registered = false;

export function registerShaderChunks()  {
    if (registered) {
        return;
    }

    Object.assign(THREE.ShaderChunk, {
        lba_bones_pars_vertex,
        lba_bones_vertex,
        lba_map_pars_fragment,
        lba_map_fragment,
        mix_map_color_fragment,
        uvgroup_pars_vertex,
        uvgroup_vertex,
        uvgroup_pars_fragment,
    });
    registered = true;
}
