// @flow

import * as THREE from 'three';

import type {Model} from '../model';
import {loadModel} from '../model';
import {loadAnimState, resetAnimState} from '../model/animState';
import {angleToRad, distance2D, angleTo, getDistanceLba} from '../utils/lba';
import {loadSprite} from '../iso/sprites';

import {getObjectName} from '../ui/editor/DebugData';

type ActorFlags = {
    hasCollisions: boolean,
    isVisible: boolean,
    isSprite: boolean,
    spriteAnim3DNumber: boolean
}

type ActorProps = {
    index: number,
    sceneIndex: number,
    pos: [number, number, number],
    life: number,
    flags: ActorFlags,
    runtimeFlags: any,
    entityIndex: number,
    bodyIndex: number,
    animIndex: number,
    angle: number,
    speed: number,
    spriteIndex: number,
    hasSpriteAnim3D: number
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
    type: 'actor',
    props: ActorProps,
    threeObject: ?THREE.Object3D,
    model: ?Model,
    physics: ActorPhysics,
    animState: any,
    isVisible: boolean,
    isSprite: boolean,
    isKilled: boolean,
    runScripts: ?Function,
    loadMesh: Function,
    reload: Function
}

export const DirMode = {
    NO_MOVE: 0,
    MANUAL: 1,
    FOLLOW: 2,
    TRACK: 3,
    FOLLOW2: 4,
    TRACK_ATTACK: 5,
    SAME_XZ: 6,
    PINGUIN: 7,
    WAGON: 8,
    MOVE_CIRCLE: 9,
    MOVE_CIRCLE2: 10,
    SAME_XZ_BETA: 11,
    MOVE_BUGGY: 12,
    MOVE_BUGGY_MANUAL: 13
};

// TODO: move section offset to container THREE.Object3D
export function loadActor(params: Object,
                          envInfo: any,
                          ambience: any,
                          props: ActorProps,
                          mainCallback: Function) {
    const animState = loadAnimState();
    const actor: Actor = {
        type: 'actor',
        index: props.index,
        props,
        physics: initPhysics(props),
        isKilled: false,
        isVisible: props.flags.isVisible
            && (props.life > 0 || props.bodyIndex >= 0)
            && props.index !== 1,
        isSprite: props.flags.isSprite,
        hasCollidedWithActor: -1,
        floorSound: -1,
        model: null,
        threeObject: null,
        animState,
        runScripts: null,
        reset() {
            this.resetAnimState();
            this.resetPhysics();
            this.isKilled = false;
            this.floorSound = -1;
        },
        resetAnimState() {
            resetAnimState(this.animState);
        },
        resetPhysics() {
            this.physics = initPhysics(props);
        },
        goto(point) {
            this.physics.temp.destination = point;
            let destAngle = angleTo(this.physics.position, point);
            const signCurr = this.physics.temp.destAngle > 0 ? 1 : -1;
            const signTgt = destAngle > 0 ? 1 : -1;
            if (signCurr !== signTgt && Math.abs(destAngle) > Math.PI / 4) {
                if (signCurr === -1) {
                    destAngle -= 2 * Math.PI;
                } else {
                    destAngle += 2 * Math.PI;
                }
            }
            this.physics.temp.destAngle = destAngle;
            this.props.runtimeFlags.isWalking = true;
            this.props.runtimeFlags.isTurning = true;
            return this.getDistance(point);
        },
        facePoint(point) {
            let destAngle = angleTo(this.physics.position, point);
            const signCurr = this.physics.temp.destAngle > 0 ? 1 : -1;
            const signTgt = destAngle > 0 ? 1 : -1;
            if (signCurr !== signTgt && Math.abs(destAngle) > Math.PI / 4) {
                if (signCurr === -1) {
                    destAngle -= 2 * Math.PI;
                } else {
                    destAngle += 2 * Math.PI;
                }
            }
            this.physics.temp.destAngle = destAngle;
            this.props.runtimeFlags.isTurning = true;
        },
        setAngle(angle) {
            this.props.runtimeFlags.isTurning = true;
            this.props.angle = angle;
            this.physics.temp.destAngle = angleToRad(angle);
        },
        getDistance(pos) {
            return distance2D(this.physics.position, pos);
        },
        getDistanceLba(pos) {
            return getDistanceLba(this.getDistance(pos));
        },
        stop() {
            this.props.runtimeFlags.isWalking = false;
            this.props.runtimeFlags.isTurning = false;
            this.physics.temp.destAngle = this.physics.temp.angle;
            delete this.physics.temp.destination;
        },
        loadMesh(callback: Function) {
            const that = this;
            // only if not sprite actor
            if (!that.isSprite && that.props.bodyIndex !== 0xFF) {
                const {entityIndex, bodyIndex, animIndex} = that.props;
                loadModel(
                    params,
                    entityIndex,
                    bodyIndex,
                    animIndex,
                    animState,
                    envInfo,
                    ambience,
                    (model) => {
                        if (model !== null) {
                            // model.mesh.visible = actor.isVisible;
                            model.mesh.position.copy(that.physics.position);
                            model.mesh.quaternion.copy(that.physics.orientation);
                            that.model = model;
                            that.threeObject = model.mesh;
                            if (that.threeObject) {
                                that.threeObject.name = `actor:${getObjectName('actor', that.props.sceneIndex, that.props.index)}`;
                                that.threeObject.visible = that.isVisible;
                            }
                        }
                        if (callback) {
                            callback(null, that);
                        }
                    });
            } else {
                loadSprite(that.props.spriteIndex, (sprite) => {
                    sprite.threeObject.position.copy(that.physics.position);
                    // sprite.threeObject.quaternion.copy(actor.physics.orientation);
                    that.threeObject = sprite.threeObject;
                    if (that.threeObject) {
                        that.threeObject.name = `actor:${getObjectName('actor', that.props.sceneIndex, that.props.index)}`;
                        that.threeObject.visible = that.isVisible;
                    }
                    if (callback) {
                        callback(null, that);
                    }
                });
            }
        },
        reload(scene) {
            if (this.threeObject) {
                this.threeObject.visible = false;
                scene.removeMesh(this.threeObject);
                delete this.threeObject;
            }
            if (this.model) {
                delete this.model;
            }
            this.loadMesh();
            scene.addMesh(this.threeObject);
        }
    };

    const euler = new THREE.Euler(0, angleToRad(props.angle), 0, 'XZY');
    actor.physics.orientation.setFromEuler(euler);

    actor.loadMesh(mainCallback);
}

function initPhysics({pos, angle}) {
    return {
        position: new THREE.Vector3(pos[0], pos[1], pos[2]),
        orientation: new THREE.Quaternion(),
        temp: {
            destination: new THREE.Vector3(0, 0, 0),
            position: new THREE.Vector3(0, 0, 0),
            angle: angleToRad(angle),
            destAngle: angleToRad(angle),
        }
    };
}
