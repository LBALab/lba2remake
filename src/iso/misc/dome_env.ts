import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

import STARS_VERT from './shaders/dome_stars.vert.glsl';
import STARS_FRAG from './shaders/dome_stars.frag.glsl';
import { WORLD_SCALE_B } from '../../utils/lba';

const starsMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0xFFFFFF) },
    },
    transparent: true,
    vertexShader: STARS_VERT,
    fragmentShader: STARS_FRAG,
});

const noiseGen = new SimplexNoise('LBA');

export function loadDomeEnv() {
    const starsGeo = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];
    const tints = [];
    const intensities = [];
    const count = 2500;
    const indices = [];
    const len2 = (x, y, z) => x * x + y * y + z * z;
    const len2Pos = idx => len2(
        positions[idx * 3],
        positions[idx * 3 + 1],
        positions[idx * 3 + 2]
    );
    for (let i = 0; i < count; i += 1) {
        let x;
        let y;
        let z;
        let l2;
        do {
            x = Math.random() * 500 - 250;
            y = Math.random() * 250 - 250;
            z = Math.random() * 500 - 250;
            l2 = len2(x, y, z);
        } while (l2 > 250 * 250 && l2 > 10 * 10)
        positions.push(x);
        positions.push(y);
        positions.push(z);
        const intensity = noiseGen.noise3D(x, y, z) * 0.2 + 0.8;
        intensities.push(intensity);
        const sz = Math.random();
        sizes.push(0.6 + sz * 0.4);
        tints.push(Math.random());
        indices.push(i);
    }
    indices.sort((a, b) => len2Pos(b) - len2Pos(a));
    starsGeo.setIndex(indices);
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

    const stars = new THREE.Points(starsGeo, starsMaterial);
    stars.name = 'dome_env';
    stars.frustumCulled = false;

    const threeObject = new THREE.Object3D();
    threeObject.position.set(39, 0, 21);
    threeObject.name = 'dome_env';
    threeObject.add(stars);

    const walls = createWalls();
    threeObject.add(walls);

    return {
        threeObject,
        update: (_time) => {
            // stars.rotation.y = time.elapsed * 0.01;
        }
    };
}

function createWalls() {
    const x0 = -15;
    const x1 = 15;
    const z0 = -22;
    const z1 = 22;
    const y0 = WORLD_SCALE_B;
    const y1 = WORLD_SCALE_B * 20;
    const positions = [
        x0, y0, z1,
        x0, y1, z1,
        x1, y1, z1,
        x0, y0, z1,
        x1, y1, z1,
        x1, y0, z1,

        x0, y0, z0,
        x0, y1, z0,
        x0, y1, z1,
        x0, y0, z0,
        x0, y1, z1,
        x0, y0, z1,

        x0, y0, z0,
        x1, y1, z0,
        x0, y1, z0,
        x0, y0, z0,
        x1, y0, z0,
        x1, y1, z0,

        x1, y0, z0,
        x1, y1, z1,
        x1, y1, z0,
        x1, y0, z0,
        x1, y0, z1,
        x1, y1, z1,
    ];
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(positions), 3)
    );

    const mesh = new THREE.Mesh(bufferGeometry, new THREE.MeshBasicMaterial({
        color: 0x0
    }));

    mesh.frustumCulled = false;
    mesh.name = 'walls';
    return mesh;
}
