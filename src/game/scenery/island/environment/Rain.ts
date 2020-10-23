import * as THREE from 'three';

import RAIN_VERT from './shaders/rain.vert.glsl';
import RAIN_FRAG from './shaders/rain.frag.glsl';
import SimplexNoise from 'simplex-noise';
import Lightning from './Lightning';

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

export default class Rain {
    readonly threeObject: THREE.Object3D;
    private sections: THREE.LineSegments[];

    constructor(props) {
        const rainGeo = new THREE.BufferGeometry();
        const positions = [];
        for (let i = 0; i < props.count; i += 1) {
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

        this.threeObject = new THREE.Object3D();
        this.threeObject.name = 'Rain';
        this.sections = [];
        for (let x = 0; x < 3; x += 1) {
            for (let z = 0; z < 3; z += 1) {
                const section = new THREE.LineSegments(rainGeo, rainMaterial);
                section.name = `Section: ${x - 1}, ${z - 1}`;
                section.onBeforeRender = Lightning.applyUniforms;
                section.renderOrder = 200;
                section.frustumCulled = false;
                section.position.x = x * 20;
                section.position.z = z * 20;
                this.sections.push(section);
                this.threeObject.add(section);
            }
        }
    }

    update(_game, scene, time) {
        const camPos = scene.camera.controlNode.position;
        const wind = rainMaterial.uniforms.wind.value;
        wind.x = noiseGen.noise2D(time.elapsed * 0.05, 0) * 20 + 10;
        wind.y = noiseGen.noise2D(time.elapsed * 0.05, 1) * 20 + 10;
        const cX = Math.round(camPos.x / 20);
        const cZ = Math.round(camPos.z / 20);
        let idx = 0;
        for (let x = -1; x < 2; x += 1) {
            for (let z = -1; z < 2; z += 1) {
                const section = this.sections[idx];
                section.position.x = (cX + x) * 20 - wind.x;
                section.position.z = (cZ + z) * 20 - wind.y;
                idx += 1;
            }
        }
        rainMaterial.uniforms.time.value = time.elapsed;
    }
}
