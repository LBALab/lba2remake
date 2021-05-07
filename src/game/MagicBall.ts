import * as THREE from 'three';

import Game from './Game';
import Scene from './Scene';
import { loadSprite } from './scenery/isometric/sprites';
import SampleType from './data/sampleType';
import { BehaviourMode } from './loop/hero';
import { Time } from '../datatypes';
import { getParams } from '../params';

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
const DEFAULT_MAX_BOUNCES = 4;

const ACTOR_BOX = new THREE.Box3();
const BALL_BOX = new THREE.Box3();

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
        this.threeObject = new THREE.Object3D();
        this.threeObject.position.copy(this.position);
        const magicLevel = this.game.getState().hero.magicball.level;
        const type = MAGIC_BALL_SPRITE + (magicLevel - 1);
        const sprite = await loadSprite(
            isLBA1 ? LBA1MagicBallMapping[type] : type,
            this.scene.props.ambience,
            false, /* hasSpriteAnim3D */
            true, /* isBillboard */
            this.scene.is3DCam,
        );
        sprite.threeObject.scale.multiplyScalar(1);
        this.threeObject.add(sprite.threeObject);
        this.threeObject.name = 'magicball';
        this.threeObject.visible = true;
        this.sprite = sprite;
    }

    update(time: Time) {
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

        BALL_BOX.copy(this.sprite.boundingBox);
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

        const normal = this.scene.scenery.physics.getNormal(this.scene, this.position,
                                                            this.sprite.boundingBox);
        if (normal) {
            // const arrowHelper = new THREE.ArrowHelper( normal, this.position, 2, 0xffff00 );
            // this.scene.addMesh(arrowHelper);

            // Move the ball away from the wall to ensure we don't immediately bounce again.
            this.position.add(normal.clone().multiplyScalar(0.1));
            this.direction.sub(normal.multiplyScalar(2 * normal.dot(this.direction)));
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

    throw(angle, behaviour) {
        if (this.game.getState().hero.magicball.level < 4) {
            this.scene.actors[0].playSample(SampleType.MAGIC_BALL_THROW);
        } else {
            this.scene.actors[0].playSample(SampleType.FIRE_BALL_THROW);
        }

        let direction = new THREE.Vector3(0, 0.1, 1.1);
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

        this.threeObject.position.copy(this.position);
        if (this.isFetchingKey) {
            const key = this.scene.getKeys()[0];
            const keyPos = key.physics.position;
            direction = keyPos.clone().sub(this.position).normalize();
        }

        this.direction = direction;
        this.bounces = 0;
        this.maxBounces = DEFAULT_MAX_BOUNCES;
        if (this.game.getState().hero.magic === 0) {
            this.maxBounces = 0;
        } else {
            this.game.getState().hero.magic -= 1;
        }
    }
}
