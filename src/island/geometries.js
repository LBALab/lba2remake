import THREE from 'three';
import {loadTexture, loadSubTexture} from '../texture';

import colored_vertex from './shaders/colored.vert.glsl';
import colored_fragment from './shaders/colored.frag.glsl';
import textured_vertex from './shaders/textured.vert.glsl';
import textured_fragment from './shaders/textured.frag.glsl';
import atlas_vertex from './shaders/atlas.vert.glsl';
import atlas_fragment from './shaders/atlas.frag.glsl';
import sea_vertex from './shaders/sea.vert.glsl';
import sea_fragment from './shaders/sea.frag.glsl';
import env_vertex from './shaders/env.vert.glsl';
import env_fragment from './shaders/env.frag.glsl';
import moon_vertex from './shaders/moon.vert.glsl';

const skyScales = {
    11: 1.0,
    13: 2.0,
    14: 128.0,
    16: 1.0,
    17: 1.0
};

export function prepareGeometries(island) {
    return {
        colored: {
            positions: [],
            colors: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: colored_vertex,
                fragmentShader: colored_fragment
            })
        },
        textured: {
            positions: [],
            colors: [],
            uvs: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: textured_vertex,
                fragmentShader: textured_fragment,
                uniforms: {
                    texture: {value: loadTexture(island.files.ile.getEntry(1), island.palette)}
                }
            })
        },
        atlas: {
            positions: [],
            colors: [],
            uvs: [],
            uvGroups: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: atlas_vertex,
                fragmentShader: atlas_fragment,
                uniforms: {
                    texture: {value: loadTexture(island.files.ile.getEntry(2), island.palette)}
                }
            })
        },
        sea: {
            positions: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: island.skyIndex != 14 ? sea_vertex : moon_vertex,
                fragmentShader: island.skyIndex != 14 ? sea_fragment : env_fragment,
                wireframe: false,
                uniforms: {
                    texture: {value: loadSubTexture(island.files.ress.getEntry(island.skyIndex), island.palette, 0, 0, 128, 128)},
                    fogColor: {value: new THREE.Vector3().fromArray(island.skyColor)},
                    time: {value: 0.0},
                    scale: {value: 512.0}
                }
            }),
            material2: new THREE.MeshBasicMaterial({wireframe: true})
        },
        sky: {
            material: new THREE.RawShaderMaterial({
                vertexShader: env_vertex,
                fragmentShader: env_fragment,
                uniforms: {
                    texture: {value: loadSubTexture(island.files.ress.getEntry(island.skyIndex), island.palette, 128, 0, 128, 128)},
                    fogColor: {value: new THREE.Vector3().fromArray(island.skyColor)},
                    scale: {value: skyScales[island.skyIndex]}
                }
            })
        }
    };
}
