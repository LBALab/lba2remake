import React from 'react';
import ReactDOM from 'react-dom';

import Ticker from './ui/utils/Ticker';
import Editor from './ui/Editor';
import Popup from './ui/Popup';
import {loadParams} from './params';
import {loadGameMetaData} from './ui/editor/DebugData';

function loadEditorParams() {
    const params = loadParams();
    params.editor = true;
    return params;
}

class Root extends React.Component {
    constructor(props) {
        super(props);
        const params = loadEditorParams();
        this.state = { params };
        this.onHashChange = this.onHashChange.bind(this);
        loadGameMetaData();
    }

    componentWillMount() {
        window.addEventListener('hashchange', this.onHashChange);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChange);
    }

    onHashChange() {
        this.setState({ params: loadEditorParams() });
    }

    render() {
        return <div>
            <Editor params={this.state.params} ticker={this.props.ticker} />
            <Popup/>
        </div>;
    }
}

window.onload = () => {
    const ticker = new Ticker();
    ReactDOM.render(<Root ticker={ticker}/>, document.getElementById('root'));
    ticker.run();
};
