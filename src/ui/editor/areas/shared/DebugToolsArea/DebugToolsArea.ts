import {DebugToolsAreaContent} from './DebugToolsAreaContent';

const DebugToolsArea = {
    id: 'dbg_tools',
    replaces: 'dbg_tools',
    name: 'Debug Tools',
    icon: 'tools.svg',
    content: DebugToolsAreaContent,
    getInitialState: () => ({}),
    stateHandler: {}
};

export default DebugToolsArea;
