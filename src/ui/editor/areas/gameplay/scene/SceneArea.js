import { makeOutlinerArea } from '../../utils/outliner';
import SceneNode from './SceneNode';

const SceneArea = makeOutlinerArea('scene_outliner', 'Scene', SceneNode, {
    icon: 'scene.png'
});

export default SceneArea;
