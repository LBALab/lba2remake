// @flow

export function createState() {
    return {
        config: {
            text: 0,
            language: 0,
            languageCode: 'EN',
            displayText: true,
            musicVolume: 0.5,
            soundFxVolume: 0.8,
            voiceVolume: 1.0
        },
        hero: {
            behaviour: 0,
            life: 50,
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
            holomap: createHolomapFlags(),
            inventory: createInventoryFlags()
        },
        save: () => {},
        load: () => {}
    };
}

function createQuestFlags() {
    const quest = [];
    for (let i = 0; i < 256; ++i) {
        quest[i] = 0;
    }

    // set default values
    quest[63] = 1;
    quest[135] = 1;
    quest[150] = 1;
    quest[152] = 1; // rain
    quest[159] = 256;

    return quest;
}

function createHolomapFlags() {
    const holomap = [];
    for (let i = 0; i < 512; ++i) {
        holomap[i] = 0;
    }
    return holomap;
}

function createInventoryFlags() {
    const inventory = [];
    for (let i = 0; i < 128; ++i) {
        inventory[i] = 0;
    }
    return inventory;
}

export function setMagicBallLevel(index: number) {
    let magicball = { level: 0, strength: 0, bounce: 0 }

    magicball.level = index;
    magicball.strength = 4;
    magicball.bounce = ((index - 1) / 20) + 1;

    switch(index) {
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
