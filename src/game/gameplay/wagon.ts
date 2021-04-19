import * as THREE from 'three';
import Actor from '../Actor';
import Scene from '../Scene';
import IsoScenery from '../scenery/isometric/IsoScenery';
import IsoSceneryPhysics from '../scenery/isometric/IsoSceneryPhysics';
import { Time } from '../../datatypes';
import { WORLD_SIZE } from '../../utils/lba';

/*
**                       ----
**    WEST [Z-]      ---/    \---      NORTH [X+]
**               ---/            \---
**           ---/                    \---
**        --/                            \--
**        --\                            /--
**           ---\                    /---
**               ---\            /---
**    SOUTH [X-]     ---\    /---      EAST [Z+]
**                       ----
*/
const RailLayout = {
    /** Temple of Bu rails **/
    // Straight
    NORTH_SOUTH:           54,
    WEST_EAST:             53,
    UP_NORTH:              63,
    UP_SOUTH:              65,
    UP_WEST:               66,
    UP_EAST:               64,
    // Turns
    TURN_NORTH_WEST:       51,
    TURN_NORTH_EAST:       50,
    TURN_SOUTH_WEST:       49,
    TURN_SOUTH_EAST:       52,
    // Turnouts
    SWITCH_NORTH_NORTH_WEST:   56,
    SWITCH_NORTH_NORTH_EAST:   55,
    SWITCH_SOUTH_SOUTH_WEST:   57,
    SWITCH_SOUTH_SOUTH_EAST:   58,
    SWITCH_WEST_NORTH_WEST:    59,
    SWITCH_WEST_SOUTH_WEST:    60,
    SWITCH_EAST_NORTH_EAST:    61,
    SWITCH_EAST_SOUTH_EAST:    62,
};

export interface WagonState {
    angle: number;
    key: string;
    turn: boolean;
    transition: number;
    pivot: THREE.Vector3;
    rotationDir: number;
}

export function initWagonState(angle): WagonState {
    return {
        angle: (Math.floor(angle / (Math.PI * 0.5)) + 8) % 4,
        key: 'none',
        turn: false,
        transition: -1,
        pivot: new THREE.Vector3(),
        rotationDir: 1,
    };
}

const EULER = new THREE.Euler();
const lINFO = {
    index: -1,
    center: new THREE.Vector3(),
    key: 'none',
    hSize: 0,
};
const HALF_TURN = (1.5 / 32) * WORLD_SIZE;
const Dir = {
    EAST: 0,
    NORTH: 1,
    WEST: 2,
    SOUTH: 3
};

export function computeWagonMovement(scene: Scene, wagon: Actor, time: Time) {
    if (!(scene.scenery.physics instanceof IsoSceneryPhysics)) {
        return;
    }

    const state = wagon.wagonState;
    scene.scenery.physics.getLayoutInfo(wagon.physics.position, lINFO);
    const rail = mapUndergasToBuRails(scene, lINFO.index);

    /* Only for debug purposes */
    wagon.debugData.railName = Object.keys(RailLayout).find(k => RailLayout[k] === rail);
    Object.assign(wagon.debugData, lINFO);
    /* ----------------------- */

    if (!state.turn) {
        switch (rail) {
            case RailLayout.NORTH_SOUTH:
                wagon.physics.position.z = lINFO.center.z;
                break;
            case RailLayout.WEST_EAST:
                wagon.physics.position.x = lINFO.center.x;
                break;
            case RailLayout.UP_EAST:
            case RailLayout.UP_WEST:
            case RailLayout.UP_NORTH:
            case RailLayout.UP_SOUTH:
                wagon.physics.position.y = lINFO.center.y;
                break;
            case RailLayout.TURN_SOUTH_WEST:
                handleTurn(state, Dir.WEST);
                break;
            case RailLayout.TURN_NORTH_WEST:
                handleTurn(state, Dir.NORTH);
                break;
            case RailLayout.TURN_NORTH_EAST:
                handleTurn(state, Dir.EAST);
                break;
            case RailLayout.TURN_SOUTH_EAST:
                handleTurn(state, Dir.SOUTH);
                break;
            case RailLayout.SWITCH_NORTH_NORTH_WEST:
                handleSwitch(state, Dir.WEST, 1);
                break;
            case RailLayout.SWITCH_NORTH_NORTH_EAST:
                handleSwitch(state, Dir.EAST, -1);
                break;
            case RailLayout.SWITCH_SOUTH_SOUTH_WEST:
                handleSwitch(state, Dir.WEST, -1);
                break;
            case RailLayout.SWITCH_SOUTH_SOUTH_EAST:
                handleSwitch(state, Dir.EAST, 1);
                break;
            case RailLayout.SWITCH_WEST_NORTH_WEST:
                handleSwitch(state, Dir.NORTH, -1);
                break;
            case RailLayout.SWITCH_WEST_SOUTH_WEST:
                handleSwitch(state, Dir.SOUTH, 1);
                break;
            case RailLayout.SWITCH_EAST_NORTH_EAST:
                handleSwitch(state, Dir.NORTH, 1);
                break;
            case RailLayout.SWITCH_EAST_SOUTH_EAST:
                handleSwitch(state, Dir.SOUTH, -1);
                break;
        }
    }

    const dt = Math.min(time.delta, 0.025);
    if (state.turn) {
        if (state.transition > 1) {
            state.transition = 1;
            state.turn = false;
        }
        const angleOffset = (state.angle + 2) % 4;
        const angleInt = (state.transition * state.rotationDir + 4 + angleOffset) % 4;
        const dAngle = angleInt * Math.PI * 0.5;
        wagon.physics.position.x = state.pivot.x + Math.sin(dAngle) * HALF_TURN;
        wagon.physics.position.z = state.pivot.z + Math.cos(dAngle) * HALF_TURN;

        const angle = dAngle + 3 * Math.PI * 0.5;
        wagon.physics.temp.angle = angle;
        EULER.set(0, angle, 0, 'XZY');
        wagon.physics.orientation.setFromEuler(EULER);
        state.transition += dt;
    }
    if (!state.turn) {
        const angle = state.angle * Math.PI * 0.5;
        wagon.physics.temp.position.x += Math.sin(angle) * dt;
        wagon.physics.temp.position.z += Math.cos(angle) * dt;
    }
    state.key = lINFO.key;
}

function handleTurn(state: WagonState, cwEntryDir: number) {
    if (lINFO.key !== state.key) {
        state.turn = true;
        state.transition = 0;
        setPivot(state, cwEntryDir);
        if (state.angle === cwEntryDir) {
            state.angle = (cwEntryDir + 3) % 4;
            state.rotationDir = -1;
        } else {
            state.angle = (cwEntryDir + 2) % 4;
            state.rotationDir = 1;
        }
    }
}

function handleSwitch(state: WagonState, offEntry: number, rotDir: number) {
    if (lINFO.key !== state.key) {
        const pvEntry = (offEntry + (rotDir * 1.5 + 1.5)) % 4;
        if (state.angle === offEntry) {
            state.turn = true;
            state.transition = 0;
            setPivot(state, pvEntry);
            state.angle = (offEntry + 2 - rotDir) % 4;
            state.rotationDir = rotDir;
        }
    }
}

const PIVOT = {
    [Dir.EAST]: [-1, -1],
    [Dir.NORTH]: [-1, 1],
    [Dir.WEST]: [1, 1],
    [Dir.SOUTH]: [1, -1],
};

function setPivot(state: WagonState, cwEntryDir) {
    const [pvx, pvy] = PIVOT[cwEntryDir];
    state.pivot.set(
        lINFO.center.x + HALF_TURN * pvx,
        0,
        lINFO.center.z + HALF_TURN * pvy,
    );
}

const UGRailLayout = {
    /** Undergas mine rails **/
    // Straight
    NORTH_SOUTH:           14,
    WEST_EAST:             15,
    UP_NORTH:              58,
    UP_SOUTH:              59,
    UP_WEST:               52,
    UP_EAST:               57,
    // Turns
    TURN_NORTH_WEST:       16,
    TURN_NORTH_EAST:       18,
    TURN_SOUTH_WEST:       19,
    TURN_SOUTH_EAST:       17,
    // Turnouts
    SWITCH_NORTH_NORTH_WEST:   66,
    SWITCH_NORTH_NORTH_EAST:   67,
    SWITCH_SOUTH_SOUTH_WEST:   50,
    SWITCH_SOUTH_SOUTH_EAST:   60,
    SWITCH_WEST_NORTH_WEST:    21,
    SWITCH_WEST_SOUTH_WEST:    20,
    SWITCH_EAST_NORTH_EAST:    62,
    SWITCH_EAST_SOUTH_EAST:    64,
};

function mapUndergasToBuRails(scene: Scene, rail: number) {
    const scenery = scene.scenery as IsoScenery;
    if (scenery.grid.library.index === 11) { // Mine library
        switch (rail) {
            case UGRailLayout.NORTH_SOUTH:              return RailLayout.NORTH_SOUTH;
            case UGRailLayout.WEST_EAST:                return RailLayout.WEST_EAST;
            case UGRailLayout.UP_NORTH:                 return RailLayout.UP_NORTH;
            case UGRailLayout.UP_SOUTH:                 return RailLayout.UP_SOUTH;
            case UGRailLayout.UP_WEST:                  return RailLayout.UP_WEST;
            case UGRailLayout.UP_EAST:                  return RailLayout.UP_EAST;
            case UGRailLayout.TURN_NORTH_WEST:          return RailLayout.TURN_NORTH_WEST;
            case UGRailLayout.TURN_NORTH_EAST:          return RailLayout.TURN_NORTH_EAST;
            case UGRailLayout.TURN_SOUTH_WEST:          return RailLayout.TURN_SOUTH_WEST;
            case UGRailLayout.TURN_SOUTH_EAST:          return RailLayout.TURN_SOUTH_EAST;
            case UGRailLayout.SWITCH_NORTH_NORTH_WEST:  return RailLayout.SWITCH_NORTH_NORTH_WEST;
            case UGRailLayout.SWITCH_NORTH_NORTH_EAST:  return RailLayout.SWITCH_NORTH_NORTH_EAST;
            case UGRailLayout.SWITCH_SOUTH_SOUTH_WEST:  return RailLayout.SWITCH_SOUTH_SOUTH_WEST;
            case UGRailLayout.SWITCH_SOUTH_SOUTH_EAST:  return RailLayout.SWITCH_SOUTH_SOUTH_EAST;
            case UGRailLayout.SWITCH_WEST_NORTH_WEST:   return RailLayout.SWITCH_WEST_NORTH_WEST;
            case UGRailLayout.SWITCH_WEST_SOUTH_WEST:   return RailLayout.SWITCH_WEST_SOUTH_WEST;
            case UGRailLayout.SWITCH_EAST_NORTH_EAST:   return RailLayout.SWITCH_EAST_NORTH_EAST;
            case UGRailLayout.SWITCH_EAST_SOUTH_EAST:   return RailLayout.SWITCH_EAST_SOUTH_EAST;
        }
    }
    return rail;
}
