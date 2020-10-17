import * as React from 'react';
import { map, each, filter } from 'lodash';
import {tr} from '../../lang';

import '../styles/menu.scss';
import { getParams } from '../../params';

interface Item {
    item: string;
    index: number;
    isVisible: boolean;
    isEnabled: boolean;
    textId?: string;
    text?: string;
}

const menuItems: Item[] = [
    { item: 'ResumeGame', index: 70, isVisible: false, isEnabled: true, textId: 'resumeGame' },
    { item: 'NewGame', index: 71, isVisible: true, isEnabled: true, textId: 'newGame' },
    { item: 'LoadGame', index: 72, isVisible: false, isEnabled: false, textId: 'loadGame' },
    { item: 'SaveGame', index: 73, isVisible: false, isEnabled: false, textId: 'saveGame' },
    { item: 'Teleport', index: -1, isVisible: true, isEnabled: true, textId: 'teleport' },
    { item: 'Editor', index: -2, isVisible: true, isEnabled: true, textId: 'editor' },
    { item: 'ExitEditor', index: -3, isVisible: true, isEnabled: true, textId: 'exitEditor' },
    { item: 'Iso3D', index: -4, isVisible: true, isEnabled: true, textId: 'iso3d' },
    { item: 'Iso3DDisable', index: -5, isVisible: true, isEnabled: true, textId: 'iso3dDisable' },
    // { item: 'Options', index: 74, isVisible: true, isEnabled: false, textId: 'options' },
    { item: 'Quit', index: 75, isVisible: false, isEnabled: false, textId: 'quit' },
];

interface MProps {
    showMenu: boolean;
    inGameMenu: boolean;
    onItemChanged: (id: number) => void;
}

interface MState {
    items?: Item[];
    selectedIndex: number;
}

export default class Menu extends React.Component<MProps, MState> {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.listener = this.listener.bind(this);
        this.state = {
            selectedIndex: 0,
            items: menuItems,
        };
    }

    componentWillMount() {
        window.addEventListener('keydown', this.listener);
    }

    componentWillReceiveProps(newProps) {
        const menu = menuItems;
        const params = getParams();
        menu[0].isVisible = newProps.inGameMenu;
        menu[5].isVisible = !params.editor;
        menu[6].isVisible = params.editor;
        menu[7].isVisible = !params.iso3d;
        menu[8].isVisible = params.iso3d;
        const items = filter(menu, 'isVisible');
        each(items, (i) => {
            i.text = tr(i.textId);
        });
        this.setState({items, selectedIndex: 0});
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
            const className = `${this.props.inGameMenu ? 'bgInGameMenu' : 'bgMenu'} fullscreen`;
            return <div className={className}>
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
        };
        return <div className={`menuItem${props.selected ? ' active' : ''}`}
                    style={extendedStyle}
                    onClick={props.onClick}>
            {props.item.text}
        </div>;
    }
    return null;
}
