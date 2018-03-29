import React from 'react';

export default class FrameListener extends React.Component {
    constructor(props) {
        super(props);
        if (!props.ticker) {
            throw new Error('FrameListener subclass should contain a ticker prop');
        }
    }

    componentWillMount() {
        this.props.ticker.register(this);
    }

    componentWillUnmount() {
        this.props.ticker.unregister(this);
    }
}
