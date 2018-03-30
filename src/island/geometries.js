import {times} from 'lodash';
import * as THREE from 'three';
import {
    loadSubTexture,
    loadPaletteTexture,
    loadTexture
} from '../texture';

import VERT_GROUND_COLORED from './shaders/ground/colored.vert.glsl';
import FRAG_GROUND_COLORED from './shaders/ground/colored.frag.glsl';
import VERT_GROUND_TEXTURED from './shaders/ground/textured.vert.glsl';
import FRAG_GROUND_TEXTURED from './shaders/ground/textured.frag.glsl';
import VERT_OBJECTS_COLORED from './shaders/objects/colored.vert.glsl';
import FRAG_OBJECTS_COLORED from './shaders/objects/colored.frag.glsl';
import VERT_OBJECTS_TEXTURED from './shaders/objects/textured.vert.glsl';
import FRAG_OBJECTS_TEXTURED from './shaders/objects/textured.frag.glsl';
import VERT_SEA from './shaders/env/sea.vert.glsl';
import FRAG_SEA from './shaders/env/sea.frag.glsl';
import VERT_ENV from './shaders/env/env.vert.glsl';
import FRAG_ENV from './shaders/env/env.frag.glsl';
import VERT_MOON from './shaders/env/moon.vert.glsl';

export function prepareGeometries(island, data, ambience) {
    const {envInfo} = island;
    const {files: {ile, ress}, palette} = data;
    const paletteTexture = loadPaletteTexture(palette);
    const groundTexture = loadTexture(ile.getEntry(1), palette);
    const objectsTexture = loadTexture(ile.getEntry(2), palette);
    const light = getLightVector(ambience);
    return {
        ground_colored: {
            positions: [],
            normals: [],
            colors: [],
            intensities: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: VERT_GROUND_COLORED,
                fragmentShader: FRAG_GROUND_COLORED,
                uniforms: {
                    fogColor: {value: new THREE.Vector4().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    palette: {value: paletteTexture},
                    actorPos: {value: times(10, () => new THREE.Vector4()), type: 'v4v'}
                }
            })
        },
        ground_textured: {
            positions: [],
            uvs: [],
            colors: [],
            intensities: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: VERT_GROUND_TEXTURED,
                fragmentShader: FRAG_GROUND_TEXTURED,
                uniforms: {
                    fogColor: {value: new THREE.Vector4().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: groundTexture},
                    palette: {value: paletteTexture},
                    actorPos: {value: times(10, () => new THREE.Vector4()), type: 'v4v'}
                }
            })
        },
        objects_colored: {
            positions: [],
            normals: [],
            colors: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: VERT_OBJECTS_COLORED,
                fragmentShader: FRAG_OBJECTS_COLORED,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    palette: {value: paletteTexture},
                    light: {value: light}
                }
            })
        },
        objects_textured: {
            positions: [],
            normals: [],
            uvs: [],
            uvGroups: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: VERT_OBJECTS_TEXTURED,
                fragmentShader: FRAG_OBJECTS_TEXTURED,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: objectsTexture},
                    palette: {value: paletteTexture},
                    light: {value: light}
                }
            })
        },
        objects_textured_transparent: {
            positions: [],
            normals: [],
            uvs: [],
            uvGroups: [],
            material: new THREE.RawShaderMaterial({
                transparent: true,
                vertexShader: VERT_OBJECTS_TEXTURED,
                fragmentShader: FRAG_OBJECTS_TEXTURED,
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: objectsTexture},
                    palette: {value: paletteTexture},
                    light: {value: light}
                }
            })
        },
        sea: {
            positions: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: envInfo.index !== 14 ? VERT_SEA : VERT_MOON,
                fragmentShader: envInfo.index !== 14 ? FRAG_SEA : FRAG_ENV,
                uniforms: {
                    texture: {
                        value: loadSubTexture(ress.getEntry(envInfo.index), palette, 0, 0, 128, 128)
                    },
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    time: {value: 0.0},
                    scale: {value: 512.0}
                }
            })
        },
        sky: {
            material: new THREE.RawShaderMaterial({
                vertexShader: VERT_ENV,
                fragmentShader: FRAG_ENV,
                uniforms: {
                    texture: {
                        value: loadSubTexture(
                            ress.getEntry(envInfo.index),
                            palette,
                            128,
                            0,
                            128,
                            128
                        )
                    },
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    scale: {value: envInfo.scale}
                }
            })
        }
    };
}

function getLightVector(ambience) {
    const lightVector = new THREE.Vector3(-1, 0, 0);
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -ambience.lightingAlpha * 2 * Math.PI / 0x1000
    );
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -ambience.lightingBeta * 2 * Math.PI / 0x1000
    );
    return lightVector;
}
