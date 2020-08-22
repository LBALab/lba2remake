import * as THREE from 'three';
import { times } from 'lodash';
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
    const basePos = new THREE.Vector3(26.875, 3.85, 24.375);
    const NUM_SPOTS = 4;
    const spotsPos = times(NUM_SPOTS, () => new THREE.Vector3(0, 1, 0));
    const spotsIntensity = times(NUM_SPOTS, () => 0);
    const spotsSize = times(NUM_SPOTS, () => 0);
    const spotsTransitionTime = times(NUM_SPOTS, () => 0);
    const starCages = [];
    const dome = await new Promise<THREE.Object3D>((resolve) => {
        gltfLoader.load('models/dome.glb', (m) => {
            m.scene.traverse((node) => {
                if (node instanceof THREE.Mesh) {
                    const material = (node.material as THREE.MeshStandardMaterial);
                    if (material.name.substring(0, 4) === 'star') {
                        material.side = THREE.FrontSide;
                        starCages.push(node);
                    } else {
                        node.material = new THREE.ShaderMaterial({
                            defines: {
                                NUM_SPOTS
                            },
                            uniforms: {
                                color: { value: material.color },
                                spotsPos: { value: spotsPos },
                                spotsIntensity: { value: spotsIntensity },
                                spotsSize: { value: spotsSize },
                            },
                            transparent: true,
                            vertexShader: WALLS_VERT,
                            fragmentShader: WALLS_FRAG,
                        });
                    }
                }
            });
            resolve(m.scene);
        });
    });

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

    let starIdx = 0;
    const addStar = ({
        pos,
        intensity,
        sz,
        tint,
        sparkle
    }) => {
        for (let j = 0; j < 6; j += 1) {
            positions.push(pos.x);
            positions.push(pos.y);
            positions.push(pos.z);
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
        indices.push(starIdx * 6);
        starIdx += 1;
    };

    const starPos = new THREE.Vector3();
    while (starIdx < count) {
        let l2;
        do {
            starPos.set(
                Math.random() * 500 - 250,
                Math.random() * 500 - 250,
                Math.random() * 500 - 250
            );
            l2 = starPos.lengthSq();
        } while (l2 > 250 * 250 || l2 < 40 * 40);
        const intensity = noiseGen.noise3D(starPos.x, starPos.y, starPos.z) * 0.2 + 0.8;
        const sz = 0.6 + Math.random() * 0.4;
        const tint = Math.random();
        const sparkle = Math.random();
        addStar({pos: starPos, intensity, sz, tint, sparkle});
    }
    indices.sort((a, b) => len2Pos(b) - len2Pos(a));
    starCages.forEach((node) => {
        const big = node.name.substr(0, 3) === 'big';
        const sz = big ? 1.2 : 0.8;
        const sparkle = big ? 0.4 : 0.05;
        const tint = big ? 0.2 : 0;
        const intensity = big ? 1 : 0.5;
        addStar({
            pos: node.position,
            intensity,
            tint,
            sz,
            sparkle
        });
    });
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

    threeObject.add(dome);

    const duration = 20;
    const transitionDelay = duration / NUM_SPOTS;
    const transition = 2;
    let lastTransition = 0;
    let nextSpot = 0;
    let init = true;

    const updateSpot = (idx, time) => {
        if (init || (idx === nextSpot && time.elapsed > lastTransition + transitionDelay)) {
            let minDistance = Infinity;
            do {
                spotsPos[idx].set(
                    Math.random() * 2 - 1,
                    Math.random(),
                    Math.random() * 2 - 1,
                );
                spotsPos[idx].normalize();
                spotsPos[idx].multiplyScalar(17.125);
                spotsPos[idx].add(basePos);
                minDistance = Infinity;
                for (let i = 0; i < NUM_SPOTS; i += 1) {
                    if (i !== idx) {
                        const dist = spotsPos[i].distanceTo(spotsPos[idx]);
                        minDistance = Math.min(dist, minDistance);
                    }
                }
            } while (minDistance < 10);
            spotsSize[idx] = 3 + Math.random() * 2;
            if (init) {
                spotsTransitionTime[idx] = time.elapsed - transitionDelay * (NUM_SPOTS - idx - 1);
            } else {
                spotsTransitionTime[idx] = time.elapsed;
            }
            lastTransition = time.elapsed;
            if (!init) {
                nextSpot = (nextSpot + 1) % NUM_SPOTS;
            }
        }
        const v = time.elapsed - spotsTransitionTime[idx];
        let d = 1;
        if (v < transition) {
            d = THREE.MathUtils.clamp(v / transition, 0, 1);
        } else if (v < duration && duration - v < transition) {
            d = THREE.MathUtils.clamp((duration - v) / transition, 0, 1);
        } else if (v >= duration) {
            d = 0;
        }
        spotsIntensity[idx] = d * 0.9 + Math.sin(time.elapsed) * 0.05 + 0.05;
    };

    return {
        threeObject,
        update: (game, time) => {
            starsMaterial.uniforms.time.value = time.elapsed;
            if (game.isPaused()) {
                init = true;
                nextSpot = 0;
            } else {
                for (let i = 0; i < NUM_SPOTS; i += 1) {
                    updateSpot(i, time);
                }
                if (init) {
                    init = false;
                }
            }
            starCages.forEach((node, idx) => {
                const sign = idx % 2 === 0 ? 1 : -1;
                node.rotation.y = time.elapsed * 0.2 * sign;
            });
        }
    };
}
