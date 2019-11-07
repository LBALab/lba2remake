import * as THREE from 'three';

import { getRandom } from '../utils/lba';
import { SpriteType } from './data/spriteType';
import { loadSprite } from '../iso/sprites';
import { addExtraToScene, removeExtraFromScene } from './scenes';
import {createBoundingBox} from '../utils/rendering.js';

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

interface ExtraPhysics {
    position: THREE.Vector3;
    orientation: THREE.Quaternion;
    temp: {
        position: THREE.Vector3,
        angle: number,
        destAngle: number
    };
}

export interface Extra {
    type: 'extra';
    physics: ExtraPhysics;

    flags: number;
    lifeTime: number;
    info: number;
    hitStrength: number;
    time: any;
    spawnTime: number;
    spriteIndex: number;

    isVisible: boolean;
    isSprite: boolean;
    isKilled: boolean;
    hasCollidedWithActor: boolean;

    loadMesh: Function;
    init: Function;
}

function initPhysics(position, angle) {
    return {
        position,
        orientation: new THREE.Quaternion(),
        temp: {
            destination: new THREE.Vector3(0, 0, 0),
            position: new THREE.Vector3(0, 0, 0),
            angle,
            destAngle: angle,
        }
    };
}

export async function addExtra(scene, position, angle, spriteIndex, bonus, time) : Promise<Extra> {
    const extra: Extra = {
        type: 'extra',
        physics: initPhysics(position, angle),
        isKilled: false,
        isVisible: true,
        isSprite: (spriteIndex) ? true : false,
        hasCollidedWithActor: false,
        flags: (
            ExtraFlag.STOP_COL
            | ExtraFlag.WAIT_NO_COL
            | ExtraFlag.BONUS
            | ExtraFlag.TAKABLE
        ),
        spriteIndex,
        spawnTime: 0,
        lifeTime: 20 * 1000, // 20 seconds
        info: bonus,
        hitStrength: 0,
        time,

        /* @inspector(locate) */
        async loadMesh() {
            this.threeObject = new THREE.Object3D();
            this.threeObject.position.copy(this.physics.position);
            const sprite = await loadSprite(spriteIndex, false, true, scene.is3DCam);
            /*
            sprite.boundingBoxDebugMesh = createBoundingBox(
                sprite.boundingBox,
                new THREE.Vector3(1, 0, 0)
            );
            sprite.boundingBoxDebugMesh.name = 'BoundingBox';
            this.threeObject.add(sprite.boundingBoxDebugMesh);
            */
            this.threeObject.add(sprite.threeObject);
            this.threeObject.name = `extra_${bonus}`;
            this.threeObject.visible = this.isVisible;
            this.sprite = sprite;
        },

        init(angle, speed, weight, time) {
            this.flags |= ExtraFlag.FLY;
            // TODO set speed
            this.time = time;
        },
    };

    if (spriteIndex !== SpriteType.KEY) {
        extra.flags += ExtraFlag.TIME_OUT + ExtraFlag.FLASH;
    }

    extra.init(angle, 40, 15);

    extra.spawnTime = time.elapsed;

    const euler = new THREE.Euler(0, angle, 0, 'XZY');
    extra.physics.orientation.setFromEuler(euler);

    await extra.loadMesh();
    addExtraToScene(scene, extra);

    return extra;
}

const ACTOR_BOX = new THREE.Box3();
const EXTRA_BOX = new THREE.Box3();
const INTERSECTION = new THREE.Box3();
const DIFF = new THREE.Vector3();

export function updateExtra(game, scene, extra, time) {
    let hitActor = null;

    if (time.elapsed - extra.spawnTime > 1) {
        EXTRA_BOX.copy(extra.sprite.boundingBox);
        EXTRA_BOX.translate(extra.physics.position);
        DIFF.set(0, 1 / 128, 0);
        EXTRA_BOX.translate(DIFF);
        for (let i = 0; i < scene.actors.length; i += 1) {
            const a = scene.actors[i];
            if ((a.model === null && a.sprite === null)
                || a.isKilled
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

    if (hitActor && hitActor.index === 0) {
        switch (extra.spriteIndex) {
            case SpriteType.KEY:
                game.getState().hero.keys += 1;
                break;
            case SpriteType.KASHES:
                game.getState().hero.money += extra.info;
                break;
        }
        removeExtraFromScene(scene, extra);
    }
}

export function randomBonus(type) {
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
