import {times} from 'lodash';
import * as THREE from 'three';
import {
    loadPaletteTexture,
    loadTextureRGBA,
    makeNoiseTexture
} from '../texture';
import {compile} from '../utils/shaders';

import GROUND_COLORED__VERT from './shaders/ground/colored.vert.glsl';
import GROUND_COLORED__FRAG from './shaders/ground/colored.frag.glsl';

import GROUND_TEXTURED__VERT from './shaders/ground/textured.vert.glsl';
import GROUND_TEXTURED__FRAG from './shaders/ground/textured.frag.glsl';

import OBJECTS_COLORED__VERT from './shaders/objects/colored.vert.glsl';
import OBJECTS_COLORED__FRAG from './shaders/objects/colored.frag.glsl';

import OBJECTS_TEXTURED__VERT from './shaders/objects/textured.vert.glsl';
import OBJECTS_TEXTURED__FRAG from './shaders/objects/textured.frag.glsl';

import { WORLD_SIZE } from '../utils/lba';

const fakeNoiseBuffer = new Uint8Array(1);
fakeNoiseBuffer[0] = 128;
const fakeNoise = new THREE.DataTexture(
    fakeNoiseBuffer,
    1,
    1,
    THREE.AlphaFormat,
    THREE.UnsignedByteType
);

export async function prepareGeometries(island, data, ambience) {
    const {envInfo} = island;
    const {files: {ile}, palette, lutTexture, atlas} = data;
    const paletteTexture = loadPaletteTexture(palette);
    const groundTexture = loadTextureRGBA(ile.getEntry(1), palette);
    const noiseTexture = makeNoiseTexture();
    const light = getLightVector(ambience);
    const worldScale = 1 / (WORLD_SIZE * 0.04);
    return {
        ground_colored: {
            positions: [],
            normals: [],
            colors: [],
            intensities: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', GROUND_COLORED__VERT),
                fragmentShader: compile('frag', GROUND_COLORED__FRAG),
                uniforms: {
                    fogColor: {value: new THREE.Vector4().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    worldScale: {value: worldScale},
                    palette: {value: paletteTexture},
                    noise: {value: noiseTexture},
                    actorPos: {value: times(10, () => new THREE.Vector4(0, 0, 0, 0)), type: 'v4v'}
                }
            })
        },
        ground_textured: {
            positions: [],
            uvs: [],
            colors: [],
            intensities: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', GROUND_TEXTURED__VERT),
                fragmentShader: compile('frag', GROUND_TEXTURED__FRAG),
                uniforms: {
                    fogColor: {value: new THREE.Vector4().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    worldScale: {value: worldScale},
                    uTexture: {value: groundTexture},
                    palette: {value: paletteTexture},
                    lutTexture: {value: lutTexture},
                    noise: {value: noiseTexture},
                    actorPos: {value: times(10, () => new THREE.Vector4(0, 0, 0, 0)), type: 'v4v'}
                }
            })
        },
        objects_colored: {
            positions: [],
            normals: [],
            colors: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: compile('vert', OBJECTS_COLORED__VERT),
                fragmentShader: compile('frag', OBJECTS_COLORED__FRAG),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    worldScale: {value: worldScale},
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
                vertexShader: compile('vert', OBJECTS_TEXTURED__VERT),
                fragmentShader: compile('frag', OBJECTS_TEXTURED__FRAG),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    worldScale: {value: worldScale},
                    uTexture: {value: atlas.texture},
                    atlasDim: {value: atlas.texture.image.width},
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
                vertexShader: compile('vert', OBJECTS_TEXTURED__VERT),
                fragmentShader: compile('frag', OBJECTS_TEXTURED__FRAG),
                uniforms: {
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    worldScale: {value: worldScale},
                    uTexture: {value: atlas.texture},
                    atlasDim: {value: atlas.texture.image.width},
                    lutTexture: {value: lutTexture},
                    palette: {value: paletteTexture},
                    light: {value: light}
                }
            })
        }
    };
}

export function getLightVector(ambience) {
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
