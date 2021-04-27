import * as React from 'react';
import {extend, each, concat, mapValues, cloneDeep} from 'lodash';
import Area, {AreaDefinition} from './editor/Area';
import NewArea from './editor/areas/utils/NewArea';
import {Type, Orientation} from './editor/layout';
import {findAreaContentById, findMainAreas} from './editor/areas';
import DebugData from './editor/DebugData';
import Ticker from './utils/Ticker';

const baseStyle = {
    position: 'absolute' as const,
    overflow: 'hidden' as const
};

const editor_style = {
    position: 'fixed' as const,
    top: 2,
    bottom: 2,
    left: 2,
    right: 2
};

interface BaseNode {
    type: number;
}

interface LayoutNode extends BaseNode {
    children: Node[];
    orientation: number;
    splitAt: number;
}

interface AreaNode extends BaseNode {
    content: React.ElementType;
}

type Node = LayoutNode | AreaNode;

interface NodeOptions {
    injectArea?: AreaDefinition;
    injectOrientation?: number;
    rootState?: any;
}

interface EditorProps {
    ticker: Ticker;
}

interface EditorState {
    layout: Node;
    root: AreaDefinition;
    separator: {
        prop: 'clientX' | 'clientY';
        min: number,
        max: number,
        node: LayoutNode
    };
}

let gId = 0;

const getId = () => {
    gId += 1;
    return gId;
};

export default class Editor extends React.Component<EditorProps, EditorState> {
    rootRef: HTMLDivElement;

    constructor(props) {
        super(props);

        this.updateSeparator = this.updateSeparator.bind(this);
        this.enableSeparator = this.enableSeparator.bind(this);
        this.disableSeparator = this.disableSeparator.bind(this);

        let layout = loadLayout(this);
        if (!layout) {
            localStorage.removeItem('editor_mode');
            layout = loadLayout(this);
        }

        this.state = {
            layout,
            root: findRootArea(layout),
            separator: null
        };
    }

    componentWillMount() {
        document.addEventListener('mousedown', this.enableSeparator);
        document.addEventListener('touchstart', this.enableSeparator);
        document.addEventListener('mousemove', this.updateSeparator);
        document.addEventListener('touchmove', this.updateSeparator);
        document.addEventListener('mouseup', this.disableSeparator);
        document.addEventListener('mouseleave', this.disableSeparator);
        document.addEventListener('touchend', this.disableSeparator);
        document.addEventListener('touchcancel', this.disableSeparator);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.enableSeparator);
        document.removeEventListener('touchstart', this.enableSeparator);
        document.removeEventListener('mousemove', this.updateSeparator);
        document.removeEventListener('touchmove', this.updateSeparator);
        document.removeEventListener('mouseup', this.disableSeparator);
        document.removeEventListener('mouseleave', this.disableSeparator);
        document.removeEventListener('touchend', this.disableSeparator);
        document.removeEventListener('touchcancel', this.disableSeparator);
    }

    enableSeparator(e) {
        if (!e) {
            return;
        }

        if (!e.composedPath) {
            this.enableSeparator({
                path: [e.target]
            });
        }

        const separator = this.findSeparator(e.composedPath(), this.state.layout, []);
        if (separator) {
            this.setState({separator});
        }
    }

    findSeparator(path, node, sepPath) {
        if (!node || !path) {
            return null;
        }
        if (node.type === Type.LAYOUT) {
            if (this.rootRef && node.separatorRef && path.indexOf(node.separatorRef) !== -1) {
                const horizontal = node.orientation === Orientation.HORIZONTAL;
                const frame = node.frame;
                const length = this.rootRef[horizontal ? 'clientWidth' : 'clientHeight'];
                return {
                    prop: horizontal ? 'clientX' : 'clientY',
                    min: length * frame[0] * 0.01,
                    max: length * frame[1] * 0.01,
                    node
                };
            }
            return this.findSeparator(path, node.children[0], concat(sepPath, 0))
                    || this.findSeparator(path, node.children[1], concat(sepPath, 1));
        }
        return null;
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
            let target = null;
            if (e.touches) {
                if (e.touches.length > 0) {
                    target = e.touches[0];
                }
            } else {
                target = e;
            }
            if (target) {
                const splitAt = 100 * ((target[separator.prop] - separator.min) / separator.max);
                const layout = this.state.layout;
                separator.node.splitAt = Math.min(Math.max(splitAt, 5), 95);
                this.setState({layout});
            }
            e.preventDefault();
            e.stopPropagation();
        }
    }

    findNodeFromPath(layout, path) {
        let node = layout;
        each(path, (elem) => {
            node = node.children[elem];
        });
        return node;
    }

    render() {
        const { layout } = this.state;
        const root = findRootNode(layout);
        const elems = {
            areas: [],
            separators: []
        };
        this.collectAreas(elems, layout, []);
        return <div style={editor_style} ref={rootRef => this.rootRef = rootRef}>
            {elems.areas.map(area => this.renderArea(area, root))}
            {elems.separators.map((sep, key) => this.renderSeparator(sep, key))}
        </div>;
    }

    collectAreas(elems, node, path, frame = [0, 0, 100, 100]) {
        if (!node) {
            return;
        }
        if (node.type === Type.LAYOUT) {
            const { splitAt } = node;
            const start = node.orientation === Orientation.HORIZONTAL
                    ? 0
                    : 1;
            const length = node.orientation === Orientation.HORIZONTAL
                ? 2
                : 3;
            for (let idx = 0; idx < 2; idx += 1) {
                const tgtFrame = [frame[0], frame[1], frame[2], frame[3]];
                tgtFrame[length] = idx === 0
                    ? frame[length] * splitAt * 0.01
                    : frame[length] * (100 - splitAt) * 0.01;
                tgtFrame[start] = idx === 0
                    ? frame[start]
                    : frame[start] + splitAt * frame[length] * 0.01;

                this.collectAreas(
                    elems,
                    node.children[idx],
                    concat(path, idx),
                    tgtFrame
                );
            }
            const sStart = 1 - start;
            const sLength = node.orientation === Orientation.HORIZONTAL
                ? 3
                : 2;
            const sepFrame = [
                frame[start] + splitAt * frame[length] * 0.01,
                frame[sStart],
                frame[sLength]
            ];
            node.frame = [frame[start], frame[length]];
            elems.separators.push({
                frame: sepFrame,
                node
            });
        } else {
            elems.areas.push({
                frame,
                path,
                node
            });
        }
    }

    renderArea({ node, path, frame }, root) {
        const availableAreas = node.content.mainArea
            ? findMainAreas()
            : this.state.root.toolAreas;
        const style = {
            ...baseStyle,
            left: `${frame[0]}%`,
            top: `${frame[1]}%`,
            width: `${frame[2]}%`,
            height: `${frame[3]}%`,
        };
        return <Area
            key={node.id}
            area={node.content}
            stateHandler={node.stateHandler}
            mainArea={node.content.mainArea}
            availableAreas={availableAreas}
            selectAreaContent={this.selectAreaContent.bind(this, path)}
            style={style}
            ticker={this.props.ticker}
            split={this.split.bind(this, path)}
            close={path.length > 0 && !node.root ? this.close.bind(this, path) : null}
            rootStateHandler={root.stateHandler}
            editor={this}
        />;
    }

    renderSeparator({ node, frame }, key) {
        const p = node.orientation === Orientation.HORIZONTAL
            ? ['left', 'top', 'height', 'width', 'col-resize']
            : ['top', 'left', 'width', 'height', 'row-resize'];

        const separator = {
            position: 'absolute' as const,
            [p[0]]: `${frame[0]}%`,
            [p[1]]: `${frame[1]}%`,
            [p[2]]: `${frame[2]}%`,
            [p[3]]: 12,
            transform: node.orientation === Orientation.HORIZONTAL
                ? 'translate(-6px, 0)'
                : 'translate(0, -6px)',
            background: 'transparent',
            cursor: p[4]
        };

        const innerStyle = {
            position: 'absolute' as const,
            [p[0]]: '5.5px',
            [p[2]]: '100%',
            [p[3]]: 1,
            background: 'rgb(0, 122, 204)'
        };

        const setSeparatorRef = (ref) => {
            node.separatorRef = ref;
        };

        return <div key={`sep_${key}`} ref={setSeparatorRef} style={separator}>
            <div style={innerStyle}/>
        </div>;
    }

    split(path, orientation, content) {
        if (!content)
            content = NewArea;
        if (path.length === 0) {
            const layout = {
                type: Type.LAYOUT,
                orientation,
                splitAt: 50,
                children: [
                    this.state.layout,
                    this.createNewArea(content)
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
                orientation,
                splitAt: 50,
                children: [
                    pNode.children[idx],
                    this.createNewArea(content)
                ]
            };
            this.setState({layout});
            saveLayout(layout);
        }
    }

    close(path) {
        if (path.length === 1) {
            const rootLayout = this.state.layout as LayoutNode;
            const layout = rootLayout.children[1 - path[0]];
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

    switchEditor(id, options) {
        const area = findAreaContentById(id);
        if (area && area.mainArea) {
            this.selectMainAreaContent(area, options);
        } else {
            // tslint:disable-next-line:no-console
            console.warn(`Invalid editor id: ${id}`);
        }
    }

    selectAreaContent(path, area) {
        const layout = this.state.layout;
        const node = this.findNodeFromPath(layout, path);
        if (node.root) {
            this.selectMainAreaContent(area);
        } else {
            node.id = getId();
            node.content = area;
            initStateHandler(this, node);
            this.setState({layout});
            saveLayout(layout);
        }
    }

    selectMainAreaContent(area, options = {}) {
        DebugData.scope = {};
        this.setState({
            layout: loadLayout(this, area.id, options),
            root: area
        });
        localStorage.setItem('editor_mode', area.id);
    }

    createNewArea(content) {
        const node = {
            id: getId(),
            type: Type.AREA,
            content
        };
        initStateHandler(this, node);
        return node;
    }
}

function initStateHandler(editor, node, state = null) {
    node.stateHandler = {
        state: state ? cloneDeep(state) : node.content.getInitialState(),
        setState: (newState, callback) => {
            extend(node.stateHandler.state, newState);
            editor.setState({layout: editor.state.layout}, callback);
            saveLayout(editor.state.layout);
        }
    };
    extend(
        node.stateHandler,
        mapValues(node.content.stateHandler, f => f.bind(node.stateHandler))
    );
}

function saveLayout(layout) {
    const saveData = JSON.stringify(saveNode(layout));
    const root = findRootArea(layout);
    localStorage.setItem(`editor_layout_${root.id}`, saveData);
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
    }
    return {
        type: Type.AREA,
        content_id: node.content.id,
        state: node.stateHandler.state,
        root: node.root
    };
}

function loadLayout(editor, mode = null, options: NodeOptions = {}) {
    if (!mode) {
        mode = localStorage.getItem('editor_mode') || 'game';
    }
    const data = localStorage.getItem(`editor_layout_${mode}`);
    let layout = null;
    if (data) {
        try {
            layout = JSON.parse(data);
        } catch (e) {
            // continue regardless of error
        }
    }
    if (!layout) {
        const mainArea = findAreaContentById(mode);
        layout = mainArea.defaultLayout;
    }
    return loadNode(editor, layout, options);
}

function loadNode(editor, node, options: NodeOptions = {}) {
    if (!node) {
        return null;
    }
    if (node.type === Type.LAYOUT) {
        const childNodes = [
            loadNode(editor, node.children[0], options),
            loadNode(editor, node.children[1], options)
        ];
        if (!childNodes[0]) {
            return childNodes[1];
        }
        if (!childNodes[1]) {
            return childNodes[0];
        }
        return {
            type: Type.LAYOUT,
            orientation: node.orientation,
            splitAt: node.splitAt !== null ? node.splitAt : 50,
            children: [
                childNodes[0],
                childNodes[1]
            ]
        };
    }
    if (node.root && options.injectArea) {
        return {
            id: getId(),
            type: Type.LAYOUT,
            orientation: options.injectOrientation !== undefined
                ? options.injectOrientation
                : Orientation.HORIZONTAL,
            splitAt: 50,
            children: [
                loadNode(editor, node, {rootState: options.rootState}),
                editor.createNewArea(options.injectArea)
            ]
        };
    }

    const tgtNode = {
        id: getId(),
        type: Type.AREA,
        root: node.root,
        content: null
    };
    tgtNode.content = findAreaContentById(node.content_id);
    if (!tgtNode.content)
        return null;

    if (node.content_id !== tgtNode.content.id
        && node.content_id === tgtNode.content.replaces) {
        node.state = null;
    }

    if (tgtNode.root && options.rootState) {
        initStateHandler(editor, tgtNode, Object.assign(node.state, options.rootState));
    } else {
        initStateHandler(editor, tgtNode, node.state);
    }
    return tgtNode;
}

function findRootNode(node) {
    if (node.type === Type.LAYOUT) {
        return findRootNode(node.children[0]) || findRootNode(node.children[1]);
    }
    return node.root ? node : null;
}

function findRootArea(node) {
    const root = findRootNode(node);
    return root ? root.content : null;
}
