import React from 'react';
import Area from './editor/Area';
import GameArea from './editor/areas/GameArea';
import ScriptEditorArea from './editor/areas/ScriptEditorArea';
import {fullscreen} from './styles';
import {extend, clone, cloneDeep, each, concat} from 'lodash';

const Type = {
    LAYOUT: 0,
    AREA: 1
};

export const Orientation = {
    HORIZONTAL: 0,
    VERTICAL: 1
};

// const baseLayout = {
//     type: Type.LAYOUT,
//     orientation: Orientation.VERTICAL,
//     splitAt: 65,
//     children: [
//         {
//             type: Type.LAYOUT,
//             orientation: Orientation.HORIZONTAL,
//             splitAt: 50,
//             children: [
//                 {type: Type.AREA, content: GameArea, toolShelfEnabled: false},
//                 {type: Type.AREA, content: ScriptEditorArea}
//             ]
//         },
//         {
//             type: Type.LAYOUT,
//             orientation: Orientation.HORIZONTAL,
//             splitAt: 50,
//             children: [
//                 {type: Type.AREA, content: ScriptEditorArea},
//                 {
//                     type: Type.LAYOUT,
//                     orientation: Orientation.HORIZONTAL,
//                     splitAt: 50,
//                     children: [
//                         {type: Type.AREA, content: ScriptEditorArea},
//                         {type: Type.AREA, content: ScriptEditorArea}
//                     ]
//                 }
//             ]
//         }
//     ]
// };

const defaultLayout = {type: Type.AREA, content: GameArea, toolShelfEnabled: false, root: true};

const baseStyle = extend({overflow: 'hidden'}, fullscreen);

const separatorStyle = {
    [Orientation.HORIZONTAL]: {
        position: 'absolute',
        top: 0,
        bottom: 0
    },
    [Orientation.VERTICAL]: {
        position: 'absolute',
        left: 0,
        right: 0
    }
};

export default class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.updateSeparator = this.updateSeparator.bind(this);
        this.enableSeparator = this.enableSeparator.bind(this);
        this.disableSeparator = this.disableSeparator.bind(this);

        this.state = {
            layout: defaultLayout,
            separator: null
        }
    }

    componentWillMount() {
        document.addEventListener('mousedown', this.enableSeparator);
        document.addEventListener('mousemove', this.updateSeparator);
        document.addEventListener('mouseup', this.disableSeparator);
        document.addEventListener('mouseleave', this.disableSeparator);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.enableSeparator);
        document.removeEventListener('mousemove', this.updateSeparator);
        document.removeEventListener('mouseup', this.disableSeparator);
        document.removeEventListener('mouseleave', this.disableSeparator);
    }

    enableSeparator(e) {
        const separator = this.findSeparator(e.path, this.state.layout, []);
        if (separator) {
            this.setState({separator});
            e.preventDefault();
            e.stopPropagation();
        }
    }

    findSeparator(path, node, sepPath) {
        if (node.type === Type.LAYOUT) {
            if (node.rootRef && node.separatorRef && path.indexOf(node.separatorRef) !== -1) {
                const horizontal = node.orientation === Orientation.HORIZONTAL;
                const bb = node.rootRef.getBoundingClientRect();
                return {
                    prop: horizontal ? 'clientX' : 'clientY',
                    min: bb[horizontal ? 'left' : 'top'],
                    max: node.rootRef[horizontal ? 'clientWidth' : 'clientHeight'],
                    path: sepPath
                };
            } else {
                return this.findSeparator(path, node.children[0], concat(sepPath, 0))
                    || this.findSeparator(path, node.children[1], concat(sepPath, 1));
            }
        } else {
            return null;
        }
    }

    disableSeparator() {
        this.setState({separator: null});
    }

    updateSeparator(e) {
        const separator = this.state.separator;
        if (separator) {
            const splitAt = 100 * ((e[separator.prop] - separator.min) / separator.max);
            const layout = cloneDeep(this.state.layout);
            const node = this.findNodeFromPath(layout, separator.path);
            node.splitAt = Math.min(Math.max(splitAt, 5), 95);
            this.setState({layout});
            e.preventDefault();
            e.stopPropagation();
        }
    }

    findNodeFromPath(layout, path) {
        let node = layout;
        each(path, elem => {
            node = node.children[elem];
        });
        return node;
    }

    render() {
        return this.renderLayout(this.state.layout, baseStyle, []);
    }

    renderLayout(node, style, path) {
        if (node.type === Type.LAYOUT) {
            const p = node.orientation === Orientation.HORIZONTAL
                ? ['right', 'left', 'width', 'col-resize']
                : ['bottom', 'top', 'height', 'row-resize'];

            const styles = [
                extend({}, baseStyle, {[p[0]]: `${100 - node.splitAt}%`}),
                extend({}, baseStyle, {[p[1]]: `${node.splitAt}%`})
            ];

            const separator = extend({
                [p[1]]: `${node.splitAt}%`,
                [p[2]]: 12,
                transform: node.orientation === Orientation.HORIZONTAL
                    ? 'translate(-6px, 0)'
                    : 'translate(0, -6px)',
                background: 'rgba(0,0,0,0)',
                cursor: p[3]
            }, separatorStyle[node.orientation]);

            const sepInnerLine = extend({
                [p[1]]: 5,
                [p[2]]: 2,
                background: 'gray',
                opacity: 1,
            }, separatorStyle[node.orientation]);

            const setSeparatorRef = (ref) => {
                node.separatorRef = ref;
            };

            const setRootRef = (ref) => {
                node.rootRef = ref;
            };

            return <div ref={setRootRef} style={style}>
                {this.renderLayout(node.children[0], styles[0], concat(path, 0))}
                {this.renderLayout(node.children[1], styles[1], concat(path, 1))}
                <div ref={setSeparatorRef} style={separator}>
                    <div style={sepInnerLine}/>
                </div>
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
                         split={this.split.bind(this, path)}
                         close={path.length > 0 && !node.root ? this.close.bind(this, path) : null}
                         setToolShelf={setToolShelf}/>;
        }
    }

    split(path, orientation) {
        if (path.length === 0) {
            this.setState({
                layout: {
                    type: Type.LAYOUT,
                    orientation: orientation,
                    splitAt: 50,
                    children: [
                        clone(this.state.layout),
                        {type: Type.AREA, content: ScriptEditorArea}
                    ]
                }
            })
        } else {
            const parentPath = path.slice(0, path.length - 1);
            const idx = path[path.length - 1];
            const layout = cloneDeep(this.state.layout);
            const pNode = this.findNodeFromPath(layout, parentPath);
            pNode.children[idx] = {
                type: Type.LAYOUT,
                orientation: orientation,
                splitAt: 50,
                children: [
                    pNode.children[idx],
                    {type: Type.AREA, content: ScriptEditorArea}
                ]
            };
            this.setState({layout});
        }
    }

    close(path) {
        if (path.length === 1) {
            this.setState({
                layout: this.state.layout.children[1 - path[0]]
            })
        } else {
            const grandParentPath = path.slice(0, path.length - 2);
            const idx = path[path.length - 2];
            const layout = cloneDeep(this.state.layout);
            const gpNode = this.findNodeFromPath(layout, grandParentPath);
            const tgtIdx = 1 - path[path.length - 1];
            gpNode.children[idx] = gpNode.children[idx].children[tgtIdx];
            this.setState({layout});
        }
    }
}
