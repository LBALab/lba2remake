import * as THREE from 'three';
import Actor from '../Actor';
import Scene from '../Scene';
import IsoScenery from '../scenery/isometric/IsoScenery';
import IsoSceneryPhysics from '../scenery/isometric/IsoSceneryPhysics';
import { Time } from '../../datatypes';
import { WORLD_SIZE } from '../../utils/lba';
import { KeyFrame } from '../../model/anim/types';

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
    UP_EAST:               66,
    UP_WEST:               64,
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

    if (!state.turn) {
        switch (rail) {
            case RailLayout.NORTH_SOUTH:
                wagon.physics.position.z = lINFO.center.z;
                break;
            case RailLayout.WEST_EAST:
                wagon.physics.position.x = lINFO.center.x;
                break;
            case RailLayout.UP_WEST:
            case RailLayout.UP_EAST:
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
                handleSwitch(scene, state, Dir.WEST, 1);
                break;
            case RailLayout.SWITCH_NORTH_NORTH_EAST:
                handleSwitch(scene, state, Dir.EAST, -1);
                break;
            case RailLayout.SWITCH_SOUTH_SOUTH_WEST:
                handleSwitch(scene, state, Dir.WEST, -1);
                break;
            case RailLayout.SWITCH_SOUTH_SOUTH_EAST:
                handleSwitch(scene, state, Dir.EAST, 1);
                break;
            case RailLayout.SWITCH_WEST_NORTH_WEST:
                handleSwitch(scene, state, Dir.NORTH, -1);
                break;
            case RailLayout.SWITCH_WEST_SOUTH_WEST:
                handleSwitch(scene, state, Dir.SOUTH, 1);
                break;
            case RailLayout.SWITCH_EAST_NORTH_EAST:
                handleSwitch(scene, state, Dir.NORTH, 1);
                break;
            case RailLayout.SWITCH_EAST_SOUTH_EAST:
                handleSwitch(scene, state, Dir.SOUTH, -1);
                break;
        }
    }

    moveAxletrees(scene, wagon, time);

    const speed = Math.min(time.delta, 0.025) * wagon.props.speed * 0.001;
    if (state.turn) {
        if (state.transition > 1) {
            state.transition = 1;
            state.turn = false;
        }
        const angleOffset = (state.angle + 2) % 4;
        const angleInt = (state.transition * state.rotationDir + 4 + angleOffset) % 4;
        const dAngle = angleInt * Math.PI * 0.5;
        wagon.physics.temp.position.set(
            state.pivot.x + Math.sin(dAngle) * HALF_TURN,
            wagon.physics.position.y,
            state.pivot.z + Math.cos(dAngle) * HALF_TURN
        );
        wagon.physics.temp.position.sub(wagon.physics.position);

        const angle = dAngle + (2 - state.rotationDir) * Math.PI * 0.5;
        wagon.physics.temp.angle = angle;
        EULER.set(0, angle, 0, 'XZY');
        wagon.physics.orientation.setFromEuler(EULER);
        state.transition += speed;
    }
    if (!state.turn) {
        const angle = state.angle * Math.PI * 0.5;
        EULER.set(0, angle, 0, 'XZY');
        wagon.physics.orientation.setFromEuler(EULER);
        wagon.physics.temp.position.x += Math.sin(angle) * speed;
        wagon.physics.temp.position.z += Math.cos(angle) * speed;
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

function handleSwitch(scene: Scene, state: WagonState, offEntry: number, rotDir: number) {
    if (lINFO.key !== state.key) {
        const pvEntry = (offEntry + (rotDir * 1.5 + 1.5)) % 4;
        const swEntry = (offEntry + 2 + rotDir) % 4;
        if (state.angle === offEntry) {
            state.turn = true;
            state.transition = 0;
            setPivot(state, pvEntry);
            state.angle = (offEntry + 2 - rotDir) % 4;
            state.rotationDir = rotDir;
        } else if (state.angle === swEntry) {
            const enabled = isSwitchEnabled(scene);
            if (enabled) {
                state.turn = true;
                state.transition = 0;
                setPivot(state, pvEntry);
                state.angle = (offEntry + 2) % 4;
                state.rotationDir = -rotDir;
            }
        }
    }
}

const POS = new THREE.Vector3();

function isSwitchEnabled(scene: Scene) {
    POS.copy(lINFO.center);
    POS.y += 0.02;
    for (const zone of scene.zones) {
        if (zone.props.type !== 9)
            continue;

        const box = zone.props.box;
        if (POS.x >= box.xMin && POS.x <= box.xMax &&
            POS.y >= box.yMin && POS.y <= box.yMax &&
            POS.z >= box.zMin && POS.z <= box.zMax) {
            return zone.props.info1 === 1;
        }
    }
    return false;
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

const AXLE_OFFSET = new THREE.Vector2();

function moveAxletrees(scene: Scene, wagon: Actor, time: Time) {
    const scenery = scene.scenery as IsoScenery;
    if (scenery.grid.library.index !== 11) { // Skip on mine library
        AXLE_OFFSET.x = getHeightAtOffset(scene, wagon, 0.28) - 0.06;
        AXLE_OFFSET.y = getHeightAtOffset(scene, wagon, -0.22) - 0.06;
    } else {
        AXLE_OFFSET.set(0, 0);
    }

    const angle = (time.elapsed * wagon.props.speed * 0.005) % (Math.PI * 2);
    const { kfs } = wagon.animState;
    adjustAxletreesBones(kfs[0], AXLE_OFFSET, angle);
    adjustAxletreesBones(kfs[1], AXLE_OFFSET, angle);
}

const POSITION = new THREE.Vector3();
const TMP_POS = new THREE.Vector3();

function getHeightAtOffset(scene: Scene, wagon: Actor, offset: number) {
    POSITION.copy(wagon.physics.position);
    TMP_POS.set(0, 0.5, offset);
    TMP_POS.applyQuaternion(wagon.physics.orientation);
    POSITION.add(TMP_POS);
    const h = (scene.scenery as IsoScenery).physics.getFloorHeight(POSITION);
    if (h < 0) {
        return 0;
    }
    return h - wagon.physics.position.y;
}

const axleAxis = new THREE.Vector3(1, 0, 0);

function adjustAxletreesBones(keyframe: KeyFrame, axleOffset: THREE.Vector2, angle: number) {
    if (!keyframe) {
        return;
    }

    const boneframes = keyframe.boneframes;
    boneframes[1].pos.set(0, axleOffset.x, 0);
    boneframes[1].type = 1;
    boneframes[2].pos.set(0, axleOffset.y, 0);
    boneframes[2].type = 1;
    boneframes[3].quat.setFromAxisAngle(axleAxis, angle);
    boneframes[4].quat.setFromAxisAngle(axleAxis, angle);
}

const UGRailLayout = {
    /** Undergas mine rails **/
    // Straight
    NORTH_SOUTH:           14,
    WEST_EAST:             15,
    UP_NORTH:              58,
    UP_SOUTH:              59,
    UP_EAST:               52,
    UP_WEST:               57,
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
            case UGRailLayout.UP_EAST:                  return RailLayout.UP_EAST;
            case UGRailLayout.UP_WEST:                  return RailLayout.UP_WEST;
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
