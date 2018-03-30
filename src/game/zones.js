import * as THREE from 'three';
import {createBoundingBox} from '../utils/rendering';
import {getObjectName} from '../ui/editor/DebugData';

/*
const ZONE_TYPE = {
    CUBE:       0,
    CAMERA:     1,
    SCENERIC:   2,
    FRAGMENT:   3,
    BONUS:      4,
    TEXT:       5,
    LADDER:     6,
    CONVEYOR:   7,
    SPIKE:      8,
    RAIL:       9
};
*/

const ZONE_TYPE_MATERIAL_COLOR = [
    '#84ff84',
    '#ff8000',
    '#6495ed',
    '#ff00ff',
    '#ffff6c',
    '#00ff00',
    '#5555ff',
    '#96c09f',
    '#ffc475',
    '#008000',
];

export function loadZone(props, callback) {
    const pos = props.pos;
    const zone = {
        type: 'zone',
        index: props.index,
        props,
        color: new THREE.Color(ZONE_TYPE_MATERIAL_COLOR[props.type]),
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2])
        }
    };

    const {xMin, yMin, zMin, xMax, yMax, zMax} = props.box;
    const bb = new THREE.Box3(
        new THREE.Vector3(xMin, yMin, zMin),
        new THREE.Vector3(xMax, yMax, zMax)
    );
    const bbGeom = createBoundingBox(bb, zone.color);
    bbGeom.name = `zone:${getObjectName('zone', props.sceneIndex, props.index)}`;
    bbGeom.visible = false;
    bbGeom.position.set(zone.physics.position.x, zone.physics.position.y, zone.physics.position.z);
    bbGeom.matrixAutoUpdate = false;
    zone.threeObject = bbGeom;

    callback(null, zone);
}
