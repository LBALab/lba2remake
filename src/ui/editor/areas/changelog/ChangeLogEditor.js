import ChangeLogEditorContent from './ChangeLogEditorContent';
import {Orientation, Type} from '../../layout';

const ChangeLogEditor = {
    id: 'changelog',
    name: 'Change Log',
    content: ChangeLogEditorContent,
    mainArea: true,
    icon: 'changelog.png',
    getInitialState: () => ({}),
    stateHandler: {},
    defaultLayout: {
        type: Type.LAYOUT,
        orientation: Orientation.VERTICAL,
        splitAt: 100,
        children: [
            { type: Type.AREA, content_id: 'changelog', root: true }
        ]
    }
};

export default ChangeLogEditor;
