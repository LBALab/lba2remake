import DebugData from '../../../DebugData';

export function SceneGraphNode(threeNode, idx) {
    return {
        name: `THREE.${threeNode.type}${idx ? '[' + (threeNode.name ? threeNode.name : idx) + ']' : ''}`,
        dynamic: true,
        getNumChildren: () => {
            return threeNode ? threeNode.children.length : 0;
        },
        childNeedsUpdate: (idx, value) => {
            return value.type !== threeNode.type
                || value.name !== threeNode.name;
        },
        getChild: (idx) => {
            const scene = DebugData.scope.scene;
            if (scene) {
                return SceneGraphNode(threeNode.children[idx], idx);
            }
        }
    }
}