import DebugData, {getObjectName, renameObject, locateObject} from '../../../DebugData';
import {SceneGraphNode} from './sceneGraph';

const Point = {
    dynamic: true,
    needsData: true,
    allowRenaming: () => true,
    rename: (point, newName) => {
        renameObject('point', point.props.sceneIndex, point.index, newName);
    },
    ctxMenu: [
        {
            name: 'Locate',
            onClick: (component, point) => locateObject(point)
        }
    ],
    name: point => getObjectName('point', point.props.sceneIndex, point.index),
    icon: () => 'editor/icons/point2.png',
    numChildren: point => (point.threeObject ? 1 : 0),
    child: () => SceneGraphNode,
    childData: point => point.threeObject,
    selected: point => DebugData.selection.point === point.index,
    onClick: (point) => { DebugData.selection.point = point.index; },
    onDoubleClick: locateObject
};

export const PointsNode = {
    dynamic: true,
    needsData: true,
    name: () => 'Points',
    icon: () => 'editor/icons/point.png',
    numChildren: scene => scene.points.length,
    child: () => Point,
    childData: (scene, idx) => scene.points[idx],
    hasChanged: scene => scene.index !== DebugData.scope.scene.index,
    onClick: (scene, setRoot) => {
        if (scene.isActive) {
            setRoot();
        }
    }
};
