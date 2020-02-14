import { LightningStrike } from 'three/examples/jsm/geometries/LightningStrike.js';
import * as THREE from 'three';

import { WORLD_SIZE } from '../../utils/lba';
import { findSection, getGroundInfo } from '../../game/loop/physicsIsland';

let currentLightning = null;

export function loadLightning(props, islandSections) {
    const params = {
        sourceOffset: new THREE.Vector3(),
        destOffset: new THREE.Vector3(),
        radius0: 0.1,
        radius1: 0.1,
        minRadius: 0.01,
        maxIterations: 7,
        isEternal: true,
        timeScale: 1.0,
        propagationTimeFactor: 0.05,
        vanishingTimeFactor: 0.95,
        subrayPeriod: 3.5,
        subrayDutyCycle: 0.6,
        maxSubrayRecursion: 3,
        ramification: 3,
        recursionProbability: 0.6,
        roughness: 0.85,
        straightness: 0.6
    };

    const lightningStrike = new LightningStrike(params);
    const lightningMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xF0F0FF),
        transparent: true
    });
    const lightningStrikeMesh = new THREE.Mesh(
        lightningStrike as unknown as THREE.BufferGeometry,
        lightningMaterial
    );
    lightningStrikeMesh.frustumCulled = false;
    lightningStrikeMesh.renderOrder = 100;

    const lightning = {
        props,
        nextTime: -Infinity,
        strength: 0,
        intensity: 0,
        duration: 0,
        playedSample: false,
        lightningStrikeMesh,
        material: lightningMaterial,
        update: null,
        params,
        strike: lightningStrike,
        newStrike: true,
        position: new THREE.Vector3()
    };

    currentLightning = lightning;

    return {
        threeObject: lightningStrikeMesh,
        update: updateLightning.bind(null, lightning, islandSections)
    };
}

export function applyLightningUniforms(_renderer, _scene, _camera, _geometry, material) {
    if (currentLightning && (
            material instanceof THREE.ShaderMaterial
            || material instanceof THREE.RawShaderMaterial)) {
        const uniforms = material.uniforms;
        if (!uniforms.lightningStrength || !uniforms.lightningPos) {
            uniforms.lightningStrength = { value: 0.0 };
            uniforms.lightningPos = { value: new THREE.Vector3() };
        }
        uniforms.lightningStrength.value = currentLightning.strength;
        uniforms.lightningPos.value.copy(currentLightning.position);
    }
}

function updateLightning(lightning, islandSections, game, scene, time) {
    const objPositions = getObjectPositions(scene);
    if (time.elapsed > lightning.nextTime + lightning.duration) {
        planNextStrike(lightning, time);
    } else if (time.elapsed > lightning.nextTime && lightning.duration > 0) {
        if (lightning.newStrike) {
            initNewStrike(lightning, islandSections, game, objPositions);
            lightning.newStrike = false;
        }
        updateStrike(lightning, objPositions, time);
    } else {
        lightning.strength = 0;
        lightning.newStrike = true;
        lightning.lightningStrikeMesh.visible = false;
    }
}

function planNextStrike(lightning, time) {
    const delay = Math.random() > lightning.props.frequency
            ? Math.random() * 8 + 4
            : Math.random() * 0.2;
    lightning.nextTime = time.elapsed + delay;
    lightning.duration = Math.random() * 0.6 + 0.8;
    lightning.intensity = Math.random() * 0.5 + 0.5 * lightning.props.intensity;
    lightning.strength = 0;
    lightning.lightningStrikeMesh.visible = false;
    lightning.newStrike = true;
}

function initNewStrike(lightning, islandSections, game, objPositions) {
    findLightningPosition(lightning, islandSections, objPositions);
    const camDist = objPositions.camera.distanceTo(lightning.position);
    const volume = Math.min(1, Math.max(0, 1 - (camDist / 200)));
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    soundFxSource.volume = volume;
    const index = (lightning.intensity < 0.1 || camDist > 40)
        ? 385
        : 381;
    soundFxSource.load(index, () => {
        soundFxSource.play();
    });
    const params = lightning.params;
    params.sourceOffset.copy(lightning.position);
    params.sourceOffset.y = WORLD_SIZE * 2 + Math.random() * 5 - 20;
    params.destOffset.copy(lightning.position);
    params.radius0 = lightning.intensity * 0.31875;
    params.radius1 = params.radius0 * 0.0318;
}

function updateStrike(lightning, objPositions, time) {
    const camDist = objPositions.camera.distanceTo(lightning.position);
    const t = (time.elapsed - lightning.nextTime) / lightning.duration;
    lightning.strength = Math.random()
        * (1 - Math.abs((t - 0.5) * 2))
        * lightning.intensity
        * 1.5;
    const {params, strike, lightningStrikeMesh} = lightning;
    params.straightness = Math.min(t * 1.5, 0.85);
    params.destOffset.y = THREE.Math.lerp(
        WORLD_SIZE * 2,
        lightning.position.y,
        Math.min((time.elapsed - lightning.nextTime) * 5, 1.0)
    );
    strike.update(time.elapsed);
    const att = Math.max(1.0 - Math.min(camDist * 0.01, 1), 0.07);
    lightning.material.opacity = Math.min(lightning.strength * att, 1);
    lightningStrikeMesh.visible = true;
}

function findLightningPosition(lightning, islandSections, {hero, camera}) {
    const {position} = lightning;

    while (true) {
        position.set(
            Math.random() * 400 - 200,
            0,
            Math.random() * 400 - 200
        );
        const section = findSection(islandSections, position);
        if (section) {
            const ground = getGroundInfo(section, position);
            position.y = ground.height;
            let hitObj = false;
            for (let i = 0; i < section.boundingBoxes.length; i += 1) {
                const bb = section.boundingBoxes[i];
                if (bb.containsPoint(position)) {
                    position.y = bb.max.y;
                    hitObj = true;
                }
            }
            if (camera.distanceTo(position) < 6 ||
                hero.distanceTo(position) < 6) {
                continue;
            }
            if (hitObj
                || (position.y > 10 && Math.random() < 0.8)
                || (position.y > 2 && Math.random() < 0.2)
                || Math.random() < 0.05) {
                break;
            }
        }
    }
}

const HERO_POS_TMP = new THREE.Vector3();

function getObjectPositions(scene) {
    const hero = scene.actors[0];
    if (hero.threeObject) {
        HERO_POS_TMP.set(0, 0, 0);
        HERO_POS_TMP.applyMatrix4(hero.threeObject.matrixWorld);
    } else {
        HERO_POS_TMP.set(10000, 10000, 10000);
    }
    return {
        hero: HERO_POS_TMP,
        camera: scene.camera.controlNode.position
    };
}
