import { LightningStrike } from 'three/examples/jsm/geometries/LightningStrike.js';
import * as THREE from 'three';

import { WORLD_SIZE } from '../../../../utils/lba';
import IslandPhysics from '../IslandPhysics';
import Game from '../../../Game';
import Scene from '../../../Scene';
import { Time } from '../../../../datatypes';

export default class Lightning {
    readonly threeObject: THREE.Mesh;
    private physics: IslandPhysics;
    private lightning: LightningInfo;
    private static currentLightning: LightningInfo = null;
    private sound: any;

    constructor(props, physics: IslandPhysics) {
        this.physics = physics;

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
        this.threeObject = new THREE.Mesh(
            lightningStrike as unknown as THREE.BufferGeometry,
            lightningMaterial
        );
        this.threeObject.name = 'Lightning';
        this.threeObject.frustumCulled = false;
        this.threeObject.renderOrder = 100;

        this.lightning = {
            props,
            nextTime: -Infinity,
            strength: 0,
            intensity: 0,
            duration: 0,
            playedSample: false,
            lightningStrikeMesh: this.threeObject,
            material: lightningMaterial,
            update: null,
            params,
            strike: lightningStrike,
            newStrike: true,
            position: new THREE.Vector3()
        };

        Lightning.currentLightning = this.lightning;
    }

    update(game: Game, scene: Scene, time: Time) {
        const objPositions = this.getObjectPositions(scene);
        if (time.elapsed > this.lightning.nextTime + this.lightning.duration) {
            this.planNextStrike(time);
        } else if (time.elapsed > this.lightning.nextTime && this.lightning.duration > 0) {
            if (this.lightning.newStrike) {
                this.initNewStrike(game, objPositions);
                this.lightning.newStrike = false;
            }
            this.updateStrike(objPositions, time);
        } else {
            this.lightning.strength = 0;
            this.lightning.newStrike = true;
            this.lightning.lightningStrikeMesh.visible = false;
        }
    }

    static applyUniforms(_renderer, _scene, _camera, _geometry, material) {
        if (Lightning.currentLightning && (
                material instanceof THREE.ShaderMaterial
                || material instanceof THREE.RawShaderMaterial)) {
            const uniforms = material.uniforms;
            if (!uniforms.lightningStrength || !uniforms.lightningPos) {
                uniforms.lightningStrength = { value: 0.0 };
                uniforms.lightningPos = { value: new THREE.Vector3() };
            }
            uniforms.lightningStrength.value = Lightning.currentLightning.strength;
            uniforms.lightningPos.value.copy(Lightning.currentLightning.position);
        }
    }

    private planNextStrike(time: Time) {
        const delay = Math.random() > this.lightning.props.frequency
                ? Math.random() * 8 + 4
                : Math.random() * 0.2;
        this.lightning.nextTime = time.elapsed + delay;
        this.lightning.duration = Math.random() * 0.6 + 0.8;
        this.lightning.intensity = Math.random() * 0.5 + 0.5 * this.lightning.props.intensity;
        this.lightning.strength = 0;
        this.lightning.lightningStrikeMesh.visible = false;
        this.lightning.newStrike = true;
        this.lightning.lightningStrikeMesh.updateWorldMatrix(false, true);
    }

    private initNewStrike(game: Game, objPositions: ObjectPositions) {
        this.findLightningPosition(objPositions);
        const camDist = objPositions.camera.distanceTo(this.lightning.position);
        const index = (this.lightning.intensity < 0.1 || camDist > 40)
        ? 385
        : 381;

        const params = this.lightning.params;
        params.sourceOffset.copy(this.lightning.position);
        params.sourceOffset.y = WORLD_SIZE * 2 + Math.random() * 5 - 20;
        params.destOffset.copy(this.lightning.position);
        params.radius0 = this.lightning.intensity * 0.31875;
        params.radius1 = params.radius0 * 0.0318;

        const audio = game.getAudioManager();
        if (!this.sound) {
            this.sound = audio.createSamplePositionalAudio();
            this.sound.setRolloffFactor(5);
            this.sound.setRefDistance(20);
            this.sound.setMaxDistance(10000);
            this.lightning.lightningStrikeMesh.add(this.sound);
        }
        this.lightning.lightningStrikeMesh.updateMatrix();
        audio.playSound(this.sound, index);
    }

    private findLightningPosition(objPositions: ObjectPositions) {
        const { position } = this.lightning;
        const { hero, camera } = objPositions;

        while (true) {
            position.set(
                Math.random() * 400 - 200,
                0,
                Math.random() * 400 - 200
            );
            const section = this.physics.findSection(position);
            if (section) {
                const ground = this.physics.getHeightmapGround(position);
                position.y = ground.height;
                let hitObj = false;
                for (const obj of section.objects) {
                    const bb = obj.boundingBox;
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

    private updateStrike(objPositions: ObjectPositions, time: Time) {
        const camDist = objPositions.camera.distanceTo(this.lightning.position);
        const t = (time.elapsed - this.lightning.nextTime) / this.lightning.duration;
        this.lightning.strength = Math.random()
            * (1 - Math.abs((t - 0.5) * 2))
            * this.lightning.intensity
            * 1.5;
        const {params, strike, lightningStrikeMesh} = this.lightning;
        params.straightness = Math.min(t * 1.5, 0.85);
        params.destOffset.y = THREE.MathUtils.lerp(
            WORLD_SIZE * 2,
            this.lightning.position.y,
            Math.min((time.elapsed - this.lightning.nextTime) * 5, 1.0)
        );
        strike.update(time.elapsed);
        const att = Math.max(1.0 - Math.min(camDist * 0.01, 1), 0.07);
        this.lightning.material.opacity = Math.min(this.lightning.strength * att, 1);
        lightningStrikeMesh.visible = true;
    }

    private static HERO_POS_TMP = new THREE.Vector3();

    private getObjectPositions(scene: Scene): ObjectPositions {
        const hero = scene.actors[0];
        if (hero.threeObject) {
            Lightning.HERO_POS_TMP.set(0, 0, 0);
            Lightning.HERO_POS_TMP.applyMatrix4(hero.threeObject.matrixWorld);
        } else {
            Lightning.HERO_POS_TMP.set(10000, 10000, 10000);
        }
        return {
            hero: Lightning.HERO_POS_TMP,
            camera: scene.camera.controlNode.position
        };
    }
}

interface LightningInfo {
    props: any;
    nextTime: number;
    strength: number;
    intensity: number;
    duration: number;
    playedSample: boolean;
    lightningStrikeMesh: THREE.Mesh;
    material: THREE.MeshBasicMaterial;
    update: null;
    params: any;
    strike: LightningStrike;
    newStrike: boolean;
    position: THREE.Vector3;
}

interface ObjectPositions {
    hero: THREE.Vector3;
    camera: THREE.Vector3;
}
