import React from 'react';
import {map, concat, times, isEqual, noop, isFunction} from 'lodash';
import NodeProps from './node_props';

export default class Node extends React.Component {
    constructor(props) {
        super(props);
        const node = props.node;
        this.state = {
            collapsed: !(this.props.level < 1 || this.isInActivePath(props)),
            name: this.name(),
            numChildren: this.numChildren(),
            selected: call('selected', node, this.props.data),
            menu: null,
            renaming: false,
            icon: this.icon()
        };
        this.renameShortcut = this.renameShortcut.bind(this);
        this.upShortcut = this.upShortcut.bind(this);
        this.downShortcut = this.downShortcut.bind(this);
        this.nodeProps = this.nodeProps.bind(this);
    }

    isInActivePath(props) {
        const activePath = props.activePath;
        const path = props.path;
        if (!activePath)
            return false;
        for (let i = 0; i < path.length; i += 1) {
            if (path[i] !== activePath[i])
                return false;
        }
        return true;
    }

    componentWillReceiveProps(newProps) {
        if (!isEqual(newProps.activePath, this.props.activePath)
            || !isEqual(newProps.path, this.props.path)) {
            const collapsed = !(newProps.level < 1 || this.isInActivePath(newProps));
            if (collapsed !== this.state.collapsed) {
                this.setState({collapsed});
            }
        }
    }

    componentWillMount() {
        if (this.props.node.dynamic || this.props.node.selected) {
            this.props.ticker.register(this);
        }
        this.props.shortcuts.register('rename', this.renameShortcut);
        this.props.shortcuts.register('up', this.upShortcut);
        this.props.shortcuts.register('down', this.downShortcut);
    }

    componentWillUnmount() {
        if (this.props.node.dynamic || this.props.node.selected) {
            this.props.ticker.unregister(this);
        }
        this.props.shortcuts.unregister('rename', this.renameShortcut);
        this.props.shortcuts.unregister('up', this.upShortcut);
        this.props.shortcuts.unregister('down', this.downShortcut);
    }

    renameShortcut() {
        if (this.state.selected && !this.state.renaming) {
            const node = this.props.node;
            const allow = node.allowRenaming && node.allowRenaming(this.props.data);
            if (allow) {
                this.setState({renaming: true});
            }
        }
    }

    upShortcut() {
        this.call('up', this.state.collapsed);
    }

    downShortcut() {
        this.call('down', this.state.collapsed);
    }

    frame() {
        if (this.props.node.dynamic) {
            const name = this.name();
            if (name !== this.state.name) {
                this.setState({name});
            }
            const icon = this.icon();
            if (icon !== this.state.icon) {
                this.setState({icon});
            }
            const numChildren = this.numChildren();
            if (numChildren !== this.state.numChildren) {
                this.setState({numChildren});
            }
        }
        const selected = call('selected', this.props.node, this.props.data);
        if (selected !== this.state.selected) {
            this.setState({selected});
        }
    }

    render() {
        const fontSize = this.props.fontSize || 18;
        const childFontSize = Math.max(fontSize - 2, 14);

        return <div>
            <div style={{fontSize, padding: `${fontSize / 8}px 0`}}>
                {this.renderCollapseButton()}
                {this.renderIcon()}
                {this.renderName()}
                {this.renderProps()}
            </div>
            <div style={{paddingLeft: '2ch'}}>{this.renderChildren(childFontSize)}</div>
            {this.renderContextMenu()}
        </div>;
    }

    renderContextMenu() {
        const menu = this.state.menu;
        if (menu) {
            const menuStyle = {
                position: 'fixed',
                left: menu.x - 4,
                top: menu.y - 4,
                padding: 0,
                background: '#cccccc',
                color: '#000000',
                border: '1px solid black',
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.5)'
            };

            const menuEntry = {
                padding: 4,
                border: '1px solid black',
            };

            const onClickRename = () => {
                this.setState({menu: null, renaming: true});
            };

            const onClickOther = (entry) => {
                entry.onClick(this, this.props.data);
                this.setState({menu: null});
            };

            return <div style={menuStyle} onMouseLeave={() => this.setState({menu: null})}>
                {menu.renaming ? <div style={menuEntry} onClick={onClickRename}>Rename</div> : null}
                {map(menu.entries, (entry, idx) =>
                    <div key={idx} style={menuEntry} onClick={onClickOther.bind(null, entry)}>
                        {entry.name}
                    </div>)}
            </div>;
        }
        return null;
    }

    renderIcon() {
        return this.state.icon !== 'none' ? <img key="icon" style={{verticalAlign: 'middle', padding: '0 5px'}} src={this.state.icon}/> : ' ';
    }

    renderName() {
        const node = this.props.node;
        const selected = this.state.selected;
        const setRoot = this.props.setRoot.bind(null, this.props.path);
        const onClick = node.onClick ? node.onClick.bind(null, this.props.data, setRoot) : setRoot;
        const onDoubleClick = node.onDoubleClick ?
            node.onDoubleClick.bind(null, this.props.data, this) : noop;

        const color = (isFunction(node.color) ? this.call('color') : node.color) || 'inherit';

        const nameStyle = {
            cursor: 'pointer',
            background: selected ? 'white' : 'transparent',
            color: selected ? 'black' : color,
            padding: selected ? '0 2px' : 0,
            verticalAlign: 'middle'
        };

        const onContextMenu = (e) => {
            e.preventDefault();
            const renaming = node.allowRenaming && node.allowRenaming(this.props.data);
            if (node.ctxMenu || renaming) {
                this.setState({
                    menu: {
                        x: e.clientX,
                        y: e.clientY,
                        entries: node.ctxMenu,
                        renaming
                    }
                });
            }
        };

        const restoreFocus = () => {
            if (this.savedFocus) {
                this.savedFocus.focus();
            }
        };

        const onKeyDown = (e) => {
            const key = e.code || e.which || e.keyCode;
            if ((key === 'Enter' || key === 13) && e.target.value) {
                node.rename(this.props.data, e.target.value);
                this.setState({renaming: false});
                restoreFocus();
            } else if (key === 'Esc' || key === 27) {
                this.setState({renaming: false});
                restoreFocus();
            }
            e.stopPropagation();
        };

        const onBlur = () => {
            this.setState({renaming: false});
        };

        const renaming = this.state.renaming;

        const onInputRef = (ref) => {
            if (ref && ref !== document.activeElement) {
                ref.value = this.state.name;
                this.savedFocus = document.activeElement;
                ref.focus();
                ref.select();
            }
        };

        return <span
            style={nameStyle}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onContextMenu={renaming ? null : onContextMenu}
        >
            {renaming
                ? <input ref={onInputRef} onBlur={onBlur} onKeyDown={onKeyDown}/>
                : this.state.name}
        </span>;
    }

    renderCollapseButton() {
        const toggleCollapse = () => {
            this.setState({collapsed: !this.state.collapsed});
        };

        const numChildren = this.state.numChildren;
        const collapsed = this.state.collapsed;
        if (numChildren > 0) {
            return <span onClick={toggleCollapse} style={{cursor: 'pointer'}}>{collapsed ? '+' : '-'}</span>;
        }
        return <span>&nbsp;</span>;
    }

    renderProps() {
        return <NodeProps
            nodeProps={this.nodeProps}
            ticker={this.props.ticker}
            dynamic={this.props.node.dynamic}
        />;
    }

    renderChildren(childFontSize) {
        const node = this.props.node;
        if (!this.state.collapsed) {
            return node.dynamic
                ? this.renderDynamicChildren(childFontSize)
                : this.renderStaticChildren(childFontSize);
        }
        return null;
    }

    renderStaticChildren(childFontSize) {
        return map(
            this.props.node.children,
            (child, idx) => this.renderChild(childFontSize, child, idx)
        );
    }

    renderDynamicChildren(childFontSize) {
        return times(
            this.state.numChildren,
            (idx) => {
                const child = this.call('child', idx);
                const childData = this.call('childData', idx);
                return this.renderChild(childFontSize, child, idx, childData);
            }
        );
    }

    renderChild(childFontSize, child, idx, childData) {
        if (!child)
            return null;

        const childName = child.dynamic ? call('name', child, childData, idx) : child.name;
        const path = concat(this.props.path, childName || idx);
        return <Node
            key={path.join('/')}
            node={child}
            data={childData}
            fontSize={childFontSize}
            setRoot={this.props.setRoot}
            path={path}
            activePath={this.props.activePath}
            ticker={this.props.ticker}
            level={this.props.level + 1}
            split={this.props.split}
            shortcuts={this.props.shortcuts}
            userData={this.props.userData}
        />;
    }

    numChildren() {
        const node = this.props.node;
        return node.dynamic ? this.call('numChildren') : node.children.length;
    }

    icon() {
        const node = this.props.node;
        const icon = node.dynamic ? this.call('icon') : node.icon;
        return icon || 'editor/icons/node.png';
    }

    name() {
        const node = this.props.node;
        return node.dynamic ? this.call('name') : node.name;
    }

    nodeProps() {
        const node = this.props.node;
        return node.dynamic ? this.call('props', this.state && this.state.collapsed) : (node.props ? node.props : []);
    }

    call(method, arg) {
        return call(method, this.props.node, this.props.data, arg, this);
    }
}

function call(method, node, data, arg, component) {
    const fct = node[method];
    const ok = node.needsData ? (data !== undefined && data !== null) : true;
    if (fct && ok) {
        return fct(data, arg, component);
    } else if (method === 'numChildren') {
        return 0;
    } else if (method === 'props') {
        return [];
    }
    return null;
}
