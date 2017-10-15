import React from 'react';
import {extend, map, each, find, isFunction} from 'lodash';
import OutlinerTree from './tree';
import Node from './node';
import {fullscreen} from '../../../styles';

const style = extend({
    overflow: 'auto',
    padding: 8,
    userSelect: 'none',
    cursor: 'default',
    whiteSpace: 'nowrap'
}, fullscreen);

export default class OutlinerContent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const root = this.findRoot();
        const path = this.props.sharedState.path;
        return <div style={style}>
            {this.renderPath()}
            {root
                ? <Node node={root}
                        setRoot={this.setRoot.bind(this)}
                        path={this.props.sharedState.path}
                        ticker={this.props.ticker}
                        level={0} />
                : `${path[path.length - 1]} node is not available.`}
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
                    return <span key={idx}>
                        &nbsp;<span style={{color: '#65a7ff'}}>&gt;</span>&nbsp;
                        {renderElement(subpath, elem)}
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

    findRoot() {
        const path = this.props.sharedState.path;
        let node = OutlinerTree;
        each(path, name => {
            const children = isFunction(node.children) ? node.children() : node.children;
            node = find(children, child => child.name === name);
        });
        return node;
    }
}