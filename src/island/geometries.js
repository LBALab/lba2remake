import THREE from 'three';
import {
    loadSubTexture,
    loadTextureWithMipmaps
} from '../texture';

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

export function prepareGeometries({env, files: {ile, ress}, palette}) {
    return {
        colored: {
            positions: [],
            colors: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: colored_vertex,
                fragmentShader: colored_fragment,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(env.skyColor)},
                    fogDensity: {value: env.fogDensity}
                }
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
                    fogColor: {value: new THREE.Vector3().fromArray(env.skyColor)},
                    fogDensity: {value: env.fogDensity},
                    texture: {value: loadTextureWithMipmaps(ile.getEntry(1), palette)}
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
                    fogColor: {value: new THREE.Vector3().fromArray(env.skyColor)},
                    fogDensity: {value: env.fogDensity},
                    texture: {value: loadTextureWithMipmaps(ile.getEntry(2), palette)}
                }
            })
        },
        atlas2: {
            positions: [],
            colors: [],
            uvs: [],
            uvGroups: [],
            material: new THREE.RawShaderMaterial({
                transparent: true,
                vertexShader: atlas_vertex,
                fragmentShader: atlas_fragment,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(env.skyColor)},
                    fogDensity: {value: env.fogDensity},
                    texture: {value: loadTextureWithMipmaps(ile.getEntry(2), palette)}
                }
            })
        },
        sea: {
            positions: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: env.index != 14 ? sea_vertex : moon_vertex,
                fragmentShader: env.index != 14 ? sea_fragment : env_fragment,
                wireframe: false,
                uniforms: {
                    texture: {value: loadSubTexture(ress.getEntry(env.index), palette, 0, 0, 128, 128)},
                    fogColor: {value: new THREE.Vector3().fromArray(env.skyColor)},
                    fogDensity: {value: env.fogDensity},
                    time: {value: 0.0},
                    scale: {value: 512.0}
                }
            })
        },
        sky: {
            material: new THREE.RawShaderMaterial({
                vertexShader: env_vertex,
                fragmentShader: env_fragment,
                uniforms: {
                    texture: {value: loadSubTexture(ress.getEntry(env.index), palette, 128, 0, 128, 128)},
                    fogColor: {value: new THREE.Vector3().fromArray(env.skyColor)},
                    fogDensity: {value: env.fogDensity},
                    scale: {value: env.scale}
                }
            })
        }
    };
}
