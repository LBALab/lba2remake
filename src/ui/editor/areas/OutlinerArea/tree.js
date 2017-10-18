import {SceneNode} from './nodes/scene';
import {LocationsNode} from './nodes/locations';
import {GameNode} from './nodes/game';

const OutlinerTree = {
    name: 'Data',
    children: [
        GameNode,
        SceneNode,
        LocationsNode
    ]
};

export default OutlinerTree;