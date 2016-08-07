import THREE from 'three';
import {assign} from 'lodash';

export const Movement = {
    NORMAL: 0
};

export const Target = {
    CAMERA: 0
};

export function createHero(config) {
    return {
        physics: assign({
            location: {
                position: new THREE.Vector3(),
                orientation: new THREE.Quaternion(),
                headOrientation: new THREE.Quaternion()
            }
        }, config.physics)
    }
}
