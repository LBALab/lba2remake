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

export function savePosition(game: any) {
    /*
    localStorage.setItem('hero_position_' + scene.index, JSON.stringify({
        position: heroPhysics.position.toArray(),
        orientation: heroPhysics.orientation.toArray(),
        headOrientation: heroPhysics.headOrientation.toArray(),
        movement: heroPhysics.config.movement
    }));
    */
}

export function loadPosition(game: any) {
    /*
    try {
        const item = localStorage.getItem('hero_position_' + scene.index);
        if (typeof item == 'string') {
            const info = JSON.parse(item);
            heroPhysics.position.fromArray(info.position);
            heroPhysics.orientation.fromArray(info.orientation);
            heroPhysics.headOrientation.fromArray(info.headOrientation);
            heroPhysics.config.movement = info.movement;
        }
    }
    catch (e) {}
    */
}