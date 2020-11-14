import * as React from 'react';
import { map, each, filter } from 'lodash';
import {tr} from '../../lang';

import '../styles/menu.scss';
import { getParams } from '../../params';
import { ControlsState } from '../../game/ControlsState';

interface Item {
    item: string;
    index: number;
    isVisible: boolean;
    isEnabled: boolean;
    textId?: string;
    text?: string;
}

const getMenuItems = (resume: boolean = false): Item[] => {
    const params = getParams();
    const menu = [
        { item: 'ResumeGame', index: 70, isVisible: resume, isEnabled: true, textId: 'resumeGame' },
        { item: 'NewGame', index: 71, isVisible: true, isEnabled: true, textId: 'newGame' },
        { item: 'LoadGame', index: 72, isVisible: false, isEnabled: false, textId: 'loadGame' },
        { item: 'SaveGame', index: 73, isVisible: false, isEnabled: false, textId: 'saveGame' },
        { item: 'Teleport', index: -1, isVisible: true, isEnabled: true, textId: 'teleport' },
        { item: 'Editor', index: -2, isVisible: !params.editor, isEnabled: true, textId: 'editor' },
        {
            item: 'ExitEditor', index: -3, isVisible: params.editor, isEnabled: true, textId: 'exitEditor'
        },
        { item: 'Options', index: 74, isVisible: true, isEnabled: true, textId: 'options' },
        { item: 'Quit', index: 75, isVisible: false, isEnabled: false, textId: 'quit' },
    ];
    const items = filter(menu, 'isVisible');
    each(items, (i: Item) => {
        i.text = tr(i.textId);
    });
    return items;
};

const getOptionItems = (): Item[] => {
    const params = getParams();
    const menu = [
        { item: 'Return', index: 741, isVisible: true, isEnabled: true, textId: 'return' },
        { item: 'Iso3D', index: -4, isVisible: !params.iso3d, isEnabled: true, textId: 'iso3d' },
        { item: 'Iso3DDisable', index: -5, isVisible: params.iso3d, isEnabled: true, textId: 'iso3dDisable' },
        {
            item: 'Audio3D', index: -8, isVisible: !params.audio3d, isEnabled: true, textId: 'audio3d'
        },
        { item: 'Audio3DDisable', index: -9, isVisible: params.audio3d, isEnabled: true, textId: 'audio3dDisable' },
        { item: 'SwitchLBA1', index: -6, isVisible: params.game === 'lba2', isEnabled: true, textId: 'switchLBA1' },
        { item: 'SwitchLBA2', index: -7, isVisible: params.game === 'lba1', isEnabled: true, textId: 'switchLBA2' },
    ];
    const items = filter(menu, 'isVisible');
    each(items, (i: Item) => {
        i.text = tr(i.textId);
    });
    return items;
};

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
        this.gamepadListener = this.gamepadListener.bind(this);
        this.state = {
            selectedIndex: 0,
            items: getMenuItems(false),
        };
    }

    componentWillMount() {
        window.addEventListener('keydown', this.listener);
        window.addEventListener('lbagamepadchanged', this.gamepadListener);
    }

    componentWillReceiveProps(newProps) {
        const menu = getMenuItems(newProps.inGameMenu);
        this.setState({ items: menu, selectedIndex: 0 });
    }

    componentWillUnmount() {
        window.removeEventListener('lbagamepadchanged', this.gamepadListener);
        window.removeEventListener('keydown', this.listener);
    }

    interactMenu(key: string | number, controlState: ControlsState) {
        let selectedIndex = this.state.selectedIndex;
        if (key === 'ArrowUp' || key === 38 || controlState?.up === 1) {
            selectedIndex -= 1;
            if (selectedIndex < 0) {
                selectedIndex = this.state.items.length - 1;
            }
            this.setState({ selectedIndex });
        }
        if (key === 'ArrowDown' || key === 40 || controlState?.down === 1) {
            selectedIndex += 1;
            if (selectedIndex > this.state.items.length - 1) {
                selectedIndex = 0;
            }
            this.setState({ selectedIndex });
        }
        if (key === 'Enter' || key === 13 || controlState?.action === 1) {
            this.itemChanged(selectedIndex);
        }
    }

    listener(event) {
        if (this.props.showMenu) {
            const key = event.code || event.which || event.keyCode;
            this.interactMenu(key, null);
        }
    }

    gamepadListener(event) {
        if (this.props.showMenu) {
            this.interactMenu(null, event.detail as ControlsState);
        }
    }

    itemChanged(selectedIndex) {
        if (this.state.items.length > 0) {
            this.props.onItemChanged(this.state.items[selectedIndex].index);
            if (this.state.items[selectedIndex].index === 74) {
                this.setState({
                    items: getOptionItems(),
                    selectedIndex: 0,
                });
            } else if (this.state.items[selectedIndex].index === 741) {
                this.setState({
                    items: getMenuItems(this.props.inGameMenu),
                    selectedIndex: 0,
                });
            }
        }
    }

    update() { }

    render() {
        if (this.props.showMenu) {
            const { game } = getParams();
            const className = `${this.props.inGameMenu ? 'bgInGameMenu' : `bgMenu ${game}`} fullscreen`;
            return <div className={className}>
                <div className="menu">
                    <ul className="menuList">
                        {map(this.state.items,
                            (i, idx) =>
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
