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
        addWatch() {

        },
        removeWatch() {

        }
    }
};

export default WatcherArea;
