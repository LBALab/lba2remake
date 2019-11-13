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
        this.listener = this.listener.bind(this);
        this.state = { selectedIndex: 0 };
    }

    componentWillMount() {
        window.addEventListener('keydown', this.listener);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.ask)
            this.setState({ selectedIndex: 0 });
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.listener);
    }

    listener(event) {
        const key = event.code || event.which || event.keyCode;
        let selectedIndex = this.state.selectedIndex;
        if (key === 'ArrowUp' || key === 38) {
            selectedIndex -= 1;
            if (selectedIndex < 0) {
                selectedIndex = this.props.ask.choices.length - 1;
            }
            this.choiceChanged(selectedIndex);
            this.setState({ selectedIndex });
        }
        if (key === 'ArrowDown' || key === 40) {
            selectedIndex += 1;
            if (selectedIndex > this.props.ask.choices.length - 1) {
                selectedIndex = 0;
            }
            this.choiceChanged(selectedIndex);
            this.setState({ selectedIndex });
        }
    }

    choiceChanged(selectedIndex) {
        if (this.props.ask.choices.length > 0)
            this.props.onChoiceChanged(this.props.ask.choices[selectedIndex].value);
    }

    update() { }

    render() {
        if (this.props.ask.text) {
            return <div>
                <div style={styleChoices}>
                    <ul style={styleChoiceList}>
                        {map(this.props.ask.choices, (c, idx) => <li key={idx} style={{padding: 5}}>
                            <Choice
                                key={c.value}
                                choice={c}
                                selected={idx === this.state.selectedIndex}
                            />
                        </li>)}
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
    fontFamily: 'LBA',
    textShadow: 'black 4px 4px',
    paddingBottom: 5,
    border: '2px outset #61cece',
    borderRadius: 15,
    fontSize: '2.5em',
    textAlign: 'center',
    width: '100%'
};

function Choice(props) {
    if (props.choice.text) {
        const extendedStyle = {
            color: props.choice.color,
            background: props.selected ? 'rgba(32, 162, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
        };
        const style = extend(extendedStyle, styleChoice);
        return <div style={style}>{props.choice.text.value}</div>;
    }
    return null;
}
