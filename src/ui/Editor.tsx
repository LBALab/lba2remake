import * as React from 'react';
import {extend, each, concat, mapValues, cloneDeep} from 'lodash';
import Area, {AreaDefinition} from './editor/Area';
import {fullscreen} from './styles';
import NewArea from './editor/areas/utils/NewArea';
import {Type, Orientation} from './editor/layout';
import {findAreaContentById, findMainAreas} from './editor/areas';
import DebugData from './editor/DebugData';
import Ticker from './utils/Ticker';

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
    params: any;
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
    mainData?: any;
}

export default class Editor extends React.Component<EditorProps, EditorState> {
    constructor(props) {
        super(props);

        this.updateSeparator = this.updateSeparator.bind(this);
        this.enableSeparator = this.enableSeparator.bind(this);
        this.disableSeparator = this.disableSeparator.bind(this);
        this.saveMainData = this.saveMainData.bind(this);

        const layout = loadLayout(this);

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
            if (node.rootRef && node.separatorRef && path.indexOf(node.separatorRef) !== -1) {
                const horizontal = node.orientation === Orientation.HORIZONTAL;
                const bb = node.rootRef.getBoundingClientRect();
                return {
                    prop: horizontal ? 'clientX' : 'clientY',
                    min: bb[horizontal ? 'left' : 'top'],
                    max: node.rootRef[horizontal ? 'clientWidth' : 'clientHeight'],
                    node: node as LayoutNode
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
        const root = findRootNode(this.state.layout);
        return this.renderLayout(this.state.layout, baseStyle, [], root);
    }

    renderLayout(node, style, path, root) {
        if (!node) {
            return null;
        }
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
                [p[2]]: 1,
                background: 'rgb(0,122,204)',
                opacity: 1,
            }, separatorStyle[node.orientation]);

            const setSeparatorRef = (ref) => {
                node.separatorRef = ref;
            };

            const setRootRef = (ref) => {
                node.rootRef = ref;
            };

            if (!node.children[1]) {
                return <div ref={setRootRef} style={style}>
                    {this.renderLayout(node.children[0], styles[0], concat(path, 0), root)}
                </div>;
            }
            return <div ref={setRootRef} style={style}>
                {this.renderLayout(node.children[0], styles[0], concat(path, 0), root)}
                {this.renderLayout(node.children[1], styles[1], concat(path, 1), root)}
                <div ref={setSeparatorRef} style={separator}>
                    <div style={sepInnerLine}/>
                </div>
            </div>;
        }
        const availableAreas = node.content.mainArea ? findMainAreas() : this.state.root.toolAreas;
        return <Area
            key={`${path.join('/')}/${node.content.name}`}
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
            mainData={this.state.mainData}
            rootStateHandler={root.stateHandler}
            editor={this}
        />;
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
            node.content = area;
            initStateHandler(this, node);
            this.setState({layout});
            saveLayout(layout);
        }
    }

    selectMainAreaContent(area, options = {}) {
        DebugData.scope = {};
        if (this.state.mainData && this.state.mainData.state) {
            const {renderer, game} = this.state.mainData.state;
            if (renderer) {
                renderer.dispose();
            }
            if (game) {
                const audioMenuManager = game.getAudioMenuManager();
                audioMenuManager.getMusicSource().stop();
                const audioManager = game.getAudioManager();
                audioManager.getMusicSource().stop();
            }
        }
        this.setState({
            mainData: undefined,
            layout: loadLayout(this, area.id, options),
            root: area
        });
        localStorage.setItem('editor_mode', area.id);
    }

    saveMainData(data) {
        this.setState({mainData: data});
    }

    createNewArea(content) {
        const node = {
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
