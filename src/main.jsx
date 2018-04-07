import React from 'react';
import ReactDOM from 'react-dom';

import Ticker from './ui/utils/Ticker';
import Game from './ui/Game';
import Editor from './ui/Editor';
import Popup from './ui/Popup';
import {loadParams} from './params';
import {loadGameMetaData} from './ui/editor/DebugData';
import {CrashHandler} from './crash_reporting';
import ChangeLog from './ui/ChangeLog';

class Root extends React.Component {
    constructor(props) {
        super(props);
        const params = loadParams();
        this.state = {
            params,
            changelog: false
        };
        this.onHashChange = this.onHashChange.bind(this);
        this.closeChangeLog = this.closeChangeLog.bind(this);
        this.openChangeLog = this.openChangeLog.bind(this);
        if (params.editor) {
            loadGameMetaData();
        }
    }

    componentWillMount() {
        window.addEventListener('hashchange', this.onHashChange);
        document.addEventListener('displaychangelog', this.openChangeLog);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChange);
        document.removeEventListener('displaychangelog', this.openChangeLog);
    }

    onHashChange() {
        this.setState({ params: loadParams() });
    }

    openChangeLog() {
        this.setState({ changelog: true });
    }

    closeChangeLog() {
        this.setState({ changelog: false });
    }

    render() {
        let content;
        if (this.state.params.editor) {
            content = <Editor params={this.state.params} ticker={this.props.ticker} />;
        } else {
            content = <Game params={this.state.params} ticker={this.props.ticker} />;
        }
        return <div>
            {content}
            <Popup/>
            {this.state.changelog ?
                <ChangeLog fullscreen title close={this.closeChangeLog}/> : null}
        </div>;
    }
}

window.onload = () => {
    init();
    document.body.removeChild(document.getElementById('preload'));
};

window.onerror = (message, file, line, column, data) => {
    const stack = (data && data.stack) || undefined;
    init({message, file, line, column, stack, data});
};

function init(error) {
    const ticker = new Ticker();
    const Renderer = () => (error
        ? <CrashHandler error={error}/>
        : <Root ticker={ticker}/>);
    ReactDOM.render(<Renderer/>, document.getElementById('root'));
    ticker.run();
}
