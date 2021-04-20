import * as THREE from 'three';
import { clone } from 'lodash';
import Actor, { ActorDirMode } from '../Actor';
import { AnimType } from '../data/animType';
import { SampleType } from '../data/sampleType';
import { LBA2GameFlags } from '../data/gameFlags';
import { GetInventoryItems } from '../data/inventory';
import { setMagicBallLevel } from '../GameState';
import { unimplemented } from './utils';
import { WORLD_SCALE, getRandom } from '../../utils/lba';
import { getVideoPath } from '../../resources';
import { ScriptContext } from './ScriptContext';
import { getParams } from '../../params';
import { initWagonState } from '../gameplay/wagon';

export const PALETTE = unimplemented();

export function BODY_OBJ(this: ScriptContext, actor, bodyIndex) {
    if (bodyIndex === -1) {
        return;
    }
    actor.isVisible = true;
    actor.setBody(this.scene, bodyIndex);
}

export function ANIM_OBJ(this: ScriptContext, actor, animIndex) {
    if (animIndex === -1) {
        return;
    }
    actor.setAnim(animIndex);
    actor.animState.interpolationFrame = 0;
}

export const SET_CAMERA = unimplemented();

export const CAMERA_CENTER = unimplemented();

export function MESSAGE(this: ScriptContext, cmdState, id) {
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
}

export function MESSAGE_OBJ(this: ScriptContext, cmdState, actor, id, sayMessage: boolean = false) {
    // If someone else is already talking, we wait for them to finish first.
    if (this.game.getState().actorTalking > -1 &&
        this.game.getState().actorTalking !== actor.index) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
        return;
    }

    const hero = this.scene.actors[0];
    const text = this.scene.props.texts[id];
    if (!cmdState.skipListener) {
        let onVoiceEndedCallback = null;
        if (this.scene.vr) {
            onVoiceEndedCallback = () => {
                cmdState.ended = true;
            };
        }
        actor.playVoice(text.index, this.scene.props.textBankId, onVoiceEndedCallback);
        if (sayMessage || text.type === 9) {
            if (!actor.threeObject || actor.threeObject.visible === false) {
                return;
            }
            const itrjId = `actor_${actor.index}_${id}`;
            const interjections = clone(this.game.getUiState().interjections);
            interjections[itrjId] = {
                scene: this.scene.index,
                obj: actor,
                color: actor.props.textColor,
                value: text.value,
            };
            this.game.setUiState({interjections});
            cmdState.skipListener = function skipListener() { };
            setTimeout(() => {
                const interjectionsCopy = clone(this.game.getUiState().interjections);
                delete interjectionsCopy[itrjId];
                this.game.setUiState({interjections: interjectionsCopy});

                actor.stopVoice();
                this.game.getState().actorTalking = -1;
                delete cmdState.skipListener;
                delete cmdState.ended;
                if (cmdState.startTime) {
                    delete cmdState.startTime;
                }
            }, 4500);
        } else {
            const isLBA1 = getParams().game === 'lba1';
            hero.props.dirMode = ActorDirMode.NO_MOVE;
            hero.props.prevEntityIndex = hero.props.entityIndex;
            hero.props.prevAnimIndex = hero.props.animIndex;
            hero.props.entityIndex = 0;
            this.game.getState().actorTalking = actor.index;
            if (!isLBA1 && actor.index === 0)
                hero.props.animIndex = AnimType.TALK;
            else
                hero.props.animIndex = AnimType.NONE;
            if (!this.scene.vr) {
                this.game.setUiState({
                    text: {
                        type: text.type === 3 ? 'big' : 'small',
                        value: text.value,
                        color: actor.props.textColor
                    }
                });
            }
        }

        const that = this;
        cmdState.skipListener = function skipListener() {
            const skip = that.game.getUiState().skip;
            if (skip || that.scene.vr) {
                cmdState.ended = true;
            } else {
                that.game.setUiState({
                    skip: true
                });
            }
        };
        if (text.type !== 9) {
            this.game.controlsState.skipListener = cmdState.skipListener;
        }
    }

    if (cmdState.ended) {
        actor.stopVoice();
        this.game.getState().actorTalking = -1;
        if (text.type !== 9) {
            this.game.setUiState({ text: null, skip: false, });
            this.game.controlsState.skipListener = null;
            hero.props.dirMode = ActorDirMode.MANUAL;
        }
        delete cmdState.skipListener;
        delete cmdState.ended;
        if (cmdState.startTime) {
            delete cmdState.startTime;
        }
        return;
    }

    // We want to immediately continue executing the rest of the script for the
    // floating text since it doesn't require any interaction from the user.
    // Only re-enter for other text types.
    if (text.type !== 9) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function CAN_FALL(this: ScriptContext, flag) {
    this.actor.props.flags.canFall = (flag & 1) === 1;
}

export function SET_DIRMODE(this: ScriptContext, dirMode) {
    SET_DIRMODE_OBJ.call(this, this.actor, dirMode);
}

export function SET_DIRMODE_OBJ(this: ScriptContext, actor: Actor, dirMode) {
    actor.props.dirMode = dirMode;
    if (dirMode === ActorDirMode.MANUAL) {
        actor.state.isTurning = false;
    }
    if (dirMode === ActorDirMode.WAGON) {
        actor.wagonState = initWagonState(actor.physics.temp.angle);
    }
}

export function CAM_FOLLOW(this: ScriptContext, actor) {
    if (this.scene.camera.setActor) {
        this.scene.camera.setActor(actor.index);
    }
}

export function SET_HERO_BEHAVIOUR(this: ScriptContext, value) {
    this.game.getState().hero.behaviour = value;
}

export function SET_VAR_CUBE(this: ScriptContext, index, value) {
    this.scene.variables[index] = value;
}

export function ADD_VAR_CUBE(this: ScriptContext, index, value) {
    this.scene.variables[index] += value;
}

export function SUB_VAR_CUBE(this: ScriptContext, index, value) {
    this.scene.variables[index] -= value;
}

export function SET_VAR_GAME(this: ScriptContext, index, value) {
    this.game.getState().flags.quest[index] = value;
}

export function ADD_VAR_GAME(this: ScriptContext, index, value) {
    this.game.getState().flags.quest[index] += value;
}

export function SUB_VAR_GAME(this: ScriptContext, index, value) {
    this.game.getState().flags.quest[index] -= value;
}

export function KILL_OBJ(this: ScriptContext, actor) {
    actor.props.life = 0;
    actor.state.isDead = true;
    actor.isVisible = false;
    if (actor.threeObject) {
        actor.threeObject.visible = false;
    }
}

export function SUICIDE(this: ScriptContext) {
    this.actor.props.life = 0;
    this.actor.state.isDead = true;
    this.actor.state.isVisible = false;
    if (this.actor.threeObject) {
        this.actor.threeObject.visible = false;
    }
    BRUTAL_EXIT.call(this);
}

export function USE_ONE_LITTLE_KEY(this: ScriptContext) {
    this.game.getState().hero.keys -= 1;
}

export function SUB_MONEY(this: ScriptContext, amount) {
    this.game.getState().hero.money -= amount;
    if (this.game.getState().hero.money > 999) {
        this.game.getState().hero.money = 999;
    }
}

export function INC_CHAPTER(this: ScriptContext) {
    this.game.getState().flags.quest[LBA2GameFlags.CHAPTER] += 1;
}

// FOUND_OBJECT_CALLBACKS allow us to execute arbitrary code when a specific item is found.
const FOUND_OBJECT_CALLBACKS = {
    [GetInventoryItems().MAGIC_BALL]: (game, _scene) => {
        if (game.getState().hero.equippedItemId === -1) {
            game.getState().hero.equippedItemId = 1;
        }
    },
    [GetInventoryItems().TUNIC]: (game, _scene) => {
        game.getState().hero.magic = 20;
    },
};

export function FOUND_OBJECT(this: ScriptContext, cmdState, id) {
    const hero = this.scene.actors[0];
    if (!cmdState.skipListener) {
        hero.props.dirMode = ActorDirMode.NO_MOVE;
        hero.props.prevEntityIndex = hero.props.entityIndex;
        hero.props.prevAnimIndex = hero.props.animIndex;
        hero.props.prevAngle = hero.physics.temp.angle;
        hero.props.entityIndex = 0;
        hero.props.animIndex = AnimType.FOUND_OBJECT;

        if (this.scene.props.isIsland) {
            hero.setAngleRad(hero.physics.temp.angle + Math.PI);
        } else {
            hero.setAngleRad(7 * Math.PI / 4);
        }

        this.game.getState().flags.quest[id] = 1;
        hero.playSample(SampleType.OBJECT_FOUND);

        if (FOUND_OBJECT_CALLBACKS[id]) {
            FOUND_OBJECT_CALLBACKS[id](this.game, this.scene);
        }

        const text = this.game.texts[id];
        this.game.setUiState({
            text: {
                type: text.type === 3 ? 'big' : 'small',
                value: text.value,
                color: hero.props.textColor
            },
            foundObject: id
        });
        const that = this;
        cmdState.skipListener = function skipListener() {
            const skip = that.game.getUiState().skip;
            if (skip || that.scene.vr) {
                cmdState.ended = true;
            } else {
                that.game.setUiState({
                    skip: true
                });
            }
        };
        this.game.controlsState.skipListener = cmdState.skipListener;
        if (text.type === 9) {
            setTimeout(() => {
                cmdState.skipListener();
            }, 6500);
        }
        hero.playVoice(text.index, -1);

        this.game.setUiState({foundObject: id});
    }
    if (cmdState.ended) {
        hero.stopVoice();
        this.game.setUiState({ skip: false, text: null, foundObject: null });
        this.game.controlsState.skipListener = null;
        hero.setAngleRad(hero.props.prevAngle);
        hero.props.dirMode = ActorDirMode.MANUAL;

        delete cmdState.skipListener;
        delete cmdState.ended;
        if (cmdState.startTime) {
            delete cmdState.startTime;
        }
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function SET_DOOR_LEFT(this: ScriptContext, dist) {
    const {pos} = this.actor.props;
    const l = (dist * WORLD_SCALE);
    this.actor.physics.position.set(pos[0], pos[1], pos[2] - l);
    this.actor.threeObject.position.set(pos[0], pos[1], pos[2] - l);
}

export function SET_DOOR_RIGHT(this: ScriptContext, dist) {
    const {pos} = this.actor.props;
    const l = (dist * WORLD_SCALE);
    this.actor.physics.position.set(pos[0], pos[1], pos[2] + l);
    this.actor.threeObject.position.set(pos[0], pos[1], pos[2] + l);
}

export function SET_DOOR_UP(this: ScriptContext, dist) {
    const {pos} = this.actor.props;
    const l = (dist * WORLD_SCALE);
    this.actor.physics.position.set(pos[0] + l, pos[1], pos[2]);
    this.actor.threeObject.position.set(pos[0] + l, pos[1], pos[2]);
}

export function SET_DOOR_DOWN(this: ScriptContext, dist) {
    const {pos} = this.actor.props;
    const l = (dist * WORLD_SCALE);
    this.actor.physics.position.set(pos[0] - l, pos[1], pos[2]);
    this.actor.threeObject.position.set(pos[0] - l, pos[1], pos[2]);
}

export const GIVE_BONUS = unimplemented();

export function CHANGE_CUBE(this: ScriptContext, index) {
    this.scene.goto(index, false, false, true, true);
}

export function OBJ_COL(this: ScriptContext, flag) {
    this.actor.props.flags.hasCollisions = (flag === 1);
}

export function BRICK_COL(this: ScriptContext, flag) {
    this.actor.props.flags.hasCollisionBricks = (flag >= 1);
    this.actor.props.flags.hasCollisionBricksLow = (flag === 2);
}

export function INVISIBLE(this: ScriptContext, hidden) {
    this.actor.state.isVisible = !hidden;
    if (this.actor.threeObject) {
        if (this.actor.index === 0 && this.game.controlsState.firstPerson) {
            this.actor.threeObject.visible = false;
        } else {
            this.actor.threeObject.visible = !hidden;
        }
    }
}

export const SHADOW_OBJ = unimplemented();

export function SET_MAGIC_LEVEL(this: ScriptContext, index) {
    setMagicBallLevel(this.game.getState(), index);
}

export function SUB_MAGIC_POINT(this: ScriptContext, points) {
    let magic = this.game.getState().hero.magic;
    magic -= points;
    this.game.getState().hero.magic = (magic > 0) ? magic : 0;
}

export function SET_LIFE_POINT_OBJ(this: ScriptContext, actor, value) {
    actor.props.life = value;
    if (actor.props.life > 0) {
        actor.state.isDead = false;
    }
}

export function SUB_LIFE_POINT_OBJ(this: ScriptContext, actor, value) {
    actor.props.life -= value;
    if (actor.props.life < 0) {
        actor.props.life = 0;
    }
}

export function HIT(this: ScriptContext, actor, strength) {
    actor.state.wasHitBy = this.actor.index;
    actor.props.life -= strength;
}

export function PLAY_VIDEO(this: ScriptContext, cmdState, video) {
    if (!cmdState.skipListener) {
        const that = this;
        this.game.pause();
        const onEnded = () => {
            that.game.setUiState({video: null, skip: false});
            cmdState.ended = true;
            that.game.resume();
        };
        this.game.setUiState({ skip: false,
            video: {
                path: getVideoPath(video),
                onEnded
            }});
        cmdState.skipListener = function skipListener() {
            onEnded();
        };
        this.game.controlsState.skipListener = cmdState.skipListener;
    }

    if (cmdState.ended) {
        delete cmdState.skipListener;
        delete cmdState.ended;
        this.game.controlsState.skipListener = null;
        if (cmdState.startTime) {
            delete cmdState.startTime;
        }
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export const ECLAIR = unimplemented();

export function INC_CLOVER_BOX(this: ScriptContext) {
    if (this.game.getState().hero.clover.boxes < 10) {
        this.game.getState().hero.clover.boxes += 1;
    }
}

export function SET_USED_INVENTORY(this: ScriptContext, item) {
    if (item < 40) {
        this.game.getState().flags.quest[item] = 1;
    }
}

export function ADD_CHOICE(this: ScriptContext, index) {
    this.state.choice = null;
    const text = this.scene.props.texts[index];
    const uiState = this.game.getUiState();
    uiState.ask.choices.push({ text, value: index, color: '#ffffff' });
    this.game.setUiState({ ask: uiState.ask });
}

export function ASK_CHOICE(this: ScriptContext, cmdState, index) {
    ASK_CHOICE_OBJ.call(this, cmdState, this.actor, index);
}

export function ASK_CHOICE_OBJ(this: ScriptContext, cmdState, actor, index) {
    const hero = this.scene.actors[0];
    if (!cmdState.skipListener) {
        const isLBA1 = getParams().game === 'lba1';
        const text = this.scene.props.texts[index];
        hero.props.dirMode = ActorDirMode.NO_MOVE;
        hero.props.prevEntityIndex = hero.props.entityIndex;
        hero.props.prevAnimIndex = hero.props.animIndex;
        hero.props.entityIndex = 0;
        if (!isLBA1 && actor.index === 0)
            hero.props.animIndex = AnimType.TALK;
        else
            hero.props.animIndex = AnimType.NONE;
        const uiState = this.game.getUiState();
        uiState.ask.text = {
            type: 'small',
            value: text.value,
            color: actor.props.textColor
        };
        this.game.setUiState({ ask: uiState.ask });
        cmdState.skipListener = () => {
            if (this.game.getUiState().choice !== null) {
                cmdState.ended = true;
            }
        };
        this.game.controlsState.skipListener = cmdState.skipListener;

        actor.playVoice(text.index, this.scene.props.textBankId);
    }
    if (cmdState.ended) {
        actor.stopVoice();
        const uiState = this.game.getUiState();
        this.state.choice = uiState.choice;
        this.game.setUiState({ ask: {choices: []}, choice: null });
        this.game.controlsState.skipListener = null;
        hero.props.dirMode = ActorDirMode.MANUAL;
        delete cmdState.skipListener;
        delete cmdState.ended;
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export const INIT_BUGGY = unimplemented();

export const MEMO_SLATE = unimplemented();

export const SET_HOLO_POS = unimplemented();

export const CLR_HOLO_POS = unimplemented();

export function ADD_FUEL(this: ScriptContext, fuel) {
    this.game.getState().hero.fuel += fuel;
    if (this.game.getState().hero.fuel > 100) {
        this.game.getState().hero.fuel = 100;
    }
}

export function SUB_FUEL(this: ScriptContext, fuel) {
    this.game.getState().hero.fuel -= fuel;
    if (this.game.getState().hero.fuel < 0) {
        this.game.getState().hero.fuel = 0;
    }
}

export const SET_GRM = unimplemented();

export const SET_CHANGE_CUBE = unimplemented();

export function MESSAGE_ZOE(this: ScriptContext, cmdState, id) {
    const colorHero = this.actor.props.textColor;
    this.actor.props.textColor = '#d76763'; // zoe text color
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
    this.actor.props.textColor = colorHero;
}

export function FULL_POINT(this: ScriptContext) {
    this.game.getState().hero.life = 50;
    this.game.getState().hero.magic = this.game.getState().hero.magicball.level * 20;
}

export const FADE_TO_PAL = unimplemented();

export const ACTION = unimplemented();

export const SET_FRAME = unimplemented();

export const SET_SPRITE = unimplemented();

export function SET_FRAME_3DS(this: ScriptContext) {

}

export const IMPACT_OBJ = unimplemented();

export const IMPACT_POINT = unimplemented();

export function ADD_MESSAGE(this: ScriptContext, cmdState, id) {
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
}

export const BALLOON = unimplemented();

export const NO_SHOCK = unimplemented();

export function CINEMA_MODE(this: ScriptContext, mode) {
    if (mode > 0) {
        this.actor.props.dirMode = ActorDirMode.NO_MOVE;
        this.game.setCinema(true);
    } else {
        this.actor.props.dirMode = ActorDirMode.MANUAL;
        this.game.setCinema(false);
    }
}

export const SAVE_HERO = unimplemented();

export const RESTORE_HERO = unimplemented();

export const ANIM_SET = unimplemented();

export const RAIN = unimplemented();

export function GAME_OVER(this: ScriptContext) {
    this.game.getState().hero.life = 0;
    this.game.getState().hero.clover.leafs = 0;
}

export function THE_END(this: ScriptContext) {
    this.game.getState().hero.life = 50;
    this.game.getState().hero.clover.leafs = 0;
    this.game.getState().hero.magic = 80;
}

export const ESCALATOR = unimplemented();

export function PLAY_MUSIC(this: ScriptContext, index) {
    const audio = this.game.getAudioManager();
    audio.stopMusic();
    audio.playMusic(index);
}

export const TRACK_TO_VAR_GAME = unimplemented();

export const VAR_GAME_TO_TRACK = unimplemented();

export const ANIM_TEXTURE = unimplemented();

export const ADD_MESSAGE_OBJ = unimplemented();

export function BRUTAL_EXIT(this: ScriptContext) {
    this.state.continue = false;
    this.state.terminated = true;
    this.moveState.terminated = true;
    this.actor.state.isDead = true;
    this.actor.state.isVisible = false;
}

export const REPLACE = unimplemented();

export const SCALE = unimplemented();

export const SET_ARMOR = unimplemented();

export const SET_ARMOR_OBJ = unimplemented();

export function ADD_LIFE_POINT_OBJ(this: ScriptContext, index, points) {
    const actor = this.scene.actors[index];
    if (actor) {
        actor.props.life += points;
        if (actor.props.life > 0) {
            actor.state.isDead = false;
        }
    }
}

export const STATE_INVENTORY = unimplemented();

export const SET_HIT_ZONE = unimplemented();

export function SAMPLE(this: ScriptContext, index) {
    this.actor.playSample(index);
}

export function SAMPLE_RND(this: ScriptContext, index) {
    const frequency = getRandom(0x800, 0x1000);
    this.actor.playSample(index, frequency);
}

export function SAMPLE_ALWAYS(this: ScriptContext, index) {
    this.actor.stopSample(index);
    this.actor.playSample(index, 0x1000, -1);
}

export function SAMPLE_STOP(this: ScriptContext, index) {
    this.actor.stopSample(index);
}

export function REPEAT_SAMPLE(this: ScriptContext, index, loopCount) {
    this.actor.playSample(index, 0x1000, loopCount - 1);
}

export const BACKGROUND = unimplemented();

export function SET_RAIL(this: ScriptContext, rail: number, value: number) {
    for (const zone of this.scene.zones) {
        if (zone.props.type === 9 && zone.props.snap === rail) {
            zone.props.info1 = value;
        }
    }
}

const EULER = new THREE.Euler();

export function INVERSE_BETA(this: ScriptContext) {
    let angle;
    if (this.actor.props.dirMode === ActorDirMode.WAGON) {
        const wagonState = this.actor.wagonState;
        wagonState.angle = (wagonState.angle + 2) % 4;
        angle = wagonState.angle * Math.PI * 0.5;
    } else {
        EULER.setFromQuaternion(this.actor.physics.orientation, 'XZY');
        angle = (EULER.y + Math.PI) % (Math.PI * 2);
    }
    this.actor.physics.temp.angle = angle;
    EULER.set(0, angle, 0, 'XZY');
    this.actor.physics.orientation.setFromEuler(EULER);
}

export function ADD_MONEY(this: ScriptContext, value) {
    this.game.getState().hero.money += value;
    if (this.game.getState().hero.money > 999) {
        this.game.getState().hero.money = 999;
    }
}

export const SPY = unimplemented();

export const DEBUG = unimplemented();

export const DEBUG_OBJ = unimplemented();

export const POPCORN = unimplemented();

export const FLOW_POINT = unimplemented();

export const FLOW_OBJ = unimplemented();

export const SET_ANIM_DIAL = unimplemented();

export const PCX = unimplemented();

export const END_MESSAGE = unimplemented();

export const END_MESSAGE_OBJ = unimplemented();

export const PARM_SAMPLE = unimplemented();

export function NEW_SAMPLE(this: ScriptContext, index, _, volume, frequency) {
    this.actor.playSample(index, frequency);
    this.actor.setSampleVolume(volume);
}

export const POS_OBJ_AROUND = unimplemented();

export const PCX_MESS_OBJ = unimplemented();

export const LABEL = unimplemented();

export const ZOOM = unimplemented();

export function BIG_MESSAGE(this: ScriptContext, cmdState, id) {
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
}

export const INIT_PINGOUIN = unimplemented();

export function SAY_MESSAGE(this: ScriptContext, cmdState, id) {
    MESSAGE_OBJ.call(this, cmdState, this.actor, id, true);
}

export function SAY_MESSAGE_OBJ(this: ScriptContext, cmdState, actor, id) {
    MESSAGE_OBJ.call(this, cmdState, actor, id, true);
}

export const GRM_OFF = unimplemented();

export const FADE_PAL_RED = unimplemented();

export const FADE_ALARM_RED = unimplemented();

export const FADE_ALARM_PAL = unimplemented();

export const FADE_RED_PAL = unimplemented();

export const FADE_RED_ALARM = unimplemented();

export const FADE_PAL_ALARM = unimplemented();

export const EXPLODE_OBJ = unimplemented();

export const BUBBLE_ON = unimplemented();

export const BUBBLE_OFF = unimplemented();

export const SET_DARK_PAL = unimplemented();

export const SET_NORMAL_PAL = unimplemented();

export const MESSAGE_SENDELL = unimplemented();

export const HOLOMAP_TRAJ = unimplemented();

export const MIDI_OFF = unimplemented();

export const PROJ_ISO = unimplemented();

export const PROJ_3D = unimplemented();

export function TEXT(this: ScriptContext, cmdState, id) {
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
}

export const CLEAR_TEXT = unimplemented();
