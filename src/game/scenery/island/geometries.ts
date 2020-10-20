import {times} from 'lodash';
import * as THREE from 'three';
import {
    loadPaletteTexture,
    loadTextureRGBA,
    makeNoiseTexture
} from '../../../texture';
import {compile} from '../../../utils/shaders';
import { loadGround } from './ground';
import { loadObjects } from './objects';
import { loadModel } from './model';
import TextureAtlas from './TextureAtlas';
import Lightning from './environment/Lightning';

import GROUND_COLORED__VERT from './shaders/ground/colored.vert.glsl';
import GROUND_COLORED__FRAG from './shaders/ground/colored.frag.glsl';

import GROUND_TEXTURED__VERT from './shaders/ground/textured.vert.glsl';
import GROUND_TEXTURED__FRAG from './shaders/ground/textured.frag.glsl';

import OBJECTS_COLORED__VERT from './shaders/objects/colored.vert.glsl';
import OBJECTS_COLORED__FRAG from './shaders/objects/colored.frag.glsl';

import OBJECTS_TEXTURED__VERT from './shaders/objects/textured.vert.glsl';
import OBJECTS_TEXTURED__FRAG from './shaders/objects/textured.frag.glsl';

import { WORLD_SIZE } from '../../../utils/lba';

const fakeNoiseBuffer = new Uint8Array(1);
fakeNoiseBuffer[0] = 128;
const fakeNoise = new THREE.DataTexture(
    fakeNoiseBuffer,
    1,
    1,
    THREE.AlphaFormat,
    THREE.UnsignedByteType
);

export function loadGeometries(threeObject, props, data, layout) {
    const usedTiles = {};
    const models = [];
    const uvGroupsS : Set<string> = new Set();
    const { obl } = data;
    for (let i = 0; i < obl.length; i += 1) {
        const model = loadModel(obl.getEntry(i));
        models.push(model);
        for (const group of model.uvGroups) {
            uvGroupsS.add(group.join(','));
        }
    }
    const allUvGroups = [...uvGroupsS]
        .map(g => g.split(',').map(v => Number(v)))
        .sort((g1, g2) => (g2[2] * g2[3]) - (g1[2] * g1[3]));
    const atlas = new TextureAtlas(data, allUvGroups);

    const geometries = prepareGeometries(props, data, atlas);

    for (const section of layout.groundSections) {
        const tilesKey = [section.x, section.z].join(',');
        usedTiles[tilesKey] = [];
        loadGround(section, geometries, usedTiles[tilesKey]);
        loadObjects(section, geometries, models, atlas, props);
    }

    const matByName = {};
    for (const [name, geom] of Object.entries(geometries)) {
        const {positions, uvs, colors, intensities, normals, uvGroups, material} = geom;
        if (positions && positions.length > 0) {
            const bufferGeometry = new THREE.BufferGeometry();
            bufferGeometry.setAttribute(
                'position',
                new THREE.BufferAttribute(new Float32Array(positions), 3)
            );
            if (uvs) {
                bufferGeometry.setAttribute(
                    'uv',
                    new THREE.BufferAttribute(new Uint8Array(uvs), 2, false)
                );
            }
            if (colors) {
                bufferGeometry.setAttribute(
                    'color',
                    new THREE.BufferAttribute(new Uint8Array(colors), 1, false)
                );
            }
            if (intensities) {
                bufferGeometry.setAttribute(
                    'intensity',
                    new THREE.BufferAttribute(new Uint8Array(intensities), 1, false)
                );
            }
            if (normals) {
                bufferGeometry.setAttribute(
                    'normal',
                    new THREE.BufferAttribute(new Float32Array(normals), 3)
                );
            }
            if (uvGroups) {
                bufferGeometry.setAttribute(
                    'uvGroup',
                    new THREE.BufferAttribute(new Uint16Array(uvGroups), 4, false)
                );
            }
            const mesh = new THREE.Mesh(bufferGeometry, material);
            mesh.matrixAutoUpdate = false;
            mesh.name = name;
            matByName[name] = material;
            threeObject.add(mesh);
            mesh.onBeforeRender = Lightning.applyUniforms;
        }
    }

    return { matByName, usedTiles };
}

function prepareGeometries(island, data, atlas) {
    const {envInfo} = island;
    const {ile, palette, lutTexture, ambience} = data;
    const paletteTexture = loadPaletteTexture(palette);
    const groundTexture = loadTextureRGBA(ile.getEntry(1), palette);
    const noiseTexture = makeNoiseTexture();
    const light = getLightVector(ambience);
    const worldScale = 1 / (WORLD_SIZE * 0.04);
    return {
        ground_colored: {
            positions: [],
            normals: null,
            uvs: null,
            uvGroups: null,
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
            normals: null,
            uvs: [],
            uvGroups: null,
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
            uvs: null,
            uvGroups: null,
            colors: [],
            intensities: null,
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
            colors: null,
            intensities: null,
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
            colors: null,
            intensities: null,
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
