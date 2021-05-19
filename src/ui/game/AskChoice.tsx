import * as React from 'react';
import {extend, map} from 'lodash';

import TextBox from './TextBox';
import { ControlsState } from '../../game/ControlsState';

const styleChoices = {
    position: 'absolute' as const,
    top: 30,
    left: 100,
    right: 100,
    listStyle: 'none' as const
};

const styleChoiceList = {
    listStyle: 'none' as const,
    padding: 0,
    margin: 0
};

interface ACProps {
    ask: {
        text?: {
            value: string;
            color: string;
            type: string;
        };
        choices: any[];
    };
    onChoiceChanged(choice: number) : void;
}

interface ACState {
    selectedIndex: number;
}

export default class AskChoice extends React.Component<ACProps, ACState> {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.listener = this.listener.bind(this);
        this.gamepadListener = this.gamepadListener.bind(this);
        this.state = { selectedIndex: 0 };
    }

    componentWillMount() {
        window.addEventListener('keydown', this.listener);
        window.addEventListener('lbagamepadchanged', this.gamepadListener);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.ask)
            this.setState({ selectedIndex: 0 });
    }

    componentWillUnmount() {
        window.removeEventListener('lbagamepadchanged', this.gamepadListener);
        window.removeEventListener('keydown', this.listener);
    }

    interactMenu(key: string | number, controlsState: ControlsState) {
        let selectedIndex = this.state.selectedIndex;
        if (key === 'ArrowUp' || controlsState?.up === 1) {
            selectedIndex -= 1;
            if (selectedIndex < 0) {
                selectedIndex = this.props.ask.choices.length - 1;
            }
            this.choiceChanged(selectedIndex);
            this.setState({ selectedIndex });
        }
        if (key === 'ArrowDown' || controlsState?.down === 1) {
            selectedIndex += 1;
            if (selectedIndex > this.props.ask.choices.length - 1) {
                selectedIndex = 0;
            }
            this.choiceChanged(selectedIndex);
            this.setState({ selectedIndex });
        }
    }

    listener(event) {
        this.interactMenu(event.code, null);
    }

    gamepadListener(event) {
        this.interactMenu(null, event.detail as ControlsState);
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
    position: 'relative' as const,
    fontFamily: 'LBA',
    textShadow: 'black 4px 4px',
    paddingBottom: 5,
    border: '2px outset #61cece',
    borderRadius: 15,
    fontSize: '2.5em',
    textAlign: 'center' as const,
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
