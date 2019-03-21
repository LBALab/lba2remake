import {times} from 'lodash';
import * as THREE from 'three';
import {
    loadSubTexture,
    loadPaletteTexture,
    loadTextureRGBA,
    makeNoiseTexture
} from '../texture.ts';
import {compile} from '../utils/shaders';

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
import VERT_SKY from './shaders/env/sky.vert.glsl';
import FRAG_SKY from './shaders/env/sky.frag.glsl';
import VERT_MOON from './shaders/env/moon.vert.glsl';
import FRAG_MOON from './shaders/env/moon.frag.glsl';

const fakeNoiseBuffer = new Uint8Array(1);
fakeNoiseBuffer[0] = 128;
const fakeNoise = new THREE.DataTexture(
    fakeNoiseBuffer,
    1,
    1,
    THREE.AlphaFormat,
    THREE.UnsignedByteType
);

export function prepareGeometries(island, data, ambience) {
    const {envInfo} = island;
    const {files: {ile, ress}, palette, lutTexture} = data;
    const paletteTexture = loadPaletteTexture(palette);
    const groundTexture = loadTextureRGBA(ile.getEntry(1), palette);
    const objectsTexture = loadTextureRGBA(ile.getEntry(2), palette);
    const noiseTexture = makeNoiseTexture();
    const light = getLightVector(ambience);
    return {
        ground_colored: {
            positions: [],
            normals: [],
            colors: [],
            intensities: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', VERT_GROUND_COLORED),
                fragmentShader: compile('frag', FRAG_GROUND_COLORED),
                uniforms: {
                    fogColor: {value: new THREE.Vector4().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    palette: {value: paletteTexture},
                    noise: {value: noiseTexture},
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
                vertexShader: compile('vert', VERT_GROUND_TEXTURED),
                fragmentShader: compile('frag', FRAG_GROUND_TEXTURED),
                uniforms: {
                    fogColor: {value: new THREE.Vector4().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    uTexture: {value: groundTexture},
                    palette: {value: paletteTexture},
                    lutTexture: {value: lutTexture},
                    noise: {value: noiseTexture},
                    actorPos: {value: times(10, () => new THREE.Vector4()), type: 'v4v'}
                }
            })
        },
        objects_colored: {
            positions: [],
            normals: [],
            colors: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', VERT_OBJECTS_COLORED),
                fragmentShader: compile('frag', FRAG_OBJECTS_COLORED),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    palette: {value: paletteTexture},
                    noise: {value: fakeNoise},
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
                vertexShader: compile('vert', VERT_OBJECTS_TEXTURED),
                fragmentShader: compile('frag', FRAG_OBJECTS_TEXTURED),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    uTexture: {value: objectsTexture},
                    lutTexture: {value: lutTexture},
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
                vertexShader: compile('vert', VERT_OBJECTS_TEXTURED),
                fragmentShader: compile('frag', FRAG_OBJECTS_TEXTURED),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    uTexture: {value: objectsTexture},
                    lutTexture: {value: lutTexture},
                    palette: {value: paletteTexture},
                    light: {value: light}
                }
            })
        },
        sea: {
            positions: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', envInfo.index !== 14 ? VERT_SEA : VERT_MOON),
                fragmentShader: compile('frag', envInfo.index !== 14 ? FRAG_SEA : FRAG_MOON),
                uniforms: {
                    uTexture: {
                        value: loadSubTexture(ress.getEntry(envInfo.index), palette, 0, 0, 128, 128)
                    },
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    time: {value: 0.0},
                    scale: {value: envInfo.index !== 14 ? 512.0 : 16.0}
                }
            })
        },
        sky: {
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', VERT_SKY),
                fragmentShader: compile('frag', FRAG_SKY),
                uniforms: {
                    uTexture: {
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
                    fogDensity: {value: 0.1},
                    opacity: {value: envInfo.skyOpacity},
                    scale: {value: envInfo.scale}
                },
                transparent: true
            })
        }
    };
}

function getLightVector(ambience) {
    const lightVector = new THREE.Vector3(-1, 0, 0);
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -(ambience.lightingAlpha * 2 * Math.PI) / 0x1000
    );
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -(ambience.lightingBeta * 2 * Math.PI) / 0x1000
    );
    return lightVector;
}
