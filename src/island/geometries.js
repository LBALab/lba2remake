import THREE from 'three';
import {
    loadSubTexture,
    loadTextureWithMipmaps,
    loadPaletteTexture,
    loadTextureWithoutPalette
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

export function prepareGeometries({envInfo, data: {files: {ile, ress}, palette}}) {
    const paletteTexture = loadPaletteTexture(palette);
    const atlasTexture = loadTextureWithoutPalette(ile.getEntry(2));
    return {
        colored: {
            positions: [],
            colorInfos: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: colored_vertex,
                fragmentShader: colored_fragment,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    palette: {value: paletteTexture}
                }
            })
        },
        textured: {
            positions: [],
            colorInfos: [],
            uvs: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: textured_vertex,
                fragmentShader: textured_fragment,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: loadTextureWithoutPalette(ile.getEntry(1))},
                    palette: {value: paletteTexture}
                }
            })
        },
        atlas: {
            positions: [],
            colorInfos: [],
            uvs: [],
            uvGroups: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: atlas_vertex,
                fragmentShader: atlas_fragment,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: atlasTexture},
                    palette: {value: paletteTexture}
                }
            })
        },
        atlas2: {
            positions: [],
            colorInfos: [],
            uvs: [],
            uvGroups: [],
            material: new THREE.RawShaderMaterial({
                transparent: true,
                vertexShader: atlas_vertex,
                fragmentShader: atlas_fragment,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: atlasTexture},
                    palette: {value: paletteTexture}
                }
            })
        },
        sea: {
            positions: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: envInfo.index != 14 ? sea_vertex : moon_vertex,
                fragmentShader: envInfo.index != 14 ? sea_fragment : env_fragment,
                wireframe: false,
                uniforms: {
                    texture: {value: loadSubTexture(ress.getEntry(envInfo.index), palette, 0, 0, 128, 128)},
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
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
                    texture: {value: loadSubTexture(ress.getEntry(envInfo.index), palette, 128, 0, 128, 128)},
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    scale: {value: envInfo.scale}
                }
            })
        }
    };
}
