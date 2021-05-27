import * as THREE from 'three';
import { omit } from 'lodash';
import { getLanguageConfig } from '../lang';
import { getParams } from '../params';
import Actor from './Actor';
import AnimState from '../model/anim/AnimState';
import { AnimStateJSON } from '../model/anim/types';

export interface GameConfig {
    displayText: boolean;
    musicVolume: number;
    soundFxVolume: number;
    ambienceVolume: number;
    voiceVolume: number;
    positionalAudio: boolean;
}

export interface CloverState {
    leafs: number;
    boxes: number;
}

export interface MagicBallState {
    level: number;
    strength: number;
    maxBounces: number;
}

export interface HeroState {
    behaviour: number;
    prevBehaviour: number;
    usingItemId: number;
    equippedItemId: number;
    inventorySlot: number;
    clover: CloverState;
    life: number;
    keys: number;
    money: number;
    magic: number;
    fuel: number;
    pinguin: number;
    magicball: MagicBallState;
    handStrength: number;
    lastValidPosTime: number;
    position: THREE.Vector3;
    animState?: AnimStateJSON;
}

export interface GameState {
    config: GameConfig;
    hero: HeroState;
    // The actor index who is currently talking.
    actorTalking: number;
    flags: any;
    save: Function;
    load: Function;
}

export const MAX_LIFE = 255;
const INITIAL_LIFE = 200;
const MAGICBALL_MAX_BOUNCES = 4;

export function createGameState(): GameState {
    const gameState = {
        config: Object.assign({
            displayText: true,
            musicVolume: 0.30,
            soundFxVolume: 1.0,
            voiceVolume: 1.0,
            ambienceVolume: 0.2,
            positionalAudio: getParams().audio3d,
        }, getLanguageConfig()),
        hero: {
            behaviour: 0,
            prevBehaviour: 0,
            life: INITIAL_LIFE,
            money: 0,
            magic: 0,
            keys: 0,
            fuel: 0,
            pinguin: 0,
            clover: { boxes: 2, leafs: 1 },
            magicball: null,
            handStrength: 5, // LVL_0
            position: null,
            lastValidPosTime: 0,
            animState: null,
            inventorySlot: 0,
            usingItemId: -1,
            equippedItemId: -1,
        },
        actorTalking: -1,
        flags: {
            quest: createQuestFlags(),
            holomap: createHolomapFlags()
        },
        save(hero: Actor) {
            this.hero.position = hero.physics.position;
            this.hero.animState = hero.animState.toJSON();
            return JSON.stringify(omit(this, ['save', 'load', 'config']));
        },
        load(savedState, hero: Actor) {
            const state = JSON.parse(savedState);
            if (!state) {
                return;
            }
            hero.physics.position.x = state.hero.position.x;
            hero.physics.position.y = state.hero.position.y;
            hero.physics.position.z = state.hero.position.z;
            // Merge the current animState with the saved one, overwritting
            // things like the currentFrame etc. to ensure we e.g. continue to
            // fly the jetpack if we drown whilst using it.
            if (!hero.animState) {
                hero.animState = new AnimState();
            }
            hero.animState.setFromJSON(state.hero.animState);

            Object.assign(this, state);
        }
    };
    setMagicBallLevel(gameState, 1);
    return gameState;
}

function createQuestFlags() {
    const quest = [];
    for (let i = 0; i < 256; i += 1) {
        quest[i] = 0;
    }

    // set default values
    if (getParams().game === 'lba2') {
        quest[63] = 1;
        quest[135] = 1;
        quest[150] = 1;
        quest[152] = 1; // rain
        quest[159] = 256;
    }

    return quest;
}

function createHolomapFlags() {
    const holomap = [];
    for (let i = 0; i < 512; i += 1) {
        holomap[i] = 0;
    }
    return holomap;
}

export function setMagicBallLevel(state: GameState, index: number) {
    const magicball = { level: 0, strength: 0, maxBounces: 0 };

    magicball.level = index;

    let handStrength = 0;
    switch (index) {
        default:
        case 0:
            magicball.strength = 10;
            handStrength = 8;
            break;
        case 1:
            magicball.strength = 10;
            magicball.maxBounces = MAGICBALL_MAX_BOUNCES;
            handStrength = 8;
            break;
        case 2:
            magicball.strength = 20;
            magicball.maxBounces = MAGICBALL_MAX_BOUNCES;
            handStrength = 18;
            break;
        case 3:
            magicball.strength = 30;
            magicball.maxBounces = MAGICBALL_MAX_BOUNCES;
            handStrength = 28;
            break;
        case 4:
            magicball.strength = 40;
            magicball.maxBounces = MAGICBALL_MAX_BOUNCES;
            handStrength = 38;
            break;
    }

    state.hero.magicball = magicball;
    state.hero.handStrength = handStrength;
}
