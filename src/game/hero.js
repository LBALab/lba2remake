// @flow

import THREE from 'three';
import {assign} from 'lodash';

type MovementType = 0 | 1;
export const Movement = {
    NORMAL: 0,
    FLY: 1
};

type TargetType = 0;
export const Target = {
    CAMERA: 0
};

type HeroPhysicsConfig = {
    enabled: boolean,
    targets: TargetType[],
    movement: MovementType,
    speed: THREE.Vector3
};

type HeroConfig = {
    physics: HeroPhysicsConfig
}

export type HeroPhysics = {
    config: HeroPhysicsConfig,
    position: THREE.Vector3,
    orientation: THREE.Quaternion,
    headOrientation: THREE.Quaternion,
    speed: THREE.Vector3
};

export function createHero(config: HeroConfig) {
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

export function switchMovementMode(heroPhysics: HeroPhysics) {
    if (heroPhysics.config.movement == Movement.NORMAL) {
        heroPhysics.config.movement = Movement.FLY;
        console.log('switchMovementMode: FLY');
    }
    else {
        heroPhysics.config.movement = Movement.NORMAL;
        console.log('switchMovementMode: NORMAL');
    }
}