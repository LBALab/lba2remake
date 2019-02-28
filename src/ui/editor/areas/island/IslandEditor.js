import IslandEditorContent from './IslandEditorContent';
import {Orientation, Type} from '../../layout';
import IslandBrowserArea from './browser/IslandBrowserArea';

const IslandEditor = {
    id: 'island',
    name: 'Island Editor',
    content: IslandEditorContent,
    mainArea: true,
    getInitialState: () => ({}),
    stateHandler: {},
    toolAreas: [
        IslandBrowserArea
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

export default IslandEditor;
