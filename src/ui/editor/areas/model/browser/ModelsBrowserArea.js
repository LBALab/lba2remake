import {makeOutlinerArea} from '../../utils/outliner';
import EntitiesNode from './EntitiesNode';
import BodiesNode from './BodiesNode';
import AnimsNode from './AnimsNode';

export const EntityBrowserArea = makeOutlinerArea('entities', 'Entities', EntitiesNode, {
    name: 'Entities',
    icon: 'folder.png'
});

export const BodyBrowserArea = makeOutlinerArea('bodies', 'Bodies', BodiesNode, {
    name: 'Bodies',
    icon: 'folder.png'
});

export const AnimBrowserArea = makeOutlinerArea('anims', 'Anims', AnimsNode, {
    name: 'Anims',
    icon: 'folder.png'
});
