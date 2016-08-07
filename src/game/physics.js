import THREE from 'three';
import {map, each} from 'lodash';
import {Movement, Target} from './hero';

export function processPhysicsFrame(time, scene, camera, heroPhysics) {
    switch (heroPhysics.config.movement) {
        case Movement.NORMAL:
            processNormalMovement(time, scene, heroPhysics);
            break;
        case Movement.FLY:
            processFlyMovement(time, scene, heroPhysics);
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

function processNormalMovement(time, scene, heroPhysics) {
    orientedSpeed.copy(heroPhysics.speed);
    orientedSpeed.multiply(heroPhysics.config.speed);
    orientedSpeed.applyQuaternion(heroPhysics.orientation);
    orientedSpeed.applyQuaternion(heroPhysics.headOffset);
    orientedSpeed.multiplyScalar(time.delta);
    heroPhysics.position.add(orientedSpeed);
    heroPhysics.position.y = scene.getGroundHeight(heroPhysics.position.x, heroPhysics.position.z) + 0.08;
}

const euler = new THREE.Euler();

function processFlyMovement(time, scene, heroPhysics) {
    euler.setFromQuaternion(heroPhysics.headOrientation, 'YXZ');
    heroPhysics.speed.y = -heroPhysics.speed.z * euler.x;
    orientedSpeed.copy(heroPhysics.speed);
    orientedSpeed.multiply(heroPhysics.config.speed);
    orientedSpeed.applyQuaternion(heroPhysics.orientation);
    orientedSpeed.applyQuaternion(heroPhysics.headOffset);
    orientedSpeed.multiplyScalar(time.delta);
    heroPhysics.position.add(orientedSpeed);
    const groundHeight = scene.getGroundHeight(heroPhysics.position.x, heroPhysics.position.z);
    heroPhysics.position.y = Math.max(groundHeight + 0.08, heroPhysics.position.y);
}

function updateTarget(tgt, src) {
    tgt.position.copy(src.position);
    tgt.quaternion.copy(src.orientation);
    if (src.headOrientation) {
        tgt.quaternion.multiply(src.headOrientation);
    }
}
