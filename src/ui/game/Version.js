import React from 'react';
import Package from '../../../package.json';

const text = {
    position: 'absolute',
    left: 2,
    bottom: 2,
    color: 'white'
};

export default function Version() {
    return <div style={text}>v{Package.version}</div>;
}
