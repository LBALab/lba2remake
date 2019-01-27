import * as THREE from 'three';

import { getRandom } from '../utils/lba';
import { SpriteType } from './data/spriteType';
import { loadSprite } from '../iso/sprites';
import { addExtraToScene } from './scenes';

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
        lifeTime: 20 * 1000, // 20 seconds
        info: bonus,
        hitStrength: 0,
        time,

        /* @inspector(locate) */
        async loadMesh() {
            const sprite = await loadSprite(spriteIndex); // , scene.data.isOutsideScene);
            sprite.threeObject.position.copy(this.physics.position);
            this.threeObject = sprite.threeObject;
            if (this.threeObject) {
                this.threeObject.name = 'extra';
                this.threeObject.visible = this.isVisible;
            }
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

    const euler = new THREE.Euler(0, angle, 0, 'XZY');
    extra.physics.orientation.setFromEuler(euler);

    await extra.loadMesh();
    addExtraToScene(scene, extra);

    return extra;
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
