import ChangeLog from './ChangeLogArea/content';
import {Orientation, Type} from '../layout';

const ChangeLogArea = {
    id: 'changelog',
    name: 'Change Log',
    content: ChangeLog,
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

export default ChangeLogArea;
