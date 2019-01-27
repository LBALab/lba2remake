import { clone } from 'lodash';
import { DirMode } from '../../game/actors.ts';
import { AnimType } from '../../game/data/constants';
import { setMagicBallLevel } from '../../game/state.ts';
import VideoData from '../../video/data';

export function PALETTE() {

}

export function BODY_OBJ(actor, bodyIndex) {
    actor.setBody(this.scene, bodyIndex);
}

export function ANIM_OBJ(actor, animIndex) {
    actor.setAnim(animIndex);
}

export function SET_CAMERA() {

}

export function CAMERA_CENTER() {

}

export function MESSAGE(cmdState, id) {
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
}

export function MESSAGE_OBJ(cmdState, actor, id) {
    const voiceSource = this.game.getAudioManager().getVoiceSource();
    const hero = this.scene.actors[0];
    if (!cmdState.listener) {
        const text = this.scene.data.texts[id];
        if (text.type === 9) {
            if (!actor.threeObject || actor.threeObject.visible === false) {
                return;
            }
            const itrjId = `${actor.index}_${id}`;
            const interjections = clone(this.game.getUiState().interjections);
            interjections[itrjId] = {
                scene: this.scene.index,
                actor: actor.index,
                color: actor.props.textColor,
                value: text.value
            };
            this.game.setUiState({interjections});
            cmdState.listener = function listener() { };
            setTimeout(() => {
                const interjectionsCopy = clone(this.game.getUiState().interjections);
                delete interjectionsCopy[itrjId];
                this.game.setUiState({interjections: interjectionsCopy});
                cmdState.ended = true;
            }, 4500);
        } else {
            hero.props.dirMode = DirMode.NO_MOVE;
            hero.props.prevEntityIndex = hero.props.entityIndex;
            hero.props.prevAnimIndex = hero.props.animIndex;
            hero.props.entityIndex = 0;
            if (actor.index === 0)
                hero.props.animIndex = AnimType.TALK;
            else
                hero.props.animIndex = AnimType.NONE;
            this.game.setUiState({
                text: {
                    type: text.type === 3 ? 'big' : 'small',
                    value: text.value,
                    color: actor.props.textColor
                }
            });
            const that = this;
            cmdState.listener = function listener(event) {
                const key = event.code || event.which || event.keyCode;
                if (key === 'Enter' || key === 13) {
                    const skip = that.game.getUiState().skip;
                    if (skip) {
                        cmdState.ended = true;
                    } else {
                        that.game.setUiState({
                            skip: true
                        });
                    }
                }
            };
            cmdState.listenerStart = function listenerStart() {
                cmdState.startTime = Date.now();
            };
            cmdState.listenerEnd = function listenerEnd() {
                const endTime = Date.now();
                const elapsed = endTime - cmdState.startTime;
                if (elapsed < 300) {
                    const skip = that.game.getUiState().skip;
                    if (skip) {
                        cmdState.ended = true;
                    } else {
                        that.game.setUiState({
                            skip: true
                        });
                    }
                }
            };
            window.addEventListener('keydown', cmdState.listener);
            window.addEventListener('touchstart', cmdState.listenerStart);
            window.addEventListener('touchend', cmdState.listenerEnd);
            if (text.type === 9) {
                setTimeout(() => {
                    cmdState.listener();
                }, 4500);
            }
        }

        voiceSource.load(text.index, this.scene.data.textBankId, () => {
            voiceSource.play();
        });
    }
    if (cmdState.ended) {
        voiceSource.stop();
        const text = this.scene.data.texts[id];
        if (text.type !== 9) {
            this.game.setUiState({ text: null, skip: false, });
            window.removeEventListener('keydown', cmdState.listener);
            window.removeEventListener('touchstart', cmdState.listenerStart);
            window.removeEventListener('touchend', cmdState.listenerEnd);
            hero.props.dirMode = DirMode.MANUAL;
        }
        delete cmdState.listener;
        delete cmdState.listenerStart;
        delete cmdState.listenerEnd;
        delete cmdState.ended;
        if (cmdState.startTime) {
            delete cmdState.startTime;
        }
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function CAN_FALL(flag) {
    this.actor.props.flags.canFall = (flag & 1) === 1;
}

export function SET_DIRMODE(dirMode) {
    this.actor.props.dirMode = dirMode;
    if (dirMode === DirMode.MANUAL) {
        this.actor.props.runtimeFlags.isTurning = false;
    }
}

export function SET_DIRMODE_OBJ(index, dirMode) {
    const actor = this.scene.actors[index];
    if (actor) {
        actor.props.runtimeFlags.dirMode = dirMode;
        if (dirMode === DirMode.MANUAL) {
            actor.props.runtimeFlags.isTurning = false;
        }
    }
}

export function CAM_FOLLOW() {

}

export function SET_BEHAVIOUR(value) {
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
    this.game.getState().hero.keys += 1;
}

export function GIVE_GOLD_PIECES(amount) {
    this.game.getState().hero.money += amount;
    if (this.game.getState().hero.money > 999) {
        this.game.getState().hero.money = 999;
    }
}

export function INC_CHAPTER() {
    this.game.getState().chapter += 1;
}

export function FOUND_OBJECT(cmdState, id) {
    const voiceSource = this.game.getAudioManager().getVoiceSource();
    const hero = this.scene.actors[0];
    if (!cmdState.listener) {
        hero.props.dirMode = DirMode.NO_MOVE;
        hero.props.prevEntityIndex = hero.props.entityIndex;
        hero.props.prevAnimIndex = hero.props.animIndex;
        hero.props.entityIndex = 0;
        hero.props.animIndex = AnimType.NONE;
        this.game.getState().flags.quest[id] = 1;
        const soundFxSource = this.game.getAudioManager().getSoundFxSource();
        soundFxSource.load(6, () => {
            soundFxSource.play();
        });
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
        cmdState.listener = function listener(event) {
            const key = event.code || event.which || event.keyCode;
            if (key === 'Enter' || key === 13) {
                const skip = that.game.getUiState().skip;
                if (skip) {
                    cmdState.ended = true;
                } else {
                    that.game.setUiState({
                        skip: true
                    });
                }
            }
        };
        cmdState.listenerStart = function listenerStart() {
            cmdState.startTime = Date.now();
        };
        cmdState.listenerEnd = function listenerEnd() {
            const endTime = Date.now();
            const elapsed = endTime - cmdState.startTime;
            if (elapsed < 300) {
                const skip = that.game.getUiState().skip;
                if (skip) {
                    cmdState.ended = true;
                } else {
                    that.game.setUiState({
                        skip: true
                    });
                }
            }
        };
        window.addEventListener('keydown', cmdState.listener);
        window.addEventListener('touchstart', cmdState.listenerStart);
        window.addEventListener('touchend', cmdState.listenerEnd);
        if (text.type === 9) {
            setTimeout(() => {
                cmdState.listener();
            }, 6500);
        }
        voiceSource.load(text.index, -1, () => {
            voiceSource.play();
        });

        this.game.setUiState({foundObject: id});
    }
    if (cmdState.ended) {
        voiceSource.stop();
        this.game.setUiState({ skip: false, text: null, foundObject: null });
        window.removeEventListener('keydown', cmdState.listener);
        window.removeEventListener('touchstart', cmdState.listenerStart);
        window.removeEventListener('touchend', cmdState.listenerEnd);
        hero.props.dirMode = DirMode.MANUAL;

        delete cmdState.listener;
        delete cmdState.listenerStart;
        delete cmdState.listenerEnd;
        delete cmdState.ended;
        if (cmdState.startTime) {
            delete cmdState.startTime;
        }
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function SET_DOOR_LEFT() {

}

export function SET_DOOR_RIGHT() {

}

export function SET_DOOR_UP() {

}

export function SET_DOOR_DOWN() {

}

export function GIVE_BONUS() {

}

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
        this.actor.threeObject.visible = !hidden;
    }
}

export function SHADOW_OBJ() {

}

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

export function HIT_OBJ(actor, strength) {
    // quick and dirty hit object
    actor.hasCollidedWithActor = this.index;
    actor.props.life -= strength;
}

export function PLAY_SMK(cmdState, video) {
    if (!cmdState.listener) {
        const that = this;
        this.game.pause();
        const src = VideoData.VIDEO.find(v => v.name === video).file;
        const onEnded = () => {
            that.game.setUiState({video: null, skip: false});
            cmdState.ended = true;
            that.game.resume();
        };
        this.game.setUiState({ skip: false,
            video: {
                src,
                onEnded
            }});
        cmdState.listener = function listener(event) {
            const key = event.code || event.which || event.keyCode;
            if (key === 'Enter' || key === 13 ||
                key === 'Escape' || key === 27) {
                onEnded();
            }
        };
        cmdState.listenerStart = function listenerStart() {
            cmdState.startTime = Date.now();
        };
        cmdState.listenerEnd = function listenerEnd() {
            const endTime = Date.now();
            const elapsed = endTime - cmdState.startTime;
            if (elapsed < 300) {
                const skip = that.game.getUiState().skip;
                if (skip) {
                    onEnded();
                } else {
                    that.game.setUiState({
                        skip: true
                    });
                }
            }
        };
        window.addEventListener('keydown', cmdState.listener);
        window.addEventListener('touchstart', cmdState.listenerStart);
        window.addEventListener('touchend', cmdState.listenerEnd);
    }

    if (cmdState.ended) {
        window.removeEventListener('keydown', cmdState.listener);
        window.removeEventListener('touchstart', cmdState.listenerStart);
        window.removeEventListener('touchend', cmdState.listenerEnd);
        delete cmdState.listener;
        delete cmdState.listenerStart;
        delete cmdState.listenerEnd;
        delete cmdState.ended;
        if (cmdState.startTime) {
            delete cmdState.startTime;
        }
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function ECLAIR() {

}

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
    const voiceSource = this.game.getAudioManager().getVoiceSource();
    const hero = this.scene.actors[0];
    if (!cmdState.listener) {
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
        cmdState.listener = function listener(event) {
            const key = event.code || event.which || event.keyCode;
            if (key === 'Enter' || key === 13) {
                cmdState.ended = true;
            }
        };
        window.addEventListener('keydown', cmdState.listener);

        voiceSource.load(text.index, this.scene.data.textBankId, () => {
            voiceSource.play();
        });
    }
    if (cmdState.ended) {
        voiceSource.stop();
        const uiState = this.game.getUiState();
        this.state.choice = uiState.choice;
        this.game.setUiState({ ask: {choices: []}, choice: null });
        window.removeEventListener('keydown', cmdState.listener);
        hero.props.dirMode = DirMode.MANUAL;
        delete cmdState.listener;
        delete cmdState.ended;
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function INIT_BUGGY() {

}

export function MEMO_SLATE() {

}

export function SET_HOLO_POS() {

}

export function CLR_HOLO_POS() {

}

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

export function SET_GRM() {

}

export function SET_CHANGE_CUBE() {

}

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

export function FADE_TO_PAL() {

}

export function ACTION() {

}

export function SET_FRAME() {

}

export function SET_SPRITE() {

}

export function SET_FRAME_3DS() {

}

export function IMPACT_OBJ() {

}

export function IMPACT_POINT() {

}

export function ADD_MESSAGE(cmdState, id) {
    MESSAGE_OBJ.call(this, cmdState, this.actor, id);
}

export function BALLOON() {

}

export function NO_SHOCK() {

}

export function CINEMA_MODE(mode) {
    if (mode === 1) {
        this.actor.props.dirMode = DirMode.NO_MOVE;
        this.game.setUiState({ cinema: true });
    } else {
        this.actor.props.dirMode = DirMode.MANUAL;
        this.game.setUiState({ cinema: false });
    }
}

export function SAVE_HERO() {

}

export function RESTORE_HERO() {

}

export function ANIM_SET() {

}

export function RAIN() {

}

export function GAME_OVER() {
    this.game.getState().hero.life = 0;
    this.game.getState().hero.clover.leafs = 0;
}

export function THE_END() {
    this.game.getState().hero.life = 50;
    this.game.getState().hero.clover.leafs = 0;
    this.game.getState().hero.magic = 80;
}

export function ESCALATOR() {

}

export function PLAY_MUSIC(index) {
    const musicSource = this.game.getAudioManager().getMusicSource();
    musicSource.load(index, () => {
        musicSource.play();
    });
}

export function TRACK_TO_VAR_GAME() {

}

export function VAR_GAME_TO_TRACK() {

}

export function ANIM_TEXTURE() {

}

export function ADD_MESSAGE_OBJ() {

}

export function BRUTAL_EXIT() {
    this.state.continue = false;
    this.state.terminated = true;
    this.moveState.terminated = true;
    this.actor.isKilled = true;
    this.actor.isVisible = false;
}

export function REPLACE() {

}

export function SCALE() {

}

export function SET_ARMOR() {

}

export function SET_ARMOR_OBJ() {

}

export function ADD_LIFE_POINT_OBJ(index, points) {
    const actor = this.scene.actors[index];
    if (actor) {
        actor.props.life += points;
    }
}

export function STATE_INVENTORY() {

}

export function SET_HIT_ZONE() {

}

export function SAMPLE(index) {
    const soundFxSource = this.game.getAudioManager().getSoundFxSource();
    soundFxSource.load(index, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_RND(index) {
    const soundFxSource = this.game.getAudioManager().getSoundFxSource();
    soundFxSource.load(index, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_ALWAYS(index) {
    const soundFxSource = this.game.getAudioManager().getSoundFxSource();
    soundFxSource.load(index, () => {
        soundFxSource.play();
    });
}

export function SAMPLE_STOP() {

}

export function REPEAT_SAMPLE() {

}

export function BACKGROUND() {

}

export function SET_RAIL() {

}

export function INVERSE_BETA() {

}

export function ADD_GOLD_PIECES(value) {
    this.game.getState().hero.money += value;
    if (this.game.getState().hero.money > 999) {
        this.game.getState().hero.money = 999;
    }
}

export function SPY() {

}

export function DEBUG() {

}

export function DEBUG_OBJ() {

}

export function POPCORN() {

}

export function FLOW_POINT() {

}

export function FLOW_OBJ() {

}

export function SET_ANIM_DIAL() {

}

export function PCX() {

}

export function END_MESSAGE() {

}

export function END_MESSAGE_OBJ() {

}

export function PARM_SAMPLE() {

}

export function NEW_SAMPLE() {

}

export function POS_OBJ_AROUND() {

}

export function PCX_MESS_OBJ() {

}

