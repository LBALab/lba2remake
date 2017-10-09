import React from 'react';
import Area from './editor/Area';
import GameArea from './editor/areas/GameArea';
import ScriptEditorArea from './editor/areas/ScriptEditorArea';
import {fullscreen} from './styles';
import {extend} from 'lodash';

const Type = {
    LAYOUT: 0,
    AREA: 1
};

const Orientation = {
    HORIZONTAL: 0,
    VERTICAL: 1
};

const baseLayout = {
    type: Type.LAYOUT,
    orientation: Orientation.VERTICAL,
    split: 65,
    children: [
        {type: Type.AREA, content: GameArea, toolShelfEnabled: true},
        {type: Type.AREA, content: ScriptEditorArea}
    ]
};

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            layout: baseLayout
        }
    }

    render() {
        return this.renderLayout(this.state.layout, fullscreen);
    }

    renderLayout(node, style) {
        if (node.type === Type.LAYOUT) {
            const pos = node.orientation === Orientation.HORIZONTAL
                ? ['right', 'left']
                : ['bottom', 'top'];
            const styles = [
                extend({}, fullscreen, {[pos[0]]: `${100 - node.split}%`}),
                extend({}, fullscreen, {[pos[1]]: `${node.split}%`})
            ];
            return <div style={style}>
                {this.renderLayout(node.children[0], styles[0])}
                {this.renderLayout(node.children[1], styles[1])}
            </div>;
        } else {
            const setToolShelf = (value) => {
                node.toolShelfEnabled = value;
                this.setState({layout: this.state.layout});
            };
            return <Area area={node.content}
                         style={style}
                         params={this.props.params}
                         ticker={this.props.ticker}
                         toolShelfEnabled={node.toolShelfEnabled}
                         setToolShelf={setToolShelf}/>;
        }
    }
}
