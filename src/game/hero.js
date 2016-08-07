import THREE from 'three';
import {GameEvents} from './events';
import {assign} from 'lodash';

export const Movement = {
    NORMAL: 0
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
            headOrientation: new THREE.Quaternion()
        }
    };

    GameEvents.Scene.SceneLoaded.addListener(scene => {
        hero.physics.position.x = scene.startPosition[0];
        hero.physics.position.z = scene.startPosition[1];
    });

    return hero;
}
