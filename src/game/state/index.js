// @flow

import THREE from 'three';
import {Target, Movement} from '../hero';
import { times } from 'lodash';

export function createState() {
    return {
        config: {
            text: 0,
            languange: 0,
            displayText: true,
            hero: {
                physics: {
                    enabled: true,
                    targets: [Target.CAMERA],
                    movement: Movement.NORMAL,
                    speed: new THREE.Vector3(0.15, 0.3, 0.3)
                }
            }
        },
        hero: {
            life: 50,
            money: 0,
            magic: 0,
            keys: 0,
            fuel: 0,
            pinguin: 0,
            clover: { boxes: 2, leafs: 0 },
            magicball: { index: 0, strength: 0, level: 0, bounce: 0 }
        },
        chapter: 0,
        flags: {
            quest: createQuestFlags(),
            scene: createSceneFlags(),
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

function createSceneFlags() {
    const scene = [];
    for (let i = 0; i < 256; ++i) {
        scene[i] = 0;
    }
    return scene;
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
