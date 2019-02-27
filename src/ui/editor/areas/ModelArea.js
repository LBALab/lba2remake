import Model from './ModelArea/content';
import {Orientation, Type} from '../layout';
import {ModelsOutliner, AnimationsOutliner} from './OutlinerArea';
import InspectorArea from './InspectorArea';

const IslandArea = {
    id: 'model',
    name: 'Model Editor',
    icon: 'model.png',
    content: Model,
    mainArea: true,
    getInitialState: () => ({}),
    stateHandler: {},
    toolAreas: [
        ModelsOutliner,
        AnimationsOutliner,
        InspectorArea
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.HORIZONTAL,
        splitAt: 70,
        children: [
            { type: Type.AREA, content_id: 'model', root: true },
            {
                type: Type.LAYOUT,
                orientation: Orientation.HORIZONTAL,
                splitAt: 50,
                children: [
                    { type: Type.AREA, content_id: 'models_list' },
                    { type: Type.AREA, content_id: 'anims_list' }
                ]
            }
        ]
    }
};

export default IslandArea;
