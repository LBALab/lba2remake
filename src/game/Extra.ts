import * as THREE from 'three';

import { getRandom, getHtmlColor } from '../utils/lba';
import { SpriteType } from './data/spriteType';
import { loadSprite } from './scenery/isometric/sprites';
import { clone } from 'lodash';
import { MAX_LIFE } from './GameState';
import Scene from './Scene';
import Game from './Game';
import { Time } from '../datatypes';
import { getParams } from '../params';
// import { createBoundingBox } from '../utils/rendering';

const ExtraFlag = {
    TIME_OUT: 1 << 0,
    FLY: 1 << 1,
    STOP_COL: 1 << 4,
    TAKABLE: 1 << 5,
    FLASH: 1 << 6,
    TIME_IN: 1 << 10,
    WAIT_NO_COL: 1 << 13,
    BONUS: 1 << 14,
};

const GRAVITY = 40000;

const SAMPLE_BONUS = 3;
const SAMPLE_BONUS_FOUND = 2;

interface ExtraProps {
    bonus: number;
    flags: {
        hasCollisions: boolean;
        hasCollisionFloor: boolean;
        canFall: boolean;
        isVisible: boolean;
        isSprite: boolean;
    };
}

interface ExtraState {
    isVisible: boolean;
    isTouchingGround: boolean;
    isDead: boolean;
}

interface ExtraPhysics {
    position: THREE.Vector3;
    orientation: THREE.Quaternion;
    temp: {
        position: THREE.Vector3,
        angle: number,
        destAngle: number
        direction: THREE.Vector3,
        velocity: THREE.Vector3,
    };
}

let indexCount = 0;
const ACTOR_BOX = new THREE.Box3();
const EXTRA_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const DIFF = new THREE.Vector3();

export default class Extra {
    readonly type = 'extra';
    readonly index: number;
    readonly physics: ExtraPhysics;
    readonly props: ExtraProps;
    readonly isSprite: boolean;
    readonly spriteIndex: SpriteType;
    readonly lifeTime: number;
    readonly hitStrength: number;
    readonly baseTime: Time;
    readonly sound: any;
    info: number;
    time: Time;
    flags: number;
    state: ExtraState;
    threeObject?: THREE.Object3D;
    sprite?: any;
    spawnTime: number;
    speed: number;
    weight: number;
    hasCollidedWithActor: boolean;

    static async load(
        game: Game,
        scene: Scene,
        position: THREE.Vector3,
        angle: number,
        spriteIndex: number,
        bonus: number,
        time: Time
    ): Promise<Extra> {
        const extra = new Extra(game, position, angle, spriteIndex, bonus, time);
        extra.init(angle, 40, 15);
        await extra.loadMesh(scene);
        scene.addExtra(extra);
        const audio = game.getAudioManager();
        audio.playSound(extra.sound, SAMPLE_BONUS);
        return extra;
    }

    private constructor(
        game: Game,
        position: THREE.Vector3,
        angle: number,
        spriteIndex: number,
        bonus: number,
        time: Time
    ) {
        this.index = indexCount;
        indexCount += 1;
        this.physics = {
            position,
            orientation: new THREE.Quaternion(),
            temp: {
                position: position.clone(),
                angle,
                destAngle: angle,
                direction: position.clone(),
                velocity: position.clone(),
            }
        };
        const euler = new THREE.Euler(0, angle, 0, 'XZY');
        this.physics.orientation.setFromEuler(euler);
        this.isSprite = !!spriteIndex;
        this.hasCollidedWithActor = false;
        this.flags = ExtraFlag.STOP_COL
            | ExtraFlag.WAIT_NO_COL
            | ExtraFlag.BONUS
            | ExtraFlag.TAKABLE
            | ExtraFlag.TIME_IN;
        this.props = {
            bonus,
            flags: {
                hasCollisions: true,
                hasCollisionFloor: true,
                canFall: true,
                isVisible: true,
                isSprite: true,
            }
        };
        this.state = {
            isVisible: true,
            isTouchingGround: false,
            isDead: false,
        };
        this.spriteIndex = spriteIndex;
        this.spawnTime = 0;
        this.lifeTime = 20; // 20 seconds
        this.info = bonus;
        this.hitStrength = 0;
        this.time = time;
        this.baseTime = time;
        this.spawnTime = time.elapsed;
        this.speed = 0;
        this.weight = 0;

        const audio = game.getAudioManager();
        this.sound = audio.createSamplePositionalAudio();
    }

    private async loadMesh(scene: Scene) {
        this.threeObject = new THREE.Object3D();
        this.threeObject.position.copy(this.physics.position);
        const sprite = await loadSprite(this.spriteIndex, false, true, scene.is3DCam);

        // // Debug Bounding Box
        // sprite.boundingBoxDebugMesh = createBoundingBox(
        //     sprite.boundingBox,
        //     new THREE.Vector3(1, 0, 0)
        // );
        // sprite.boundingBoxDebugMesh.name = 'BoundingBox';
        // this.threeObject.add(sprite.boundingBoxDebugMesh);

        this.threeObject.add(sprite.threeObject);
        this.threeObject.name = `extra_${this.props.bonus}`;
        this.threeObject.visible = this.state.isVisible;
        this.sprite = sprite;
        this.threeObject.add(this.sound);
    }

    private init(_angle, speed, _weight) {
        this.flags |= ExtraFlag.FLY;
        this.time = this.baseTime;
        this.speed = speed * 0.8;
        this.weight = _weight;
    }

    update(game: Game, scene: Scene, time: Time) {
        let hitActor = null;

        if (time.elapsed - this.spawnTime > this.lifeTime
            && this.spriteIndex !== SpriteType.KEY) {
            this.flags |= ExtraFlag.TIME_OUT;
        }

        if ((this.flags & ExtraFlag.FLY) === ExtraFlag.FLY) {
            const ts = (time.elapsed - this.spawnTime) * 0.0025;

            const x = this.speed * ts * Math.cos(45);
            const y = this.speed * ts * Math.sin(45) - (0.5 * GRAVITY * ts * ts);
            const trajectory = new THREE.Vector3(x, y, 0);
            trajectory.applyEuler(new THREE.Euler(0, this.physics.temp.angle, 0, 'XZY'));

            this.physics.position.add(trajectory);
            this.threeObject.position.copy(this.physics.position);
        }

        if (this.props.flags.hasCollisions &&
            time.elapsed - this.spawnTime > 0.5) {
            const isTouchingGroud = scene.scenery.physics.processCollisions(scene, this, time);
            if (isTouchingGroud) {
                this.physics.position.add(new THREE.Vector3(0, 0.1, 0));
                this.threeObject.position.copy(this.physics.position);
                this.flags &= ~ExtraFlag.FLY;
            }
        }

        if (!((this.flags & ExtraFlag.FLY) === ExtraFlag.FLY)) {
            EXTRA_BOX.copy(this.sprite.boundingBox);
            EXTRA_BOX.translate(this.physics.position);
            DIFF.set(0, 1 / 128, 0);
            EXTRA_BOX.translate(DIFF);
            for (let i = 0; i < scene.actors.length; i += 1) {
                const a = scene.actors[i];
                if ((a.model === null && a.sprite === null)
                    || a.state.isDead
                    || !(a.props.flags.hasCollisions || a.props.flags.isSprite)) {
                    continue;
                }
                const boundingBox = a.model ? a.model.boundingBox : a.sprite.boundingBox;
                INTERSECTION.copy(boundingBox);
                if (a.model) {
                    INTERSECTION.translate(a.physics.position);
                } else {
                    INTERSECTION.applyMatrix4(a.threeObject.matrixWorld);
                }
                DIFF.set(0, 1 / 128, 0);
                INTERSECTION.translate(DIFF);
                ACTOR_BOX.copy(INTERSECTION);
                if (ACTOR_BOX.intersectsBox(EXTRA_BOX)) {
                    hitActor = a;
                    break;
                }
            }
        }

        // Only Twinsen can collect extras such as keys, but we allow other actors
        // to collect extras like life points.
        let shouldCollect = false;

        if (hitActor && hitActor.index === 0) {
            shouldCollect = true;
            const { hero } = game.getState();
            switch (this.spriteIndex) {
                case SpriteType.LIFE:
                    hero.life += this.info * 5;
                    if (hero.life > MAX_LIFE) {
                        hero.life = MAX_LIFE;
                    }
                    break;
                case SpriteType.MAGIC:
                    hero.magic += this.info;
                    if (hero.magic > (hero.magicball.level + 1) * 20) {
                        hero.magic = (hero.magicball.level + 1) * 20;
                    }
                    break;
                case SpriteType.KEY:
                    hero.keys += 1;
                    this.info = 1;
                    break;
                case SpriteType.KASHES:
                    hero.money += this.info;
                    break;
            }
        } else if (hitActor) {
            switch (this.spriteIndex) {
                case SpriteType.LIFE:
                    hitActor.props.life += this.info * 5;
                    shouldCollect = true;
                    break;
            }
        }

        if (shouldCollect ||
            (this.flags & ExtraFlag.TIME_OUT) === ExtraFlag.TIME_OUT) {
            if (this.info && shouldCollect) {
                const audio = game.getAudioManager();
                audio.stopSound(this.sound, SAMPLE_BONUS);
                audio.playSound(this.sound, SAMPLE_BONUS_FOUND);
                const itrjId = `extra_${this.index}_${this.info}`;
                const interjections = clone(game.getUiState().interjections);

                interjections[itrjId] = {
                    scene: scene.index,
                    obj: this,
                    color: getHtmlColor(scene.props.palette, (10 * 16) + 12),
                    value: this.info,
                };
                game.setUiState({interjections});
                setTimeout(() => {
                    const interjectionsCopy = clone(game.getUiState().interjections);
                    delete interjectionsCopy[itrjId];
                    game.setUiState({interjections: interjectionsCopy});
                }, 1000);
            }

            scene.removeExtra(this);
        }
    }
}

export function getBonus(type): SpriteType {
    const isLBA1 = getParams().game === 'lba1';
    const bonus = [];
    for (let b = 0; b < 5; b += 1) {
        if (type & (1 << (b + 4))) {
            bonus.push(b);
        }
    }

    // TODO validate per chapter bonus

    let spriteIndex = bonus[getRandom(0, bonus.length - 1)];
    spriteIndex += 3;

    if (!isLBA1 && spriteIndex === 3) {
        spriteIndex = SpriteType.KASHES;
        // TODO if planet Zeelich then increment
        // spriteIndex += 1
    }

    return spriteIndex;
}
