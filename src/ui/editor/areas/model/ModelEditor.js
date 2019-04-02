import ModelEditorContent from './ModelEditorContent';
import ModelEditorSettings from './ModelEditorSettings';
import {Orientation, Type} from '../../layout';
import {
    EntityBrowserArea,
    BodyBrowserArea,
    AnimBrowserArea
} from './browser/ModelsBrowserArea';
import TimelineArea from './timeline/TimelineArea';
import InspectorArea from '../shared/InspectorArea/InspectorArea';

const ModelEditor = {
    id: 'model',
    name: 'Model Editor',
    icon: 'model.png',
    content: ModelEditorContent,
    settings: ModelEditorSettings,
    mainArea: true,
    getInitialState: () => ({
        entity: 0,
        body: 0,
        anim: 0,
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
                body: 0,
                anim: 0
            });
        },
        setBody(body) {
            this.setState({ body });
        },
        setAnim(anim) {
            this.setState({ anim });
        }
    },
    toolAreas: [
        EntityBrowserArea,
        BodyBrowserArea,
        AnimBrowserArea,
        TimelineArea,
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
                orientation: Orientation.VERTICAL,
                splitAt: 50,
                children: [
                    { type: Type.AREA, content_id: 'entities' },
                    {
                        type: Type.LAYOUT,
                        orientation: Orientation.HORIZONTAL,
                        splitAt: 50,
                        children: [
                            { type: Type.AREA, content_id: 'bodies' },
                            { type: Type.AREA, content_id: 'anims' },
                        ]
                    },
                ]
            }
        ]
    }
};

export default ModelEditor;
