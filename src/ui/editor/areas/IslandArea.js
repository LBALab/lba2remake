import Island from './IslandArea/content';
import {Orientation, Type} from '../layout';
import {IslandOutliner} from './OutlinerArea';

const IslandArea = {
    id: 'island',
    name: 'Island Editor',
    content: Island,
    mainArea: true,
    getInitialState: () => ({}),
    stateHandler: {},
    toolAreas: [
        IslandOutliner
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.VERTICAL,
        splitAt: 70,
        children: [
            { type: Type.AREA, content_id: 'island', root: true },
            { type: Type.AREA, content_id: 'islands_list' }
        ]
    }
};

export default IslandArea;
