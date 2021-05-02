import IsoGridEditorContent from './IsoGridEditorContent';
import IsoGridEditorSettings from './IsoGridEditorSettings';
import {Orientation, Type} from '../../layout';
import InspectorArea from '../shared/InspectorArea/InspectorArea';
import IsoBrowserArea from './browser/IsoBrowserArea';
import PaletteArea from '../gameplay/palette/PaletteArea';
import SceneGraphArea from '../gameplay/sceneGraph/SceneGraphArea';

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
            if (cam === 2) {
                // Skip saving state if using free camera to
                // prevent bug when loading directly on free cam
                this.state.cam = 2;
            } else {
                this.setState({cam});
            }
        },
        setIsoGridIdx(isoGridIdx) {
            this.setState({isoGridIdx});
        }
    },
    toolAreas: [
        IsoBrowserArea,
        InspectorArea,
        PaletteArea,
        SceneGraphArea
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
