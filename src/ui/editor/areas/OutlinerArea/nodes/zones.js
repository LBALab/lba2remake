import React from 'react';
import DebugData, {getObjectName, renameObject, locateObject} from '../../../DebugData';
import {SceneGraphNode} from './sceneGraph';

const ZONE_TYPE = [
    'CUBE',
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

const Zone = {
    dynamic: true,
    needsData: true,
    allowRenaming: () => true,
    rename: (zone, newName) => {
        renameObject('zone', zone.props.sceneIndex, zone.index, newName);
    },
    ctxMenu: [
        {
            name: 'Locate',
            onClick: (component, zone) => locateObject(zone)
        }
    ],
    name: zone => getObjectName('zone', zone.props.sceneIndex, zone.index),
    icon: () => 'editor/icons/zone2.png',
    props: zone => [
        {
            id: 'type',
            value: ZONE_TYPE[zone.props.type],
            render: (value) => {
                const {r, g, b} = zone.color;
                const color = `rgba(${Math.floor(r * 256)},${Math.floor(g * 256)},${Math.floor(b * 256)},1)`;
                let label = `${value} (${zone.props.snap})`;
                switch (value) {
                    case 'CUBE':
                        label = `GOTO -> ${zone.props.snap}`;
                        break;
                    case 'TEXT':
                        label = DebugData.scope.scene.data.texts[zone.props.snap].value;
                        break;
                }
                return <span style={{color}}>{label}</span>;
            }
        },
    ],
    numChildren: zone => (zone.threeObject ? 1 : 0),
    child: () => SceneGraphNode,
    childData: zone => zone.threeObject,
    selected: zone => DebugData.selection.zone === zone.index,
    onClick: (zone) => { DebugData.selection.zone = zone.index; },
    onDoubleClick: locateObject
};

export const ZonesNode = {
    dynamic: true,
    needsData: true,
    name: () => 'Zones',
    icon: () => 'editor/icons/zone.png',
    numChildren: scene => scene.zones.length,
    child: () => Zone,
    childData: (scene, idx) => scene.zones[idx],
    hasChanged: scene => scene.index !== DebugData.scope.scene.index,
    onClick: (scene, setRoot) => {
        if (scene.isActive) {
            setRoot();
        }
    }
};
