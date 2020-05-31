import { omit } from 'lodash';
import { getLanguageConfig } from '../lang';

export function createState() {
    return {
        config: Object.assign({
            displayText: true,
            musicVolume: 0.8,
            soundFxVolume: 0.5,
            voiceVolume: 1.0
        }, getLanguageConfig()),
        hero: {
            behaviour: 0,
            prevBehaviour: 0,
            life: 200,
            money: 0,
            magic: 0,
            keys: 0,
            fuel: 0,
            pinguin: 0,
            clover: { boxes: 2, leafs: 0 },
            magicball: { level: 0, strength: 0, bounce: 0 }
        },
        chapter: 0,
        flags: {
            quest: createQuestFlags(),
            holomap: createHolomapFlags()
        },
        save() {
            return JSON.stringify(omit(this, ['save', 'load', 'config']));
        },
        load(savedState) {
            const state = JSON.parse(savedState);
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

export function setMagicBallLevel(index: number) {
    const magicball = { level: 0, strength: 0, bounce: 0 };

    magicball.level = index;
    magicball.strength = 4;
    magicball.bounce = ((index - 1) / 20) + 1;

    switch (index) {
        default:
        case 0:
        case 1:
            magicball.strength = 4;
            break;
        case 2:
            magicball.strength = 6;
            break;
        case 3:
            magicball.strength = 8;
            break;
        case 4:
            magicball.strength = 10;
            break;
    }

    return magicball;
}
