import React from 'react';
import {extend, map} from 'lodash';

import TextBox from './TextBox';

const styleChoices = {
    position: 'absolute',
    top: 30,
    left: 100,
    right: 100,
    listStyle: 'none'
};

const styleChoiceList = {
    listStyle: 'none',
    padding: 0,
    margin: 0
};

export default class AskChoice extends React.Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.state = { choices: [] };
        this.interval = null;
    }

    componentWillMount() { }

    componentWillReceiveProps(newProps) { }

    componentWillUnmount() { }

    update() { }

    render() {
        if (this.props.ask.text) {
            return <div>
                <div style={styleChoices}>
                    <ul style={styleChoiceList}>
                        {map(this.props.ask.choices, (c, idx) => {
                            return <li  style={{padding:5}}>
                                <Choice key={idx} choice={c}/>
                            </li>
                        })}
                    </ul>
                </div>
                <TextBox text={this.props.ask.text}/>
            </div>;
        }
        return null;
    }
}

const styleChoice = {
    position: 'relative',
    background: 'rgba(0, 0, 0, 0.5)',
    fontFamily: 'LBA',
    textShadow: 'black 4px 4px',
    paddingBottom: 5,
    border: '2px outset #20a2ff',
    borderRadius: 15,
    fontSize: '3em',
    textAlign: 'center',
    width: '100%'
};

function Choice(props) {
    if (props.choice.text) {
        const style = extend({color: props.choice.color}, styleChoice);
        return <div style={style}>{props.choice.text.value}</div>
    }
    return null;
}
