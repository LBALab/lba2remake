import * as THREE from 'three';

import { getRandom } from '../utils/lba';
import { SpriteType } from './data/constants';
import { loadSprite } from '../iso/sprites';
import { addExtraToScene } from './scenes';

export const ExtraFlag = {
    TIME_IN: 1 << 10,
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
    isVisible: boolean;
    isSprite: boolean;
    isKilled: boolean;
    loadMesh: Function;
    hasCollidedWithActor: boolean;
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

export async function addExtra(scene, position, angle, spriteIndex, bonus) : Promise<Extra> {
    const extra: Extra = {
        type: 'extra',
        physics: initPhysics(position, angle),
        isKilled: false,
        isVisible: true,
        isSprite: (spriteIndex) ? true : false,
        hasCollidedWithActor: false,

        /* @inspector(locate) */
        async loadMesh() {
            const sprite = await loadSprite(spriteIndex);
            sprite.threeObject.position.copy(this.physics.position);
            this.threeObject = sprite.threeObject;
            if (this.threeObject) {
                this.threeObject.name = 'extra';
                this.threeObject.visible = this.isVisible;
            }
        }
    };

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
