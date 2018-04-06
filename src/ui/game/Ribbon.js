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
    border: '1px outset #c01813',
    borderRadius: 3,
    padding: '1px 3px'
};

const loaderVersion = {
    color: 'rgba(49, 89, 255, 1)',
    display: 'inline-block',
    userSelect: 'none',
    fontSize: 14,
    border: '1px outset rgba(49, 89, 255, 1)',
    borderRadius: 3,
    padding: '1px 3px'
};

export default function Ribbon(props) {
    return <div style={overlay}>
        {!props.editor && !props.loader ? [<img key="logo" src="images/remake_logo.png" />, <br key="br"/>] : null}
        <span style={props.loader ? loaderVersion : versionText}>v<i>{version}</i></span>
    </div>;
}
