import React from 'react';
import {extend, mapValues} from 'lodash';
import {style as tsStyle} from './ToolShelf';
import {editor} from '../styles/index';

const menuHeight = 26;

const menuStyle = extend({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: menuHeight - 1,
    borderBottom: '1px solid gray',
    paddingRight: menuHeight - 1,
    lineHeight: `${menuHeight - 1}px`
}, editor.base);

const menuContentStyle = {
    padding: '0 1ch',
    float: 'right'
};

const contentStyle = {
    position: 'absolute',
    top: menuHeight,
    left: 0,
    right: 0,
    bottom: 0
};

const titleStyle = {
    padding: '0 1ch',
    borderRight: '1px solid gray',
};

const resizerStyle = {
    position: 'absolute',
    top: 0,
    right: 0
};

export default class Area extends React.Component {
    constructor(props) {
        super(props);
        this.toggleToolShelf = this.toggleToolShelf.bind(this);
        this.setSharedState = this.setSharedState.bind(this);
        this.state = this.props.area.sharedState;
        this.stateHandler = mapValues(this.props.area.stateHandler, f => f.bind(this));
    }

    render() {
        return <div style={this.props.style}>
            {this.renderMenu()}
            {this.renderContent()}
        </div>;
    }

    renderMenu() {
        const menu = React.createElement(this.props.area.menu, {
            params: this.props.params,
            ticker: this.props.ticker,
            stateHandler: this.stateHandler,
            sharedState: this.state
        });
        return <div style={menuStyle}>
            <span style={titleStyle}>{this.props.area.name}</span>
            <span style={menuContentStyle}>{menu}</span>
            <img style={resizerStyle} src="editor/icons/resize.png"/>
        </div>;
    }

    renderContent() {
        const content = React.createElement(this.props.area.content, {
            params: this.props.params,
            ticker: this.props.ticker,
            stateHandler: this.stateHandler,
            sharedState: this.state
        });
        return <div style={contentStyle}>
            {content}
            {this.renderToolShelf()}
        </div>;
    }

    renderToolShelf() {
        if (this.props.area.toolShelf) {
            if (this.props.toolShelfEnabled) {
                return React.createElement(this.props.area.toolShelf, {
                    params: this.props.params,
                    ticker: this.props.ticker,
                    data: this.data,
                    close: this.toggleToolShelf
                });
            } else {
                return <div style={tsStyle.openButton} onClick={this.toggleToolShelf}>+</div>;
            }
        } else {
            return null;
        }
    }

    toggleToolShelf() {
        this.props.setToolShelf(!this.props.toolShelfEnabled);
    }

    setSharedState(value) {
        this.setState({sharedState: value});
    }
}
