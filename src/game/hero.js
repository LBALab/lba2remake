import THREE from 'three';
import {GameEvents} from './events';
import {assign} from 'lodash';

export const Movement = {
    NORMAL: 0,
    FLY: 1
};

export const Target = {
    CAMERA: 0
};

export function createHero(config) {
    const hero = {
        physics: {
            config: config.physics,
            position: new THREE.Vector3(),
            orientation: new THREE.Quaternion(),
            headOrientation: new THREE.Quaternion(),
            speed: new THREE.Vector3()
        }
    };

    GameEvents.scene.sceneLoaded.addListener(scene => {
        hero.physics.position.x = scene.startPosition[0];
        hero.physics.position.z = scene.startPosition[1];
    });

    return hero;
}

export function switchMovementMode(heroPhysics) {
    if (heroPhysics.config.movement == Movement.NORMAL) {
        heroPhysics.config.movement  = Movement.FLY;
    }
    else {
        heroPhysics.config.movement  = Movement.NORMAL;
    }
    console.log('switchMode mode:', heroPhysics.config.movement);
}