import DebugData from '../../../DebugData';
import {ActorsNode} from './actors';
import {ZonesNode} from './zones';
import {PointsNode} from './points';
import {SceneGraphNode} from './sceneGraph';

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
        if (scene) {
            if (scene.threeScene) {
                return sceneChildren.length + 1;
            } else {
                return sceneChildren.length;
            }
        } else {
            return 0;
        }
    },
    childNeedsUpdate: () => false,
    getChild: (idx) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            if (idx === 3) {
                return SceneGraphNode(scene.threeScene);
            } else {
                return sceneChildren[idx];
            }
        }
    },
};
