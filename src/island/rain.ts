import * as THREE from 'three';

import RAIN_VERT from './shaders/env/rain.vert.glsl';
import RAIN_FRAG from './shaders/env/rain.frag.glsl';
import { applyLightningUniforms } from './lightning';
import SimplexNoise from 'simplex-noise';

const rainMaterial = new THREE.ShaderMaterial({
    vertexShader: RAIN_VERT,
    fragmentShader: RAIN_FRAG,
    transparent: true,
    uniforms: {
        time: { value: 1.0 },
        wind: { value: new THREE.Vector2(0, 0) },
    }
});

const noiseGen = new SimplexNoise('LBA');

export function loadRain(props) {
    const rainCount = props.count;
    const rainGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < rainCount; i += 1) {
        const x = Math.random();
        const y = Math.random();
        const z = Math.random();
        positions.push(x);
        positions.push(y);
        positions.push(z);
        positions.push(x);
        positions.push(y + 0.01);
        positions.push(z);
    }
    const posArray = new Float32Array(positions);
    const posAttr = new THREE.BufferAttribute(posArray, 3);
    rainGeo.setAttribute('position', posAttr);

    const threeObject = new THREE.Object3D();
    const sections = [];
    for (let x = 0; x < 3; x += 1) {
        for (let z = 0; z < 3; z += 1) {
            const section = new THREE.LineSegments(rainGeo, rainMaterial);
            section.onBeforeRender = applyLightningUniforms;
            section.renderOrder = 200;
            section.frustumCulled = false;
            section.position.x = x * 20;
            section.position.z = z * 20;
            sections.push(section);
            threeObject.add(section);
        }
    }

    const update = (scene, time) => {
        const camPos = scene.camera.controlNode.position;
        const wind = rainMaterial.uniforms.wind.value;
        wind.x = noiseGen.noise2D(time.elapsed * 0.05, 0) * 20 + 10;
        wind.y = noiseGen.noise2D(time.elapsed * 0.05, 1) * 20 + 10;
        const cX = Math.round(camPos.x / 20);
        const cZ = Math.round(camPos.z / 20);
        let idx = 0;
        for (let x = -1; x < 2; x += 1) {
            for (let z = -1; z < 2; z += 1) {
                const section = sections[idx];
                section.position.x = (cX + x) * 20 - wind.x;
                section.position.z = (cZ + z) * 20 - wind.y;
                idx += 1;
            }
        }
        rainMaterial.uniforms.time.value = time.elapsed;
    };
    return {threeObject, update, material: rainMaterial};
}
