import React from 'react';
import {extend, map} from 'lodash';

import TextBox from './TextBox';

export default class AskChoice extends React.Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.state = { content: '', offset: 0, numChoices: 0, choices: [] };
        this.interval = null;
    }

    componentWillMount() {
        this.state.choices.push('choice 1');
        this.state.choices.push('choice 2');
        this.state.choices.push('choice 3');
    }

    componentWillReceiveProps(newProps) {

    }

    componentWillUnmount() {

    }

    update() {

    }

    render() {
        const color = this.props.color;
        if (this.props.text) {
            return <div>
                <ul>
                    {map(this.state.choices, (c, idx) => {
                        return <li><Choice key={idx} text={c} color={color}/></li>
                    })}
                </ul>
                <TextBox text={this.props.text}/>
            </div>;
        }
        return null;
    }
}

const baseStyleChoice = {
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.5)',
    fontFamily: 'LBA',
    textShadow: 'black 4px 4px',
    padding: 20,
    border: '2px outset #20a2ff',
    borderRadius: 15,
    fontSize: '3em',
};

const styleTypeChoice = {
    top: 30,
    left: 100,
    right: 100,
    minHeight: 117
};

function Choice(props) {
    if (props.text) {
        const style = extend({color: props.color}, baseStyleChoice, styleTypeChoice);
        return <div style={style}>{props.text}</div>
    } else {
        return null;
    }
}
