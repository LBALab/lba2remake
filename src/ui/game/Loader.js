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
    fontFamily: 'LBA',
    padding: '0.5em 1em',
    fontSize: '2.5em',
    color: '#61cece',
    bottom: '20%',
    left: '51%',
    transform: 'translate(-51%, 0)'
};

export default function Loader() {
    return <div style={overlay}>
        <img style={image} src="images/30_screen_loading.png" />
        <div style={text}>Loading...</div>
    </div>;
}
