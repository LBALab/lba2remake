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
        if (!this.state.root) {
            const root = this.findRoot(this.props.sharedState.path);
            if (root) {
                this.setState({root});
            }
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({ root: this.findRoot(newProps.sharedState.path) });
    }

    render() {
        const root = this.state.root;
        return <div style={style}>
            {this.renderPath()}
            {root
                ? <Node node={root}
                        setRoot={this.setRoot.bind(this)}
                        path={this.props.sharedState.path}
                        ticker={this.props.ticker}
                        level={0} />
                : 'Node is not available.'}
        </div>;
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
                {map(path, (elem, idx) => {
                    const subpath = path.slice(0, idx + 1);
                    const e = elem.split(':');
                    return <span key={idx}>
                        &nbsp;<span style={{color: '#65a7ff'}}>&gt;</span>&nbsp;
                        {renderElement(subpath, e[e.length - 1])}
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
        each(path, name => {
            if (!node)
                return;
            if (node.dynamic) {
                let childNode = null;
                for (let i = 0; i < node.getNumChildren(); ++i) {
                    const child = node.getChild(i);
                    if (child && child.name === name) {
                        childNode = child;
                        break;
                    }
                }
                node = childNode;
            } else {
                node = find(node.children, child => child.name === name);
            }
        });
        return node;
    }
}