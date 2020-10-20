import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

import STARS_VERT from './shaders/stars.vert.glsl';
import STARS_FRAG from './shaders/stars.frag.glsl';

const starsMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0xFFFFFF) },
    },
    vertexShader: STARS_VERT,
    fragmentShader: STARS_FRAG,
});

const pt = new THREE.Vector3();

const noiseGen = new SimplexNoise('LBA');

export default class Stars {
    threeObject: THREE.Points;

    constructor(props) {
        const starsCount = props.count;
        const starsGeo = new THREE.BufferGeometry();
        const positions = [];
        const sizes = [];
        const tints = [];
        const intensities = [];
        for (let i = 0; i < starsCount; i += 1) {
            const dist = 600 + Math.random();
            const s = 2;
            pt.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            const intensity = noiseGen.noise3D(pt.x * s, pt.y * s, pt.z * s) * 0.5 + 0.5;
            intensities.push(intensity * intensity * intensity);
            pt.normalize();
            positions.push(pt.x * dist + 45);
            positions.push(pt.y * dist);
            positions.push(pt.z * dist);
            const sz = Math.random();
            sizes.push(0.2 + (sz * sz * sz) * 0.8);
            tints.push(Math.random());
        }
        const posArray = new Float32Array(positions);
        const posAttr = new THREE.BufferAttribute(posArray, 3);
        starsGeo.setAttribute('position', posAttr);
        const sizeArray = new Float32Array(sizes);
        const sizeAttr = new THREE.BufferAttribute(sizeArray, 1);
        starsGeo.setAttribute('size', sizeAttr);
        const tintArray = new Float32Array(tints);
        const tintAttr = new THREE.BufferAttribute(tintArray, 1);
        starsGeo.setAttribute('tint', tintAttr);
        const intensitiesArray = new Float32Array(intensities);
        const intensitiesAttr = new THREE.BufferAttribute(intensitiesArray, 1);
        starsGeo.setAttribute('intensity', intensitiesAttr);

        this.threeObject = new THREE.Points(starsGeo, starsMaterial);
        this.threeObject.renderOrder = 1;
        this.threeObject.frustumCulled = false;
    }

    update(_game, _scene, time) {
        this.threeObject.rotation.x = time.elapsed * 0.003;
    }
}
