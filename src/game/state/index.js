// @flow

import THREE from 'three';
import {Target, Movement} from '../hero';

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
        game: {
            life: 0,
            money: 0,
            magic: 0,
            keys: 0,
            fuel: 0,
            pinguin: 0,
            chapter: 0,
            clover: { boxes: 0, leafs: 0},
            magicball: { index: 0, strength: 0, level: 0, bounce: 0 },
            flags: {
                quest: [],
                scene: [],
                holomap: [],
                inventory: []
            }
        },
        save: () => {},
        load: () => {}
    };
}
