import THREE from 'three';
import {assign} from 'lodash';

export const Movement = {
    NORMAL: 0,
    FLY: 1
};

export const Target = {
    CAMERA: 0
};

export function createHero(config) {
    return {
        physics: {
            config: config.physics,
            position: new THREE.Vector3(),
            orientation: new THREE.Quaternion(),
            headOrientation: new THREE.Quaternion(),
            speed: new THREE.Vector3()
        }
    };
}

export function switchMovementMode(heroPhysics) {
    if (heroPhysics.config.movement == Movement.NORMAL) {
        heroPhysics.config.movement = Movement.FLY;
        console.log('switchMovementMode: FLY');
    }
    else {
        heroPhysics.config.movement = Movement.NORMAL;
        console.log('switchMovementMode: NORMAL');
    }
}