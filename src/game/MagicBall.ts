import * as THREE from 'three';

import Game from './Game';
import Scene from './Scene';
import { loadSprite } from './scenery/isometric/sprites';
import SampleType from './data/sampleType';
import { BehaviourMode } from './loop/hero';
import { Time } from '../datatypes';
import { compile } from '../utils/shaders';
import Renderer from '../renderer';
import { getParams } from '../params';
import INNER_VERT from './shaders/magicball/inner.vert.glsl';
import INNER_FRAG from './shaders/magicball/inner.frag.glsl';
import GLOW_VERT from './shaders/magicball/glow.vert.glsl';
import GLOW_FRAG from './shaders/magicball/glow.frag.glsl';
import CLOUD_VERT from './shaders/magicball/cloud.vert.glsl';
import CLOUD_FRAG from './shaders/magicball/cloud.frag.glsl';

const isLBA1 = getParams().game === 'lba1';

const LBA1MagicBallMapping = {
    8: 1,
    9: 2,
    10: 43,
    11: 13,
};

const MAGIC_BALL_SPRITE = 8;
const MAGIC_BALL_SPEED = 6.0;
const GRAVITY_ACC = 0.015;

const ACTOR_BOX = new THREE.Box3();
const BALL_BOX = new THREE.Box3();

const TMP_VEC = new THREE.Vector3();

const ROTATION_AXIS = new THREE.Vector3(0, 1, 0);

const textureLoader = new THREE.TextureLoader();

const colorsPerLevel = {
    0: [
        new THREE.Color('#ffffd0'),
        new THREE.Color('#fdfd2d'),
        new THREE.Color('#f4bc20'),
        new THREE.Color('#845810'),
    ],
    1: [
        new THREE.Color('#d1e7be'),
        new THREE.Color('#80dc31'),
        new THREE.Color('#37a92f'),
        new THREE.Color('#15591e'),
    ],
    2: [
        new THREE.Color('#f9b381'),
        new THREE.Color('#fe791a'),
        new THREE.Color('#e8210a'),
        new THREE.Color('#832e1a'),
    ],
    3: [
        new THREE.Color('#000000'),
        new THREE.Color('#ffff00'),
        new THREE.Color('#ff9400'),
        new THREE.Color('#7a0d00'),
    ]
};

export enum MagicballStatus {
    IDLE = 0,
    HOLDING_IN_HAND = 1,
    THROWING = 2,
    COMING_BACK = 3
}

/**
 * This singleton class manages the magicball
 * 3D model (or sprite) as well as its behaviour.
 */
export default class MagicBall {
    static get instance() { return this._instance; }

    get status(): MagicballStatus { return this._status; }
    get threeObject(): THREE.Object3D { return this._threeObject; }

    private game: Game;
    private position = new THREE.Vector3();
    private _threeObject?: THREE.Object3D;
    private _status = MagicballStatus.IDLE;
    private direction: THREE.Vector3;
    private sprite?: any;
    private bounces: number;
    private maxBounces: number;
    private normal = new THREE.Vector3();
    private scene: Scene;
    private isFetchingKey: boolean;

    private static _instance: MagicBall = new MagicBall();
    private constructor() {}

    /**
     * This method inits the magicball to the position
     * from which it will be thrown.
     * @param position
     */
    async init(game: Game, scene: Scene) {
        this.game = game;
        if (this.scene !== scene) {
            // Reset when changing scenes
            this.scene = scene;
            this._status = MagicballStatus.HOLDING_IN_HAND;
            await this.loadMesh();
        }
        if (this.status >= MagicballStatus.THROWING) {
            return;
        }
        this.isFetchingKey = (scene.getKeys().length > 0);
        this._status = MagicballStatus.HOLDING_IN_HAND;
        scene.addMagicBall(this);
    }

    setPosition(position: THREE.Vector3) {
        if (this._status >= MagicballStatus.THROWING) {
            return;
        }
        this.position.copy(position);
        if (this.threeObject) {
            this.threeObject.position.copy(this.position);
        }
    }

    private async loadMesh() {
        const magicLevel = Math.max(1, this.game.getState().hero.magicball.level) - 1;
        let threeObject;
        if (this.game.vr && this.game.controlsState.firstPerson) {
            threeObject = await MagicBall.getBallModel(magicLevel);
        } else {
            threeObject = new THREE.Object3D();
            threeObject.position.copy(this.position);
            const type = MAGIC_BALL_SPRITE + magicLevel;
            const sprite = await loadSprite(
                isLBA1 ? LBA1MagicBallMapping[type] : type,
                this.scene.props.ambience,
                false, /* hasSpriteAnim3D */
                true, /* isBillboard */
                this.scene.is3DCam,
            );
            sprite.threeObject.scale.multiplyScalar(1);
            threeObject.add(sprite.threeObject);
            this.sprite = sprite;
        }
        threeObject.name = 'magicball';
        threeObject.visible = true;
        this._threeObject = threeObject;
    }

    update(time: Time) {
        if (!this.sprite) {
            this.updateModel(time);
        }

        if (this._status < MagicballStatus.THROWING) {
            return;
        }

        this.position.add(this.direction.clone().multiplyScalar(time.delta * MAGIC_BALL_SPEED));

        if (this.isFetchingKey) {
            const key = this.scene.getKeys()[0];
            if (this.position.distanceTo(key.physics.position) < 0.1) {
                key.collectKey(this.game, this.scene);
                this.stopBall();
            }
            this._threeObject.position.copy(this.position);
            return;
        }

        this.direction.y -= GRAVITY_ACC;
        this._threeObject.position.copy(this.position);

        const bb = this.sprite
            ? this.sprite.boundingBox
            : MagicBall.sphereGeometry.boundingBox;
        BALL_BOX.copy(bb);
        BALL_BOX.translate(this.position);
        let hitActor = null;
        for (let i = 1 /* skip hero */; i < this.scene.actors.length; i += 1) {
            const a = this.scene.actors[i];
            if ((a.model === null && a.sprite === null)
                || a.state.isDead
                || !(a.props.flags.hasCollisions || a.props.flags.isSprite)) {
                continue;
            }
            const boundingBox = a.model ? a.model.boundingBox : a.sprite.boundingBox;
            ACTOR_BOX.copy(boundingBox);
            if (a.model) {
                ACTOR_BOX.translate(a.physics.position);
            } else {
                ACTOR_BOX.applyMatrix4(a.threeObject.matrixWorld);
            }

            if (ACTOR_BOX.intersectsBox(BALL_BOX)) {
                hitActor = a;
                break;
            }
        }
        if (hitActor) {
            hitActor.hit(0 /* hero */, this.game.getState().hero.magicball.strength);
            this.stopBall();
            return;
        }

        const ok = this.scene.scenery.physics.getNormal(
            this.scene,
            this.position,
            bb,
            this.normal
        );
        if (ok) {
            // const arrowHelper = new THREE.ArrowHelper( normal, this.position, 2, 0xffff00 );
            // this.scene.addMesh(arrowHelper);

            // Move the ball away from the wall to ensure we don't immediately bounce again.
            TMP_VEC.copy(this.normal).multiplyScalar(0.1);
            this.position.add(TMP_VEC);
            TMP_VEC.copy(this.normal).multiplyScalar(2 * this.normal.dot(this.direction));
            this.direction.sub(TMP_VEC);
            this.direction.multiplyScalar(0.8);
            this.bounces += 1;

            if (this.bounces > this.maxBounces) {
                this.stopBall(true);
                return;
            }

            this.scene.actors[0].playSample(SampleType.MAGIC_BALL_BOUNCE);
        }
        if (this.position.y < 0) {
            this.stopBall(true);
        }
    }

    private stopBall(playSample = false) {
        if (playSample) {
            this.scene.actors[0].playSample(SampleType.MAGIC_BALL_STOP);
        }
        this.scene.removeMagicBall();
        this._status = MagicballStatus.IDLE;
    }

    /**
     * Throw the magicball with Twinsen's angle and behaviour
     * deciding the trajectory.
     * @param angle
     * @param behaviour
     * @returns Whether the ball was thrown.
     */
    throw(angle: number, behaviour: number): boolean {
        if (this._status >= MagicballStatus.THROWING) {
            // Don't throw again if already throwing
            return false;
        }
        const direction = new THREE.Vector3(0, 0.1, 1.1);
        switch (behaviour) {
            case BehaviourMode.AGGRESSIVE:
                direction.z = 1.2;
                break;
            case BehaviourMode.DISCRETE:
                direction.y = 0.5;
                direction.z = 0.3;
                break;
        }
        const euler = new THREE.Euler(0, angle, 0, 'XZY');
        direction.applyEuler(euler);

        // Offset the ball to line up with Twinsen's hand.
        this.position.add(new THREE.Vector3(0, 1.45, 1).applyEuler(euler));
        const perpendicularEluer = new THREE.Euler(0, angle - Math.PI / 2, 0, 'XZY');
        const perpendicularDirection = new THREE.Vector3(0, 0, 0.25).applyEuler(perpendicularEluer);
        this.position.add(perpendicularDirection.clone().multiplyScalar(0.5));

        return this.throwTowards(direction);
    }

    /**
     * Throws the ball towards given direction
     * @param direction
     * @returns Whether the ball was thrown
     */
    throwTowards(direction: THREE.Vector3): boolean {
        if (this._status >= MagicballStatus.THROWING) {
            // Don't throw again if already throwing
            return false;
        }
        if (this.game.getState().hero.magicball.level < 4) {
            this.scene.actors[0].playSample(SampleType.MAGIC_BALL_THROW);
        } else {
            this.scene.actors[0].playSample(SampleType.FIRE_BALL_THROW);
        }

        if (this._threeObject) {
            this._threeObject.position.copy(this.position);
        }
        if (this.isFetchingKey) {
            const key = this.scene.getKeys()[0];
            const keyPos = key.physics.position;
            this.direction = keyPos.clone().sub(this.position).normalize();
        } else {
            this.direction = direction.clone();
        }

        this.bounces = 0;
        this.maxBounces = this.game.getState().hero.magicball.maxBounces;
        if (this.game.getState().hero.magic <= 0) {
            this.maxBounces = 0;
        } else {
            this.game.getState().hero.magic -= 1;
        }
        this._status = MagicballStatus.THROWING;
        return true;
    }

    private updateModel(time: Time) {
        if (this.sprite || !this.threeObject) {
            return;
        }
        const cloudLayer = this.threeObject.children[2] as THREE.Mesh;
        cloudLayer.quaternion.setFromAxisAngle(ROTATION_AXIS, time.elapsed * 0.5);
        const material = cloudLayer.material as THREE.RawShaderMaterial;
        material.uniforms.uNormalMatrix.value.setFromMatrix4(
            cloudLayer.matrixWorld
        );
    }

    private static ballModelPromise: Promise<THREE.Object3D>;
    private static sphereGeometry: THREE.IcosahedronGeometry = null;
    private static glowMaterial: THREE.RawShaderMaterial = null;
    private static cloudMaterial: THREE.RawShaderMaterial = null;
    private static innerMaterial: THREE.RawShaderMaterial = null;

    private static async getBallModel(magicLevel: number): Promise<THREE.Object3D> {
        if (!this.ballModelPromise) {
            this.ballModelPromise = this.loadBallModel();
        }
        await this.ballModelPromise;
        this.setMagicLevel(magicLevel);
        return this.ballModelPromise;
    }

    private static setMagicLevel(magicLevel) {
        const colors = colorsPerLevel[magicLevel];
        this.cloudMaterial.uniforms.color.value.copy(colors[0]);
        this.glowMaterial.uniforms.color.value.copy(colors[2]);
        this.innerMaterial.uniforms.color1.value.copy(colors[1]);
        this.innerMaterial.uniforms.color2.value.copy(colors[2]);
        this.innerMaterial.uniforms.color3.value.copy(colors[3]);
    }

    private static async loadBallModel(): Promise<THREE.Object3D> {
        const cloudTexture = await textureLoader.loadAsync('images/magicball_clouds.png');

        this.sphereGeometry = new THREE.IcosahedronGeometry(0.1, 5);
        this.sphereGeometry.computeBoundingBox();

        this.glowMaterial = new THREE.RawShaderMaterial({
            vertexShader: compile('vert', GLOW_VERT),
            fragmentShader: compile('frag', GLOW_FRAG),
            transparent: true,
            side: THREE.BackSide,
            uniforms: {
                color: { value: new THREE.Color() },
            },
            glslVersion: Renderer.getGLSLVersion()
        });

        this.cloudMaterial = new THREE.RawShaderMaterial({
            vertexShader: compile('vert', CLOUD_VERT),
            fragmentShader: compile('frag', CLOUD_FRAG),
            transparent: true,
            uniforms: {
                color: { value: new THREE.Color() },
                clouds: { value: cloudTexture },
                uNormalMatrix: { value: new THREE.Matrix3() }
            },
            glslVersion: Renderer.getGLSLVersion()
        });

        this.innerMaterial = new THREE.RawShaderMaterial({
            vertexShader: compile('vert', INNER_VERT),
            fragmentShader: compile('frag', INNER_FRAG),
            uniforms: {
                color1: { value: new THREE.Color() },
                color2: { value: new THREE.Color() },
                color3: { value: new THREE.Color() },
            },
            glslVersion: Renderer.getGLSLVersion()
        });

        const ball = new THREE.Object3D();
        const cloudLayer = new THREE.Mesh(this.sphereGeometry, this.cloudMaterial);
        const glow = new THREE.Mesh(this.sphereGeometry, this.glowMaterial);
        const innerBall = new THREE.Mesh(this.sphereGeometry, this.innerMaterial);
        glow.scale.setScalar(1.2);
        glow.renderOrder = 1;
        innerBall.scale.setScalar(0.92);
        innerBall.renderOrder = 2;
        cloudLayer.renderOrder = 3;
        ball.add(innerBall);
        ball.add(glow);
        ball.add(cloudLayer);
        return ball;
    }
}
