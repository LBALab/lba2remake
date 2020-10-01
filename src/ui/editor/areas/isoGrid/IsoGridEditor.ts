import IsoGridEditorContent from './IsoGridEditorContent';
import IsoGridEditorSettings from './IsoGridEditorSettings';
import {Orientation, Type} from '../../layout';
import InspectorArea from '../shared/InspectorArea/InspectorArea';
import IsoBrowserArea from './browser/IsoBrowserArea';

const IsoGridEditor = {
    id: 'iso_grid',
    name: 'Iso Grids Editor',
    icon: 'layout.png',
    content: IsoGridEditorContent,
    settings: IsoGridEditorSettings,
    mainArea: true,
    getInitialState: () => ({
        cam: 0,
        isoGridIdx: 0
    }),
    stateHandler: {
        setCam(cam) {
            this.setState({cam});
        },
        setIsoGridIdx(isoGridIdx) {
            this.setState({isoGridIdx});
        }
    },
    toolAreas: [
        IsoBrowserArea,
        InspectorArea
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.HORIZONTAL,
        splitAt: 70,
        children: [
            { type: Type.AREA, content_id: 'iso_grid', root: true },
            { type: Type.AREA, content_id: 'iso_browser' }
        ]
    }
};

export default IsoGridEditor;
