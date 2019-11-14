import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import changelog from '../../CHANGELOG.md';
import './styles/changelog.scss';

const bg_style = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.85)'
};

const wrapper_style = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 32,
    background: 'black',
    color: 'white',
    border: '2px outset #61cece',
    borderRadius: 12,
    overflow: 'hidden' as const
};

const content_style = {
    padding: '0px 24px',
    overflow: 'hidden auto',
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
};

const closeStyle = {
    position: 'absolute' as const,
    top: 2,
    right: 8,
    width: 24,
    height: 24,
    cursor: 'pointer' as const
};

const onKeyDown = (close, e) => {
    const key = e.code || e.which || e.keyCode;
    if (key === 'Escape' || key === 27) {
        close();
    }
    e.stopPropagation();
};

const onKeyUp = (e) => {
    e.stopPropagation();
};

export default function ChangeLog(props) {
    const onRef = (ref) => {
        if (ref) {
            ref.focus();
        }
    };

    return <div
        ref={onRef}
        style={bg_style}
        onClick={props.close}
        onKeyDown={onKeyDown.bind(null, props.close)}
        onKeyUp={onKeyUp}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
    >
        <div style={wrapper_style} onClick={e => e.stopPropagation()}>
            <div className="changelog" style={content_style}>
                <ReactMarkdown
                    source={changelog}
                    escapeHtml={false}
                    skipHtml={false}
                    linkTarget="_blank"
                />
            </div>
            <img style={closeStyle} src="./editor/icons/close.svg" onClick={props.close}/>
        </div>
    </div>;
}
