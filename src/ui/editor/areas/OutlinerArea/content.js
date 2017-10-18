import React from 'react';
import {extend, map, each, find} from 'lodash';
import OutlinerTree from './tree';
import Node from './node';
import {fullscreen} from '../../../styles';
import FrameListener from '../../../utils/FrameListener';

const style = extend({
    overflow: 'auto',
    padding: 8,
    userSelect: 'none',
    cursor: 'default',
    whiteSpace: 'nowrap'
}, fullscreen);

export default class OutlinerContent extends FrameListener {
    constructor(props) {
        super(props);
        this.state = {
            root: this.findRoot(this.props.sharedState.path)
        };
    }

    frame() {
        let root = this.state.root;
        if (!root.node || (root.node.hasChanged && root.node.hasChanged(root.data))) {
            root = this.findRoot(this.props.sharedState.path);
            if (root.node) {
                this.setState({root});
            }
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({ root: this.findRoot(newProps.sharedState.path) });
    }

    render() {
        return <div style={style}>
            {this.renderPath()}
            {this.renderContent()}
        </div>;
    }

    renderContent() {
        const root = this.state.root;
        const path = this.props.sharedState.path;
        if (root.node) {
            return <Node key={path.join('/')}
                         node={root.node}
                         data={root.data}
                         setRoot={this.setRoot.bind(this)}
                         path={this.props.sharedState.path}
                         ticker={this.props.ticker}
                         level={0} />;
        } else {
            return 'Node is not available.';
        }
    }

    renderPath() {
        const path = this.props.sharedState.path;
        const renderElement =
            (subpath, elem) => <span style={{cursor: 'pointer'}} onClick={this.setRoot.bind(this, subpath)}>
                {elem}
            </span>;
        if (path.length > 0) {
            return <div style={{paddingBottom: 8}}>
                {renderElement([], OutlinerTree.name)}
                {map(path, (name, idx) => {
                    const subpath = path.slice(0, idx + 1);
                    return <span key={idx}>
                        &nbsp;<span style={{color: '#65a7ff'}}>&gt;</span>&nbsp;
                        {renderElement(subpath, name)}
                    </span>;
                })}
            </div>
        } else {
            return null;
        }
    }

    setRoot(path) {
        this.props.stateHandler.setPath(path);
    }

    findRoot(path) {
        let node = OutlinerTree;
        let data = null;

        const getName = (n, d, i) => n.dynamic ? n.name(d, i) : n.name;
        each(path, name => {
            if (!node)
                return;
            if (node.dynamic) {
                let childNode = null;
                for (let i = 0; i < node.numChildren(); ++i) {
                    const child = node.child(data, i);
                    if (child) {
                        const childName = getName(child, data, i);
                        if (childName === name) {
                            childNode = child;
                            data = node.childData(data, i);
                            break;
                        }
                    }
                }
                node = childNode;
            } else {
                node = find(node.children, (child, i) => getName(child, data, i) === name);
            }
        });
        return {node, data};
    }
}