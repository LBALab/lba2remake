import {makeOutlinerArea} from '../../utils/outliner';
import LayoutsNode from './LayoutsNode';

const LayoutsBrowserArea = makeOutlinerArea('layouts_browser', 'Layouts', LayoutsNode, {
    icon: 'folder.png',
    style: {
        background: '#111111'
    },
    hideRoot: true
});

export default LayoutsBrowserArea;
