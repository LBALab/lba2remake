import ModelEditorContent from './ModelEditorContent';
import ModelEditorMenu from './ModelEditorMenu';
import {Orientation, Type} from '../../layout';
import ModelsBrowserArea from './browser/ModelsBrowserArea';
import TimelineArea from './timeline/TimelineArea';
import InspectorArea from '../shared/InspectorArea/InspectorArea';

const ModelEditor = {
    id: 'model',
    name: 'Model Editor',
    icon: 'model.png',
    content: ModelEditorContent,
    menu: ModelEditorMenu,
    mainArea: true,
    getInitialState: () => ({
        entity: 0,
        body: 0,
        anim: 0,
        rotateView: true
    }),
    stateHandler: {
        setRotateView(rotateView) {
            this.setState({ rotateView });
        },
        setEntity(entity) {
            this.setState({
                entity,
                body: 0,
                anim: 0
            });
        },
        setBody(entity, body) {
            if (entity !== this.state.entity) {
                this.setState({ entity, body, anim: 0 });
            } else {
                this.setState({ entity, body });
            }
        },
        setAnim(entity, anim) {
            if (entity !== this.state.entity) {
                this.setState({ entity, anim, body: 0 });
            } else {
                this.setState({ entity, anim });
            }
        }
    },
    toolAreas: [
        ModelsBrowserArea,
        TimelineArea,
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
