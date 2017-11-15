import React from 'react';
import ReactDOM from 'react-dom';

import Ticker from './ui/utils/Ticker';
import Game from './ui/Game';
import {loadParams} from './params';

window.onload = function() {
    const ticker = new Ticker();
    const params = loadParams();
    params.editor = false;
    params.noscripts = false;
    params.pauseOnLoad = false;
    ReactDOM.render(<Game params={params} ticker={ticker} />, document.getElementById('root'));
    ticker.run();
};
