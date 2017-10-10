import React from 'react';
import Game from '../../Game';
import {clone} from 'lodash';

const GameArea = {
    name: 'Game',
    menu: GameMenu,
    content: Game,
    mainArea: true,
    sharedState: {
        labels: {
            actor: false,
            zone: false,
            point: false
        }
    },
    stateHandler: {
        setLabel: function(type, value) {
            const labels = clone(this.state.labels);
            labels[type] = value;
            this.setState({labels});
        }
    }
};

export default GameArea;

function GameMenu(props) {
    const changeLabel = (type, e) => {
        props.stateHandler.setLabel(type, e.target.checked);
    };

    return <span>
        <label style={{color: 'red'}}><input type="checkbox" onChange={changeLabel.bind(null, 'actor')}/>Actors</label>
        &nbsp;
        <label style={{color: 'lime'}}><input type="checkbox" onChange={changeLabel.bind(null, 'zone')}/>Zones</label>
        &nbsp;
        <label style={{color: 'lightskyblue'}}><input type="checkbox" onChange={changeLabel.bind(null, 'point')}/>Points</label>
    </span>;
}
