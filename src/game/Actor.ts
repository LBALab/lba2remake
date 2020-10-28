import * as THREE from 'three';
import {cloneDeep} from 'lodash';

import { loadModel, Model } from '../model';
import { loadAnimState, resetAnimState } from '../model/animState';
import { AnimType } from './data/animType';
import { angleToRad, distance2D, angleTo, getDistanceLba } from '../utils/lba';
import {createBoundingBox} from '../utils/rendering';
import { loadSprite } from './scenery/isometric/sprites';

import { getObjectName } from '../ui/editor/DebugData';
import { createActorLabel } from '../ui/editor/labels';
import { runScript } from './scripting';
import { compileScripts } from '../scripting/compiler';
import { parseScript } from '../scripting/parser';
import { postProcessScripts, cleanUpScripts } from '../scripting/postprocess';
import { getParams } from '../params';
import Game from './Game';
import Scene from './Scene';
import { pure } from '../utils/decorators';

interface ActorFlags {
    hasCollisions: boolean;
    hasCollisionBricks: boolean;
    hasCollisionBricksLow: boolean;
    hasSpriteAnim3D: boolean;
    isVisible: boolean;
    isSprite: boolean;
    canFall: boolean;
    noShadow: boolean;
}

export interface ActorProps {
    index: number;
    sceneIndex: number;
    pos: [number, number, number];
    life: number;
    flags: ActorFlags;
    entityIndex: number;
    bodyIndex: number;
    animIndex: number;
    dirMode: number;
    angle: number;
    speed: number;
    spriteIndex: number;
    spriteAnim3DNumber: number;
    lifeScriptSize: number;
    lifeScript: DataView;
    moveScriptSize: number;
    moveScript: DataView;
    textColor: string;
    prevEntityIndex?: number;
    prevAnimIndex?: number;
    prevAngle?: number;
    followActor?: number;
}

interface ActorPhysics {
    position: THREE.Vector3;
    orientation: THREE.Quaternion;
    temp: {
        position: THREE.Vector3;
        destination: THREE.Vector3;
        angle: number;
        destAngle: number;
    };
}

export interface ActorState {
    isVisible: boolean;
    isDead: boolean;
    isFalling: boolean;
    hasGravityByAnim: boolean;
    isJumping: boolean;
    isWalking: boolean;
    isTurning: boolean;
    isFighting: boolean;
    isHit: boolean;
    wasHitBy: number;
    hasSeenHit: boolean;
    repeatHit: number;
    isSwitchingHit: boolean;
    isCrouching: boolean;
    isClimbing: boolean;
    isColliding: boolean;
    isDrowning: boolean;
    isDrowningLava: boolean;
    isDrowningStars: boolean;
    isTouchingGround: boolean;
    isTouchingFloor: boolean;
    isUsingProtoOrJetpack: boolean;
    isSearching: boolean;
    isToppingOutUp: boolean;
    noInterpolateNext: boolean;
    distFromGround: number;
    distFromFloor: number;
    fallDistance: number;
    hasCollidedWithActor: number;
    floorSound: number;
    nextAnim: number;
}

interface ActorScripts {
    life: any;
    move: any;
}

interface NewActorDetails {
    position: THREE.Vector3;
    props: {
        entityIndex: number;
        bodyIndex: number;
        animIndex: number;
    };
}

export const ActorDirMode = {
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

export default class Actor {
    readonly type: string = 'actor';
    readonly index: number;
    readonly props: ActorProps;
    readonly state: ActorState;
    private readonly game: Game;
    private readonly scene: Scene;
    animState: any = null;
    threeObject?: THREE.Object3D = null;
    model?: Model = null;
    sprite?: any = null;
    physics: ActorPhysics = null;
    scripts: ActorScripts;
    // Those properties are used by the editor.
    // We should move them somewhere else.
    label?: any;
    refreshLabel?: Function;

    static async load(
        game: Game,
        scene: Scene,
        props: ActorProps,
    ): Promise<Actor> {
        const actor = new Actor(game, scene, props);
        if (actor.animState) {
            await actor.loadMesh();
        }
        return actor;
    }

    // This function is used for creating new
    // actors at runtime (ex: in the editor)
    static async create(
        game: Game,
        scene: Scene,
        details: NewActorDetails
    ): Promise<Actor> {
        const props = createNewActorProps(scene, details);
        const actor = await Actor.load(game, scene, props);
        // This is usually called in 3 phases on all actors
        // at scene load time. See loadScripts() function.
        postProcessScripts(scene, actor);
        cleanUpScripts(actor);
        compileScripts(game, scene, actor);
        return actor;
    }

    private constructor(
        game: Game,
        scene: Scene,
        props: ActorProps
    ) {
        this.index = props.index;
        this.game = game;
        this.scene = scene;
        this.props = cloneDeep(props);
        this.physics = initPhysics(props);
        this.state = Actor.createState();
        this.state.isVisible = props.flags.isVisible
            && (props.life > 0 || props.bodyIndex >= 0)
            && props.index !== 1; // 1 is always Nitro-mecapingouin
        this.scripts = {
            life: parseScript(props.index, 'life', props.lifeScript),
            move: parseScript(props.index, 'move', props.moveScript)
        };
        const skipModel = scene.isSideScene && this.index === 0;
        if (!skipModel) {
            this.animState = loadAnimState();
        }
    }

    runScripts(time) {
        if (this.scripts) {
            const params = getParams();
            runScript(params, this.scripts.life, time);
            runScript(params, this.scripts.move, time);
        }
    }

    reset(scene) {
        this.resetAnimState();
        this.resetPhysics();
        compileScripts(this.game, scene, this);
        this.state.isDead = false;
        this.state.floorSound = -1;
    }

    resetAnimState() {
        resetAnimState(this.animState);
    }

    resetPhysics() {
        this.physics = initPhysics(this.props);
    }

    goto(position: THREE.Vector3) {
        this.physics.temp.destination = position;
        let destAngle = angleTo(this.physics.position, position);
        if (destAngle < 0) {
            destAngle += Math.PI * 2;
        }
        this.physics.temp.destAngle = destAngle;
        this.state.isWalking = true;
        this.state.isTurning = true;
        return this.getDistance(position);
    }

    gotoSprite(position: THREE.Vector3, delta: number) {
        this.physics.position.lerp(position, delta);
        this.threeObject.position.copy(this.physics.position);
        return this.getDistance(position);
    }

    facePoint(position: THREE.Vector3) {
        let destAngle = angleTo(this.physics.position, position);
        if (destAngle < 0) {
            destAngle += Math.PI * 2;
        }
        this.physics.temp.destAngle = destAngle;
        this.state.isTurning = true;
    }

    setAngle(angle) {
        this.state.isTurning = true;
        this.props.angle = angle;
        this.physics.temp.destAngle = angleToRad(angle);
    }

    setAngleRad(angle) {
        this.state.isTurning = true;
        this.props.angle = angle;
        this.physics.temp.destAngle = angle;
    }

    @pure()
    getDistance(pos) {
        return distance2D(this.physics.position, pos);
    }

    @pure()
    getDistanceLba(pos) {
        return getDistanceLba(this.getDistance(pos));
    }

    stop() {
        this.state.isWalking = false;
        this.state.isTurning = false;
        this.physics.temp.destAngle = this.physics.temp.angle;
        delete this.physics.temp.destination;
    }

    async loadMesh() {
        const params = getParams();
        const name = getObjectName('actor',
                        this.props.sceneIndex,
                        this.props.index);
        // only if not sprite actor
        if (!this.props.flags.isSprite && this.props.bodyIndex !== 0xFF) {
            const {entityIndex, bodyIndex, animIndex} = this.props;
            const model = await loadModel(
                entityIndex,
                bodyIndex,
                animIndex,
                this.animState,
                this.scene.scenery.props.envInfo,
                this.scene.props.ambience
            );
            if (model !== null) {
                // model.mesh.visible = actor.isVisible;
                model.mesh.position.copy(this.physics.position);
                model.mesh.quaternion.copy(this.physics.orientation);
                this.model = model;
                this.threeObject = model.mesh;
                if (this.threeObject) {
                    this.threeObject.name = `actor:${name}`;
                    if (this.props.index === 0 && this.game.controlsState.firstPerson) {
                        this.threeObject.visible = false;
                    } else {
                        this.threeObject.visible = this.state.isVisible;
                    }
                }
            }
        } else {
            this.threeObject = new THREE.Object3D();
            this.threeObject.name = `actor:${name}`;
            this.threeObject.visible = this.state.isVisible;
            this.threeObject.position.copy(this.physics.position);
            this.threeObject.quaternion.copy(this.physics.orientation);
            if (this.props.flags.isSprite) {
                this.state.hasGravityByAnim = true;
                const {spriteIndex, flags: { hasSpriteAnim3D } } = this.props;
                const sprite = await loadSprite(
                    spriteIndex,
                    hasSpriteAnim3D,
                    false,
                    false
                );
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
            createActorLabel(this, name, this.scene.is3DCam);
        }
    }

    setBody(scene, index) {
        if (this.props.bodyIndex === index) {
            return;
        }
        this.props.bodyIndex = index;
        this.reloadModel(scene);
    }

    setAnim(index) {
        if (this.props.animIndex === index) {
            return;
        }
        this.props.animIndex = index;
        this.resetAnimState();
    }

    cancelAnims() {
        // TODO(scottwilliams): There are likely other cases where we should
        // also not cancel the animations e.g. when Twinsen is crawling. Add
        // them here when we've implemented them.
        if (this.state.isDrowning) {
            return;
        }
        this.setAnim(0);
        this.state.isJumping = false;
        this.state.isWalking = false;
        this.state.isFalling = false;
        this.state.isClimbing = false;
    }

    setAnimWithCallback(index, callback) {
        if (this.props.animIndex === index) {
            return;
        }
        this.props.animIndex = index;
        this.resetAnimState();
        this.animState.callback = callback;
    }

    reloadModel(scene: Scene) {
        const oldObject = this.threeObject;
        this.loadMesh().then(() => {
            scene.addMesh(this.threeObject);
            scene.removeMesh(oldObject);
            this.threeObject.updateMatrixWorld();
        });
    }

    hit(hitBy, hitStrength) {
        // Ensure we don't repeatedly play the hit animation.
        if (this.state.isHit &&
            this.props.animIndex === AnimType.HIT) {
            return;
        }

        let life = -1;
        // TODO(scottwilliams): This doesn't take into account actor armour.
        if (this.index === 0) {
            this.game.getState().hero.life -= hitStrength;
            life = this.game.getState().hero.life;
        } else {
            this.props.life -= hitStrength;
            life = this.props.life;
        }

        if (life <= 0) {
            // TODO(scottwilliams): This doesn't do the right thing for
            // Twinsen yet.
            this.props.life = 0;
            this.state.isDead = true;
            this.state.isVisible = false;
            if (this.threeObject) {
                this.threeObject.visible = false;
            }
            return;
        }

        const currentAnim = this.props.animIndex;
        this.setAnimWithCallback(AnimType.HIT, () => {
            if (this.index !== 0 && this.props.animIndex === AnimType.HIT) {
                this.state.nextAnim = currentAnim;
            }
            this.state.isHit = false;
            this.state.wasHitBy = hitBy;
        });
        this.animState.noInterpolate = true;
        this.state.isHit = true;
    }

    private static createState(): ActorState {
        return {
            isVisible: false,
            isDead: false,
            isFalling: false,
            hasGravityByAnim: false,
            isJumping: false,
            isWalking: false,
            isTurning: false,
            isFighting: false,
            isHit: false,
            wasHitBy: -1,
            hasSeenHit: false,
            repeatHit: 0,
            isSwitchingHit: false,
            isCrouching: false,
            isClimbing: false,
            isColliding: false,
            isDrowning: false,
            isDrowningLava: false,
            isDrowningStars: false,
            isTouchingGround: false,
            isTouchingFloor: false,
            isUsingProtoOrJetpack: false,
            isSearching: false,
            isToppingOutUp: false,
            noInterpolateNext: false,
            distFromFloor: 0,
            distFromGround: 0,
            fallDistance: 0,
            hasCollidedWithActor: -1,
            floorSound: -1,
            nextAnim: null,
        };
    }
}

function initPhysics({pos, angle}) {
    const angleRad = angleToRad(angle);
    const euler = new THREE.Euler(0, angleRad, 0, 'XZY');
    const orientation = new THREE.Quaternion();
    orientation.setFromEuler(euler);
    return {
        position: new THREE.Vector3(pos[0], pos[1], pos[2]),
        orientation,
        temp: {
            destination: new THREE.Vector3(0, 0, 0),
            position: new THREE.Vector3(0, 0, 0),
            angle: angleRad,
            destAngle: angleRad,
        }
    };
}

export function createNewActorProps(
    scene: Scene,
    details: NewActorDetails
): ActorProps {
    return {
        ...details.props,
        sceneIndex: scene.index,
        index: scene.actors.length,
        pos: details.position.toArray() as any,
        life: 255,
        flags: {
            hasCollisions: true,
            hasCollisionBricks: true,
            hasCollisionBricksLow: true,
            hasSpriteAnim3D: false,
            canFall: true,
            isVisible: true,
            isSprite: false,
            noShadow: false
        },
        dirMode: ActorDirMode.NO_MOVE,
        angle: 0,
        speed: 35,
        spriteIndex: 0,
        spriteAnim3DNumber: -1,
        lifeScriptSize: 1,
        lifeScript: new DataView(new ArrayBuffer(1)),
        moveScriptSize: 1,
        moveScript: new DataView(new ArrayBuffer(1)),
        textColor: 'white'
    };
}
