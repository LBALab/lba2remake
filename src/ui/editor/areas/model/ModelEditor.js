import ModelEditorContent from './ModelEditorContent';
import {Orientation, Type} from '../../layout';
import ModelsBrowserArea from './models/ModelsBrowserArea';
import InspectorArea from '../shared/InspectorArea/InspectorArea';

const ModelEditor = {
    id: 'model',
    name: 'Model Editor',
    icon: 'model.png',
    content: ModelEditorContent,
    mainArea: true,
    getInitialState: () => ({
        entity: 0,
        body: 0,
        anim: 0
    }),
    stateHandler: {
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
