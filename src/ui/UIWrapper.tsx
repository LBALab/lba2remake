import * as React from 'react';
import Ticker from './utils/Ticker';
import {CrashHandler} from '../crash_reporting';
import Root from './Root';

interface UIWrapperProps {
    error?: any;
    ticker: Ticker;
}

export default class UIWrapper extends React.Component<UIWrapperProps> {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.error) {
            return <CrashHandler error={this.props.error}/>;
        }
        return <Root ticker={this.props.ticker}/>;
    }
}
