import React from 'react';

const style = {
    fontSize: 16,
    fontWeight: 'normal',
    padding: 20,
    textAlign: 'center'
};

const AreaLoader = {
    id: 'loader',
    name: 'Loading...',
    content: () => <div style={style}>Loading...</div>,
    getInitialState: () => ({})
};

export default AreaLoader;
