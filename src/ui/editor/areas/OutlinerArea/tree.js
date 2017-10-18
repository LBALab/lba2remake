import {SceneNode} from './nodes/scene';
import {LocationsNode} from './nodes/locations';
import {GameNode} from './nodes/game';

const OutlinerTree = {
    name: 'Data',
    children: [
        SceneNode,
        GameNode,
        LocationsNode
    ]
};

export default OutlinerTree;