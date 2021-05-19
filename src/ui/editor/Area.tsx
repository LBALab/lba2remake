import * as React from 'react';
import {map, findIndex, extend, isEmpty} from 'lodash';
import {editor, fullscreen} from '../styles/index';
import {Orientation} from './layout';
import NewArea, {NewAreaContent} from './areas/utils/NewArea';
import SettingsIcon from '../utils/SettingsIcon';
import DebugData from './DebugData';
import Ticker from '../utils/Ticker';
import { getParams } from '../../params';

const menuHeight = 26;

const menuStyle = (numIcons, main) => extend({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: menuHeight - 1,
    borderBottom: '1px solid rgb(0,122,204)',
    paddingRight: (24 * numIcons) + 2,
    lineHeight: `${menuHeight - 1}px`,
    userSelect: 'none' as const,
    overflow: 'hidden' as const
}, editor.base, { background: main ? 'black' : 'rgb(45,45,48)' });

const contentStyle = extend({
    position: 'absolute' as const,
    top: menuHeight,
    left: 0,
    right: 0,
    bottom: 0,
    color: 'white'
}, editor.base);

const settingsWrapper = extend({}, editor.base, {
    position: 'absolute' as const,
    top: menuHeight,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)'
});

const settingsStyle = extend({}, editor.base, {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    padding: 20,
    borderLeft: '1px solid rgb(0,122,204)',
    borderBottom: '1px solid rgb(0,122,204)',
    background: '#1F1F1F'
});

const iconStyle = (base = {}) => (extend({
    position: 'absolute' as const,
    top: 1,
    cursor: 'pointer' as const,
    width: 22,
    height: 22
}, base));

const mainIconStyle = (base = {}) => (extend({
    float: 'left' as const,
    cursor: 'pointer' as const,
    paddingTop: '2px',
    paddingLeft: '2px',
    paddingRight: '5px',
    width: 20,
    height: 20
}, base));

const {Provider, Consumer} = React.createContext(undefined);

export const WithShortcuts = Consumer;

export interface AreaDefinition {
    id: string;
    name: string;
    icon: string;
    mainArea: boolean;
    toolAreas: AreaDefinition[];
    settings?: React.Component;
    content: () => JSX.Element;
    style: React.CSSProperties;
    getInitialState: () => Object;
}

const CloseAreaShortcut = {
    id: 'close',
    name: 'Exit Editor',
    icon: '../close.svg'
};

interface AreaProps {
    style: React.CSSProperties;
    area: AreaDefinition;
    mainArea: AreaDefinition;
    ticker: Ticker;
    stateHandler: any;
    rootStateHandler: any;
    close?: (any) => any;
    split: Function;
    availableAreas: AreaDefinition[];
    selectAreaContent: (content: AreaDefinition) => void;
    editor: any;
}

interface AreaState {
    settings: boolean;
    popup?: {
        msg: any;
        style: React.CSSProperties;
        onConfirm?: Function;
        ok?: string;
        cancel?: string;
    };
}

export default class Area extends React.Component<AreaProps, AreaState> {
    shortcuts: any;

    constructor(props) {
        super(props);
        this.confirmPopup = this.confirmPopup.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.state = {
            popup: props.area.id === 'new_area' ? {
                msg: this.renderAreaSelectionPopup(),
                style: {
                    background: 'transparent'
                }
            } : null,
            settings: false
        };
        this.shortcuts = {
            listeners: {},
            register: function register(name, callback) {
                if (!(name in this.listeners)) {
                    this.listeners[name] = new Set();
                }
                this.listeners[name].add(callback);
            },
            unregister: function unregister(name, callback) {
                if (name in this.listeners) {
                    this.listeners[name].delete(callback);
                }
            },
            call: function call(shortcut) {
                if (shortcut in this.listeners) {
                    this.listeners[shortcut].forEach(callback => callback());
                }
            }
        };
    }

    keyDown(event) {
        switch (event.code) {
            case 'F2':
            case 'Enter':
                this.shortcuts.call('rename');
                break;
            case 'ArrowUp':
                this.shortcuts.call('up');
                break;
            case 'ArrowDown':
                this.shortcuts.call('down');
                break;
        }
    }

    render() {
        return <div
            className="editor_area"
            style={this.props.style}
            onKeyDown={this.keyDown}
            tabIndex={0}
        >
            <Provider value={this.shortcuts}>
                {this.renderContent()}
                {this.renderMenu()}
                {this.renderSettings()}
            </Provider>
        </div>;
    }

    renderMenu() {
        const icon = this.props.area.icon || 'default.png';
        const isMain = this.props.area.mainArea;
        const settings = this.props.area.settings && !this.state.settings;
        const doSplit = !(isMain && isEmpty(this.props.area.toolAreas));
        let numIcons = 0;
        if (this.props.close)
            numIcons += 1;
        if (doSplit)
            numIcons += 2;

        const onClickIcon = () => {
            if (this.state.popup) {
                this.setState({popup: null});
            } else {
                this.setState({popup: {
                    msg: this.renderAreaSelectionPopup(),
                    style: {
                        background: 'transparent',
                        zIndex: 100
                    }
                }});
            }
        };

        const titleStyle = extend({
            fontSize: isMain ? 20 : 18
        }, mainIconStyle(), {float: 'none'});

        const closeIcon = this.props.close &&
            <img style={iconStyle({right: 2})}
                onClick={this.props.close}
                src="editor/icons/close.svg"/>;

        const splitH = doSplit
            && <img style={iconStyle({right: ((numIcons - 1) * 26) + 2})}
                    onClick={this.props.split.bind(null, Orientation.HORIZONTAL, null)}
                    src="editor/icons/split_horizontal.svg"/>;
        const splitV = doSplit
            && <img style={iconStyle({right: ((numIcons - 2) * 26) + 2})}
                    onClick={this.props.split.bind(null, Orientation.VERTICAL, null)}
                    src="editor/icons/split_vertical.svg"/>;

        const switchSettings = () => {
            this.setState(state => ({
                settings: !state.settings
            }));
        };

        const settingsIcon = settings
            && <SettingsIcon
                style={iconStyle({right: ((numIcons) * 26) + 2})}
                onClick={switchSettings}
            />;

        return <div style={menuStyle(numIcons, isMain)}>
            <img onClick={onClickIcon} style={mainIconStyle()} src={`editor/icons/areas/${icon}`}/>
            <span onClick={onClickIcon} style={titleStyle}>{this.props.area.name}</span>

            {settingsIcon}
            {splitH}
            {splitV}
            {closeIcon}
        </div>;
    }

    renderAreaSelectionPopup() {
        const isNew = (this.props.area === NewArea);
        const availableAreas = map(this.props.availableAreas);
        if (!isNew) {
            const idx = findIndex(availableAreas, area => area.name === this.props.area.name);
            if (idx === -1) {
                availableAreas.push(this.props.area);
            }
        }
        if (this.props.area.mainArea) {
            availableAreas.push(CloseAreaShortcut as AreaDefinition);
        }

        const selectAreaContent = (area) => {
            if (area.id === 'close') {
                const {renderer, game} = DebugData.scope;
                if (renderer) {
                    renderer.dispose();
                }
                if (game) {
                    const audio = game.getAudioManager();
                    audio.stopMusic();
                    audio.stopMusicTheme();
                }
                if ('exitPointerLock' in document) {
                    document.exitPointerLock();
                }
                window.location.hash = '';
                return;
            }
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
            ticker: this.props.ticker,
            stateHandler: this.props.stateHandler,
            sharedState: this.props.stateHandler.state,
            availableAreas: this.props.availableAreas,
            selectAreaContent: this.props.selectAreaContent,
            confirmPopup: this.confirmPopup,
            split: this.props.split,
            rootStateHandler: this.props.rootStateHandler,
            rootState: this.props.rootStateHandler && this.props.rootStateHandler.state,
            editor: this.props.editor,
            area: this
        };
        return <div style={extend({}, contentStyle, this.props.area.style)}>
            {React.createElement(this.props.area.content, props)}
            {this.renderPopup()}
        </div>;
    }

    renderSettings() {
        if (this.state.settings) {
            const closeIconStyle = {
                position: 'absolute' as const,
                top: 4,
                right: 4,
                width: 16,
                height: 16,
                cursor: 'pointer' as const
            };
            const close = () => {
                this.setState({settings: false});
            };
            return <div style={settingsWrapper} onClick={close}>
                <div style={settingsStyle} onClick={(e) => { e.stopPropagation(); }}>
                    {React.createElement(this.props.area.settings as any, {
                        params: getParams(),
                        ticker: this.props.ticker,
                        stateHandler: this.props.stateHandler,
                        sharedState: this.props.stateHandler.state,
                        confirmPopup: this.confirmPopup
                    })}
                    <img style={closeIconStyle} src="editor/icons/close.svg" onClick={close}/>
                </div>
            </div>;
        }
        return null;
    }

    renderPopup() {
        const popup = this.state.popup;
        const ok = () => {
            popup.onConfirm();
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

    confirmPopup(msg, ok, cancel, onConfirm) {
        this.setState({
            popup: {
                msg,
                ok,
                cancel,
                onConfirm,
                style: {
                    background: 'black',
                    padding: 15
                }
            }
        });
    }
}
