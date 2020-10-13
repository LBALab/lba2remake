import IslandEditorContent from './IslandEditorContent';
import IslandEditorSettings from './IslandEditorSettings';
import {Orientation, Type} from '../../layout';
import {
    IslandsBrowserArea,
} from './browser/IslandsBrowserArea';
import InspectorArea from '../shared/InspectorArea/InspectorArea';
import PaletteArea from '../gameplay/palette/PaletteArea';

const IslandEditor = {
    id: 'island',
    name: 'Island Editor',
    icon: 'islands.png',
    content: IslandEditorContent,
    settings: IslandEditorSettings,
    mainArea: true,
    getInitialState: () => ({
        island: 'CITADEL',
        wireframe: false,
        fog: false,
    }),
    stateHandler: {
        setWireframe(wireframe) {
            this.setState({ wireframe });
        },
        setFog(fog) {
            this.setState({ fog });
        },
        setName(name) {
            this.setState({
                name,
            });
        },
    },
    toolAreas: [
        IslandsBrowserArea,
        InspectorArea,
        PaletteArea,
    ],
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.HORIZONTAL,
        splitAt: 70,
        children: [
            { type: Type.AREA, content_id: 'island', root: true },
            {
                type: Type.LAYOUT,
                orientation: Orientation.VERTICAL,
                splitAt: 50,
                children: [
                    { type: Type.AREA, content_id: 'islands' },
                ]
            }
        ]
    }
};

export default IslandEditor;
