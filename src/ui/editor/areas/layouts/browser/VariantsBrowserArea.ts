import {makeOutlinerArea} from '../../utils/outliner';
import VariantsNode from './VariantsNode';

const VariantsBrowserArea = makeOutlinerArea('variants_browser', 'Variants', VariantsNode, {
    icon: 'folder.png',
    style: {
        background: '#111111'
    },
    hideRoot: true
});

export default VariantsBrowserArea;
