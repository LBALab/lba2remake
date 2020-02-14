import {makeOutlinerArea} from '../../utils/outliner';
import LibrariesNode from './LibrariesNode';

const LibrariesBrowserArea = makeOutlinerArea('libraries_browser', 'Libraries', LibrariesNode, {
    icon: 'folder.png',
    style: {
        background: '#111111'
    },
    hideRoot: true
});

export default LibrariesBrowserArea;
