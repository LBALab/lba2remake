// @flow

import THREE from 'three';

import type {Model} from '../model';
import {loadModel, updateModel} from '../model';
import {loadAnimState,resetAnimState} from '../model/animState';
import {getRotation,distance2D} from '../utils/lba';

type ActorProps = {
    index: number,
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

// TODO: move section offset to container THREE.Object3D
export function loadActor(game: any, envInfo: any, ambience: any, props: ActorProps, callback: Function) {
    const pos = props.pos;
    const animState = loadAnimState();
    const actor: Actor = {
        index: props.index,
        props: props,
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2]),
            orientation: new THREE.Quaternion(),
            temp: {
                destination: new THREE.Vector3(0, 0, 0),
                position: new THREE.Vector3(0, 0, 0),
                angle: THREE.Math.degToRad(getRotation(props.angle, 0, 1)),
            }
        },
        isVisible: !(props.staticFlags & ActorStaticFlag.HIDDEN) && (props.life > 0 || props.bodyIndex >= 0) ? true : false,
        isSprite: (props.staticFlags & ActorStaticFlag.SPRITE) ? true : false,
        isWalking: false,
        isTurning: false,
        model: null,
        threeObject: null,
        animState: animState,
        resetAnimState: function() {
            resetAnimState(this.animState);
        },
        update: function(time) {
            //this.runScripts(time);

            if(this.model) {
                this.animState.matrixRotation.makeRotationFromQuaternion(this.physics.orientation);
                updateModel(this.model, this.animState, this.props.entityIndex, this.props.bodyIndex, this.props.animIndex, time);
                if (this.animState.isPlaying) {
                    this.updateAnimStep(time);
                }
            }
        },
        goto: function(point) {
            if (!this.isWalking) {
                this.physics.temp.destination = point;
                this.physics.temp.angle = this.physics.position.angleTo(point);
                //this.physics.temp.angle = angleTo(point, this.physics.position);
            }
            this.isWalking = true;
            this.isTurning = true;

            return distance2D(this.physics.position, point);
        },
        setAngle: function(angle) {
            this.isTurning = true;
            this.props.angle = angle;
            this.physics.temp.angle = THREE.Math.degToRad(getRotation(angle, 0, 1));
        },
        stop: function() {
            this.isWalking = false;
            this.isTurning = false;
        },
        updateAnimStep: function(time) {
            const delta = time.delta * 1000;
            if (this.isTurning) {
                const euler = new THREE.Euler(THREE.Math.degToRad(0),
                    this.physics.temp.angle - (Math.PI/2),
                    THREE.Math.degToRad(0), 'XZY');
                this.physics.orientation.setFromEuler(euler);
                this.model.mesh.quaternion.copy(this.physics.orientation);
            }
            if (this.isWalking) {
                this.physics.temp.position.set(0,0,0);

                const speedZ = ((this.animState.step.z * delta) / this.animState.keyframeLength);
                const speedX = ((this.animState.step.x * delta) / this.animState.keyframeLength);

                this.physics.temp.position.x += (Math.cos(this.physics.temp.angle) * speedZ) * -1; // x is inverted
                this.physics.temp.position.z += Math.sin(this.physics.temp.angle) * speedZ;

                this.physics.temp.position.x += Math.sin(this.physics.temp.angle) * speedX;
                this.physics.temp.position.z += Math.cos(this.physics.temp.angle) * speedX;

                this.physics.temp.position.y += (this.animState.step.y * delta) / (this.animState.keyframeLength);

                this.physics.position.add(this.physics.temp.position);
                this.model.mesh.position.set(this.physics.position.x, this.physics.position.y, this.physics.position.z);
            }
        }
    };

    const euler = new THREE.Euler(THREE.Math.degToRad(0),
                                  THREE.Math.degToRad(getRotation(props.angle, 0, 1) - 90),
                                  THREE.Math.degToRad(0), 'XZY');
    actor.physics.orientation.setFromEuler(euler);

    // only if not sprite actor
    if (!actor.isSprite && props.bodyIndex != 0xFF) {
        loadModel(props.entityIndex, props.bodyIndex, props.animIndex, animState, envInfo, ambience, (model) => {
            //model.mesh.visible = actor.isVisible;
            model.mesh.position.set(actor.physics.position.x, actor.physics.position.y, actor.physics.position.z);
            model.mesh.quaternion.copy(actor.physics.orientation);
            actor.model = model;
            actor.threeObject = model.mesh;
            callback(null, actor);
        });
    } else {
        // TODO load sprite
        callback(null, actor);
    }
}
