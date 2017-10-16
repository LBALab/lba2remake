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
        return value.selected !== (DebugData.selection.zone === idx);
    },
    getChild: (idx) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            const zone = scene.zones[idx];
            return {
                name: `zone_${idx}`,
                props: {
                    type: ZONE_TYPE[zone.props.type],
                },
                selected: DebugData.selection.zone === idx,
                onClick: () => {DebugData.selection.zone = idx},
                children: []
            };
        }
    }
};
