import {SceneNode} from './nodes/scene';
import {LocationsNode} from './nodes/locations';

const OutlinerTree = {
    name: 'Data',
    children: [
        SceneNode,
        LocationsNode
    ]
};

export default OutlinerTree;