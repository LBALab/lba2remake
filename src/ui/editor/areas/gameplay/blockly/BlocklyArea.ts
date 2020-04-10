import BlocklyAreaContent from './BlocklyAreaContent';

const BlocklyArea = {
    id: 'blockly_editor',
    name: 'Blockly Scripts',
    icon: 'blockly.svg',
    content: BlocklyAreaContent,
    getInitialState: () => ({
        autoScroll: false,
        objectLabels: false,
        actorIndex: 0,
    }),
    stateHandler: {
        splitAt(splitAt) {
            this.setState({splitAt});
        },
        setAutoScroll(autoScroll) {
            this.setState({autoScroll});
        },
        setObjectLabels(objectLabels) {
            this.setState({objectLabels});
        },
        setActor(actorIndex) {
            this.setState({actorIndex});
        }
    }
};

export default BlocklyArea;
