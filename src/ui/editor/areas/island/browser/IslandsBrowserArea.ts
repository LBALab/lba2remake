import {makeOutlinerArea} from '../../utils/outliner';
import IslandsNode from './IslandsNode';

export const IslandsBrowserArea = makeOutlinerArea('islands', 'Islands', IslandsNode, {
    icon: 'folder.png',
    style: {
        background: '#111111'
    },
    hideRoot: true
});
