import React from 'react';
import Game from './Game';
import Editor from './Editor';
import {loadParams} from '../params';

export default class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = { params: loadParams() };
        this.onHashChange = this.onHashChange.bind(this);
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
