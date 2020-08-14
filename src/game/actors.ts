import * as THREE from 'three';
import {cloneDeep} from 'lodash';

import { loadModel, Model } from '../model';
import { loadAnimState, resetAnimState } from '../model/animState';
import { angleToRad, distance2D, angleTo, getDistanceLba } from '../utils/lba';
import {createBoundingBox} from '../utils/rendering';
import { loadSprite } from '../iso/sprites';

import { getObjectName } from '../ui/editor/DebugData';
import { createActorLabel } from '../ui/editor/labels';
import { runScript } from './scripting';
import { makePure } from '../utils/debug';
import { compileScripts } from '../scripting/compiler';

interface ActorFlags {
    hasCollisions: boolean;
    isVisible: boolean;
    isSprite: boolean;
    spriteAnim3DNumber: boolean;
}

interface ActorProps {
    index: number;
    sceneIndex: number;
    pos: [number, number, number];
    life: number;
    flags: ActorFlags;
    runtimeFlags: any;
    entityIndex: number;
    bodyIndex: number;
    animIndex: number;
    angle: number;
    speed: number;
    spriteIndex: number;
    hasSpriteAnim3D: number;
}

interface ActorPhysics {
    position: THREE.Vector3;
    orientation: THREE.Quaternion;
    temp: {
        position: THREE.Vector3,
        angle: number,
        destAngle: number
    };
}

export interface Actor {
    index: number;
    type: 'actor';
    props: ActorProps;
    threeObject?: THREE.Object3D;
    model?: Model;
    sprite?: any;
    physics: ActorPhysics;
    animState: any;
    isVisible: boolean;
    isSprite: boolean;
    isKilled: boolean;
    runScripts?: Function;
    loadMesh: Function;
    reloadModel: Function;
    hasCollidedWithActor: number;
    floorSound: number;
    reset: Function;
    resetAnimState: Function;
    resetPhysics: Function;
    goto: Function;
    gotoSprite: Function;
    facePoint: Function;
    setAngle: Function;
    getDistance: Function;
    getDistanceLba: Function;
    stop: Function;
    setBody: Function;
    setAnim: Function;
    setAnimWithCallback: Function;
    cancelAnims: Function;
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
export async function loadActor(
    game: any,
    params: any,
    is3DCam: boolean,
    envInfo: any,
    ambience: any,
    props: ActorProps,
    isSideScene: boolean) {
    const skipModel = isSideScene && props.index === 0;
    const animState = !skipModel ? loadAnimState() : null;
    const actor: Actor = {
        type: 'actor',
        index: props.index,
        props: cloneDeep(props),
        physics: initPhysics(props),
        isKilled: false,
        isVisible: props.flags.isVisible
            && (props.life > 0 || props.bodyIndex >= 0)
            && props.index !== 1,
        isSprite: props.flags.isSprite,
        hasCollidedWithActor: -1,
        floorSound: -1,
        model: null,
        sprite: null,
        threeObject: null,
        animState,

        runScripts(time) {
            if (this.scripts) {
                runScript(params, this.scripts.life, time);
                runScript(params, this.scripts.move, time);
            }
        },

        reset(scene) {
            this.resetAnimState();
            this.resetPhysics();
            compileScripts(game, scene, this);
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
            if (destAngle < 0) {
                destAngle += Math.PI * 2;
            }
            this.physics.temp.destAngle = destAngle;
            this.props.runtimeFlags.isWalking = true;
            this.props.runtimeFlags.isTurning = true;
            return this.getDistance(point);
        },

        gotoSprite(point, delta) {
            this.physics.position.lerp(point, delta);
            this.threeObject.position.copy(this.physics.position);
            return this.getDistance(point);
        },

        facePoint(point) {
            let destAngle = angleTo(this.physics.position, point);
            if (destAngle < 0) {
                destAngle += Math.PI * 2;
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

        async loadMesh() {
            const name = getObjectName('actor',
                            this.props.sceneIndex,
                            this.props.index);
            // only if not sprite actor
            if (!this.isSprite && this.props.bodyIndex !== 0xFF) {
                const {entityIndex, bodyIndex, animIndex} = this.props;
                const model = await loadModel(
                    params,
                    entityIndex,
                    bodyIndex,
                    animIndex,
                    this.animState,
                    envInfo,
                    ambience
                );
                if (model !== null) {
                    // model.mesh.visible = actor.isVisible;
                    model.mesh.position.copy(this.physics.position);
                    model.mesh.quaternion.copy(this.physics.orientation);
                    this.model = model;
                    this.threeObject = model.mesh;
                    if (this.threeObject) {
                        this.threeObject.name = `actor:${name}`;
                        if (props.index === 0 && game.controlsState.firstPerson) {
                            this.threeObject.visible = false;
                        } else {
                            this.threeObject.visible = this.isVisible;
                        }
                    }
                }
            } else {
                this.threeObject = new THREE.Object3D();
                this.threeObject.name = `actor:${name}`;
                this.threeObject.visible = this.isVisible;
                this.threeObject.position.copy(this.physics.position);
                this.threeObject.quaternion.copy(this.physics.orientation);
                if (this.isSprite) {
                    const {spriteIndex, flags: {hasSpriteAnim3D}} = this.props;
                    const sprite = await loadSprite(spriteIndex, hasSpriteAnim3D, false);
                    this.threeObject.add(sprite.threeObject);
                    if (params.editor) {
                        sprite.boundingBoxDebugMesh = createBoundingBox(
                            sprite.boundingBox,
                            new THREE.Vector3(1, 0, 0)
                        );
                        sprite.boundingBoxDebugMesh.name = 'BoundingBox';
                        sprite.boundingBoxDebugMesh.visible = false;
                        this.threeObject.add(sprite.boundingBoxDebugMesh);
                    }
                    this.sprite = sprite;
                }
            }
            if (params.editor) {
                createActorLabel(this, name, is3DCam);
            }
        },

        setBody(scene, index) {
            if (this.props.bodyIndex === index) {
                return;
            }
            this.props.bodyIndex = index;
            this.reloadModel(scene);
        },

        setAnim(index) {
            if (this.props.animIndex === index) {
                return;
            }
            this.props.animIndex = index;
            this.resetAnimState();
        },

        cancelAnims() {
            // TODO(scottwilliams): There are likely other cases where we should
            // also not cancel the animations e.g. when Twinsen is crawling. Add
            // them here when we've implemented them.
            if (this.props.runtimeFlags.isDrowning) {
                return;
            }
            this.setAnim(0);
            this.props.runtimeFlags.isJumping = false;
            this.props.runtimeFlags.isWalking = false;
            this.props.runtimeFlags.isFalling = false;
            this.props.runtimeFlags.isClimbing = false;
        },

        setAnimWithCallback(index, callback) {
            if (this.props.animIndex === index) {
                return;
            }
            this.props.animIndex = index;
            this.resetAnimState();
            this.animState.callback = callback;
        },

        reloadModel(scene) {
            const oldObject = this.threeObject;
            this.loadMesh().then(() => {
                scene.addMesh(this.threeObject);
                if (oldObject) {
                    scene.removeMesh(oldObject);
                }
                this.threeObject.updateMatrixWorld();
            });
        }
    };

    makePure(actor.getDistance);
    makePure(actor.getDistanceLba);

    const euler = new THREE.Euler(0, angleToRad(props.angle), 0, 'XZY');
    actor.physics.orientation.setFromEuler(euler);

    if (!skipModel) {
        await actor.loadMesh();
    }
    return actor;
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
