import * as THREE from 'three';

import RAIN_VERT from './shaders/env/rain.vert.glsl';
import RAIN_FRAG from './shaders/env/rain.frag.glsl';
import { applyLightningUniforms } from './lightning';

const rainMaterial = new THREE.ShaderMaterial({
    vertexShader: RAIN_VERT,
    fragmentShader: RAIN_FRAG,
    transparent: true,
    uniforms: {
        time: { value: 1.0 },
        wind: { value: new THREE.Vector2(20, 0) },
    }
});

export function loadRain() {
    const rainCount = 5000;
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
    for (let x = 0; x < 3; x += 1) {
        for (let z = 0; z < 3; z += 1) {
            const section = new THREE.LineSegments(rainGeo, rainMaterial);
            section.onBeforeRender = applyLightningUniforms;
            section.renderOrder = 200;
            section.frustumCulled = false;
            section.position.x = x * 20;
            section.position.z = z * 20;
            threeObject.add(section);
        }
    }

    const update = (_scene, time) => {
        // const camPos = scene.camera.controlNode.position;
        rainMaterial.uniforms.time.value = time.elapsed;
    };
    return {threeObject, update, material: rainMaterial};
}
