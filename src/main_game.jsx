import React from 'react';
import ReactDOM from 'react-dom';

import Ticker from './ui/utils/Ticker';
import Game from './ui/Game';
import Popup from './ui/Popup';
import {loadParams} from './params';

window.onload = () => {
    const ticker = new Ticker();
    const params = loadParams();
    params.editor = false;
    ReactDOM.render(<div>
        <Game params={params} ticker={ticker} />
        <Popup/>
    </div>, document.getElementById('root'));
    ticker.run();
};
