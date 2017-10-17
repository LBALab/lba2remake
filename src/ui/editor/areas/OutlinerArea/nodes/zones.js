import React from 'react';
import DebugData from '../../../DebugData';

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

export const ZonesNode = {
    name: 'Zones',
    dynamic: true,
    getNumChildren: () => {
        const scene = DebugData.scope.scene;
        return scene ? scene.zones.length : 0;
    },
    childNeedsUpdate: (idx, value) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            const zone = scene.zones[idx];
            return value.props[0].value !== ZONE_TYPE[zone.props.type]
                || value.selected !== (DebugData.selection.zone === idx)
                || value.snap !== zone.props.snap;
        }
        return true;
    },
    getChild: (idx) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            const zone = scene.zones[idx];
            return {
                name: `zone_${idx}`,
                props: [
                    {id: 'type', value: ZONE_TYPE[zone.props.type]},
                ],
                renderProp: (id, value) => {
                    const {r, g, b} = zone.color;
                    const color = `rgba(${Math.floor(r * 256)},${Math.floor(g * 256)},${Math.floor(b * 256)},1)`;
                    let label = value;
                    switch (value) {
                        case 'CUBE':
                            label = `GOTO -> ${zone.props.snap}`;
                            break;
                        case 'TEXT':
                            label = scene.data.texts[zone.props.snap].value;
                            break;
                    }
                    return <span style={{color}}>{label}</span>;
                },
                snap: zone.props.snap,
                selected: DebugData.selection.zone === idx,
                onClick: () => {DebugData.selection.zone = idx},
                children: []
            };
        }
    }
};
