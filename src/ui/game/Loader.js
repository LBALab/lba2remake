import React from 'react';
import {extend} from 'lodash';
import {fullscreen} from '../styles/index';

const overlay = extend({background: 'black'}, fullscreen);
const image = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
};
const text = {
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.5)',
    fontFamily: 'LBA',
    padding: '0.5em 1em',
    border: '2px outset #20a2ff',
    borderRadius: 15,
    fontSize: '3em',
    color: '#20a2ff',
    bottom:'20%',
    left: '50%',
    transform: 'translate(-50%, 0)'
};

export default function Loader() {
    return <div style={overlay}>
        <img style={image} src="30_loading_screen.png" />
        <div style={text}>Loading...</div>
    </div>;
}
