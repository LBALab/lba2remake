// @flow

import THREE from 'three';

import type {Model} from '../model';
import {loadModel, updateModel} from '../model';
import { loadAnimState } from '../model/animState';
import {getRotation} from '../utils/lba';
import * as Script from './scripting';

type ActorProps = {
    pos: [number, number, number],
    life: number,
    staticFlags: number,
    entityIndex: number,
    bodyIndex: number,
    animIndex: number,
    angle: number,
    speed: number
}

type ActorPhysics = {
    position: THREE.Vector3,
    orientation: THREE.Quaternion
}

type Actor = {
    props: ActorProps,
    threeObject: ?THREE.Object3D,
    model: ?Model,
    physics: ActorPhysics,
    isVisible: boolean,
    isSprite: boolean,
    scriptState: any,
    update: ?Function
}

export const ActorStaticFlag = {
    NONE             : 0,
    COLLIDE_WITH_OBJ : 1,
    // TODO
    HIDDEN           : 0x200,
    SPRITE           : 0x400
    // TODO
};

// TODO: move scetion offset to container THREE.Object3D
export function loadActor(props: ActorProps, callback: Function) {
    const pos = props.pos;
    const animState = loadAnimState();
    const actor: Actor = {
        props: props,
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2]),
            orientation: new THREE.Quaternion()
        },
        isVisible: !(props.staticFlags & ActorStaticFlag.HIDDEN) && (props.life > 0 || props.bodyIndex >= 0) ? true : false,
        isSprite: (props.staticFlags & ActorStaticFlag.SPRITE) ? true : false,
        model: null,
        animState: animState,
        threeObject: null,
        scriptState: Script.initScriptState(),
        updateAnimStep: function(time) {
            let newPos = new THREE.Vector3(0,0,0);
            const angle = THREE.Math.degToRad(getRotation(props.angle, 0, 1));

            const delta = time.delta * 1000;
            const speedZ = ((this.animState.step.z * delta) / this.animState.keyframeLength);
            const speedX = ((this.animState.step.x * delta) / this.animState.keyframeLength);

            newPos.x += (Math.cos(angle) * speedZ) * -1; // x is inverted
            newPos.z += Math.sin(angle) * speedZ;

            newPos.x += Math.sin(angle) * speedX;
            newPos.z += Math.cos(angle) * speedX;

            newPos.y += (this.animState.step.y * delta) / (this.animState.keyframeLength * 2);

            this.physics.position.add(newPos);
            this.model.mesh.position.set(this.physics.position.x, this.physics.position.y, this.physics.position.z);
        },
        update: function(time) {
            Script.processMoveScript(actor);
            Script.processLifeScript(actor);
            updateModel(this.model, this.animState, props.entityIndex, props.bodyIndex, props.animIndex, time);

            if(!this.isSprite && this.animState.isPlaying) {
                this.updateAnimStep(time);
            }
        }
    };

    const euler = new THREE.Euler(THREE.Math.degToRad(0),
                                  THREE.Math.degToRad(getRotation(props.angle, 0, 1) - 90),
                                  THREE.Math.degToRad(0), 'XZY');
    actor.physics.orientation.setFromEuler(euler);

    // only if not sprite actor
    loadModel(props.entityIndex, props.bodyIndex, props.animIndex, animState, (model) => {
        //model.mesh.visible = actor.isVisible;
        model.mesh.position.set(actor.physics.position.x, actor.physics.position.y, actor.physics.position.z);
        model.mesh.quaternion.copy(actor.physics.orientation);
        actor.model = model;
        actor.threeObject = model.mesh;
        callback(null, actor);
    });
}
