import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import SimplexNoise from 'simplex-noise';

import STARS_VERT from './shaders/dome_stars.vert.glsl';
import STARS_FRAG from './shaders/dome_stars.frag.glsl';
import WALLS_VERT from './shaders/dome_walls.vert.glsl';
import WALLS_FRAG from './shaders/dome_walls.frag.glsl';

const loader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

const noiseGen = new SimplexNoise('LBA');

export async function loadDomeEnv() {
    const starTexture = await new Promise(resolve =>
        loader.load('images/stars/B_OPC3.png', resolve)
    );
    const starsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            starTex: { value: starTexture },
            color: { value: new THREE.Color(0xFFFFFF) },
            time: { value: 0 }
        },
        transparent: true,
        vertexShader: STARS_VERT,
        fragmentShader: STARS_FRAG,
    });
    const starsGeo = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    const sizes = [];
    const tints = [];
    const sparkles = [];
    const intensities = [];
    const count = 5000;
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
            y = Math.random() * 500 - 250;
            z = Math.random() * 500 - 250;
            l2 = len2(x, y, z);
        } while (l2 > 250 * 250 || l2 < 40 * 40);
        const intensity = noiseGen.noise3D(x, y, z) * 0.2 + 0.8;
        const sz = 0.6 + Math.random() * 0.4;
        const tint = Math.random();
        const sparkle = Math.random();
        for (let j = 0; j < 6; j += 1) {
            positions.push(x);
            positions.push(y);
            positions.push(z);
            intensities.push(intensity);
            sizes.push(sz);
            tints.push(tint);
            sparkles.push(sparkle);
        }
        uvs.push(
            0, 0,
            0, 1,
            1, 0,
            1, 1,
            1, 0,
            0, 1
        );
        indices.push(i * 6);
    }
    indices.sort((a, b) => len2Pos(b) - len2Pos(a));
    const realIndices = [];
    indices.forEach(idx => realIndices.push(idx, idx + 1, idx + 2, idx + 3, idx + 4, idx + 5));
    starsGeo.setIndex(realIndices);
    const posArray = new Float32Array(positions);
    const posAttr = new THREE.BufferAttribute(posArray, 3);
    starsGeo.setAttribute('position', posAttr);
    const uvArray = new Float32Array(uvs);
    const uvAttr = new THREE.BufferAttribute(uvArray, 2);
    starsGeo.setAttribute('uv', uvAttr);
    const sizeArray = new Float32Array(sizes);
    const sizeAttr = new THREE.BufferAttribute(sizeArray, 1);
    starsGeo.setAttribute('size', sizeAttr);
    const tintArray = new Float32Array(tints);
    const tintAttr = new THREE.BufferAttribute(tintArray, 1);
    starsGeo.setAttribute('tint', tintAttr);
    const sparkleArray = new Float32Array(sparkles);
    const sparkleAttr = new THREE.BufferAttribute(sparkleArray, 1);
    starsGeo.setAttribute('sparkle', sparkleAttr);
    const intensitiesArray = new Float32Array(intensities);
    const intensitiesAttr = new THREE.BufferAttribute(intensitiesArray, 1);
    starsGeo.setAttribute('intensity', intensitiesAttr);

    const stars = new THREE.Mesh(starsGeo, starsMaterial);
    stars.name = 'dome_env';
    stars.frustumCulled = false;
    stars.renderOrder = -1;

    const threeObject = new THREE.Object3D();
    threeObject.position.set(39, 0, 21);
    threeObject.name = 'dome_env';
    threeObject.add(stars);

    const basePos = new THREE.Vector3(26.875, 0, 24.375);
    const dome = await new Promise<THREE.Object3D>((resolve) => {
        gltfLoader.load('models/dome.glb', (m) => {
            m.scene.traverse((node) => {
                if (node instanceof THREE.Mesh) {
                    const material = (node.material as THREE.MeshStandardMaterial);
                    node.material = new THREE.ShaderMaterial({
                        uniforms: {
                            color: { value: material.color },
                            map: { value: material.map },
                            offset: { value: basePos }
                        },
                        transparent: true,
                        vertexShader: WALLS_VERT,
                        fragmentShader: WALLS_FRAG,
                    });
                }
            });
            resolve(m.scene);
        });
    });
    threeObject.add(dome);

    return {
        threeObject,
        update: (time) => {
            starsMaterial.uniforms.time.value = time.elapsed;
        }
    };
}
