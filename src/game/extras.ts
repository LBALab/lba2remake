import * as THREE from 'three';

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
    // loadMesh: Function;
    hasCollidedWithActor: boolean;
}

function initPhysics(pos, angle) {
    return {
        position: new THREE.Vector3(pos[0], pos[1], pos[2]),
        orientation: new THREE.Quaternion(),
        temp: {
            destination: new THREE.Vector3(0, 0, 0),
            position: new THREE.Vector3(0, 0, 0),
            angle,
            destAngle: angle,
        }
    };
}

export async function loadExtra(pos, angle, spriteIndex, bonus) : Promise<Extra> {
    const extra: Extra = {
        type: 'extra',
        physics: initPhysics(pos, angle),
        isKilled: false,
        isVisible: true,
        isSprite: (spriteIndex) ? true : false,
        hasCollidedWithActor: false,
    };

    /* @inspector(locate)
    async loadMesh() {

    } */

    const euler = new THREE.Euler(0, angle, 0, 'XZY');
    extra.physics.orientation.setFromEuler(euler);

    // await extra.loadMesh();
    return extra;
}
