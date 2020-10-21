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
    hasSpriteAnim3D: boolean;
    isVisible: boolean;
    isSprite: boolean;
    canFall: boolean;
}

interface ActorProps {
    index: number;
    sceneIndex: number;
    pos: [number, number, number];
    life: number;
    flags: ActorFlags;
    entityIndex: number;
    bodyIndex: number;
    animIndex: number;
    angle: number;
    speed: number;
    spriteIndex: number;
    spriteAnim3DNumber: number;
    lifeScriptSize: number;
    lifeScript: DataView;
    moveScriptSize: number;
    moveScript: DataView;
}

interface ActorOptions {
    isSideScene: boolean;
    has3DCam: boolean;
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

interface ActorState {
    waitHitFrame: boolean;
    isHitting: boolean;
    hasAnimEnded: boolean;
    hasNewFrame: boolean;
    wasDrawn: boolean;
    isDead: boolean;
    isSpriteMoving: boolean;
    hasRotationByAnim: boolean;
    isFalling: boolean;
    isSuperHitting: boolean;
    hasFrameShield: boolean;
    canDrawShadow: boolean;
    hasGravityByAnim: boolean;
    isSkating: boolean;
    canThrowProjectile: boolean;
    canLeftJump: boolean;
    canRightJump: boolean;
    waitSuperHit: boolean;
    hasRotationByTrack: boolean;
    canFlyJetPack: boolean;
    unknown20: boolean;
    hasManualFrame: boolean;
    waitPosition: boolean;
    forceFalling: boolean;
    // not from original from this point
    isJumping: boolean;
    isWalking: boolean;
    isTurning: boolean;
    isFighting: boolean;
    isHit: boolean;
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

export default class Actor {
    readonly type: 'actor';
    readonly index: number;
    readonly props: ActorProps;
    readonly state: ActorState;
    readonly isSprite: boolean;
    readonly animState: any = null;
    private readonly game: Game;
    private readonly scene: Scene;
    private readonly options: ActorOptions;
    threeObject?: THREE.Object3D = null;
    model?: Model = null;
    sprite?: any = null;
    physics: ActorPhysics = null;
    isVisible: boolean = false;
    hasCollidedWithActor: number = -1;
    floorSound: number = -1;
    nextAnim: number = null;
    scripts: ActorScripts;
    wasHitBy: number = -1;

    static async load(
        game: Game,
        scene: Scene,
        props: ActorProps,
        options: ActorOptions
    ): Promise<Actor> {
        const actor = new Actor(game, scene, props, options);
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
        const options: ActorOptions = {
            isSideScene: !scene.isActive,
            has3DCam: scene.is3DCam
        };
        const props = createNewActorProps(scene, details);
        const actor = await Actor.load(game, scene, props, options);
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
        props: ActorProps,
        options: ActorOptions
    ) {
        this.index = props.index;
        this.game = game;
        this.scene = scene;
        this.options = options;
        this.props = cloneDeep(props);
        this.physics = initPhysics(props);
        this.state = Actor.createState();
        this.isVisible = props.flags.isVisible
            && (props.life > 0 || props.bodyIndex >= 0)
            && props.index !== 1; // 1 is always Nitro-mecapingouin
        this.isSprite = props.flags.isSprite;
        this.scripts = {
            life: parseScript(props.index, 'life', props.lifeScript),
            move: parseScript(props.index, 'move', props.moveScript)
        };
        const skipModel = options.isSideScene && this.index === 0;
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
        this.floorSound = -1;
    }

    resetAnimState() {
        resetAnimState(this.animState);
    }

    resetPhysics() {
        this.physics = initPhysics(this.props);
    }

    goto(point) {
        this.physics.temp.destination = point;
        let destAngle = angleTo(this.physics.position, point);
        if (destAngle < 0) {
            destAngle += Math.PI * 2;
        }
        this.physics.temp.destAngle = destAngle;
        this.state.isWalking = true;
        this.state.isTurning = true;
        return this.getDistance(point);
    }

    gotoSprite(point, delta) {
        this.physics.position.lerp(point, delta);
        this.threeObject.position.copy(this.physics.position);
        return this.getDistance(point);
    }

    facePoint(point) {
        let destAngle = angleTo(this.physics.position, point);
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
        if (!this.isSprite && this.props.bodyIndex !== 0xFF) {
            const {entityIndex, bodyIndex, animIndex} = this.props;
            const model = await loadModel(
                entityIndex,
                bodyIndex,
                animIndex,
                this.animState,
                this.scene.scenery.props.envInfo,
                this.scene.data.ambience
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
            createActorLabel(this, name, this.options.has3DCam);
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

    reloadModel(scene) {
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
            this.isVisible = false;
            if (this.threeObject) {
                this.threeObject.visible = false;
            }
            return;
        }

        const currentAnim = this.props.animIndex;
        this.setAnimWithCallback(AnimType.HIT, () => {
            if (this.index !== 0 && this.props.animIndex === AnimType.HIT) {
                this.nextAnim = currentAnim;
            }
            this.state.isHit = false;
            this.wasHitBy = hitBy;
        });
        this.animState.noInterpolate = true;
        this.state.isHit = true;
    }

    private static createState(): ActorState {
        return {
            waitHitFrame: false,
            isHitting: false,
            hasAnimEnded: false,
            hasNewFrame: false,
            wasDrawn: false,
            isDead: false,
            isSpriteMoving: false,
            hasRotationByAnim: false,
            isFalling: false,
            isSuperHitting: false,
            hasFrameShield: false,
            canDrawShadow: false,
            hasGravityByAnim: false,
            isSkating: false,
            canThrowProjectile: false,
            canLeftJump: false,
            canRightJump: false,
            waitSuperHit: false,
            hasRotationByTrack: false,
            canFlyJetPack: false,
            unknown20: false,
            hasManualFrame: false,
            waitPosition: false,
            forceFalling: false,
            // not from original from this point
            isJumping: false,
            isWalking: false,
            isTurning: false,
            isFighting: false,
            isHit: false,
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
            hasSpriteAnim3D: false,
            canFall: true,
            isVisible: true,
            isSprite: false,
        },
        angle: 0,
        speed: 35,
        spriteIndex: 0,
        spriteAnim3DNumber: -1,
        lifeScriptSize: 1,
        lifeScript: new DataView(new ArrayBuffer(1)),
        moveScriptSize: 1,
        moveScript: new DataView(new ArrayBuffer(1)),
    };
}
