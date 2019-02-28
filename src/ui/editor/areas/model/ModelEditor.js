import ModelEditorContent from './ModelEditorContent';
import {Orientation, Type} from '../../layout';
import ModelsBrowserArea from './models/ModelsBrowserArea';
import InspectorArea from '../shared/InspectorArea/InspectorArea';

const ModelEditor = {
    id: 'model',
    name: 'Model Editor',
    icon: 'model.png',
    content: ModelEditorContent,
    mainArea: true,
    getInitialState: () => ({}),
    stateHandler: {},
    toolAreas: [
        ModelsBrowserArea,
        InspectorArea
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.HORIZONTAL,
        splitAt: 75,
        children: [
            { type: Type.AREA, content_id: 'model', root: true },
            { type: Type.AREA, content_id: 'models_list' },
        ]
    }
};

export default ModelEditor;
