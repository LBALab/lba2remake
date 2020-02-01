import { LightningStrike } from 'three/examples/jsm/geometries/LightningStrike.js';
import * as THREE from 'three';
import { WORLD_SIZE } from '../../utils/lba';
// import { LightningStorm } from 'three/example/jsm/objects/LightningStorm.js';

const nextLightning = {
    time: -Infinity,
    intensity: 0,
    duration: 0,
    playedSample: false,
    scenery: null
};

const rayParams = {
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

const lightningStrike = new LightningStrike(rayParams);
const lightningMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xF0F0FF),
    transparent: true
});
const lightningStrikeMesh = new THREE.Mesh(
    lightningStrike as unknown as THREE.BufferGeometry,
    lightningMaterial
);
lightningStrikeMesh.frustumCulled = false;
lightningStrikeMesh.renderOrder = 5;

export function updateLightning(game, scene, time) {
    if (game.isPaused()
        || !scene
        || !scene.isIsland
        || !(scene.scenery.props.env === 'TWINSUN_RAIN')) {
        game.lightningStrength = 0;
        nextLightning.time = -Infinity;
        nextLightning.intensity = 0;
        nextLightning.duration = 0;
        nextLightning.playedSample = false;
        nextLightning.scenery = null;
        return;
    }

    if (nextLightning.scenery !== scene.scenery) {
        scene.scenery.threeObject.add(lightningStrikeMesh);
        nextLightning.scenery = scene.scenery;
    }

    if (time.elapsed > nextLightning.time + nextLightning.duration) {
        const delay = Math.random() * 2;
        nextLightning.time = time.elapsed + delay;
        nextLightning.duration = Math.random() * 0.6 + 0.8;
        nextLightning.intensity = Math.random() * 0.5 + 0.5;
        game.lightningStrength = 0;
        lightningStrikeMesh.visible = false;
        scene.scenery.physics.getLightningPosition(game.lightningPos);
        rayParams.sourceOffset.copy(game.lightningPos);
        rayParams.sourceOffset.y = WORLD_SIZE * 2;
        rayParams.destOffset.copy(game.lightningPos);
        rayParams.radius0 = nextLightning.intensity * 0.1;
        rayParams.radius1 = rayParams.radius0 * 0.5;
        nextLightning.playedSample = false;
    } else if (time.elapsed > nextLightning.time && nextLightning.duration > 0) {
        const t = (time.elapsed - nextLightning.time) / nextLightning.duration;
        game.lightningStrength = Math.random()
            * (1 - Math.abs((t - 0.5) * 2))
            * nextLightning.intensity
            * 2;
        if (!nextLightning.playedSample) {
            const dist = scene.camera.controlNode.position.distanceTo(game.lightningPos);
            const volume = Math.min(1, Math.max(0, 1 - (dist / 200)));
            const soundFxSource = game.getAudioManager().getSoundFxSource();
            soundFxSource.volume = volume;
            const index = (nextLightning.intensity < 0.3 || dist > 30)
                ? 385
                : 381;
            soundFxSource.load(index, () => {
                soundFxSource.play();
            });
            nextLightning.playedSample = true;
        }
        rayParams.straightness = Math.min(t * 1.5, 0.8);
        rayParams.destOffset.y = THREE.Math.lerp(
            WORLD_SIZE * 2,
            game.lightningPos.y,
            Math.min((time.elapsed - nextLightning.time) * 5, 1.0)
        );
        lightningStrike.update(time.elapsed);
        lightningStrikeMesh.visible = true;
        lightningMaterial.opacity = Math.min(game.lightningStrength, 1);
    } else {
        game.lightningStrength = 0;
        nextLightning.playedSample = false;
        lightningStrikeMesh.visible = false;
    }
}
