// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import Root from './ui/Root';
import Ticker from './ui/utils/Ticker';

window.onload = function() {
    const ticker = new Ticker();
    ReactDOM.render(<Root ticker={ticker}/>, document.getElementById('root'));
    ticker.run();
};
