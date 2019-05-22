import IslandEditorContent from './IslandEditorContent';
import IslandEditorSettings from './IslandEditorSettings';
import {Orientation, Type} from '../../layout';
import {
    IslandsBrowserArea,
} from './browser/IslandsBrowserArea';

const IslandEditor = {
    id: 'island',
    name: 'Island Editor',
    icon: 'model.png',
    content: IslandEditorContent,
    settings: IslandEditorSettings,
    mainArea: true,
    getInitialState: () => ({
        entity: 'CITADEL',
        rotateView: true,
        wireframe: false,
        grid: true
    }),
    stateHandler: {
        setRotateView(rotateView) {
            this.setState({ rotateView });
        },
        setWireframe(wireframe) {
            this.setState({ wireframe });
        },
        setGrid(grid) {
            this.setState({ grid });
        },
        setEntity(entity) {
            this.setState({
                entity,
            });
        },
    },
    toolAreas: [
        IslandsBrowserArea,
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
