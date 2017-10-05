import THREE from 'three';

import {DirMode} from '../../game/actors';
import {setMagicBallLevel} from '../../game/state';
import VideoData from '../../video/data';

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
    if (!cmdState.listener) {
        const hero = this.scene.getActor(0);
        hero.props.dirMode = DirMode.NO_MOVE;
        hero.props.prevEntityIndex = hero.props.entityIndex;
        hero.props.prevAnimIndex = hero.props.animIndex;
        hero.props.entityIndex = 0;
        if (actor.index === 0)
            hero.props.animIndex = 28; // talking / reading
        else
            hero.props.animIndex = 0;
        let textBox = document.getElementById('frameText');
        const text = this.scene.data.texts[id];
        if (text.type === 3) {
            textBox.className = "bigText";
        } else if (text.type === 9) {
            if (!actor.threeObject || actor.threeObject.visible === false) {
                return;
            }
            const main = document.querySelector('#main');
            textBox = document.createElement('div');
            textBox.className = "noframeText";
            textBox.id = `noframeText_${actor.index}_${id}`;
            main.appendChild(textBox);

            const renderer = window.game.getRenderer();
            const widthHalf = 0.5 * renderer.domElement.width;
            const heightHalf = 0.5 * renderer.domElement.height;

            const pos = new THREE.Vector3();
            actor.threeObject.updateMatrixWorld();
            pos.setFromMatrixPosition(actor.threeObject.matrixWorld);
            pos.project(renderer.getMainCamera(scene));
            pos.x = (pos.x * widthHalf) + widthHalf;
            pos.y = - (pos.y * heightHalf) + heightHalf;
            // re-align above character (should be calculated based on font height and text width)
            pos.x -= 50;
            pos.y -= 125;

            textBox.style.left = (pos.x / renderer.pixelRatio()) + 'px';
            textBox.style.top = (pos.y / renderer.pixelRatio()) + 'px';
        } else {
            textBox.className = "smallText";
        }
        cmdState.currentChar = 0;
        textBox.innerHTML = '';
        textBox.style.color = actor.props.textColor;
        let textInterval = setInterval(function () {
            textBox.style.display = 'block';
            const char = text.value.charAt(cmdState.currentChar);
            if (char === '@') {
                const br = document.createElement('br');
                textBox.appendChild(br);
            } else {
                textBox.innerHTML += char;
            }
            cmdState.currentChar++;
            if (cmdState.currentChar > text.value.length) {
                clearInterval(textInterval);
            }
        }, 35);
        const that = this;
        cmdState.listener = function(event) {
            const key = event.code || event.which || event.keyCode;
            if (key === 'Enter' || key === 13) {
                cmdState.ended = true;
                clearInterval(textInterval);
                if (text.type === 9) {
                    const main = document.querySelector('#main');
                    textBox = document.getElementById(`noframeText_${actor.index}_${id}`);
                    main.removeChild(textBox);
                }
                that.scene.getActor(0).props.dirMode = DirMode.MANUAL;
            }
        };
        window.addEventListener('keydown', cmdState.listener);
        if (text.type === 9) {
            setTimeout(function () {
                cmdState.listener();
            }, 3000);
        }
        voiceSource.load(text.index, this.scene.data.textBankId, () => {
            voiceSource.play();
        });

    }
    if (cmdState.ended) {
        voiceSource.stop();
        let textBox = null;
        const text = this.scene.data.texts[id];
        if (text.type !== 9) {
            textBox = document.getElementById('frameText');
            textBox.style.display = 'none';
            textBox.innerHTML = '';
        }
        window.removeEventListener('keydown', cmdState.listener);
        delete cmdState.listener;
        delete cmdState.ended;
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
    const actor = this.scene.getActor(index);
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
    if (this.game.getState().hero.money > 999) {
        this.game.getState().hero.money = 999;
    }
}

export function END_LIFE() {
    BRUTAL_EXIT.call(this);
}

export function INC_CHAPTER() {
    this.game.getState().chapter++;
}

export function FOUND_OBJECT(cmdState, id) {
    const voiceSource = this.game.getAudioManager().getVoiceSource();
    const textBox = document.getElementById('frameText');
    if (!cmdState.listener) {
        this.scene.getActor(0).props.dirMode = DirMode.NO_MOVE;
        this.game.getState().flags.inventory[id] = 1;
        //this.actor.isVisible = false;
        const soundFxSource = this.game.getAudioManager().getSoundFxSource();
        soundFxSource.load(6, () => {
            soundFxSource.play();
        });
        cmdState.currentChar = 0;
        const text = this.game.controlsState.texts[id];
        if (text.type === 3) {
            textBox.className = "bigText";
        } else {
            textBox.className = "smallText";
        }
        textBox.innerHTML = '';
        textBox.style.color = this.actor.props.textColor;
        let textInterval = setInterval(function () {
            textBox.style.display = 'block';
            const char = text.value.charAt(cmdState.currentChar);
            if (char == '@') {
                const br = document.createElement('br');
                textBox.appendChild(br);
            } else {
                textBox.innerHTML += char;
            }
            cmdState.currentChar++;
            if (cmdState.currentChar > text.value.length) {
                clearInterval(textInterval);
            }
        }, 35);
        const that = this;
        cmdState.listener = function(event) {
            const key = event.code || event.which || event.keyCode;
            if (key === 'Enter' || key === 13) {
                cmdState.ended = true;
                clearInterval(textInterval);
                that.scene.getActor(0).props.dirMode = DirMode.MANUAL;
            }
        };
        window.addEventListener('keydown', cmdState.listener);
        voiceSource.load(text.index, -1, () => {
            voiceSource.play();
        });

        const overlayBox = document.getElementById('overlay');
        overlayBox.style.display = 'block';
    }
    if (cmdState.ended) {
        //this.actor.isVisible = true;
        voiceSource.stop();
        const textBox = document.getElementById('frameText');
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

export function SET_LIFE_POINT_OBJ(index, value) {
    const actor = this.scene.getActor(index);
    actor.props.life = value;
}

export function SUB_LIFE_POINT_OBJ() {
    const actor = this.scene.getActor(index);
    actor.props.life -= value;
    if (actor.props.life < 0) {
        actor.props.life = 0;
    }
}

export function HIT_OBJ() {

}

export function PLAY_SMK(cmdState, video) {
    if (!cmdState.listener) {
        this.game.pause();
        const main = document.querySelector('#main');
        const videoTag = document.createElement('video');
        const source = document.createElement('source');
        source.type = 'video/mp4';
        source.src = VideoData.VIDEO.find((v) => { return v.name === video; }).file;
        videoTag.id = 'video';
        videoTag.autoplay = true;
        videoTag.className = 'video';
        videoTag.appendChild(source);
        main.appendChild(videoTag);

        cmdState.listener = function(event) {
            const key = event.code || event.which || event.keyCode;
            if (key === 'Enter' || key === 13) {
                cmdState.ended = true;
                videoTag.removeEventListener('ended', cmdState.listener);
                main.removeChild(videoTag);
                window.game.pause();
            }
        };
        window.addEventListener('keydown', cmdState.listener);
        videoTag.addEventListener('ended', cmdState.listener);
    }

    if (cmdState.ended) {
        window.removeEventListener('keydown', cmdState.listener);
        delete cmdState.listener;
        delete cmdState.ended;
    } else {
        this.state.reentryOffset = this.state.offset;
        this.state.continue = false;
    }
}

export function ECLAIR() {

}

export function INC_CLOVER_BOX() {
    if (this.game.getState().hero.clover.boxes < 10) {
        this.game.getState().hero.clover.boxes++;
    }
}

export function SET_USED_INVENTORY(item) {
    this.game.getState().flags.inventory[item] = 1;
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

export function MESSAGE_ZOE() {

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

export function ADD_MESSAGE() {

}

export function BALLOON() {

}

export function NO_SHOCK() {

}

export function ASK_CHOICE_OBJ() {

}

export function CINEMA_MODE(mode) {
    const cinemaModeDiv = document.getElementById('cinemaMode');
    if (mode === 1) {
        this.actor.props.dirMode = DirMode.NO_MOVE;
        cinemaModeDiv.style.display = 'block';
        cinemaModeDiv.className = "cinemaModeIn";
    } else {
        this.actor.props.dirMode = DirMode.MANUAL;
        cinemaModeDiv.className = "cinemaModeOut";
        setTimeout(function() { cinemaModeDiv.style.display = 'none'; }, 3000); // animation is in 3s
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
    const musicSource = game.getAudioManager().getMusicSource();
    if (!musicSource.isPlaying) {
        musicSource.load(index, () => {
            musicSource.play();
        });
    }
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
    const actor = this.scene.getActor(index);
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

