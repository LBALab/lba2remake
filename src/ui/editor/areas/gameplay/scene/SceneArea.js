import { makeOutlinerArea } from '../../utils/outliner';
import SceneNode from './SceneNode';
import { findAllReferences } from './node_factories/variables';

const SceneArea = makeOutlinerArea('scene_outliner', 'Scene', SceneNode, {
    icon: 'scene.png',
    generators: {
        findAllReferences
    }
});

export default SceneArea;
