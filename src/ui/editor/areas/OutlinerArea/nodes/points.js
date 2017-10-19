import DebugData, {getObjectName, renameObject} from '../../../DebugData';
import {SceneGraphNode} from './sceneGraph';

const Point = {
    dynamic: true,
    needsData: true,
    allowRenaming: () => true,
    rename: (point, newName) => {
        renameObject('point', point.props.sceneIndex, point.index, newName);
    },
    name: (point) => getObjectName('point', point.props.sceneIndex, point.index),
    numChildren: (point) => point.threeObject ? 1 : 0,
    child: () => SceneGraphNode,
    childData: (point) => point.threeObject,
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
    hasChanged: (scene) => scene.index !== DebugData.scope.scene.index,
    onClick: (scene, setRoot) => {
        if (scene.isActive) {
            setRoot();
        }
    }
};
