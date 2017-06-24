import {DirMode} from '../../game/actors';

export function PALETTE() {

}

export function BODY_OBJ(actor, bodyIndex)  {
    actor.props.bodyIndex = bodyIndex;
}

export function ANIM_OBJ(actor, animIndex) {
    if (actor.props.animIndex == animIndex) {
        return;
    }
    actor.props.animIndex = animIndex;
    actor.resetAnimState();
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
    const textBox = document.getElementById('smallText');
    if (!cmdState.listener) {
        cmdState.currentChar = 0;
        textBox.innerHTML = '';
        textBox.style.color = actor.props.textColor;
        let textInterval = setInterval(function () {
            textBox.style.display = 'block';
            const char = this.scene.data.texts[id].value.charAt(cmdState.currentChar);
            if (char == '@') {
                const br = document.createElement('br');
                textBox.appendChild(br);
            } else {
                textBox.innerHTML += char;
            }
            cmdState.currentChar++;
            if (cmdState.currentChar > this.scene.data.texts[id].value.length) {
                clearInterval(textInterval);
            }
        }, 45);
        cmdState.listener = function () {
            cmdState.ended = true;
            clearInterval(textInterval);
        };
        window.addEventListener('keydown', cmdState.listener);
        voiceSource.load(this.scene.data.texts[id].index, this.scene.data.textBankId, () => {
            voiceSource.play();
        });

    }
    if (cmdState.ended) {
        voiceSource.stop();
        textBox.style.display = 'none';
        textBox.innerHTML = '';
        window.removeEventListener('keydown', cmdState.listener);
        delete cmdState.listener;
        delete cmdState.ended;
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function CAN_FALL() {

}

export function SET_DIRMODE(dirMode) {
    this.actor.props.dirMode = dirMode;
    if (dirMode == DirMode.MANUAL) {
        this.actor.isTurning = false;
    }
}

export function SET_DIRMODE_OBJ() {

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

export function KILL_OBJ(index) {
    const actor = this.scene.getActor(index);
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
    this.game.getState().hero.keys++;
}

export function GIVE_GOLD_PIECES(amount) {
    this.game.getState().hero.money += amount;
}

export function END_LIFE() {
    BRUTAL_EXIT.call(this);
}

export function INC_CHAPTER() {
    this.game.getState().chapter++;
}

export function FOUND_OBJECT(cmdState, id) {
    const voiceSource = this.game.getAudioManager().getVoiceSource();
    const textBox = document.getElementById('smallText');
    if (!cmdState.listener) {
        this.game.getState().flags.inventory[id] = 1;
        //this.actor.isVisible = false;
        const soundFxSource = this.game.getAudioManager().getSoundFxSource();
        soundFxSource.load(6, () => {
            soundFxSource.play();
        });
        cmdState.currentChar = 0;
        textBox.innerHTML = '';
        textBox.style.color = this.actor.props.textColor;
        let textInterval = setInterval(function () {
            textBox.style.display = 'block';
            const char = this.game.controlsState.texts[id].value.charAt(cmdState.currentChar);
            if (char == '@') {
                const br = document.createElement('br');
                textBox.appendChild(br);
            } else {
                textBox.innerHTML += char;
            }
            cmdState.currentChar++;
            if (cmdState.currentChar > this.game.controlsState.texts[id].value.length) {
                clearInterval(textInterval);
            }
        }, 45);
        cmdState.listener = function () {
            cmdState.ended = true;
            clearInterval(textInterval);
        };
        window.addEventListener('keydown', cmdState.listener);
        voiceSource.load(this.game.controlsState.texts[id].index, -1, () => {
            voiceSource.play();
        });

        const overlayBox = document.getElementById('overlay');
        overlayBox.style.display = 'block';
    }
    if (cmdState.ended) {
        //this.actor.isVisible = true;
        voiceSource.stop();
        const textBox = document.getElementById('smallText');
        textBox.style.display = 'none';
        textBox.innerHTML = '';
        const overlayBox = document.getElementById('overlay');
        overlayBox.style.display = 'none';
        window.removeEventListener('keydown', cmdState.listener);
        delete cmdState.listener;
        delete cmdState.ended;
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
    this.game.getSceneManager().goto(index);
}

export function OBJ_COL() {

}

export function BRICK_COL() {

}

export function INVISIBLE(hidden) {
    this.actor.isVisible = !hidden;
}

export function SHADOW_OBJ() {

}

export function SET_MAGIC_LEVEL() {

}

export function SUB_MAGIC_POINT() {

}

export function SET_LIFE_POINT_OBJ() {

}

export function SUB_LIFE_POINT_OBJ() {

}

export function HIT_OBJ() {

}

export function PLAY_SMK() {

}

export function ECLAIR() {

}

export function INC_CLOVER_BOX() {

}

export function SET_USED_INVENTORY() {

}

export function ADD_CHOICE() {

}

export function ASK_CHOICE() {

}

export function INIT_BUGGY() {

}

export function MEMO_SLATE() {

}

export function SET_HOLO_POS() {

}

export function CLR_HOLO_POS() {

}

export function ADD_FUEL() {

}

export function SUB_FUEL() {

}

export function SET_GRM() {

}

export function SET_CHANGE_CUBE() {

}

export function MESSAGE_ZOE() {

}

export function FULL_POINT() {

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

export function ADD_MESSAGE() {

}

export function BALLOON() {

}

export function NO_SHOCK() {

}

export function ASK_CHOICE_OBJ() {

}

export function CINEMA_MODE() {

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

}

export function THE_END() {

}

export function ESCALATOR() {

}

export function PLAY_MUSIC() {

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

export function ADD_LIFE_POINT_OBJ() {

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

export function ADD_GOLD_PIECES() {

}

export function STOP_CURRENT_TRACK_OBJ() {

}

export function RESTORE_LAST_TRACK_OBJ() {

}

export function SAVE_COMPORTEMENT_OBJ() {

}

export function RESTORE_COMPORTEMENT_OBJ() {

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

