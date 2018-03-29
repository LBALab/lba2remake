import React from 'react';
import {extend} from 'lodash';

const baseStyle = {
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.5)',
    fontFamily: 'LBA',
    textShadow: 'black 4px 4px',
    padding: 20,
    border: '2px outset #61cece',
    borderRadius: 15,
    fontSize: '2.5em'
};

const styleType = {
    small: {
        bottom: 30,
        left: 30,
        right: 30,
        minHeight: 117
    },
    big: {
        bottom: 30,
        left: 30,
        right: 30,
        top: 30
    }
};

export default class TextBox extends React.Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.state = { content: '', offset: 0 };
        this.interval = null;
    }

    componentWillMount() {
        if (this.props.text) {
            this.interval = setInterval(this.update, 35);
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.text !== this.props.text) {
            if (newProps.text) {
                this.setState({ content: '', offset: 0 });
                clearInterval(this.interval);
                this.interval = setInterval(this.update, 35);
            } else {
                this.setState({ content: '', offset: 0 });
                clearInterval(this.interval);
                this.interval = null;
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    update() {
        let {offset, content} = this.state;
        const text = this.props.text.value;
        const char = text.charAt(offset);
        if (char === '@') {
            content += '\n';
        } else {
            content += char;
        }
        offset += 1;
        if (offset >= text.length) {
            clearInterval(this.interval);
        }
        this.setState({offset, content});
    }

    render() {
        const text = this.props.text;
        if (text) {
            const style = extend({color: text.color}, baseStyle, styleType[text.type]);
            return <div style={style}>{this.state.content}</div>;
        }
        return null;
    }
}

