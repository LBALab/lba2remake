import React from 'react';
import {version} from '../../../package.json';

const overlay = {
    position: 'absolute',
    right: 5,
    top: 5,
    textAlign: 'right',
    fontFamily: 'LBA',
};

const versionText = color => ({
    color,
    display: 'inline-block',
    userSelect: 'none',
    cursor: 'pointer',
    fontSize: 14,
    background: 'rgba(0, 0, 0, 0.5)',
    border: `1px outset ${color}`,
    borderRadius: 3,
    padding: '1px 3px'
});

const editorVersionText = versionText('white');
delete editorVersionText.border;
delete editorVersionText.borderRadius;

function changelog() {
    document.dispatchEvent(new Event('displaychangelog'));
}

export default function Ribbon({mode, editor}) {
    let color;
    switch (mode) {
        case 'loader': color = 'rgba(49, 89, 255, 1)'; break;
        case 'menu': color = '#ffffff'; break;
        case 'game': color = '#c01813'; break;
        default: break;
    }
    const logo = mode === 'game' && !editor;
    const build = window.buildNumber;
    return <div style={overlay}>
        {logo ? [<img key="logo" src="images/remake_logo.png" />, <br key="br"/>] : null}
        <span
            style={editor ? versionText('white') : versionText(color)}
            onClick={changelog}
        >
            v<i>{version}</i>
            {build && <React.Fragment>-{build}</React.Fragment>}
        </span>
    </div>;
}
