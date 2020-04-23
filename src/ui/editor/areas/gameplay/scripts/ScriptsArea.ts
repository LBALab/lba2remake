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
        refreshing: false
    }),
    stateHandler: {
        setRefreshing(refreshing) {
            this.setState({refreshing});
        },
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
