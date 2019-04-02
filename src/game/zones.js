import * as THREE from 'three';
import {getObjectName} from '../ui/editor/DebugData';
import {createBoundingBox} from '../utils/rendering';
import {createZoneLabel} from '../ui/editor/labels';

const ZONE_TYPE = [
    'GOTO_SCENE',
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

export function loadZone(props, is3DCam) {
    const pos = props.pos;
    const zone = {
        type: 'zone',
        zoneType: ZONE_TYPE[props.type],
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
    const name = getObjectName('zone', props.sceneIndex, props.index);
    bbGeom.name = `zone:${name}`;
    bbGeom.visible = false;
    bbGeom.position.set(zone.physics.position.x, zone.physics.position.y, zone.physics.position.z);
    bbGeom.matrixAutoUpdate = false;
    zone.threeObject = bbGeom;
    createZoneLabel(zone, name, is3DCam);

    return zone;
}
