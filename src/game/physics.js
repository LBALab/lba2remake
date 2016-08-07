import THREE from 'three';
import {map, each} from 'lodash';
import {Movement, Target} from './hero';

export function processPhysicsFrame(dt, scene, camera, heroPhysics) {
    switch (heroPhysics.config.movement) {
        case Movement.NORMAL:
            processNormalMovement(dt, scene, heroPhysics);
            break;
    }

    each(heroPhysics.config.targets, target => {
        switch (target) {
            case Target.CAMERA:
                updateTarget(camera, heroPhysics);
                break;
        }
    });
}

const orientedSpeed = new THREE.Vector3();

function processNormalMovement(dt, scene, heroPhysics) {
    orientedSpeed.copy(heroPhysics.speed);
    orientedSpeed.multiply(heroPhysics.config.speed);
    orientedSpeed.applyQuaternion(heroPhysics.orientation);
    orientedSpeed.multiplyScalar(dt);
    heroPhysics.position.add(orientedSpeed);
    heroPhysics.position.y = scene.getGroundHeight(heroPhysics.position.x, heroPhysics.position.z) + 0.08;
}

function updateTarget(tgt, src) {
    tgt.position.copy(src.position);
    tgt.quaternion.copy(src.orientation);
    if (src.headOrientation) {
        tgt.quaternion.multiply(src.headOrientation);
    }
}
