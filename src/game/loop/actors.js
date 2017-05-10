// @flow
import THREE from 'three';
import {updateModel} from '../../model';
import type {Actor} from '../actors';

export function updateActor(scene: any, actor: Actor, time: any, step: any) {
    if (actor.runScripts) {
        actor.runScripts(time, step);
    }

    if(actor.props.index != 0)
        return;

    if (actor.model != null && actor.threeObject && actor.threeObject.visible) {
        const model = actor.model;
        actor.animState.matrixRotation.makeRotationFromQuaternion(actor.physics.orientation);
        updateModel(scene.isActive, model, actor.animState, actor.props.entityIndex, actor.props.bodyIndex, actor.props.animIndex, time);
        if (actor.animState.isPlaying) {
            updateMovements(actor, time);
        }
    }
}

function updateMovements(actor: Actor, time: any) {
    const delta = time.delta * 1000;
    if (actor.isTurning) {
        let angle = ((actor.physics.temp.destAngle - actor.physics.temp.angle) * delta) / (actor.props.speed * 10);
        angle = Math.atan2(Math.sin(angle), Math.cos(angle));
        actor.physics.temp.angle += angle;
        const euler = new THREE.Euler(0, actor.physics.temp.angle, 0, 'XZY');
        actor.physics.orientation.setFromEuler(euler);
    }
    if (actor.isWalking) {
        actor.physics.temp.position.set(0,0,0);

        const speedZ = ((actor.animState.step.z * delta) / actor.animState.keyframeLength);
        const speedX = ((actor.animState.step.x * delta) / actor.animState.keyframeLength);

        actor.physics.temp.position.x += Math.sin(actor.physics.temp.angle) * speedZ;
        actor.physics.temp.position.z += Math.cos(actor.physics.temp.angle) * speedZ;

        actor.physics.temp.position.x -= Math.cos(actor.physics.temp.angle) * speedX;
        actor.physics.temp.position.z += Math.sin(actor.physics.temp.angle) * speedX;

        actor.physics.temp.position.y += (actor.animState.step.y * delta) / (actor.animState.keyframeLength);
    } else {
        actor.physics.temp.position.set(0, 0, 0);
    }
}