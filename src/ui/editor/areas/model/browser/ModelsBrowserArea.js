import {makeOutlinerArea} from '../../utils/outliner';
import EntitiesNode from './EntitiesNode';

const ModelsBrowserArea = makeOutlinerArea('models_list', 'Browser', EntitiesNode, {
    name: 'Browser',
    icon: 'folder.png'
});

export default ModelsBrowserArea;
