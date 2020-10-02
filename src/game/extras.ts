import * as THREE from 'three';

import { getRandom } from '../utils/lba';
import { SpriteType } from './data/spriteType';
import { loadSprite } from '../iso/sprites';
import { addExtraToScene, removeExtraFromScene } from './scenes';
import { clone } from 'lodash';
import { getHtmlColor } from '../scene';
import { MAX_LIFE } from './state';
// import { createBoundingBox } from '../utils/rendering';

export const ExtraFlag = {
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

export interface Extra {
    type: 'extra';
    physics: ExtraPhysics;

    flags: number;
    props: any;
    lifeTime: number;
    info: number;
    hitStrength: number;
    time: any;
    spawnTime: number;
    spriteIndex: number;
    speed: number;
    weight: number;

    isVisible: boolean;
    isSprite: boolean;
    hasCollidedWithActor: boolean;

    loadMesh: Function;
    init: Function;
}

const playSoundFx = (game, sampleIndex) => {
    const audio = game.getAudioManager();
    audio.playSample(sampleIndex);
};

function initPhysics(position, angle) {
    return {
        position,
        orientation: new THREE.Quaternion(),
        temp: {
            position: new THREE.Vector3(0, 0, 0),
            angle,
            destAngle: angle,
            direction: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0),
        }
    };
}

export async function addExtra(game, scene, position, angle, spriteIndex, bonus, time)
    : Promise<Extra> {
    const extra: Extra = {
        type: 'extra',
        physics: initPhysics(position, angle),
        isVisible: true,
        isSprite: (spriteIndex) ? true : false,
        hasCollidedWithActor: false,
        flags: (
            ExtraFlag.STOP_COL
            | ExtraFlag.WAIT_NO_COL
            | ExtraFlag.BONUS
            | ExtraFlag.TAKABLE
        ),
        props: {
            flags: {
                hasCollisions: true,
                hasCollisionFloor: true,
                canFall: true,
                isVisible: true,
                isSprite: true,
            },
            runtimeFlags: {
                isTouchingGround: false,
                isDead: false,
            }
        },
        spriteIndex,
        spawnTime: 0,
        lifeTime: 20, // 20 seconds
        info: bonus,
        hitStrength: 0,
        time,
        speed: 0,
        weight: 0,

        async loadMesh() {
            this.threeObject = new THREE.Object3D();
            this.threeObject.position.copy(this.physics.position);
            const sprite = await loadSprite(spriteIndex, false, true, scene.is3DCam);

            // // Debug Bounding Box
            // sprite.boundingBoxDebugMesh = createBoundingBox(
            //     sprite.boundingBox,
            //     new THREE.Vector3(1, 0, 0)
            // );
            // sprite.boundingBoxDebugMesh.name = 'BoundingBox';
            // this.threeObject.add(sprite.boundingBoxDebugMesh);

            this.threeObject.add(sprite.threeObject);
            this.threeObject.name = `extra_${bonus}`;
            this.threeObject.visible = this.isVisible;
            this.sprite = sprite;
        },

        init(_angle, _speed, _weight) {
            this.flags |= ExtraFlag.FLY;
            this.time = time;
            this.speed = _speed * 0.8;
            this.weight = _weight;
        },
    };

    extra.init(angle, 40, 15);

    extra.spawnTime = time.elapsed;
    extra.flags |= ExtraFlag.TIME_IN;

    const euler = new THREE.Euler(0, angle, 0, 'XZY');
    extra.physics.orientation.setFromEuler(euler);

    extra.physics.temp.direction = extra.physics.position.clone();

    extra.physics.temp.velocity = extra.physics.temp.direction.clone();

    await extra.loadMesh();
    addExtraToScene(scene, extra);

    playSoundFx(game, SAMPLE_BONUS);

    return extra;
}

const ACTOR_BOX = new THREE.Box3();
const EXTRA_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const DIFF = new THREE.Vector3();

export function updateExtra(game, scene, extra, time) {
    if (!extra)
        return;

    let hitActor = null;

    if (time.elapsed - extra.spawnTime > extra.lifeTime &&
        extra.spriteType !== SpriteType.KEY) {
        extra.flags |= ExtraFlag.TIME_OUT;
    }

    if ((extra.flags & ExtraFlag.FLY) === ExtraFlag.FLY) {
        const ts = (time.elapsed - extra.spawnTime) / 200;

        const x = extra.speed * ts
            * Math.cos(45);
        const y = extra.speed * ts
            * Math.sin(45) - (0.5 * GRAVITY * ts * ts);
        const trajectory = new THREE.Vector3(x, y, 0);
        trajectory.applyEuler(new THREE.Euler(0, extra.physics.temp.angle, 0, 'XZY'));

        extra.physics.position.add(
            trajectory
        );
        extra.threeObject.position.copy(extra.physics.position);
    }

    if (extra.props.flags.hasCollisions &&
        time.elapsed - extra.spawnTime > 0.5) {
        const isTouchingGroud = scene.scenery.physics.processCollisions(scene, extra, time);
        if (isTouchingGroud) {
            extra.physics.position.add(new THREE.Vector3(0, 0.1, 0));
            extra.threeObject.position.copy(extra.physics.position);
            extra.flags &= ~ExtraFlag.FLY;
        }
    }

    if (!((extra.flags & ExtraFlag.FLY) === ExtraFlag.FLY)) {
        EXTRA_BOX.copy(extra.sprite.boundingBox);
        EXTRA_BOX.translate(extra.physics.position);
        DIFF.set(0, 1 / 128, 0);
        EXTRA_BOX.translate(DIFF);
        for (let i = 0; i < scene.actors.length; i += 1) {
            const a = scene.actors[i];
            if ((a.model === null && a.sprite === null)
                || a.props.runtimeFlags.isDead
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
        switch (extra.spriteIndex) {
            case SpriteType.LIFE:
                hero.life += extra.info * 5;
                if (hero.life > MAX_LIFE) {
                    hero.life = MAX_LIFE;
                }
                break;
            case SpriteType.MAGIC:
                hero.magic += extra.info;
                if (hero.magic > (hero.magicball.level + 1) * 20) {
                    hero.magic = (hero.magicball.level + 1) * 20;
                }
                break;
            case SpriteType.KEY:
                hero.keys += 1;
                extra.info = 1;
                break;
            case SpriteType.KASHES:
                hero.money += extra.info;
                break;
        }
    } else if (hitActor) {
        switch (extra.spriteIndex) {
            case SpriteType.LIFE:
                hitActor.props.life += extra.info * 5;
                shouldCollect = true;
                break;
        }
    }

    if (shouldCollect ||
        (extra.flags & ExtraFlag.TIME_OUT) === ExtraFlag.TIME_OUT) {
        if (extra.info && shouldCollect) {
            playSoundFx(game, SAMPLE_BONUS_FOUND);
            const itrjId = `extra_${extra.index}_${extra.info}`;
            const interjections = clone(game.getUiState().interjections);

            interjections[itrjId] = {
                scene: scene.index,
                obj: extra,
                color: getHtmlColor(scene.data.palette, (10 * 16) + 12),
                value: extra.info,
            };
            game.setUiState({interjections});
            setTimeout(() => {
                const interjectionsCopy = clone(game.getUiState().interjections);
                delete interjectionsCopy[itrjId];
                game.setUiState({interjections: interjectionsCopy});
            }, 1000);
        }

        removeExtraFromScene(scene, extra);
    }
}

export function getBonus(type) {
    let spriteIndex = 0;
    const bonus = [];
    for (let b = 0; b < 5; b += 1) {
        if (type & (1 << (b + 4))) {
            bonus.push(b);
        }
    }

    // TODO validate per chapter bonus

    spriteIndex = bonus[getRandom(0, bonus.length - 1)];
    if (spriteIndex === 0) {
        spriteIndex = SpriteType.KASHES;
        // TODO if planet Zeelich then increment
        // spriteIndex += 1
    } else {
        spriteIndex += 3; // starts on heart sprite
    }

    return spriteIndex;
}
