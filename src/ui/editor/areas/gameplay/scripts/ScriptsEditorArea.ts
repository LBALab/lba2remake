import ScriptsEditorContent from './ScriptsEditorContent';

const ScriptsEditorArea = {
    id: 'scripts_editor_v2',
    replaces: 'scripts_editor',
    name: 'Scripts',
    icon: 'scripts.svg',
    content: ScriptsEditorContent,
    getInitialState: () => ({
        actorIndex: 0,
        mode: 'blocks'
    }),
    stateHandler: {
        setActor(actorIndex) {
            this.setState({actorIndex});
        },
        switchMode() {
            if (this.state.mode === 'blocks') {
                this.setState({mode: 'text'});
            } else {
                this.setState({mode: 'blocks'});
            }
        }
    }
};

export default ScriptsEditorArea;
