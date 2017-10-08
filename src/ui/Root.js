import React from 'react';
import Game from './Game';
import GameArea from './editor/areas/GameArea';
import {loadParams} from '../params';

export default class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = { params: loadParams() };
        this.watchParams = this.watchParams.bind(this);
    }

    componentWillMount() {
        window.addEventListener('hashchange', this.watchParams);
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.watchParams);
    }

    watchParams() {
        this.setState({ params: loadParams() });
    }

    render() {
        if (this.state.params.editor) {
            return <GameArea params={this.state.params} ticker={this.props.ticker} />;
        } else {
            return <Game params={this.state.params} ticker={this.props.ticker} />;
        }
    }
}
