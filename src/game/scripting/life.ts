import { clone } from 'lodash';
import { DirMode } from '../../game/actors';
import { AnimType } from '../data/animType';
import { setMagicBallLevel } from '../../game/state';
import { unimplemented } from './utils';
import { WORLD_SCALE, getRandom } from '../../utils/lba';
import { getResourcePath } from '../../resources';

export const PALETTE = unimplemented();

export function BODY_OBJ(actor, bodyIndex) {
    actor.isVisible = true;
    actor.setBody(this.scene, bodyIndex);
}

export function ANIM_OBJ(actor, animIndex) {
    actor.setAnim(animIndex);
    actor.animState.interpolationFrame = 0;
}

export const SET_CAMERA = unimplemented();

export const CAMERA_CENTER = unimplemented();

export function MESSAGE(cmdState, id) {
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
}

export function MESSAGE_OBJ(cmdState, actor, id) {
    // If someone else is already talking, we wait for them to finish first.
    if (this.game.getState().actorTalking > -1 &&
        this.game.getState().actorTalking !== actor.index) {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
        return;
    }

    const audio = this.game.getAudioManager();
    const hero = this.scene.actors[0];
    const text = this.scene.data.texts[id];
    if (!cmdState.skipListener) {
        let onVoiceEndedCallback = null;
        if (this.scene.vr) {
            onVoiceEndedCallback = () => {
                cmdState.ended = true;
            };
        }
        audio.playVoice(text.index, this.scene.data.textBankId, onVoiceEndedCallback);
        if (text.type === 9) {
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

                audio.stopVoice();
                this.game.getState().actorTalking = -1;
                delete cmdState.skipListener;
                delete cmdState.ended;
                if (cmdState.startTime) {
                    delete cmdState.startTime;
                }
            }, 4500);
        } else {
            hero.props.dirMode = DirMode.NO_MOVE;
            hero.props.prevEntityIndex = hero.props.entityIndex;
            hero.props.prevAnimIndex = hero.props.animIndex;
            hero.props.entityIndex = 0;
            this.game.getState().actorTalking = actor.index;
            if (actor.index === 0)
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
        audio.stopVoice();
        this.game.getState().actorTalking = -1;
        if (text.type !== 9) {
            this.game.setUiState({ text: null, skip: false, });
            this.game.controlsState.skipListener = null;
            hero.props.dirMode = DirMode.MANUAL;
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

export function CAN_FALL(flag) {
    this.actor.props.flags.canFall = (flag & 1) === 1;
}

export function SET_DIRMODE(dirMode) {
    SET_DIRMODE_OBJ(this.actor, dirMode);
}

export function SET_DIRMODE_OBJ(actor, dirMode) {
    actor.props.dirMode = dirMode;
    if (dirMode === DirMode.MANUAL) {
        actor.props.runtimeFlags.isTurning = false;
    }
}

export const CAM_FOLLOW = unimplemented();

export function SET_HERO_BEHAVIOUR(value) {
    this.game.getState().hero.behaviour = value;
}

export function SET_VAR_CUBE(index, value) {
    this.scene.variables[index] = value;
}

export function ADD_VAR_CUBE(index, value) {
    this.scene.variables[index] += value;
}

export function SUB_VAR_CUBE(index, value) {
    this.scene.variables[index] -= value;
}

export function SET_VAR_GAME(index, value) {
    this.game.getState().flags.quest[index] = value;
}

export function ADD_VAR_GAME(index, value) {
    this.game.getState().flags.quest[index] += value;
}

export function SUB_VAR_GAME(index, value) {
    this.game.getState().flags.quest[index] -= value;
}

export function KILL_OBJ(actor) {
    actor.isKilled = true;
    actor.isVisible = false;
    if (actor.threeObject) {
        actor.threeObject.visible = false;
    }
}

export function SUICIDE() {
    this.actor.isVisible = false;
    if (this.actor.threeObject) {
        this.actor.threeObject.visible = false;
    }
    BRUTAL_EXIT.call(this);
}

export function USE_ONE_LITTLE_KEY() {
    this.game.getState().hero.keys -= 1;
}

export function SUB_MONEY(amount) {
    this.game.getState().hero.money -= amount;
    if (this.game.getState().hero.money > 999) {
        this.game.getState().hero.money = 999;
    }
}

export function INC_CHAPTER() {
    this.game.getState().chapter += 1;
}

export function FOUND_OBJECT(cmdState, id) {
    const audio = this.game.getAudioManager();
    const hero = this.scene.actors[0];
    if (!cmdState.skipListener) {
        hero.props.dirMode = DirMode.NO_MOVE;
        hero.props.prevEntityIndex = hero.props.entityIndex;
        hero.props.prevAnimIndex = hero.props.animIndex;
        hero.props.entityIndex = 0;
        hero.props.animIndex = AnimType.NONE;
        this.game.getState().flags.quest[id] = 1;
        audio.playSample(6);
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
        audio.playVoice(text.index, -1);

        this.game.setUiState({foundObject: id});
    }
    if (cmdState.ended) {
        audio.stopVoice();
        this.game.setUiState({ skip: false, text: null, foundObject: null });
        this.game.controlsState.skipListener = null;
        hero.props.dirMode = DirMode.MANUAL;

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

export function SET_DOOR_LEFT(dist) {
    const {pos} = this.actor.props;
    const l = (dist * WORLD_SCALE);
    this.actor.physics.position.set(pos[0], pos[1], pos[2] - l);
    this.actor.threeObject.position.set(pos[0], pos[1], pos[2] - l);
}

export function SET_DOOR_RIGHT(dist) {
    const {pos} = this.actor.props;
    const l = (dist * WORLD_SCALE);
    this.actor.physics.position.set(pos[0], pos[1], pos[2] + l);
    this.actor.threeObject.position.set(pos[0], pos[1], pos[2] + l);
}

export function SET_DOOR_UP(dist) {
    const {pos} = this.actor.props;
    const l = (dist * WORLD_SCALE);
    this.actor.physics.position.set(pos[0] + l, pos[1], pos[2]);
    this.actor.threeObject.position.set(pos[0] + l, pos[1], pos[2]);
}

export function SET_DOOR_DOWN(dist) {
    const {pos} = this.actor.props;
    const l = (dist * WORLD_SCALE);
    this.actor.physics.position.set(pos[0] - l, pos[1], pos[2]);
    this.actor.threeObject.position.set(pos[0] - l, pos[1], pos[2]);
}

export const GIVE_BONUS = unimplemented();

export function CHANGE_CUBE(index) {
    this.scene.goto(index);
}

export function OBJ_COL(flag) {
    this.actor.props.flags.hasCollisions = (flag === 1);
}

export function BRICK_COL(flag) {
    this.actor.props.flags.hasCollisionBricks = (flag >= 1);
    this.actor.props.flags.hasCollisionBricksLow = (flag === 2);
}

export function INVISIBLE(hidden) {
    this.actor.isVisible = !hidden;
    if (this.actor.threeObject) {
        if (this.actor.index === 0 && this.game.controlsState.firstPerson) {
            this.actor.threeObject.visible = false;
        } else {
            this.actor.threeObject.visible = !hidden;
        }
    }
}

export const SHADOW_OBJ = unimplemented();

export function SET_MAGIC_LEVEL(index) {
    const magicball = setMagicBallLevel(index);
    this.game.getState().hero.magicball = magicball;
    this.game.getState().hero.magic = magicball.level * 20;
}

export function SUB_MAGIC_POINT(points) {
    let magic = this.game.getState().hero.magic;
    magic -= points;
    this.game.getState().hero.magic = (magic > 0) ? magic : 0;
}

export function SET_LIFE_POINT_OBJ(actor, value) {
    actor.props.life = value;
}

export function SUB_LIFE_POINT_OBJ(actor, value) {
    actor.props.life -= value;
    if (actor.props.life < 0) {
        actor.props.life = 0;
    }
}

export function HIT(actor, strength) {
    actor.wasHitBy = this.actor.index;
    actor.props.life -= strength;
}

export function PLAY_VIDEO(cmdState, video) {
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
                path: getResourcePath(`VIDEO_${video}`),
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

export function INC_CLOVER_BOX() {
    if (this.game.getState().hero.clover.boxes < 10) {
        this.game.getState().hero.clover.boxes += 1;
    }
}

export function SET_USED_INVENTORY(item) {
    if (item < 40) {
        this.game.getState().flags.quest[item] = 1;
    }
}

export function ADD_CHOICE(index) {
    this.state.choice = null;
    const text = this.scene.data.texts[index];
    const uiState = this.game.getUiState();
    uiState.ask.choices.push({ text, value: index, color: '#ffffff' });
    this.game.setUiState({ ask: uiState.ask });
}

export function ASK_CHOICE(cmdState, index) {
    ASK_CHOICE_OBJ.call(this, cmdState, this.actor, index);
}

export function ASK_CHOICE_OBJ(cmdState, actor, index) {
    const audio = this.game.getAudioManager();
    const hero = this.scene.actors[0];
    if (!cmdState.skipListener) {
        const text = this.scene.data.texts[index];
        hero.props.dirMode = DirMode.NO_MOVE;
        hero.props.prevEntityIndex = hero.props.entityIndex;
        hero.props.prevAnimIndex = hero.props.animIndex;
        hero.props.entityIndex = 0;
        if (actor.index === 0)
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

        audio.playVoice(text.index, this.scene.data.textBankId);
    }
    if (cmdState.ended) {
        audio.stopVoice();
        const uiState = this.game.getUiState();
        this.state.choice = uiState.choice;
        this.game.setUiState({ ask: {choices: []}, choice: null });
        this.game.controlsState.skipListener = null;
        hero.props.dirMode = DirMode.MANUAL;
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

export function ADD_FUEL(fuel) {
    this.game.getState().hero.fuel += fuel;
    if (this.game.getState().hero.fuel > 100) {
        this.game.getState().hero.fuel = 100;
    }
}

export function SUB_FUEL(fuel) {
    this.game.getState().hero.fuel -= fuel;
    if (this.game.getState().hero.fuel < 0) {
        this.game.getState().hero.fuel = 0;
    }
}

export const SET_GRM = unimplemented();

export const SET_CHANGE_CUBE = unimplemented();

export function MESSAGE_ZOE(cmdState, id) {
    const colorHero = this.actor.props.textColor;
    this.actor.props.textColor = '#d76763'; // zoe text color
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
    this.actor.props.textColor = colorHero;
}

export function FULL_POINT() {
    this.game.getState().hero.life = 50;
    this.game.getState().hero.magic = this.game.getState().hero.magicball.level * 20;
}

export const FADE_TO_PAL = unimplemented();

export const ACTION = unimplemented();

export const SET_FRAME = unimplemented();

export const SET_SPRITE = unimplemented();

export function SET_FRAME_3DS() {

}

export const IMPACT_OBJ = unimplemented();

export const IMPACT_POINT = unimplemented();

export function ADD_MESSAGE(cmdState, id) {
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
}

export const BALLOON = unimplemented();

export const NO_SHOCK = unimplemented();

export function CINEMA_MODE(mode) {
    if (mode === 1) {
        this.actor.props.dirMode = DirMode.NO_MOVE;
        this.game.setUiState({ cinema: true });
    } else {
        this.actor.props.dirMode = DirMode.MANUAL;
        this.game.setUiState({ cinema: false });
    }
}

export const SAVE_HERO = unimplemented();

export const RESTORE_HERO = unimplemented();

export const ANIM_SET = unimplemented();

export const RAIN = unimplemented();

export function GAME_OVER() {
    this.game.getState().hero.life = 0;
    this.game.getState().hero.clover.leafs = 0;
}

export function THE_END() {
    this.game.getState().hero.life = 50;
    this.game.getState().hero.clover.leafs = 0;
    this.game.getState().hero.magic = 80;
}

export const ESCALATOR = unimplemented();

export function PLAY_MUSIC(index) {
    const musicSource = this.game.getAudioManager().getMusicSource();
    musicSource.load(index, () => {
        musicSource.play();
    });
}

export const TRACK_TO_VAR_GAME = unimplemented();

export const VAR_GAME_TO_TRACK = unimplemented();

export const ANIM_TEXTURE = unimplemented();

export const ADD_MESSAGE_OBJ = unimplemented();

export function BRUTAL_EXIT() {
    this.state.continue = false;
    this.state.terminated = true;
    this.moveState.terminated = true;
    this.actor.isKilled = true;
    this.actor.isVisible = false;
}

export const REPLACE = unimplemented();

export const SCALE = unimplemented();

export const SET_ARMOR = unimplemented();

export const SET_ARMOR_OBJ = unimplemented();

export function ADD_LIFE_POINT_OBJ(index, points) {
    const actor = this.scene.actors[index];
    if (actor) {
        actor.props.life += points;
    }
}

export const STATE_INVENTORY = unimplemented();

export const SET_HIT_ZONE = unimplemented();

export function SAMPLE(index) {
    const audio = this.game.getAudioManager();
    audio.playSample(index);
}

export function SAMPLE_RND(index) {
    const frequency = getRandom(0x800, 0x1000);
    const audio = this.game.getAudioManager();
    audio.playSample(index, frequency);
}

export function SAMPLE_ALWAYS(index) {
    const audio = this.game.getAudioManager();
    audio.stopSample(index);
    audio.playSample(index, 0x1000, -1);
}

export function SAMPLE_STOP(index) {
    const audio = this.game.getAudioManager();
    audio.stopSample(index);
}

export function REPEAT_SAMPLE(index, loopCount) {
    const audio = this.game.getAudioManager();
    audio.playSample(index, 0x1000, loopCount - 1);
}

export const BACKGROUND = unimplemented();

export const SET_RAIL = unimplemented();

export const INVERSE_BETA = unimplemented();

export function ADD_MONEY(value) {
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

export function NEW_SAMPLE(index, _, volume, frequency) {
    const audio = this.game.getAudioManager();
    const sample = audio.playSample(index, frequency);
    sample.setVolume(volume / 100);
}

export const POS_OBJ_AROUND = unimplemented();

export const PCX_MESS_OBJ = unimplemented();
