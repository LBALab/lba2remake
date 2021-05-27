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

export default class MagicBall {
    readonly game: Game;
    readonly scene: Scene;
    readonly isFetchingKey: boolean;

    direction: THREE.Vector3;
    position: THREE.Vector3;
    threeObject?: THREE.Object3D;
    sprite?: any;
    bounces: number;
    maxBounces: number;
    normal = new THREE.Vector3();
    private thrown = false;

    static async load(game: Game, scene: Scene, position: THREE.Vector3): Promise<MagicBall> {
        const magicBall = new MagicBall(game, scene, position.clone());
        await magicBall.loadMesh();
        scene.addMagicBall(magicBall);
        return magicBall;
    }

    private constructor(game: Game, scene: Scene, position: THREE.Vector3) {
        this.game = game;
        this.scene = scene;
        this.position = position;
        this.isFetchingKey = (scene.getKeys().length > 0);
    }

    private async loadMesh() {
        const magicLevel = Math.max(1, this.game.getState().hero.magicball.level) - 1;
        if (this.game.vr && this.game.controlsState.firstPerson) {
            this.threeObject = await MagicBall.makeBallModel(magicLevel);
        } else {
            this.threeObject = new THREE.Object3D();
            this.threeObject.position.copy(this.position);
            const type = MAGIC_BALL_SPRITE + magicLevel;
            const sprite = await loadSprite(
                isLBA1 ? LBA1MagicBallMapping[type] : type,
                this.scene.props.ambience,
                false, /* hasSpriteAnim3D */
                true, /* isBillboard */
                this.scene.is3DCam,
            );
            sprite.threeObject.scale.multiplyScalar(1);
            this.threeObject.add(sprite.threeObject);
            this.sprite = sprite;
        }
        this.threeObject.name = 'magicball';
        this.threeObject.visible = true;
    }

    update(time: Time) {
        if (!this.sprite) {
            MagicBall.updateBallModel(this.threeObject, time);
        }

        if (!this.thrown) {
            return;
        }

        this.position.add(this.direction.clone().multiplyScalar(time.delta * MAGIC_BALL_SPEED));

        if (this.isFetchingKey) {
            const key = this.scene.getKeys()[0];
            if (this.position.distanceTo(key.physics.position) < 0.1) {
                key.collectKey(this.game, this.scene);
                this.scene.removeMagicBall();
            }
            this.threeObject.position.copy(this.position);
            return;
        }

        this.direction.y -= GRAVITY_ACC;
        this.threeObject.position.copy(this.position);

        const bb = this.sprite
            ? this.sprite.boundingBox
            : this.threeObject.userData.bb;
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
            this.scene.removeMagicBall();
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
                this.scene.actors[0].playSample(SampleType.MAGIC_BALL_STOP);
                this.scene.removeMagicBall();
                return;
            }

            this.scene.actors[0].playSample(SampleType.MAGIC_BALL_BOUNCE);
        }
    }

    throw(angle: number, behaviour: number) {
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

        this.throwTowards(direction);
    }

    throwTowards(direction: THREE.Vector3) {
        if (this.game.getState().hero.magicball.level < 4) {
            this.scene.actors[0].playSample(SampleType.MAGIC_BALL_THROW);
        } else {
            this.scene.actors[0].playSample(SampleType.FIRE_BALL_THROW);
        }

        this.threeObject.position.copy(this.position);
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
        this.thrown = true;
    }

    static async updateBallModel(ball: THREE.Object3D, time: Time) {
        const cloudLayer = ball.children[2] as THREE.Mesh;
        cloudLayer.quaternion.setFromAxisAngle(ROTATION_AXIS, time.elapsed * 0.5);
        const material = cloudLayer.material as THREE.RawShaderMaterial;
        material.uniforms.uNormalMatrix.value.setFromMatrix4(
            cloudLayer.matrixWorld
        );
    }

    private static cloudTexture: THREE.Texture = null;
    private static sphereGeometry: THREE.IcosahedronGeometry = null;
    private static glowMaterial: THREE.RawShaderMaterial = null;
    private static cloudMaterial: THREE.RawShaderMaterial = null;
    private static innerMaterial: THREE.RawShaderMaterial = null;

    static async makeBallModel(magicLevel: number): Promise<THREE.Object3D> {
        if (!this.cloudTexture) {
            this.cloudTexture = await textureLoader.loadAsync('images/magicball_clouds.png');
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
                    clouds: { value: this.cloudTexture },
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
        }
        const colors = colorsPerLevel[magicLevel];
        this.cloudMaterial.uniforms.color.value.copy(colors[0]);
        this.glowMaterial.uniforms.color.value.copy(colors[2]);
        this.innerMaterial.uniforms.color1.value.copy(colors[1]);
        this.innerMaterial.uniforms.color2.value.copy(colors[2]);
        this.innerMaterial.uniforms.color3.value.copy(colors[3]);
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
        ball.userData.bb = this.sphereGeometry.boundingBox;
        return ball;
    }
}
