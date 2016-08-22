import THREE from 'three';
import {
    loadSubTexture,
    loadPaletteTexture,
    loadTexture
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

const hypot = Math.hypot || function(x, y) {
    return Math.sqrt(x * x + y * y);
};

function getDistortionCoefficients() {
    return [-0.4410035, 0.42756155, -0.4804439, 0.5460139,
        -0.58821183, 0.5733938, -0.48303202, 0.33299083, -0.17573841,
        0.0651772, -0.01488963, 0.001559834];
}

function getDistortionMaxFovSquared() {
    var maxFov = hypot(
        Math.tan(THREE.Math.degToRad(40)),
        Math.tan(THREE.Math.degToRad(40))
    );
    return maxFov * maxFov;
}

function getDistortionFovOffset() {
    var left = Math.tan(THREE.Math.degToRad(40));
    var down = Math.tan(THREE.Math.degToRad(40));
    return new THREE.Vector2(left, down);
}

function getDistortionFovScale() {
    var left = Math.tan(THREE.Math.degToRad(40));
    var right = Math.tan(THREE.Math.degToRad(40));
    var up = Math.tan(THREE.Math.degToRad(40));
    var down = Math.tan(THREE.Math.degToRad(40));
    return new THREE.Vector2(left + right, up + down);
}

function distort(uniforms) {
    uniforms.uDistortionCoefficients = {
        type: 'fv1',
        value: getDistortionCoefficients()
    };
    uniforms.uDistortionMaxFovSquared = {
        type: 'f',
        value: getDistortionMaxFovSquared()
    };
    uniforms.uDistortionFovOffset = {
        type: 'v2',
        value: getDistortionFovOffset()
    };
    uniforms.uDistortionFovScale = {
        type: 'v2',
        value: getDistortionFovScale()
    };
    return uniforms;
}

export function prepareGeometries({envInfo, data: {files: {ile, ress}, palette}}) {
    const paletteTexture = loadPaletteTexture(palette);
    const groundTexture = loadTexture(ile.getEntry(1), palette);
    const atlasTexture = loadTexture(ile.getEntry(2), palette);
    return {
        colored: {
            positions: [],
            colorInfos: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: colored_vertex,
                fragmentShader: colored_fragment,
                uniforms: distort({
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    palette: {value: paletteTexture}
                })
            })
        },
        textured: {
            positions: [],
            colorInfos: [],
            uvs: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: textured_vertex,
                fragmentShader: textured_fragment,
                uniforms: distort({
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: groundTexture},
                    palette: {value: paletteTexture}
                })
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
                uniforms: distort({
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: atlasTexture},
                    palette: {value: paletteTexture}
                })
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
                uniforms: distort({
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    texture: {value: atlasTexture},
                    palette: {value: paletteTexture}
                })
            })
        },
        sea: {
            positions: [],
            material: new THREE.RawShaderMaterial({
                vertexShader: envInfo.index != 14 ? sea_vertex : moon_vertex,
                fragmentShader: envInfo.index != 14 ? sea_fragment : env_fragment,
                wireframe: false,
                uniforms: distort({
                    texture: {value: loadSubTexture(ress.getEntry(envInfo.index), palette, 0, 0, 128, 128)},
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    time: {value: 0.0},
                    scale: {value: 512.0}
                })
            })
        },
        sky: {
            material: new THREE.RawShaderMaterial({
                vertexShader: env_vertex,
                fragmentShader: env_fragment,
                uniforms: distort({
                    texture: {value: loadSubTexture(ress.getEntry(envInfo.index), palette, 128, 0, 128, 128)},
                    fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
                    fogDensity: {value: envInfo.fogDensity},
                    scale: {value: envInfo.scale}
                })
            })
        }
    };
}
