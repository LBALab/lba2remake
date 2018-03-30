import React from 'react';
import {map, findIndex, extend} from 'lodash';
import {editor, fullscreen} from '../styles/index';
import {Orientation} from './layout';
import NewArea, {NewAreaContent} from './areas/NewArea';
import AreaLoader from './areas/AreaLoader';

const menuHeight = 26;

const menuStyle = (numIcons, main) => extend({
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
}, editor.base, { background: main ? 'black' : 'rgb(45,45,48)' });

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

const iconStyle = base => (extend({
    position: 'absolute',
    top: 1,
    cursor: 'pointer'
}, base));

const mainIconStyle = base => (extend({
    float: 'left',
    cursor: 'pointer',
    paddingLeft: '2px',
    paddingRight: '5px'
}, base));

export default class Area extends React.Component {
    constructor(props) {
        super(props);
        this.confirmPopup = this.confirmPopup.bind(this);
        this.state = { popup: null };
    }

    render() {
        return <div style={this.props.style}>
            {this.renderContent()}
            {this.renderMenu()}
        </div>;
    }

    renderMenu() {
        const menu = this.props.area.menu && !this.state.popup
            ? React.createElement(this.props.area.menu, {
                params: this.props.params,
                ticker: this.props.ticker,
                stateHandler: this.props.stateHandler,
                sharedState: this.props.stateHandler.state,
                confirmPopup: this.confirmPopup
            })
            : null;
        const icon = this.props.area.icon || 'default.png';
        const numIcons = this.props.close ? 3 : 2;

        const onClickIcon = () => {
            if (this.state.popup) {
                this.setState({popup: null});
            } else {
                this.setState({popup: {
                    msg: this.renderAreaSelectionPopup()
                }});
            }
        };

        const isMain = this.props.area.mainArea;

        const titleStyle = extend({
            fontSize: isMain ? 20 : 18
        }, mainIconStyle());

        return <div style={menuStyle(numIcons, isMain)}>
            <img onClick={onClickIcon} style={mainIconStyle()} src={`editor/icons/areas/${icon}`}/>
            <span onClick={onClickIcon} style={titleStyle}>{this.props.area.name}</span>

            <span style={menuContentStyle}>{menu}</span>
            <img style={iconStyle({right: (numIcons - 1) * 26 + 2})} onClick={this.props.split.bind(null, Orientation.HORIZONTAL, null)} src="editor/icons/split_horizontal.png"/>
            <img style={iconStyle({right: (numIcons - 2) * 26 + 2})} onClick={this.props.split.bind(null, Orientation.VERTICAL, null)} src="editor/icons/split_vertical.png"/>
            {this.props.close ? <img style={iconStyle({right: 2})} onClick={this.props.close} src="editor/icons/close.png"/> : null}
        </div>;
    }

    renderAreaSelectionPopup() {
        if (this.props.area === AreaLoader) {
            return null;
        }
        const isNew = (this.props.area === NewArea);
        const availableAreas = map(this.props.availableAreas);
        if (!isNew) {
            const idx = findIndex(availableAreas, area => area.name === this.props.area.name);
            if (idx === -1) {
                availableAreas.push(this.props.area);
            }
        }

        const selectAreaContent = (area) => {
            if (area.id !== this.props.area.id) {
                this.props.selectAreaContent(area);
            } else {
                this.setState({popup: null});
            }
        };

        return <NewAreaContent
            availableAreas={availableAreas}
            selectAreaContent={selectAreaContent}
        />;
    }

    renderContent() {
        const props = {
            params: this.props.params,
            ticker: this.props.ticker,
            stateHandler: this.props.stateHandler,
            sharedState: this.props.stateHandler.state,
            availableAreas: this.props.availableAreas,
            selectAreaContent: this.props.selectAreaContent,
            confirmPopup: this.confirmPopup,
            split: this.props.split
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
        const popup = this.state.popup;
        const ok = () => {
            popup.callback();
            this.setState({popup: null});
        };
        const cancel = () => {
            this.setState({popup: null});
        };
        if (popup) {
            const style = extend({}, fullscreen, editor.base, popup.style);
            const buttonStyle = extend({}, editor.button, {
                fontSize: 16,
                margin: '0px 4px'
            });
            return <div style={style}>
                <div>{popup.msg}</div>
                <div style={{float: 'right'}}>
                    {popup.ok ? <button style={buttonStyle} onClick={ok}>{popup.ok}</button> : null}
                    {popup.cancel ? <button
                        style={buttonStyle}
                        onClick={cancel}
                    >{popup.cancel}</button> : null}
                </div>
            </div>;
        }
        return null;
    }

    confirmPopup(msg, ok, cancel, callback) {
        this.setState({
            popup: {
                msg,
                ok,
                cancel,
                callback,
                style: {
                    background: 'black',
                    padding: 15
                }
            }
        });
    }
}
