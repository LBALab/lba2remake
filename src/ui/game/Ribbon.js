import React from 'react';
import {version} from '../../../package.json';

const overlay = {
    position: 'absolute',
    right: 5,
    top: 5,
    textAlign: 'right',
    fontFamily: 'LBA',
};

const versionText = {
    color: '#c01813',
    display: 'inline-block',
    userSelect: 'none',
    fontSize: 14,
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px outset rgba(97, 206, 206, 0.75)',
    borderRadius: 3,
    padding: '2px 6px'
};

export default function Ribbon(props) {
    return <div style={overlay}>
        {!props.editor ? [<img key="logo" src="images/remake_logo.png" />, <br key="br"/>] : null}
        <span style={versionText}>v<i>{version}</i></span>
    </div>;
}
