import * as React from 'react';

import '../styles/textbox.scss';

interface TBProps {
    text: {
        value: string;
        color: string;
        type: string;
    };
    skip?: boolean;
    textAnimEnded?: Function;
}

interface TBState {
    offset: number;
    content: string;
}

export default class TextBox extends React.Component<TBProps, TBState> {
    interval: number;

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
        if (newProps.skip !== this.props.skip
            && this.props.text
            && this.props.text.value) {
            this.setState({offset: 0, content: this.props.text.value.replace(/@/g, '\n')});
            clearInterval(this.interval);
            this.interval = null;
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
            if (this.props.textAnimEnded) {
                this.props.textAnimEnded();
            }
        }
        this.setState({offset, content});
    }

    render() {
        const text = this.props.text;
        if (text) {
            return <div className={`textbox ${text.type}`}
                        style={{color: text.color}}>
                {this.state.content}
            </div>;
        }
        return null;
    }
}
