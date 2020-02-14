import { each } from 'lodash';
import * as THREE from 'three';

import { WORLD_SIZE } from '../../utils/lba';
import { loadSubTexture } from '../../texture';
import { compile } from '../../utils/shaders';

import { applyLightningUniforms } from './lightning';
import VERT_CLOUDS from './shaders/clouds.vert.glsl';
import FRAG_CLOUDS from './shaders/clouds.frag.glsl';

const worldScale = 1 / (WORLD_SIZE * 0.04);

const loader = new THREE.TextureLoader();

export async function loadClouds(props, {envInfo, ress, palette}) {
    const cloudsTexture = await new Promise(resolve =>
        loader.load('images/smoke.png', resolve)
    );
    const material = new THREE.RawShaderMaterial({
        vertexShader: compile('vert', VERT_CLOUDS),
        fragmentShader: compile('frag', FRAG_CLOUDS),
        uniforms: {
            uTexture: {value: cloudsTexture},
            uTexture2: {
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
            scale: {value: props.scale || 1.0}
        },
        transparent: true,
        side: props.ground ? THREE.BackSide : THREE.FrontSide
    });
    if (props.whiteness) {
        material.uniforms.whiteness.value = props.whiteness;
    }
    if (props.opacity) {
        material.uniforms.opacity.value = props.opacity;
    }
    const threeObject = new THREE.Object3D();
    const cloudGeo = new THREE.PlaneBufferGeometry(600, 600);
    for (let p = 0; p < 50; p += 1) {
        const cloud = new THREE.Mesh(cloudGeo, material);
        cloud.onBeforeRender = applyLightningUniforms;
        cloud.position.set(
            p === 0 ? 0 : Math.random() * 1600 - 800,
            props.ground
                ? p * 0.05 - 0.9
                : WORLD_SIZE * 2 + p - 20,
            p === 0 ? 0 : Math.random() * 1600 - 800
        );
        cloud.rotation.x = Math.PI / 2;
        if (props.ground) {
            cloud.renderOrder = 400 + p;
        } else {
            cloud.renderOrder = 4 + (50 - p);
        }
        threeObject.add(cloud);
    }

    const update = (time) => {
        each(threeObject.children, cloud => cloud.rotation.z += props.speed * time.delta);
    };
    return {threeObject, update};
}
