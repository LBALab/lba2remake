import {findIndex} from 'lodash';
import {WatcherContent} from './WatcherArea/content';

const WatcherArea = {
    id: 'watcher',
    name: 'Watcher',
    icon: 'terminal.png',
    content: WatcherContent,
    getInitialState: () => ({
        path: [],
        watches: []
    }),
    stateHandler: {
        setPath(path) {
            this.setState({path});
        },
        addWatch(path) {
            const watches = this.state.watches || [];
            const id = new Date().getTime();
            watches.push({
                id,
                path
            });
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

export default WatcherArea;
