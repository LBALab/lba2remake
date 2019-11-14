import {makeOutlinerArea} from '../../utils/outliner';
import EntitiesNode from './EntitiesNode';
import BodiesNode from './BodiesNode';
import AnimsNode from './AnimsNode';

export const EntityBrowserArea = makeOutlinerArea('entities', 'Entities', EntitiesNode, {
    icon: 'folder.png',
    style: {
        background: '#111111'
    },
    hideRoot: true
});

export const BodyBrowserArea = makeOutlinerArea('bodies', 'Bodies', BodiesNode, {
    icon: 'folder.png',
    style: {
        background: '#110000'
    },
    hideRoot: true
});

export const AnimBrowserArea = makeOutlinerArea('anims', 'Anims', AnimsNode, {
    icon: 'folder.png',
    style: {
        background: '#000011'
    },
    hideRoot: true
});
