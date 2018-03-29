import React from 'react';
import {extend, map, each, isFunction} from 'lodash';
import Node from './node';
import {fullscreen} from '../../../styles';
import FrameListener from '../../../utils/FrameListener';

const style = extend({
    overflow: 'auto',
    padding: 8,
    userSelect: 'none',
    cursor: 'default',
    whiteSpace: 'nowrap',
    fontWeight: 'normal'
}, fullscreen);

export function makeContentComponent(tree, frame, ownStyle) {
    return class OutlinerContent extends FrameListener {
        constructor(props) {
            super(props);
            this.state = {
                root: this.findRoot(this.props.sharedState.path)
            };
            if (frame) {
                this.extraFrameHandler = frame.bind(this);
            }
        }

        frame() {
            let root = this.state.root;
            if (!root.node || (root.node.hasChanged && root.node.hasChanged(root.data))) {
                root = this.findRoot(this.props.sharedState.path);
                if (root.node) {
                    this.setState({root});
                }
            }
            if (this.extraFrameHandler) {
                this.extraFrameHandler();
            }
        }

        componentWillReceiveProps(newProps) {
            this.setState({ root: this.findRoot(newProps.sharedState.path) });
        }

        render() {
            const extStyle = extend({}, style, ownStyle);
            return <div style={extStyle}>
                {this.renderPath()}
                {this.renderContent()}
            </div>;
        }

        renderContent() {
            const root = this.state.root;
            const path = this.props.sharedState.path;
            if (root.node) {
                return <Node
                    key={path.join('/')}
                    node={root.node}
                    data={root.data}
                    setRoot={this.setRoot.bind(this)}
                    path={this.props.sharedState.path}
                    activePath={this.props.sharedState.activePath}
                    ticker={this.props.ticker}
                    level={0}
                    split={this.props.split}
                />;
            }
            return 'Node is not available.';
        }

        renderPath() {
            const path = this.props.sharedState.path;
            const renderElement =
                (subpath, elem) => <span style={{cursor: 'pointer'}} onClick={this.setRoot.bind(this, subpath)}>
                    {elem}
                </span>;
            if (path.length > 0) {
                return <div style={{paddingBottom: 8}}>
                    {renderElement([], isFunction(tree.name) ? tree.name() : tree.name)}
                    {map(path, (name, idx) => {
                        const subpath = path.slice(0, idx + 1);
                        return <span key={idx}>&nbsp;
                            <span style={{color: '#65a7ff'}}>&gt;</span>&nbsp;
                            {renderElement(subpath, name)}
                        </span>;
                    })}
                </div>;
            }
            return null;
        }

        setRoot(path) {
            this.props.stateHandler.setPath(path);
        }

        findRoot(path) {
            let node = tree;
            let data = null;

            each(path, (name) => {
                if (!node)
                    return;

                let childNode = null;
                const numChildren = node.dynamic ? node.numChildren(data) : node.children.length;
                for (let i = 0; i < numChildren; i += 1) {
                    const child = node.dynamic ? node.child(data, i) : node.children[i];
                    if (child) {
                        const childData = node.dynamic ? node.childData(data, i) : null;
                        const childName = child.dynamic ? child.name(childData, i) : child.name;
                        if (childName === name) {
                            childNode = child;
                            data = childData;
                            break;
                        }
                    }
                }
                node = childNode;
            });
            return {node, data};
        }
    };
}
