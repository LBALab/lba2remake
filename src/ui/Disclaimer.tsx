import React from 'react';
import {tr} from '../lang';
import {center, editor as editor_style, fullscreen} from './styles';

const wrapper_style = Object.assign({}, fullscreen, editor_style.base, {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 32,
    background: 'rgba(0, 0, 0, 0.75)',
    color: 'white',
    border: '2px outset #61cece',
    borderRadius: 12,
    overflow: 'hidden' as const
});

const content_style = {
    padding: 24,
    overflow: 'hidden' as const,
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
};

const center_vert = Object.assign({}, center, {
    left: 0,
    right: 0,
    transform: 'translate(0, -50%)',
    textAlign: 'center' as const,
    maxHeight: '100%',
    overflow: 'auto'
});

const buttonStyle = {
    color: 'white',
    background: 'rgba(32, 162, 255, 0.5)',
    border: '2px outset #61cece',
    borderRadius: 12,
    padding: '5px 15px',
    fontSize: '1.4em',
    cursor: 'pointer'
};

const titleStyle = {
    fontSize: '2em',
};

const textContainer = {
    display: 'inline-block',
    maxWidth: 800,
    textAlign: 'left' as const,
    fontSize: '1.1em',
    padding: '0 10px'
};

export default function Disclaimer({accept}) {
    return <div className="bgMenu fullscreen">
        <div style={wrapper_style}>
            <div style={content_style}>
                <div style={center_vert}>
                    <img src="images/remake_logo.png"/>
                    <h1 style={titleStyle}>{tr('Disclaimer')}</h1>
                    <div style={textContainer}>
                        <p>{tr('disclaimer1')}</p>
                        <p>{tr('disclaimer2')}</p>
                        <p>{tr('disclaimer3')}</p>
                    </div>
                    <br/>
                    <button style={buttonStyle} onClick={accept}>OK</button>
                </div>
            </div>
        </div>
    </div>;
}
