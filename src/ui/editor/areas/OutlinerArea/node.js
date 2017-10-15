import React from 'react';
import FrameListener from '../../../utils/FrameListener';
import {map, concat, find, isFunction} from 'lodash';

class StaticNode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: props.node.collapsed
        };
    }

    render() {
        const fontSize = this.props.fontSize || 18;
        const node = this.props.node;
        return <div>
            <div style={{fontSize, padding: `${fontSize / 8}px 0`}}>
                {this.renderCollapseButton()}
                &nbsp;
                <span style={{cursor: 'pointer'}} onClick={this.props.setRoot.bind(null, this.props.path)}>{node.name}</span>
                </div>
            <div style={{paddingLeft: '2ch'}}>{this.renderChildren(fontSize)}</div>
        </div>;
    }

    renderCollapseButton() {
        const collapsed = this.state.collapsed;
        const children = this.getChildren();
        if (children.length > 0) {
            return <span onClick={this.toggleCollapse.bind(this)} style={{cursor: 'pointer'}}>{collapsed ? '+' : '-'}</span>;
        } else {
            return <span>&bull;</span>;
        }
    }

    toggleCollapse() {
        this.setState({collapsed: !this.state.collapsed});
    }

    renderChildren(fontSize) {
        const childFontSize = Math.max(fontSize - 2, 12);
        const children = this.getChildren();
        if (!this.state.collapsed) {
            return map(
                children,
                child => {
                    return <Node key={`${this.props.path.join('/')}/${child.name}`}
                                 node={child}
                                 fontSize={childFontSize}
                                 setRoot={this.props.setRoot}
                                 path={concat(this.props.path, child.name)}
                                 ticker={this.props.ticker}/>
                }
            );
        } else {
            return null;
        }
    }

    getChildren() {
        if ('children' in this.props) {
            return this.props.children;
        } else {
            return this.props.node.children;
        }
    }
}

class DynamicNode extends FrameListener {
    constructor(props) {
        super(props);
        this.state = {
            children: props.node.children()
        };
    }

    frame() {
        const baseChildren = this.state.children;
        const children = this.props.node.children();
        if (children.length !== baseChildren.length) {
            this.setState({children});
        } else {
            const different = find(children, (child, idx) => child.name !== baseChildren[idx].name);
            if (different) {
                this.setState({children});
            }
        }
    }

    render() {
        return <StaticNode {...this.props} children={this.state.children} />;
    }
}

export default class Node extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const dynamic = isFunction(this.props.node.children);
        return dynamic ? <DynamicNode {...this.props}/> : <StaticNode {...this.props}/>;
    }
}
