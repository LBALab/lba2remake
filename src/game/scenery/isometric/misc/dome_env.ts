import * as THREE from 'three';
import { times } from 'lodash';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import SimplexNoise from 'simplex-noise';

import STARS_VERT from './shaders/dome_stars.vert.glsl';
import STARS_FRAG from './shaders/dome_stars.frag.glsl';
import SHOOTING_STAR_VERT from './shaders/dome_shooting_star.vert.glsl';
import SHOOTING_STAR_FRAG from './shaders/dome_shooting_star.frag.glsl';
import WALLS_VERT from './shaders/dome_walls.vert.glsl';
import WALLS_FRAG from './shaders/dome_walls.frag.glsl';
import PLATFORM_VERT from './shaders/dome_platform.vert.glsl';
import PLATFORM_FRAG from './shaders/dome_platform.frag.glsl';
import LBA_OBJECT_VERT from '../shaders/objects/colored.preview.vert.glsl';
import LBA_OBJECT_FRAG from '../shaders/objects/colored.frag.glsl';
import { loadLUTTexture } from '../../../../utils/lut';

const loader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

const noiseGen = new SimplexNoise('LBA');

export async function loadDomeEnv(ambience) {
    const basePos = new THREE.Vector3(26.875, 3.85, 24.375);
    const NUM_SPOTS = 4;
    const spotsPos = times(NUM_SPOTS, () => new THREE.Vector3(0, 1, 0));
    const spotsIntensity = times(NUM_SPOTS, () => 0);
    const spotsSize = times(NUM_SPOTS, () => 0);
    const spotsTransitionTime = times(NUM_SPOTS, () => 0);
    const starCages = [];
    const archStars = [];
    const dome = await new Promise<THREE.Object3D>((resolve) => {
        gltfLoader.load('models/lba2/dome.glb', (m) => {
            resolve(m.scene);
        });
    });
    const starsHighresMaterial = await makeStarsMaterial('B_OPC3_HD');
    const lutTexture = await loadLUTTexture();
    const light = getLightVector(ambience);
    dome.traverse((node) => {
        if (node instanceof THREE.Mesh) {
            const material = (node.material as THREE.MeshStandardMaterial);
            if (material.name.substring(0, 4) === 'star') {
                material.side = THREE.FrontSide;
                starCages.push(node);
            } else if (material.name === 'platform_white') {
                node.material = new THREE.ShaderMaterial({
                    defines: {
                        NUM_SPOTS
                    },
                    uniforms: {
                        light: { value: light },
                        lutTexture: { value: lutTexture },
                        uNormalMatrix: { value: new THREE.Matrix3() },
                        color: { value: material.color },
                        spotsPos: { value: spotsPos },
                        spotsIntensity: { value: spotsIntensity },
                        spotsSize: { value: spotsSize },
                    },
                    vertexShader: PLATFORM_VERT,
                    fragmentShader: PLATFORM_FRAG,
                });
                node.onBeforeRender = () => {
                    const mat = node.material as THREE.ShaderMaterial;
                    mat.uniforms.uNormalMatrix.value.setFromMatrix4(node.matrixWorld);
                };
            } else if (material.name === 'arch_white' || material.name === 'deco_white') {
                if (material.name === 'arch_white') {
                    archStars.push(node);
                }
                const c = material.color;
                node.material = new THREE.RawShaderMaterial({
                    uniforms: {
                        light: { value: light },
                        lutTexture: { value: lutTexture },
                        uNormalMatrix: { value: new THREE.Matrix3() },
                        uColor: { value: new THREE.Vector4(c.r, c.g, c.b, 1) }
                    },
                    vertexShader: LBA_OBJECT_VERT,
                    fragmentShader: LBA_OBJECT_FRAG,
                });
                node.onBeforeRender = () => {
                    const mat = node.material as THREE.ShaderMaterial;
                    mat.uniforms.uNormalMatrix.value.setFromMatrix4(node.matrixWorld);
                };
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

    const starsMaterial = await makeStarsMaterial();

    const stars = makeStars(generateStarsDefinitions(5000), starsMaterial);
    stars.name = 'stars';
    stars.renderOrder = -1;

    const threeObject = new THREE.Object3D();
    threeObject.position.set(39, 0, 21);
    threeObject.name = 'dome_env';

    starCages.forEach(async (node) => {
        const star = makeStars([{
            pos: new THREE.Vector3(),
            intensity: 0.5,
            tint: 0,
            size: 0.8,
            sparkle: 0.05
        }], starsHighresMaterial);
        star.name = `${node.name}_light`;
        star.renderOrder = 1;
        node.add(star);
        node.userData.baseY = node.position.y;
    });

    archStars.forEach(async (node) => {
        const star = makeStars([{
            pos: new THREE.Vector3(),
            intensity: 0.9,
            tint: 0.1,
            size: 1.0,
            sparkle: 0.03
        }], starsHighresMaterial);
        star.position.set(0, 1.6, 0);
        star.name = `${node.name}_bell_star`;
        star.renderOrder = 1;
        node.add(star);
        node.userData.baseY = node.position.y;
    });

    threeObject.add(stars);
    const shootingStars = times(3, () => {
        const shootingStar = makeShootingStar(starsMaterial);
        threeObject.add(shootingStar.mesh);
        return shootingStar;
    });

    threeObject.add(dome);

    const duration = 20;
    const transitionDelay = duration / NUM_SPOTS;
    const transition = 2;
    let lastTransition = 0;
    let nextSpot = 0;
    let init = true;

    const updateSpot = (idx, time) => {
        if (init || (idx === nextSpot && time.elapsed > lastTransition + transitionDelay)) {
            let minDistance;
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
        update: (time) => {
            starsMaterial.uniforms.time.value = time.elapsed;
            starsHighresMaterial.uniforms.time.value = time.elapsed;
            if (time.elapsed < lastTransition) {
                lastTransition = time.elapsed;
            }
            for (let i = 0; i < NUM_SPOTS; i += 1) {
                updateSpot(i, time);
            }
            if (init) {
                init = false;
            }
            starCages.forEach((node, idx) => {
                const sign = idx % 2 === 0 ? 1 : -1;
                node.rotation.y = time.elapsed * 0.15 * sign;
                const tm = time.elapsed + (idx * Math.PI * 0.5);
                node.position.y = node.userData.baseY + Math.sin(tm) * 0.2 + 0.1;
            });
            shootingStars.forEach(star => star.update(time));
        }
    };
}

export async function makeStarsMaterial(texture = 'B_OPC3') {
    const starTexture = await new Promise(resolve =>
        loader.load(`images/stars/${texture}.png`, resolve)
    );

    const starsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            starTex: { value: starTexture },
            time: { value: 0 }
        },
        transparent: true,
        vertexShader: STARS_VERT,
        fragmentShader: STARS_FRAG,
    });

    return starsMaterial;
}

function makeShootingStar(starsMaterial) {
    const speed = new THREE.Vector3();
    const uTint = { value: 1 };
    const uIntensity = { value: 1 };
    const uSparkle = { value: 0.3 };
    const uAlpha = { value: 0.0 };
    const stStarsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            starTex: { value: starsMaterial.uniforms.starTex },
            time: { value: 0 },
            speed: { value: speed },
            uTint,
            uIntensity,
            uSparkle,
            uAlpha
        },
        side: THREE.DoubleSide,
        transparent: true,
        vertexShader: SHOOTING_STAR_VERT,
        fragmentShader: SHOOTING_STAR_FRAG,
    });
    const starGeo = new THREE.BufferGeometry();
    const positions = [];
    const tp = [];
    const spos = [];
    const posRnd = [];
    for (let i = 0; i < 50; i += 1) {
        positions.push(
            0, 0, 0,
            0, 1, 0,
            1, 0, 0,
            1, 1, 0,
            1, 0, 0,
            0, 1, 0
        );
        if (i === 0) {
            tp.push(1, 1, 1, 1, 1, 1);
        } else {
            tp.push(0, 0, 0, 0, 0, 0);
        }
        spos.push(i, i, i, i, i, i);
        const xRnd = (Math.random() - 0.5) * 2;
        const yRnd = (Math.random() - 0.5) * 2;
        const zRnd = (Math.random() - 0.5) * 2;
        posRnd.push(
            xRnd, yRnd, zRnd,
            xRnd, yRnd, zRnd,
            xRnd, yRnd, zRnd,
            xRnd, yRnd, zRnd,
            xRnd, yRnd, zRnd,
            xRnd, yRnd, zRnd
        );
    }
    const posArray = new Float32Array(positions);
    const positionAttr = new THREE.BufferAttribute(posArray, 3);
    starGeo.setAttribute('position', positionAttr);

    const tpArray = new Float32Array(tp);
    const tpAttr = new THREE.BufferAttribute(tpArray, 1);
    starGeo.setAttribute('tp', tpAttr);

    const sposArray = new Float32Array(spos);
    const sposAttr = new THREE.BufferAttribute(sposArray, 1);
    starGeo.setAttribute('spos', sposAttr);

    const posRndArray = new Float32Array(posRnd);
    const posRndAttr = new THREE.BufferAttribute(posRndArray, 3);
    starGeo.setAttribute('posRnd', posRndAttr);

    const star = new THREE.Mesh(starGeo, stStarsMaterial);
    const ray = new THREE.Ray();
    const safetyRadius = 80;
    const minLengthSq = 200 * 200;
    const sphere = new THREE.Sphere(
        new THREE.Vector3(),
        safetyRadius
    );
    star.frustumCulled = false;
    star.name = 'shootingStar';
    star.renderOrder = -1;
    let start = getRandomStarPos();
    let end = getRandomStarPos();
    let lastTime = Infinity;
    return {
        mesh: star,
        update: (time) => {
            if (time.elapsed < lastTime) {
                lastTime = time.elapsed - Math.random() * 2;
            }
            let dt = (time.elapsed - lastTime) * 0.5;
            if (dt > 1) {
                lastTime = time.elapsed;
                dt = 0;
                do {
                    start = getRandomStarPos(safetyRadius);
                    end = getRandomStarPos(safetyRadius);
                    if (start.distanceToSquared(end) < minLengthSq) {
                        continue;
                    }
                    ray.origin.copy(start);
                    ray.direction.copy(end);
                    ray.direction.sub(start);
                    ray.direction.normalize();
                } while (ray.intersectsSphere(sphere));
                speed.copy(end);
                speed.sub(start);
                speed.multiplyScalar(0.08);
                uIntensity.value = Math.random() * 0.2 + 0.8;
                uTint.value = Math.random();
                uSparkle.value = Math.random();
            }
            stStarsMaterial.uniforms.time.value = time.elapsed;
            star.position.lerpVectors(start, end, dt);
            if (dt < 0.2) {
                uAlpha.value = Math.max(dt, 0) * 5;
            } else if (dt > 0.8) {
                uAlpha.value = Math.max((1.0 - dt), 0) * 5;
            } else {
                uAlpha.value = 1;
            }
        }
    };
}

export function makeStars(starDefs, starsMaterial) {
    const starsGeo = new THREE.BufferGeometry();
    const positions = [];
    const uvs = [];
    const sizes = [];
    const tints = [];
    const sparkles = [];
    const intensities = [];
    const indices = [];
    const len2 = (x, y, z) => x * x + y * y + z * z;
    const len2Pos = idx => len2(
        positions[idx * 3],
        positions[idx * 3 + 1],
        positions[idx * 3 + 2]
    );

    starDefs.forEach((props, idx) => {
        const { pos, intensity, size, tint, sparkle } = props;
        for (let j = 0; j < 6; j += 1) {
            positions.push(pos.x);
            positions.push(pos.y);
            positions.push(pos.z);
            intensities.push(intensity);
            sizes.push(size);
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
        indices.push(idx * 6);
    });
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
    stars.frustumCulled = false;
    return stars;
}

function generateStarsDefinitions(count) {
    return times(count, () => {
        const pos = getRandomStarPos();
        const intensity = noiseGen.noise3D(pos.x, pos.y, pos.z) * 0.2 + 0.8;
        const size = 0.6 + Math.random() * 0.4;
        const tint = Math.random();
        const sparkle = Math.random();
        return {
            pos,
            intensity,
            size,
            tint,
            sparkle
        };
    });
}

function getRandomStarPos(minDistance = 40, maxDistance = 250) {
    const minDistSq = minDistance * minDistance;
    const maxDistSq = maxDistance * maxDistance;
    const starPos = new THREE.Vector3();
    let lenSq;
    do {
        starPos.set(
            Math.random() * 500 - 250,
            Math.random() * 500 - 250,
            Math.random() * 500 - 250
        );
        lenSq = starPos.lengthSq();
    } while (lenSq > maxDistSq || lenSq < minDistSq);

    return starPos;
}

function getLightVector(ambience) {
    const lightVector = new THREE.Vector3(-1, 0, 0);
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -(ambience.lightingAlpha * 2 * Math.PI) / 0x1000
    );
    lightVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -(ambience.lightingBeta * 2 * Math.PI) / 0x1000
    );
    return lightVector;
}
