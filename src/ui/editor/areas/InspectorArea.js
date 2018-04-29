import {findIndex, find} from 'lodash';
import {InspectorContent} from './InspectorArea/content';

const InspectorArea = {
    id: 'inspector',
    replaces: 'dbg_hud',
    name: 'Inspector',
    icon: 'terminal.png',
    content: InspectorContent,
    getInitialState: () => ({
        path: [],
        watches: [],
        tab: 'explore'
    }),
    stateHandler: {
        setTab(tab) {
            this.setState({tab});
        },
        setPath(path) {
            this.setState({path});
        },
        addWatch(path, bindings, editId, rootName) {
            const watches = this.state.watches || [];
            if (editId) {
                const watch = find(watches, w => w.id === editId);
                if (watch) {
                    watch.path = path;
                    Object.assign(watch.bindings || {}, bindings);
                }
            } else {
                const id = new Date().getTime();
                watches.push({
                    id,
                    path,
                    bindings,
                    rootName
                });
            }
            this.setState({watches});
        },
        removeWatch(id) {
            const watches = this.state.watches || [];
            const idx = findIndex(watches, w => w.id === id);
            if (idx !== -1) {
                watches.splice(idx, 1);
            }
            this.setState({watches});
        }
    }
};

export default InspectorArea;
