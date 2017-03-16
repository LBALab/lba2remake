// @flow

import THREE from 'three';

import type {Model} from '../model';
import {loadModel} from '../model';
import {loadAnimState, resetAnimState} from '../model/animState';
import {angleToRad, distance2D, angleTo, getDistanceLba} from '../utils/lba';

type ActorFlags = {
    hasCollisions: boolean,
    isVisible: boolean,
    isSprite: boolean
}

type ActorProps = {
    index: number,
    pos: [number, number, number],
    life: number,
    flags: ActorFlags,
    entityIndex: number,
    bodyIndex: number,
    animIndex: number,
    angle: number,
    speed: number
}

type ActorPhysics = {
    position: THREE.Vector3,
    orientation: THREE.Quaternion,
    temp: {
        position: THREE.Vector3,
        angle: number,
        destAngle: number
    }
}

export type Actor = {
    props: ActorProps,
    threeObject: ?THREE.Object3D,
    model: ?Model,
    physics: ActorPhysics,
    animState: any,
    isVisible: boolean,
    isSprite: boolean,
    isTurning: boolean,
    isWalking: boolean,
    isKilled: boolean,
    runScripts: ?Function
}

export const DirMode = {
    NO_MOVE: 0,
    MANUAL: 1
};

// TODO: move section offset to container THREE.Object3D
export function loadActor(envInfo: any, ambience: any, props: ActorProps, callback: Function) {
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
                angle: angleToRad(props.angle),
                destAngle: angleToRad(props.angle),
            }
        },
        isKilled: false,
        isVisible: props.flags.isVisible && (props.life > 0 || props.bodyIndex >= 0),
        isSprite: props.flags.isSprite,
        isWalking: false,
        isTurning: false,
        model: null,
        threeObject: null,
        animState: animState,
        runScripts: null,
        resetAnimState: function() {
            resetAnimState(this.animState);
        },
        goto: function(point) {
            this.physics.temp.destination = point;
            let destAngle = angleTo(this.physics.position, point);
            const signCurr = this.physics.temp.destAngle > 0 ? 1 : -1;
            const signTgt = destAngle > 0 ? 1 : -1;
            if (signCurr != signTgt && Math.abs(destAngle) > Math.PI / 4) {
                if (signCurr == -1) {
                    destAngle -= 2 * Math.PI;
                } else {
                    destAngle += 2 * Math.PI;
                }
            }
            this.physics.temp.destAngle = destAngle;
            this.isWalking = true;
            this.isTurning = true;
            return this.getDistance(point);
        },
        setAngle: function(angle) {
            this.isTurning = true;
            this.props.angle = angle;
            this.physics.temp.destAngle = angleToRad(angle);
        },
        getDistance: function(pos) {
            return distance2D(this.physics.position, pos);
        },
        getDistanceLba: function(pos) {
            return getDistanceLba(this.getDistance(pos));
        },
        stop: function() {
            this.isWalking = false;
            this.isTurning = false;
            this.physics.temp.destAngle = this.physics.temp.angle;
            delete this.physics.temp.destination;
        }
    };

    const euler = new THREE.Euler(0, angleToRad(props.angle), 0, 'XZY');
    actor.physics.orientation.setFromEuler(euler);

    // only if not sprite actor
    if (actor.isVisible && !actor.isSprite && props.bodyIndex != 0xFF) {
        loadModel(props.entityIndex, props.bodyIndex, props.animIndex, animState, envInfo, ambience, (model) => {
            //model.mesh.visible = actor.isVisible;
            model.mesh.position.copy(actor.physics.position);
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
