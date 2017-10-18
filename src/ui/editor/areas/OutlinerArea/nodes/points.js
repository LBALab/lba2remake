import DebugData from '../../../DebugData';

const Point = {
    dynamic: true,
    needsData: true,
    name: (point) => `point_${point.index}`,
    selected: (point) => DebugData.selection.point === point.index,
    onClick: (point) => {DebugData.selection.point = point.index},
};

export const PointsNode = {
    dynamic: true,
    needsData: true,
    name: () => 'Points',
    numChildren: (scene) => scene.points.length,
    child: () => Point,
    childData: (scene, idx) => scene.points[idx],
    hasChanged: (scene) => scene.index !== DebugData.scope.scene.index
};
