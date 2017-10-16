import DebugData from '../../../DebugData';

export const PointsNode = {
    name: 'Points',
    dynamic: true,
    getNumChildren: () => {
        const scene = DebugData.scope.scene;
        return scene ? scene.points.length : 0;
    },
    childNeedsUpdate: (idx, value) => {
        return value.selected !== (DebugData.selection.point === idx);
    },
    getChild: (idx) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            return {
                name: `point_${idx}`,
                selected: DebugData.selection.point === idx,
                onClick: () => {DebugData.selection.point = idx},
                children: []
            };
        }
    }
};