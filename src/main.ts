import * as React from 'react';
import { createRoot } from 'react-dom/client';

import Ticker from './ui/utils/Ticker';
import UIWrapper from './ui/UIWrapper';

let root = null;

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
    if (data && data.code === 18) {
        // Prevent pointer lock error from crashing the app
        return;
    }
    const message = (data && data.message) || data;
    const stack = data && data.stack;
    init({
        message: `Unhandled promise rejection: ${message}`,
        stack
    });
});

function init(error = null) {
    const ticker = new Ticker();
    if (!root) {
        root = createRoot(document.getElementById('root') as unknown as Element);
    }
    root.render(
        React.createElement(UIWrapper, {ticker, error}) as any
    );
}
