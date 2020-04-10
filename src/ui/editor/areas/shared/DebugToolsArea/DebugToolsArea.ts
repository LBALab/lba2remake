import {DebugToolsAreaContent} from './DebugToolsAreaContent';

const DebugToolsArea = {
    id: 'dbg_tools',
    replaces: 'dbg_tools',
    name: 'Debug Tools',
    icon: 'terminal.png',
    content: DebugToolsAreaContent,
    getInitialState: () => ({}),
    stateHandler: {}
};

export default DebugToolsArea;
