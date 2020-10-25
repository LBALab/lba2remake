import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Ticker from './ui/utils/Ticker';
import UIWrapper from './ui/UIWrapper';

window.onload = () => {
    init();
    document.body.removeChild(document.getElementById('preload'));
};

window.onerror = (message, file, line, column, data) => {
    if ('vrSession' in window && window.vrSession !== null) {
        window.vrSession.end();
    }
    const stack = (data && data.stack) || undefined;
    init({message, file, line, column, stack, data});
};

window.addEventListener('unhandledrejection', (event) => {
    if ('vrSession' in window && window.vrSession !== null) {
        window.vrSession.end();
    }
    const data = event.reason;
    const message = (data && data.message) || data;
    const stack = data && data.stack;
    init({
        message: `Unhandled promise rejection: ${message}`,
        stack
    });
});

function init(error = null) {
    const ticker = new Ticker();
    ReactDOM.render(
        React.createElement(UIWrapper, {ticker, error}) as any,
        document.getElementById('root') as any
    );
}
