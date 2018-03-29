import React from 'react';
import {extend, map, each} from 'lodash';

import {fullscreen} from '../styles/index';

const styleBgMenu = {
    backgroundImage: 'url(images/2_screen_menubg_extended.png)',
    backgroundRepeat: 'repeat-x',
    height: '100%',
    backgroundPosition: 'center',
    backgroundSize: 'cover'
};

const styleBgInGameMenu = {
    background: 'rgba(0,0,0,0.5)',
    height: '100%'
};

const styleMenu = {
    position: 'absolute',
    bottom: '10%',
    left: '50%',
    transform: 'translate(-50%, 0)',
    listStyle: 'none'
};

const styleMenuList = {
    listStyle: 'none',
    padding: 0,
    margin: 0
};

const menuItems = [
    { item: 'ResumeGame', index: 70, isVisible: false, isEnabled: true, text: null },
    { item: 'NewGame', index: 71, isVisible: true, isEnabled: true, text: null },
    { item: 'LoadGame', index: 72, isVisible: true, isEnabled: false, text: null },
    { item: 'SaveGame', index: 73, isVisible: true, isEnabled: false, text: null },
    { item: 'Options', index: 74, isVisible: true, isEnabled: false, text: null },
    { item: 'Quit', index: 75, isVisible: false, isEnabled: false, text: null }
];


export default class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.listener = this.listener.bind(this);
        this.state = {
            selectedIndex: 0,
            items: null,
            inGameMenu: false
        };
    }

    componentWillMount() {
        window.addEventListener('keydown', this.listener);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.texts) {
            const menu = menuItems;
            menu[0].isVisible = newProps.inGameMenu;
            const items = _.filter(menu, 'isVisible');
            each(items, (i) => {
                i.text = newProps.texts[i.index].value;
            });
            this.setState({items, selectedIndex: 0, inGameMenu: newProps.inGameMenu});
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.listener);
    }

    listener(event) {
        if (this.props.showMenu) {
            const key = event.code || event.which || event.keyCode;
            let selectedIndex = this.state.selectedIndex;
            if (key === 'ArrowUp' || key === 38) {
                selectedIndex -= 1;
                if (selectedIndex < 0) {
                    selectedIndex = this.state.items.length - 1;
                }
                this.setState({ selectedIndex });
            }
            if (key === 'ArrowDown' || key === 40) {
                selectedIndex += 1;
                if (selectedIndex > this.state.items.length - 1) {
                    selectedIndex = 0;
                }
                this.setState({ selectedIndex });
            }
            if (key === 'Enter' || key === 13) {
                this.itemChanged(selectedIndex);
            }
        }
    }

    itemChanged(selectedIndex) {
        if (this.state.items.length > 0) {
            this.props.onItemChanged(this.state.items[selectedIndex].index);
        }
    }

    update() { }

    render() {
        if (this.props.showMenu) {
            const styleFull = this.props.inGameMenu ?
                extend(styleBgInGameMenu, fullscreen)
                : extend(styleBgMenu, fullscreen);
            return <div style={styleFull}>
                <div style={styleMenu}>
                    <ul style={styleMenuList}>
                        {map(this.state.items, (i, idx) =>
                            ((i.isVisible) ? <li key={idx} style={styleMenuItemList}>
                                <MenuItem
                                    item={i}
                                    selected={idx === this.state.selectedIndex}
                                    onClick={this.itemChanged.bind(this, idx)}
                                />
                            </li> : null))}
                    </ul>
                </div>
            </div>;
        }
        return null;
    }
}

const styleMenuItemList = {
    padding: 10,
    width: '700px'
};

const styleMenuItem = {
    position: 'relative',
    fontFamily: 'LBA',
    textShadow: 'black 4px 4px',
    paddingBottom: 5,
    border: '2px outset #61cece',
    borderRadius: 15,
    fontSize: '2.5em',
    textAlign: 'center',
    width: '100%'
};

function MenuItem(props) {
    if (props.item.text) {
        const extendedStyle = {
            color: props.item.isEnabled ? 'white' : '#828282',
            background: props.selected ? 'rgba(32, 162, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            userSelect: 'none',
            cursor: 'pointer'
        };
        const style = extend(extendedStyle, styleMenuItem);
        return <div style={style} onClick={props.onClick}>{props.item.text}</div>;
    }
    return null;
}
