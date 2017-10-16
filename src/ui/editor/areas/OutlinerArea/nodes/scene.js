import DebugData from '../../../DebugData';
import {ActorsNode} from './actors';
import {ZonesNode} from './zones';
import {PointsNode} from './points';

const sceneChildren = [
    ActorsNode,
    ZonesNode,
    PointsNode
];

export const SceneNode = {
    name: 'Scene',
    dynamic: true,
    getNumChildren: () => {
        const scene = DebugData.scope.scene;
        return scene ? sceneChildren.length : 0;
    },
    childNeedsUpdate: () => false,
    getChild: (idx) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            return sceneChildren[idx];
        }
    },
};
