import {WatcherContent} from './WatcherArea/content';

const WatcherArea = {
    id: 'watcher',
    name: 'Watcher',
    icon: 'terminal.png',
    content: WatcherContent,
    getInitialState: () => ({
        path: []
    }),
    stateHandler: {
        setPath(path) {
            this.setState({path});
        }
    }
};

export default WatcherArea;
