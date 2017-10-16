import React from 'react';
import FrameListener from '../../../utils/FrameListener';
import {map, concat, times} from 'lodash';

function renderCollapseButton(numChildren) {
    const collapsed = this.state.collapsed;
    if (numChildren > 0) {
        return <span onClick={toggleCollapse.bind(this)} style={{cursor: 'pointer'}}>{collapsed ? '+' : '-'}</span>;
    } else {
        return <span>&bull;</span>;
    }
}

function toggleCollapse() {
    this.setState({collapsed: !this.state.collapsed});
}

function renderProps() {
    const node = this.props.node;
    const nodeProps = node.props;
    const propStyle = {
        padding: '0 3px',
        verticalAlign: 'middle'
    };
    if (nodeProps) {
        return <span style={{color: '#858585'}}>
            {
                map(nodeProps, prop => {
                    const elem = node.renderProp && node.renderProp(prop.id, prop.value);
                    return <span key={prop.id} style={propStyle}>{elem ? elem : `${prop.id}=${prop.value}`}</span>;
                })
            }
        </span>;
    } else {
        return null;
    }
}

function renderNode(numChildren) {
    const fontSize = this.props.fontSize || 18;
    const childFontSize = Math.max(fontSize - 2, 14);
    const node = this.props.node;
    const onClick = node.onClick ? node.onClick : this.props.setRoot.bind(null, this.props.path);
    const nameStyle = {
        cursor: 'pointer',
        background: node.selected ? 'white' : 'transparent',
        color: node.selected ? 'black' : 'inherit',
        padding: node.selected ? '0 2px' : 0
    };
    return <div>
        <div style={{fontSize, padding: `${fontSize / 8}px 0`}}>
            {renderCollapseButton.call(this, numChildren)}
            &nbsp;
            <span style={nameStyle} onClick={onClick}>{node.name}</span>
            &nbsp;
            {renderProps.call(this)}
        </div>
        <div style={{paddingLeft: '2ch'}}>{this.renderChildren(childFontSize)}</div>
    </div>;
}

class StaticNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: this.props.level > 1
        };
    }

    render() {
        return renderNode.call(this, this.props.node.children.length);
    }

    renderChildren(childFontSize) {
        const children = this.props.node.children;
        if (!this.state.collapsed) {
            return map(
                children,
                child => {
                    const path = concat(this.props.path, child.name);
                    return <Node key={path.join('/')}
                                 node={child}
                                 fontSize={childFontSize}
                                 setRoot={this.props.setRoot}
                                 path={path}
                                 ticker={this.props.ticker}
                                 level={this.props.level + 1} />
                }
            );
        } else {
            return null;
        }
    }
}

class DynamicNodeContent extends FrameListener {
    constructor(props) {
        super(props);
        this.state = {
            value: props.getValue()
        };
    }

    frame() {
        if (this.props.hasChanged(this.state.value)) {
            this.setState({
                value: this.props.getValue()
            });
        }
    }

    render() {
        const value = this.state.value;
        return <Node node={value}
                     fontSize={this.props.fontSize}
                     setRoot={this.props.setRoot}
                     path={this.props.path}
                     ticker={this.props.ticker}
                     level={this.props.level} />;
    }
}

class DynamicNode extends FrameListener {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: this.props.level > 1,
            numChildren: props.node.getNumChildren()
        };
    }

    frame() {
        const numChildren = this.props.node.getNumChildren();
        if (numChildren !== this.state.numChildren) {
            this.setState({numChildren});
        }
    }

    render() {
        return renderNode.call(this, this.state.numChildren);
    }

    renderChildren(childFontSize) {
        const childNeedsUpdate = this.props.node.childNeedsUpdate || (() => false);
        if (!this.state.collapsed) {
            return times(
                this.state.numChildren,
                (idx) => {
                    const getValue = this.props.node.getChild.bind(null, idx);
                    const value = getValue();
                    const name = value ? value.name : idx;
                    const path = concat(this.props.path, name);
                    return <DynamicNodeContent key={path.join('/')}
                                               getValue={getValue}
                                               hasChanged={childNeedsUpdate.bind(null, idx)}
                                               fontSize={childFontSize}
                                               setRoot={this.props.setRoot}
                                               path={path}
                                               ticker={this.props.ticker}
                                               level={this.props.level + 1}/>
                }
            );
        } else {
            return null;
        }
    }
}

export default class Node extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.node) {
            const dynamic = this.props.node.dynamic;
            return dynamic ? <DynamicNode {...this.props}/> : <StaticNode {...this.props}/>;
        } else {
            return null;
        }
    }
}
