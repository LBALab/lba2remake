import BlocklyAreaContent from './BlocklyAreaContent';

const BlocklyArea = {
    id: 'blockly_editor',
    name: 'Scripts (blockly)',
    icon: 'blockly.svg',
    content: BlocklyAreaContent,
    getInitialState: () => ({
        actorIndex: 0,
    }),
    stateHandler: {
        setActor(actorIndex) {
            this.setState({actorIndex});
        }
    }
};

export default BlocklyArea;
