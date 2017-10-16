import DebugData from '../../../DebugData';

export const PointsNode = {
    name: 'Points',
    dynamic: true,
    getNumChildren: () => {
        const scene = DebugData.scope.scene;
        return scene ? scene.points.length : 0;
    },
    childNeedsUpdate: () => {
        return false;
    },
    getChild: (idx) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            return {
                name: `point_${idx}`,
                children: []
            };
        }
    }
};