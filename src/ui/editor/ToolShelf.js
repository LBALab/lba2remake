import React from 'react';
import {extend} from 'lodash';
import FrameListener from '../utils/FrameListener';

export const style = {
    base: {
        position: 'absolute',
        top: 0,
        right: 0,
        background: 'black',
        opacity: 0.7,
        border: '3px solid gray',
        borderRadius: 10,
        color: 'white',
        fontFamily: `'Courier', monospace`,
        fontSize: 16,
        fontWeight: 'bold'
    },
    button: {
        color: 'black',
        background: 'white',
        borderRadius: 5,
        cursor: 'pointer',
        padding: '1px 4px',
        margin: '0px 2px'
    },
    input: {
        borderRadius: 5,
        padding: '1px 4px',
        margin: '0px 2px'
    }
};

style.openButton = extend({
    padding: 5,
    width: 12,
    height: 12,
    lineHeight: '12px',
    textAlign: 'center',
    cursor: 'pointer'
}, style.base);

const frameStyle = extend({
    maxWidth: '50%',
    maxHeight: '90%',
    overflow: 'auto',
    padding: 0
}, style.base);

const closeButton = {
    float: 'right',
    width: 12,
    textAlign: 'center',
    cursor: 'pointer'
};

const contentStyle = {
    padding: 8
};

export default class ToolShelf extends FrameListener {
    constructor(props) {
        super(props);
    }

    render() {
        const content = this.renderContent();
        const headerStyle = {
            borderBottom: content.length !== 0 ? '2px solid gray' : 0,
            padding: 8
        };
        return <div style={frameStyle}>
            <div style={headerStyle}>{this.renderTitle()} {this.renderMenu()} {this.renderCloseButton()}</div>
            {content.length !== 0 ? <div style={contentStyle}>{content}</div> : null}
        </div>;
    }

    renderCloseButton() {
        return <span style={closeButton} onClick={this.props.close}>-</span>;
    }
}
