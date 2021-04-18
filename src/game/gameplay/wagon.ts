import * as THREE from 'three';
import Actor from '../Actor';
import Scene from '../Scene';
import IsoSceneryPhysics from '../scenery/isometric/IsoSceneryPhysics';
import { Time } from '../../datatypes';

const RailLayout = {
    /** Temple of Bu rails **/
    // Straight
    NORTH_SOUTH:           54,
    EAST_WEST:             53,
    UP_NORTH:              63,
    UP_SOUTH:              65,
    UP_EAST:               66,
    UP_WEST:               64,
    // Turns
    TURN_NORTH_EAST:       51,
    TURN_NORTH_WEST:       50,
    TURN_SOUTH_EAST:       49,
    TURN_SOUTH_WEST:       52,
    // Turnouts
    TO_NORTH_NORTH_EAST:   56,
    TO_NORTH_NORTH_WEST:   55,
    TO_SOUTH_SOUTH_EAST:   57,
    TO_SOUTH_SOUTH_WEST:   58,
    TO_WEST_WEST_SOUTH:    59,
    TO_WEST_WEST_NORTH:    60,
    TO_EAST_EAST_SOUTH:    61,
    TO_EAST_EAST_NORTH:    62,

    /** Undergas mine rails **/
    // Straight
    U_NORTH_SOUTH:           14,
    U_EAST_WEST:             15,
    U_UP_NORTH:              58,
    U_UP_SOUTH:              59,
    U_UP_EAST:               52,
    U_UP_WEST:               57,
    // Turns
    U_TURN_NORTH_EAST:       16,
    U_TURN_NORTH_WEST:       18,
    U_TURN_SOUTH_EAST:       19,
    U_TURN_SOUTH_WEST:       17,
    // Turnouts
    U_TO_NORTH_NORTH_EAST:   66,
    U_TO_NORTH_NORTH_WEST:   67,
    U_TO_SOUTH_SOUTH_EAST:   50,
    U_TO_SOUTH_SOUTH_WEST:   60,
    U_TO_WEST_WEST_SOUTH:    21,
    U_TO_WEST_WEST_NORTH:    20,
    U_TO_EAST_EAST_SOUTH:    62,
    U_TO_EAST_EAST_NORTH:    64,
};

const wEuler = new THREE.Euler();

export function computeWagonMovement(scene: Scene, wagon: Actor, time: Time) {
    if (!(scene.scenery.physics instanceof IsoSceneryPhysics)) {
        return;
    }

    let straight = false;
    let turn = false;
    let x = 0;
    let z = 0;
    let angle = 0;
    const layout = scene.scenery.physics.getLayoutIndex(wagon.physics.position);
    wagon.debugData.rail = layout;
    wagon.debugData.railName = Object.keys(RailLayout).find(k => RailLayout[k] === layout);
    switch (layout) {
        case RailLayout.NORTH_SOUTH:
        case RailLayout.U_NORTH_SOUTH:
            straight = true;
            x = 1;
            break;
        case RailLayout.EAST_WEST:
        case RailLayout.U_EAST_WEST:
            straight = true;
            z = -1;
            break;
        case RailLayout.TURN_SOUTH_EAST:
        case RailLayout.U_TURN_SOUTH_EAST:
            turn = true;
            x = 1;
            angle = Math.PI / 2;
            break;
        case RailLayout.TURN_SOUTH_WEST:
        case RailLayout.U_TURN_SOUTH_WEST:
            turn = true;
            x = 1;
            angle = Math.PI / 2;
            break;
        case RailLayout.TURN_NORTH_EAST:
        case RailLayout.U_TURN_NORTH_EAST:
            turn = true;
            z = 1;
            angle = Math.PI;
            break;
    }
    if (straight || turn) {
        const speed = time.delta;
        const speedX = x * speed;
        const speedZ = z * speed;
        wagon.physics.temp.position.x += speedX;
        wagon.physics.temp.position.z += speedZ;
    }
    if (turn) {
        wagon.physics.temp.angle = angle;
        wEuler.set(0, angle, 0, 'XZY');
        wagon.physics.orientation.setFromEuler(wEuler);
    }
}
