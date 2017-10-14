import React from 'react';
import Area from './editor/Area';
import {fullscreen} from './styles';
import {extend, each, concat, mapValues} from 'lodash';
import GameArea from './editor/areas/GameArea';
import NewArea from "./editor/areas/NewArea";
import {MainAreas, SubAreas, findAreaContentByName} from './editor/areas/all';
import ScriptEditorArea from "./editor/areas/ScriptEditorArea";

const Type = {
    LAYOUT: 0,
    AREA: 1
};

export const Orientation = {
    HORIZONTAL: 0,
    VERTICAL: 1
};

const defaultLayout = {
    type: Type.LAYOUT,
    orientation: Orientation.HORIZONTAL,
    splitAt: 50,
    children: [
        {
            type: Type.AREA,
            content: GameArea,
            root: true
        },
        {
            type: Type.AREA,
            content: ScriptEditorArea
        }
    ],

};

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
        this.saveMainData = this.saveMainData.bind(this);

        this.state = {
            layout: this.initLayout(loadLayout()),
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
        if (this.state.separator) {
            this.setState({separator: null});
            saveLayout(this.state.layout);
        }
    }

    updateSeparator(e) {
        const separator = this.state.separator;
        if (separator) {
            const splitAt = 100 * ((e[separator.prop] - separator.min) / separator.max);
            const layout = this.state.layout;
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
            const availableAreas = node.content.mainArea ? MainAreas : SubAreas;
            return <Area key={`${path.join('/')}/${node.content.name}`}
                         node={node}
                         area={node.content}
                         stateHandler={node.stateHandler}
                         mainArea={node.content.mainArea}
                         availableAreas={availableAreas}
                         selectAreaContent={this.selectAreaContent.bind(this, path)}
                         style={style}
                         params={this.props.params}
                         ticker={this.props.ticker}
                         split={this.split.bind(this, path)}
                         close={path.length > 0 && !node.root ? this.close.bind(this, path) : null}
                         saveMainData={this.saveMainData}
                         mainData={this.state.mainData}/>;
        }
    }

    split(path, orientation) {
        if (path.length === 0) {
            const layout = {
                type: Type.LAYOUT,
                orientation: orientation,
                splitAt: 50,
                children: [
                    this.state.layout,
                    this.initLayout({type: Type.AREA, content: NewArea})
                ]
            };
            this.setState({layout});
            saveLayout(layout);
        } else {
            const parentPath = path.slice(0, path.length - 1);
            const idx = path[path.length - 1];
            const layout = this.state.layout;
            const pNode = this.findNodeFromPath(layout, parentPath);
            pNode.children[idx] = {
                type: Type.LAYOUT,
                orientation: orientation,
                splitAt: 50,
                children: [
                    pNode.children[idx],
                    this.initLayout({type: Type.AREA, content: NewArea})
                ]
            };
            this.setState({layout});
            saveLayout(layout);
        }
    }

    close(path) {
        if (path.length === 1) {
            const layout = this.state.layout.children[1 - path[0]];
            this.setState({layout});
            saveLayout(layout);
        } else {
            const grandParentPath = path.slice(0, path.length - 2);
            const idx = path[path.length - 2];
            const layout = this.state.layout;
            const gpNode = this.findNodeFromPath(layout, grandParentPath);
            const pNode = gpNode.children[idx];
            const tgtIdx = 1 - path[path.length - 1];
            gpNode.children[idx] = pNode.children[tgtIdx];
            this.setState({layout});
            saveLayout(layout);
        }
    }

    selectAreaContent(path, area) {
        const layout = this.state.layout;
        const node = this.findNodeFromPath(layout, path);
        node.content = area;
        this.initLayout(node);
        this.setState({layout});
        saveLayout(layout);
    }

    saveMainData(data) {
        this.setState({mainData: data});
    }

    initLayout(node, root = node) {
        if (node.type === Type.LAYOUT) {
            this.initLayout(node.children[0], root);
            this.initLayout(node.children[1], root);
        } else {
            node.stateHandler = {
                state: node.content.getInitialState(),
                setState: (state) => {
                    extend(node.stateHandler.state, state);
                    this.setState({layout: this.state.layout});
                    saveLayout(this.state.layout);
                }
            };
            extend(
                node.stateHandler,
                mapValues(node.content.stateHandler, f => f.bind(node.stateHandler))
            );
        }
        return root;
    }


}

function saveLayout(layout) {
    const saveData = JSON.stringify(saveNode(layout));
    localStorage.setItem('editor_layout', saveData);
}

function saveNode(node) {
    if (node.type === Type.LAYOUT) {
        return {
            type: Type.LAYOUT,
            orientation: node.orientation,
            splitAt: node.splitAt,
            children: [
                saveNode(node.children[0]),
                saveNode(node.children[1])
            ]
        };
    } else {
        return {
            type: Type.AREA,
            content: node.content.name,
            root: node.root
        };
    }
}

function loadLayout() {
    const data = localStorage.getItem('editor_layout');
    if (data) {
        try {
            return loadNode(JSON.parse(data));
        } catch(e) {}
    }
    return defaultLayout;
}

function loadNode(node) {
    if (node.type === Type.LAYOUT) {
        return {
            type: Type.LAYOUT,
            orientation: node.orientation,
            splitAt: node.splitAt,
            children: [
                loadNode(node.children[0]),
                loadNode(node.children[1])
            ]
        };
    } else {
        return {
            type: Type.AREA,
            content: findAreaContentByName(node.content),
            root: node.root
        };
    }
}