import THREE from 'three';
import {map, each} from 'lodash';
import {Movement, Target} from './hero';

export function processPhysicsFrame(game, renderer, scene, time) {
    processHeroMovement(game.controlsState, scene, time);
    /*
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
                updateTarget(cameras.camera3D, heroPhysics);
                break;
        }
    });
    */
}

const orientedSpeed = new THREE.Vector3();
const euler = new THREE.Euler();
const q = new THREE.Quaternion();

function processHeroMovement(controlsState, scene, time) {
    const actor = scene.getActor(0);
    if (controlsState.heroRotationSpeed != 0) {
        euler.setFromQuaternion(actor.physics.orientation, 'YXZ');
        euler.y += controlsState.heroRotationSpeed * time.delta * 1.2;
        actor.physics.orientation.setFromEuler(euler);
    }
    if (controlsState.heroSpeed != 0) {
        orientedSpeed.set(0, 0, controlsState.heroSpeed * 0.05);
        orientedSpeed.applyQuaternion(actor.physics.orientation);
        orientedSpeed.multiplyScalar(time.delta);
        actor.physics.position.add(orientedSpeed);
        if (scene.scenery.getGroundHeight)
            actor.physics.position.y = scene.scenery.getGroundHeight(actor.physics.position.x, actor.physics.position.z);
    }
}

function processNormalMovement(time, scene, heroPhysics) {
    orientedSpeed.copy(heroPhysics.speed);
    orientedSpeed.multiply(heroPhysics.config.speed);
    orientedSpeed.applyQuaternion(heroPhysics.orientation);
    orientedSpeed.applyQuaternion(onlyY(heroPhysics.headOrientation));
    orientedSpeed.multiplyScalar(time.delta);
    heroPhysics.position.add(orientedSpeed);
    heroPhysics.position.y = scene.getGroundHeight(heroPhysics.position.x, heroPhysics.position.z) + 0.08;
}



function processFlyMovement(time, scene, heroPhysics) {
    const groundHeight = scene.getGroundHeight(heroPhysics.position.x, heroPhysics.position.z);
    const altitude = Math.max(0.0, Math.min(1.0, (heroPhysics.position.y - groundHeight) * 0.7));
    euler.setFromQuaternion(heroPhysics.headOrientation, 'YXZ');
    heroPhysics.speed.y = -heroPhysics.speed.z * euler.x;

    orientedSpeed.copy(heroPhysics.speed);
    orientedSpeed.multiplyScalar((altitude * altitude) * 3.0 + 1.0);
    orientedSpeed.multiply(heroPhysics.config.speed);
    orientedSpeed.applyQuaternion(heroPhysics.orientation);
    orientedSpeed.applyQuaternion(onlyY(heroPhysics.headOrientation));
    orientedSpeed.multiplyScalar(time.delta);

    heroPhysics.position.add(orientedSpeed);
    heroPhysics.position.y = Math.max(groundHeight + 0.08, heroPhysics.position.y);
}

function onlyY(src) {
    euler.setFromQuaternion(src, 'YXZ');
    euler.x = 0;
    euler.z = 0;
    return q.setFromEuler(euler);
}

function updateTarget(tgt, src) {
    tgt.position.copy(src.position);
    tgt.quaternion.copy(src.orientation);
    if (src.headOrientation) {
        tgt.quaternion.multiply(src.headOrientation);
    }
}
