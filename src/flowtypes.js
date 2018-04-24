// @flow

import * as THREE from 'three';
import type {Game} from './game';

export type Time = {
    delta: number,
    elapsed: number
}

export type Scene = {}

export type Actor = {}

export type GroundInfo = {
    sound: number, // bits(flags, 8, 4),
    collision: boolean, // bits(flags, 17, 1),
    height: number // float
}

export type Scenery = {
    sceneNode: THREE.Object3D,
    physics: {
        processCollisions: (scene: Scene, actor: Actor) => void,
        getGroundInfo: (position: THREE.Vector3) => GroundInfo
    },
    update: (game: Game, scene: Scene, time: Time) => void
}
