import React from 'react';
import Game from './Game';
import Editor from './Editor';
import {loadParams} from '../params';
import {loadGameMetaData} from './editor/DebugData';

export default class Root extends React.Component {
    constructor(props) {
        super(props);
        const params = loadParams();
        this.state = { params };
        this.onHashChange = this.onHashChange.bind(this);
        if (params.editor) {
            loadGameMetaData();
        }
    }

    componentWillMount() {
        window.addEventListener('hashchange', this.onHashChange);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChange);
    }

    onHashChange() {
        this.setState({ params: loadParams() });
    }

    render() {
        if (this.state.params.editor) {
            return <Editor params={this.state.params} ticker={this.props.ticker} />;
        } else {
            return <Game params={this.state.params} ticker={this.props.ticker} />;
        }
    }
}
