import React from 'react';
import Area from './Area';
import Game from '../../Game';
import DebugHUD from './GameArea/DebugHUD';

export default class GameArea extends Area {
    constructor(props) {
        super(props);
        this.toolShelf = DebugHUD;
    }

    renderContent() {
        return <Game params={this.props.params} ticker={this.props.ticker} />;
    }
}
