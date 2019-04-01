import React from 'react';
import {extend, map, each, isFunction} from 'lodash';
import OutlinerNode from './OutlinerNode';
import {fullscreen} from '../../../../styles';
import FrameListener from '../../../../utils/FrameListener';
import {WithShortcuts} from '../../../Area';

const style = extend({
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: 8,
    userSelect: 'none',
    cursor: 'default',
    fontWeight: 'normal'
}, fullscreen);

const Separator = {
    normal: <React.Fragment>
        &nbsp;<span style={{color: '#65a7ff'}}>&gt;</span>&nbsp;
    </React.Fragment>,
    dot: '.'
};

export function makeContentComponent(tree, frame, ownStyle, sep = 'normal', hideRoot = false) {
    return class OutlinerAreaContent extends FrameListener {
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
                return <WithShortcuts>
                    {shortcuts => <OutlinerNode
                        hidden={hideRoot}
                        parentHidden={false}
                        key={path.join('/')}
                        node={root.node}
                        data={root.data}
                        setRoot={this.setRoot.bind(this)}
                        path={this.props.sharedState.path}
                        prettyPath={
                            this.props.sharedState.prettyPath
                            || this.props.sharedState.path
                        }
                        activePath={this.props.sharedState.activePath}
                        ticker={this.props.ticker}
                        level={0}
                        split={this.props.split}
                        shortcuts={shortcuts}
                        rootName={isFunction(tree.name) ? tree.name() : tree.name}
                        userData={this.props.userData}
                        rootStateHandler={this.props.rootStateHandler}
                        rootState={this.props.rootState}
                        editor={this.props.editor}
                    />}
                </WithShortcuts>;
            }
            return <span>Node is not available. {sep === 'dot' && <button onClick={() => this.setRoot([])}>Reset</button>}</span>;
        }

        renderPath() {
            const path = this.props.sharedState.path;
            const prettyPath = this.props.sharedState.prettyPath || path;
            const renderElement =
                (subpath, prettySubpath, elem) => <span style={{cursor: 'pointer'}} onClick={this.setRoot.bind(this, subpath, prettySubpath)}>
                    {elem}
                </span>;
            if (path.length > 0) {
                return <div style={{paddingBottom: 2}}>
                    <div style={{overflowX: 'auto', paddingBottom: 6, whiteSpace: 'nowrap'}}>
                        {renderElement([], [], isFunction(tree.name) ? tree.name() : tree.name)}
                        {map(prettyPath, (name, idx) => {
                            const subpath = path.slice(0, idx + 1);
                            const prettySubpath = prettyPath.slice(0, idx + 1);
                            return <span key={idx}>
                                {Separator[sep]}
                                {renderElement(subpath, prettySubpath, name)}
                            </span>;
                        })}
                    </div>
                    <hr style={{border: 'none', borderBottom: '1px dashed rgba(200, 200, 200, 0.5)'}}/>
                </div>;
            }
            return null;
        }

        setRoot(path, prettyPath) {
            this.props.stateHandler.setPath(path, prettyPath);
        }

        findRoot(path) {
            let node = tree;
            let data = null;

            each(path, (key) => {
                if (!node)
                    return;

                let childNode = null;
                const numChildren = node.dynamic
                    ? node.numChildren(data, null, this)
                    : node.children.length;
                for (let i = 0; i < numChildren; i += 1) {
                    const child = node.dynamic ? node.child(data, i, this) : node.children[i];
                    if (child) {
                        const childData = node.dynamic ? node.childData(data, i, this) : null;
                        let childKey = null;
                        if (child.dynamic) {
                            childKey = child.key
                                ? child.key(childData, i)
                                : child.name(childData, i);
                        } else {
                            childKey = child.key || child.name;
                        }
                        if (childKey === key) {
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
