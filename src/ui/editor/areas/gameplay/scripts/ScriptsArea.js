import ScriptsAreaContent from './ScriptsAreaContent';

const ScriptsArea = {
    id: 'script_editor',
    name: 'Scripts',
    icon: 'script.png',
    content: ScriptsAreaContent,
    getInitialState: () => ({
        autoScroll: true,
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

export default ScriptsArea;
