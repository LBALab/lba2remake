import * as THREE from 'three';

import { WORLD_SIZE } from '../../../../utils/lba';
import { loadSubTexture } from '../../../../texture';
import { compile } from '../../../../utils/shaders';

import { applyLightningUniforms } from './lightning';
import VERT_CLOUDS from './shaders/clouds.vert.glsl';
import FRAG_CLOUDS from './shaders/clouds.frag.glsl';

const worldScale = 1 / (WORLD_SIZE * 0.04);

export function loadClouds(props, {envInfo, ress, palette, smokeTexture}) {
    const material = new THREE.RawShaderMaterial({
        vertexShader: compile('vert', VERT_CLOUDS),
        fragmentShader: compile('frag', FRAG_CLOUDS),
        uniforms: {
            txSmoke: {value: smokeTexture},
            txEnv: {
                value: loadSubTexture(
                    ress.getEntry(envInfo.index),
                    palette,
                    props.ground ? 0 : 128,
                    0,
                    128,
                    128
                )
            },
            fogColor: {value: new THREE.Vector3().fromArray(envInfo.skyColor)},
            fogDensity: {value: 0.1},
            worldScale: {value: worldScale},
            opacity: {value: 0.6},
            whiteness: {value: 0.0},
            scale: {value: props.scale || 1.0},
            time: {value: 0.0}
        },
        side: props.ground ? THREE.BackSide : THREE.FrontSide,
        transparent: true
    });
    if (props.whiteness) {
        material.uniforms.whiteness.value = props.whiteness;
    }
    if (props.opacity) {
        material.uniforms.opacity.value = props.opacity;
    }
    const positions = [];
    const uvs = [];
    const angles = [];
    const POS = new THREE.Vector3();
    for (let p = 50; p >= 0; p -= 1) {
        POS.set(
            p === 0 ? 0 : Math.random() * 1600 - 800,
            props.ground
                ? 0.5 - p * 0.012
                : WORLD_SIZE * 2 + p - 20,
            p === 0 ? 0 : Math.random() * 1600 - 800
        );
        const angle = Math.random() * Math.PI * 2.0;
        angles.push(angle, angle, angle, angle, angle, angle);

        positions.push(POS.x, POS.y, POS.z);
        uvs.push(0, 0);
        positions.push(POS.x, POS.y, POS.z);
        uvs.push(1, 0);
        positions.push(POS.x, POS.y, POS.z);
        uvs.push(0, 1);

        positions.push(POS.x, POS.y, POS.z);
        uvs.push(0, 1);
        positions.push(POS.x, POS.y, POS.z);
        uvs.push(1, 0);
        positions.push(POS.x, POS.y, POS.z);
        uvs.push(1, 1);
    }
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), 3)
    );
    bufferGeometry.setAttribute(
        'uv',
        new THREE.BufferAttribute(new Uint8Array(uvs), 2, false)
    );
    bufferGeometry.setAttribute(
        'angle',
        new THREE.BufferAttribute(new Float32Array(angles), 1, false)
    );
    const clouds = new THREE.Mesh(bufferGeometry, material);
    clouds.onBeforeRender = applyLightningUniforms;

    const update = (_game, _scene, time) => {
        material.uniforms.time.value = time.elapsed * props.speed;
    };
    return {threeObject: clouds, update};
}
