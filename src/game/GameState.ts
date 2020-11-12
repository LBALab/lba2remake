import { omit } from 'lodash';
import { getLanguageConfig } from '../lang';

export interface GameConfig {
    displayText: boolean;
    musicVolume: number;
    soundFxVolume: number;
    voiceVolume: number;
}

export interface GameState {
    config: GameConfig;
    hero: any;
    chapter: number;
    // The actor index who is currently talking.
    actorTalking: number;
    flags: any;
    save: Function;
    load: Function;
}

export const MAX_LIFE = 255;
const INITIAL_LIFE = 200;

export function createGameState(): GameState {
    return {
        config: Object.assign({
            displayText: true,
            musicVolume: 0.5,
            soundFxVolume: 0.5,
            voiceVolume: 1.0
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
            magicball: { level: 0, strength: 0, bounce: 0 },
            handStrength: 5, // LVL_0
            position: null,
            lastValidPosTime: 0,
            animState: null,
            inventorySlot: 0,
            usingItemId: -1,
            equippedItemId: -1,
        },
        chapter: 0,
        actorTalking: -1,
        flags: {
            quest: createQuestFlags(),
            holomap: createHolomapFlags()
        },
        save(hero) {
            this.hero.position = hero.physics.position;
            this.hero.animState = hero.animState;
            return JSON.stringify(omit(this, ['save', 'load', 'config']));
        },
        load(savedState, hero) {
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
            hero.animState = {
                ...hero.animState,
                // Obmit any objects with functions since they aren't preserved
                // through the stringify process.
                ...omit(state.hero.animState, [
                    'skeleton',
                    'bones',
                    'matrixRotation',
                    'step',
                    'rotation',
                ]),
            };

            hero.animState.matrixRotation.fromArray(state.hero.animState.matrixRotation.elements);
            hero.animState.step.x = state.hero.animState.step.x;
            hero.animState.step.y = state.hero.animState.step.y;
            hero.animState.step.z = state.hero.animState.step.z;
            hero.animState.rotation.x = state.hero.animState.rotation.x;
            hero.animState.rotation.y = state.hero.animState.rotation.y;
            hero.animState.rotation.z = state.hero.animState.rotation.z;

            Object.assign(this, state);
        }
    };
}

function createQuestFlags() {
    const quest = [];
    for (let i = 0; i < 256; i += 1) {
        quest[i] = 0;
    }

    // set default values
    quest[63] = 1;
    quest[135] = 1;
    quest[150] = 1;
    quest[152] = 1; // rain
    quest[159] = 256;
    quest[10] = 1;
    quest[11] = 1;
    quest[9] = 1;
    quest[23] = 1;

    // debug video scene 45 - kill tralu
    // quest[56] = 3;
    // quest[71] = 0;

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
    const magicball = { level: 0, strength: 0, bounce: 0 };

    magicball.level = index;
    magicball.bounce = ((index - 1) / 20) + 1;

    let handStrength = 0;
    switch (index) {
        default:
        case 0:
            magicball.strength = 10;
            handStrength = 8;
            break;
        case 1:
            magicball.strength = 10;
            handStrength = 8;
            break;
        case 2:
            magicball.strength = 20;
            handStrength = 18;
            break;
        case 3:
            magicball.strength = 30;
            handStrength = 28;
            break;
        case 4:
            magicball.strength = 40;
            handStrength = 38;
            break;
    }

    state.hero.magicball = magicball;
    state.hero.handStrength = handStrength;
}
