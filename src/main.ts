import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {each} from 'lodash';

import Ticker from './ui/utils/Ticker';
import UIWrapper from './ui/UIWrapper';
import { EngineError } from './crash_reporting';

window.onload = () => {
    init();
    document.body.removeChild(document.getElementById('preload'));
};

window.onerror = (message, file, line, column, data) => {
    if ('getVRDisplays' in navigator) {
        navigator.getVRDisplays().then((displays) => {
            each(displays, (display) => {
                if (display.isPresenting) {
                    display.exitPresent();
                }
            });
        });
    }
    const stack = (data && data.stack) || undefined;
    init({message, file, line, column, stack, data});
};

window.addEventListener('unhandledrejection', (event) => {
    const error = {
        message: 'unhandledrejection',
        data: event.reason,
        rootCause: null,
        stack: null,
    };
    if (event.reason instanceof EngineError) {
        if (event.reason.rootCause) {
            error.rootCause = event.reason.rootCause.message;
            error.stack = event.reason.rootCause.stack;
        }
    }

    init(error);
});

function init(error = null) {
    const ticker = new Ticker();
    ReactDOM.render(
        React.createElement(UIWrapper, {ticker, error}) as any,
        document.getElementById('root') as any
    );
}
