import React from 'react';
import { map, each, filter } from 'lodash';

import '../styles/menu.scss';

const menuItems = [
    { item: 'ResumeGame', index: 70, isVisible: false, isEnabled: true, text: null },
    { item: 'NewGame', index: 71, isVisible: true, isEnabled: true, text: null },
    { item: 'LoadGame', index: 72, isVisible: false, isEnabled: false, text: null },
    { item: 'SaveGame', index: 73, isVisible: false, isEnabled: false, text: null },
    { item: 'Teleport', index: -1, isVisible: true, isEnabled: true, text: 'Teleport' },
    { item: 'Editor', index: -2, isVisible: true, isEnabled: true, text: 'Editor' },
    { item: 'ExitEditor', index: -3, isVisible: true, isEnabled: true, text: 'Exit Editor' },
    { item: 'Options', index: 74, isVisible: true, isEnabled: false, text: null },
    { item: 'Quit', index: 75, isVisible: false, isEnabled: false, text: null },
];

export default class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.listener = this.listener.bind(this);
        this.state = {
            selectedIndex: 0,
            items: null
        };
    }

    componentWillMount() {
        window.addEventListener('keydown', this.listener);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.texts) {
            const menu = menuItems;
            menu[0].isVisible = newProps.inGameMenu;
            menu[5].isVisible = !newProps.params.editor;
            menu[6].isVisible = newProps.params.editor;
            const items = filter(menu, 'isVisible');
            each(items, (i) => {
                if (!i.text) {
                    i.text = newProps.texts[i.index].value;
                }
            });
            this.setState({items, selectedIndex: 0});
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
            return <div className={`${this.props.inGameMenu ? 'bgInGameMenu' : 'bgMenu'} fullscreen`}>
                <div className="menu">
                    <ul className="menuList">
                        {map(this.state.items, (i, idx) =>
                            ((i.isVisible) ? <li key={idx} className="menuItemList">
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

function MenuItem(props) {
    if (props.item.text) {
        const extendedStyle = {
            color: props.item.isEnabled ? 'white' : '#828282',
            background: props.selected ? 'rgba(32, 162, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        };
        return <div className="menuItem" style={extendedStyle} onClick={props.onClick}>{props.item.text}</div>;
    }
    return null;
}
