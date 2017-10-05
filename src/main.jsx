// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import Root from './ui/Root';

window.onload = function() {
    ReactDOM.render(
        <Root/>,
        document.getElementById('root')
    );
};
