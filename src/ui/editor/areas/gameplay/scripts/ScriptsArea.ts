import ScriptsAreaContent from './ScriptsAreaContent';

const ScriptsArea = {
    id: 'script_editor',
    name: 'Scripts',
    icon: 'script.png',
    content: ScriptsAreaContent,
    getInitialState: () => ({
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
        setActor(actorIndex) {
            this.setState({actorIndex});
        }
    }
};

export default ScriptsArea;
