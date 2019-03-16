import {makeOutlinerArea} from '../../utils/outliner';
import EntitiesNode from './EntitiesNode';
import BodiesNode from './BodiesNode';
import AnimsNode from './AnimsNode';

export const EntityBrowserArea = makeOutlinerArea('entities', 'Entities', EntitiesNode, {
    name: 'Entities',
    icon: 'folder.png',
    style: {
        background: '#111111'
    },
    hideRoot: true
});

export const BodyBrowserArea = makeOutlinerArea('bodies', 'Bodies', BodiesNode, {
    name: 'Bodies',
    icon: 'folder.png',
    style: {
        background: '#110000'
    },
    hideRoot: true
});

export const AnimBrowserArea = makeOutlinerArea('anims', 'Anims', AnimsNode, {
    name: 'Anims',
    icon: 'folder.png',
    style: {
        background: '#000011'
    },
    hideRoot: true
});
