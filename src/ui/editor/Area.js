import React from 'react';
import {extend, mapValues} from 'lodash';
import {editor} from '../styles/index';
import {Orientation} from '../Editor';
import {map, findIndex} from 'lodash';
import NewArea from './areas/NewArea';

const menuHeight = 26;

const menuStyle = (numIcons) => extend({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: menuHeight - 1,
    borderBottom: '1px solid gray',
    paddingRight: 24 * numIcons + 2,
    lineHeight: `${menuHeight - 1}px`
}, editor.base);

const menuContentStyle = {
    padding: '0 1ch',
    float: 'right'
};

const contentStyle = extend({
    position: 'absolute',
    top: menuHeight,
    left: 0,
    right: 0,
    bottom: 0,
    color: 'white'
}, editor.base);

const iconStyle = (right) => ({
    position: 'absolute',
    top: 1,
    right: right,
    cursor: 'pointer'
});

export default class Area extends React.Component {
    constructor(props) {
        super(props);
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
        const menu = this.props.area.menu
            ? React.createElement(this.props.area.menu, {
                params: this.props.params,
                ticker: this.props.ticker,
                stateHandler: this.stateHandler,
                sharedState: this.state
            })
            : null;
        const numIcons = this.props.close ? 3 : 2;
        return <div style={menuStyle(numIcons)}>
            {this.renderTitle()}

            <span style={menuContentStyle}>{menu}</span>
            <img style={iconStyle((numIcons - 1) * 24)} onClick={this.props.split.bind(null, Orientation.HORIZONTAL)} src="editor/icons/split_horizontal.png"/>
            <img style={iconStyle((numIcons - 2) * 24)} onClick={this.props.split.bind(null, Orientation.VERTICAL)} src="editor/icons/split_vertical.png"/>
            {this.props.close ? <img style={iconStyle(0)} onClick={this.props.close} src="editor/icons/close.png"/> : null}
        </div>;
    }

    renderTitle() {
        const isNew = (this.props.area === NewArea);
        const onChange = (e) => {
            const area = this.props.availableAreas[e.target.value];
            this.props.selectAreaContent(area);
        };
        const value = isNew ? 'new' : findIndex(this.props.availableAreas, area => area.name === this.props.area.name);
        return <select onChange={onChange} style={editor.select} value={value}>
            {<option disabled value="new">Select content</option>}
            {map(this.props.availableAreas, (area, idx) => {
                return <option key={idx} value={idx}>{area.name}</option>;
            })}
        </select>;
    }

    renderContent() {
        const content = React.createElement(this.props.area.content, {
            params: this.props.params,
            ticker: this.props.ticker,
            stateHandler: this.stateHandler,
            sharedState: this.state,
            availableAreas: this.props.availableAreas,
            selectAreaContent: this.props.selectAreaContent
        });
        return <div style={contentStyle}>
            {content}
        </div>;
    }

    setSharedState(value) {
        this.setState({sharedState: value});
    }
}
