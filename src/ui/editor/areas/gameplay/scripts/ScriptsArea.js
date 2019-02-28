import ScriptsAreaContent from './ScriptsAreaContent';
import ScriptsAreaMenu from './ScriptsAreaMenu';

const ScriptsArea = {
    id: 'script_editor',
    name: 'Scripts',
    menu: ScriptsAreaMenu,
    icon: 'script.png',
    content: ScriptsAreaContent,
    getInitialState: () => ({
        autoScroll: true,
        actorIndex: 0,
    }),
    stateHandler: {
        splitAt(splitAt) {
            this.setState({splitAt});
        },
        setAutoScroll(autoScroll) {
            this.setState({autoScroll});
        },
        setActor(actor) {
            this.setState({actor});
        }
    }
};

export default ScriptsArea;
