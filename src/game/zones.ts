import THREE from 'three';
import {cloneDeep} from 'lodash';
import {getObjectName} from '../ui/editor/DebugData';
import {createBoundingBox} from '../utils/rendering';
import {createZoneLabel} from '../ui/editor/labels';

export const ZONE_TYPE = [
    'TELEPORT',
    'CAMERA',
    'SCENERIC',
    'FRAGMENT',
    'BONUS',
    'TEXT',
    'LADDER',
    'CONVEYOR',
    'SPIKE',
    'RAIL'
];

const ZONE_TYPE_MATERIAL_COLOR = [
    '#84ff84', // TELEPORT
    '#ffb200', // CAMERA
    '#6495ed', // SCENERIC
    '#ff00ff', // FRAGMENT
    '#e7b5d6', // BONUS
    '#ff7448', // TEXT
    '#5555ff', // LADDER
    '#96c09f', // CONVEYOR
    '#ffc475', // SPIKE
    '#008000', // RAIL
];

export function loadZone(props, is3DCam) {
    const pos = props.pos;
    const zone = {
        type: 'zone',
        zoneType: ZONE_TYPE[props.type],
        index: props.index,
        props: cloneDeep(props),
        color: new THREE.Color(ZONE_TYPE_MATERIAL_COLOR[props.type]),
        physics: {
            position: new THREE.Vector3(pos[0], pos[1], pos[2])
        },
        threeObject: null,
        boundingBox: null
    };

    const {xMin, yMin, zMin, xMax, yMax, zMax} = props.box;
    const bb = new THREE.Box3(
        new THREE.Vector3(xMin, yMin, zMin),
        new THREE.Vector3(xMax, yMax, zMax)
    );
    const bbGeom = createBoundingBox(bb, zone.color);
    const name = getObjectName('zone', props.sceneIndex, props.index);
    bbGeom.name = `zone:${name}`;
    bbGeom.visible = false;
    bbGeom.position.set(zone.physics.position.x, zone.physics.position.y, zone.physics.position.z);
    bbGeom.matrixAutoUpdate = false;
    zone.threeObject = bbGeom;
    const width = bb.max.x - bb.min.x;
    const height = bb.max.y - bb.min.y;
    const depth = bb.max.z - bb.min.z;
    zone.boundingBox = new THREE.Box3(
        new THREE.Vector3(-width * 0.5, -height * 0.5, -depth * 0.5),
        new THREE.Vector3(width * 0.5, height * 0.5, depth * 0.5)
    );
    createZoneLabel(zone, name, is3DCam);

    return zone;
}
