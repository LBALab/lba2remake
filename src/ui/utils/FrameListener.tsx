import React from 'react';
import {TickerProps} from './Ticker';

export default abstract class FrameListener<TProps extends TickerProps = TickerProps, TState = {}>
                    extends React.Component<TProps, TState>
{
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

    abstract frame(): void;
}
