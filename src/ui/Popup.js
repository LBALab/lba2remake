import React from "react";

const style = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 50,
    background: 'rgba(0, 0, 0, 0.5)'
};

export default class Popup extends React.Component {
    static instance = null;

    static display(component) {
        if (Popup.instance) {
            Popup.instance.setState({ content: component });
        }
    }

    constructor(props) {
        super(props);
        this.state = { content: null };
        Popup.instance = this;
    }

    close() {
        this.setState({ content: null });
    }

    render() {
        if (this.state.content) {
            return <div style={style}>
                {React.createElement(this.state.content, {
                    close: this.close.bind(this)
                })}
            </div>;
        } else {
            return null;
        }
    }
}