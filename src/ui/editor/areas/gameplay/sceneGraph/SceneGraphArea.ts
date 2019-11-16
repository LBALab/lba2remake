import { makeOutlinerArea } from '../../utils/outliner';
import { SceneGraphRootNode } from './SceneGraphNode';

const SceneGraphArea = makeOutlinerArea('scene_graph', '3D Scene Graph', SceneGraphRootNode, {
    icon: 'graph.png',
    hideRoot: true
});

export default SceneGraphArea;
