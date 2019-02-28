import ModelEditorContent from './ModelEditorContent';
import {Orientation, Type} from '../../layout';
import ModelsBrowserArea from './models/ModelsBrowserArea';
import AnimsBrowserArea from './anims/AnimsBrowserArea';
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
        AnimsBrowserArea,
        InspectorArea
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.HORIZONTAL,
        splitAt: 75,
        children: [
            { type: Type.AREA, content_id: 'model', root: true },
            {
                type: Type.LAYOUT,
                orientation: Orientation.VERTICAL,
                splitAt: 60,
                children: [
                    { type: Type.AREA, content_id: 'models_list' },
                    { type: Type.AREA, content_id: 'anims_list' }
                ]
            }
        ]
    }
};

export default ModelEditor;
