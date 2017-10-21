import React from 'react';
import {extend} from 'lodash';
import {editor, fullscreen} from '../styles/index';
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
    borderBottom: '1px solid rgb(0,122,204)',
    paddingRight: 24 * numIcons + 2,
    lineHeight: `${menuHeight - 1}px`,
    userSelect: 'none',
    overflow: 'hidden'
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
        this.confirmPopup = this.confirmPopup.bind(this);
        this.state = { confirmPopup: null };
    }

    render() {
        return <div style={this.props.style}>
            {this.renderContent()}
            {this.renderMenu()}
        </div>;
    }

    renderMenu() {
        const menu = this.props.area.menu && !this.state.confirmPopup
            ? React.createElement(this.props.area.menu, {
                params: this.props.params,
                ticker: this.props.ticker,
                stateHandler: this.props.stateHandler,
                sharedState: this.props.stateHandler.state,
                confirmPopup: this.confirmPopup
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
        const props = {
            params: this.props.params,
            ticker: this.props.ticker,
            stateHandler: this.props.stateHandler,
            sharedState: this.props.stateHandler.state,
            availableAreas: this.props.availableAreas,
            selectAreaContent: this.props.selectAreaContent,
            confirmPopup: this.confirmPopup
        };
        if (this.props.mainArea) {
            extend(props, {
                saveMainData: this.props.saveMainData,
                mainData: this.props.mainData
            });
        }
        return <div style={contentStyle}>
            {React.createElement(this.props.area.content, props)}
            {this.renderPopup()}
        </div>;
    }

    renderPopup() {
        const confirmPopup = this.state.confirmPopup;
        const ok = () => {
            confirmPopup.callback();
            this.setState({confirmPopup: null});
        };
        const cancel = () => {
            this.setState({confirmPopup: null});
        };
        if (confirmPopup) {
            const style = extend({
                background: 'black',
                padding: 15
            }, fullscreen, editor.base);
            const buttonStyle = extend({}, editor.button, {
                fontSize: 16,
                margin: '0px 4px'
            });
            return <div style={style}>
                <div>{confirmPopup.msg}</div>
                <div style={{float: 'right'}}>
                    <button style={buttonStyle} onClick={ok}>{confirmPopup.ok}</button>
                    <button style={buttonStyle} onClick={cancel}>{confirmPopup.cancel}</button>
                </div>
            </div>;
        } else {
            return null;
        }
    }

    confirmPopup(msg, ok, cancel, callback) {
        this.setState({
            confirmPopup: {
                msg,
                ok,
                cancel,
                callback
            }
        });
    }
}
