import * as React from 'react';
import {extend, map, filter, tail, first} from 'lodash';
import {fullscreen} from '../../../../../styles';
import FrameListener from '../../../../../utils/FrameListener';
import {getDebugListing} from './listing';
import DebugData from '../../../../DebugData';
import { TickerProps } from '../../../../../utils/Ticker';
import { scopeColors } from '../blocks/blocksLibrary/utils';
import Scene from '../../../../../../game/Scene';
import { GetInventorySize } from '../../../../../../game/data/inventory';

const defaultSplitDistance = 60;

const scriptBaseStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    overflow: 'auto',
    // boxShadow: 'inset 0px 0px 0px 1px rgb(0,122,204)',
    background: 'rgb(25,25,25)',
    fontWeight: 'normal',
    fontSize: 16
};

const scriptStyle = {
    life: splitAt => extend({left: 0, width: `${splitAt}%`}, scriptBaseStyle),
    move: splitAt => extend({left: `${splitAt}%`, right: 0}, scriptBaseStyle)
};

interface Props extends TickerProps {
    sharedState: any;
    stateHandler: any;
    editor: boolean;
    renderToolbar: (props: any) => React.ReactElement;
    hideVariablesPanel: () => void;
}

interface State {
    separator?: {
        min: number;
        max: number;
    };
    actorIndex: number;
    splitAt?: number;
    listing?: any;
    lifeLine?: number;
    moveLine?: number;
}

export default class TextEditor extends FrameListener<Props, State> {
    lineNumbers: {
        life: number;
        move: number;
    };
    lineCmds: {
        life: any;
        move: any;
    };
    separatorRef: HTMLElement;
    rootRef: HTMLElement;
    scene: Scene;
    actor: any;
    scrollElem: HTMLElement;

    constructor(props) {
        super(props);

        this.state = {
            separator: null,
            actorIndex: props.sharedState.actorIndex
        };

        this.onRef = this.onRef.bind(this);
        this.updateSeparator = this.updateSeparator.bind(this);
        this.enableSeparator = this.enableSeparator.bind(this);
        this.disableSeparator = this.disableSeparator.bind(this);

        this.lineNumbers = {
            life: null,
            move: null
        };
        this.lineCmds = {
            life: null,
            move: null
        };
    }

    componentWillMount() {
        super.componentWillMount();
        document.addEventListener('mousedown', this.enableSeparator);
        document.addEventListener('mousemove', this.updateSeparator);
        document.addEventListener('mouseup', this.disableSeparator);
        document.addEventListener('mouseleave', this.disableSeparator);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        document.removeEventListener('mousedown', this.enableSeparator);
        document.removeEventListener('mousemove', this.updateSeparator);
        document.removeEventListener('mouseup', this.disableSeparator);
        document.removeEventListener('mouseleave', this.disableSeparator);
    }

    enableSeparator(e) {
        if (!e || !e.path) {
            return;
        }
        if (e.path.indexOf(this.separatorRef) !== -1) {
            const bb = this.rootRef.getBoundingClientRect();
            const separator = {
                min: bb.left,
                max: this.rootRef.clientWidth
            };
            if (this.props.sharedState.splitAt) {
                this.props.stateHandler.splitAt(undefined);
            }
            this.setState({separator});
            this.updateSeparator(e, separator);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    updateSeparator(e, separator = this.state.separator) {
        if (separator) {
            const splitAt = 100 * ((e.clientX - separator.min) / separator.max);
            this.setState({splitAt});
            e.preventDefault();
            e.stopPropagation();
        }
    }

    disableSeparator() {
        if (this.state.separator) {
            if (this.state.splitAt) {
                this.props.stateHandler.splitAt(this.state.splitAt);
            }
            this.setState({separator: null, splitAt: undefined});
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.sharedState.actorIndex !== this.state.actorIndex) {
            this.setState({ actorIndex: newProps.sharedState.actorIndex });
        }
    }

    frame() {
        const scene = DebugData.scope.scene;
        const actor = scene ? scene.actors[this.state.actorIndex] : null;
        if (DebugData.selection &&
                ('lifeLine' in DebugData.selection || 'moveLine' in DebugData.selection)) {
            this.props.stateHandler.setActor(DebugData.selection.index);
        }
        if (this.scene !== scene || this.actor !== actor || this.props.sharedState.refreshing) {
            this.setState({
                listing: {
                    life: getDebugListing('life', scene, actor),
                    move: getDebugListing('move', scene, actor)
                },
                lifeLine: undefined,
                moveLine: undefined
            });
            this.scene = scene;
            this.actor = actor;
        }
        if (this.scene && this.actor) {
            this.updateActiveLines('life');
            this.updateActiveLines('move');
        }
    }

    updateActiveLines(type) {
        let firstBreakpoint = true;
        if (this.lineNumbers[type] && this.lineCmds[type]) {
            const ln = this.lineNumbers[type].children;
            const lc = this.lineCmds[type].children;
            const commands = this.state.listing[type].commands;
            const activeCommands = DebugData.script[type][this.actor.index] || {};
            const breakpoints = DebugData.breakpoints[type][this.actor.index] || {};
            for (let i = 0; i < ln.length; i += 1) {
                const lineNum = ln[i];
                const lineCmd = lc[i];
                const active = (i in activeCommands);
                if (breakpoints[i]) {
                    if (active) {
                        if (firstBreakpoint) {
                            if (this.scrollElem !== lineNum) {
                                lineNum.scrollIntoView({block: 'center'});
                                this.scrollElem = lineNum;
                            }
                            firstBreakpoint = false;
                        }
                        lineNum.style.background = '#ff0000';
                        lineNum.style.color = 'black';
                        lineCmd.style.background = '#330000';
                    } else {
                        lineNum.style.background = '#660000';
                        lineNum.style.color = 'inherit';
                        lineCmd.style.background = 'black';
                    }
                } else {
                    if (active) {
                        lineNum.style.color = 'black';
                        lineNum.style.background = '#00ff00';
                        lineCmd.style.background = '#001100';
                    } else {
                        const activeSection = commands[i].section === activeCommands.section;
                        lineNum.style.color = activeSection ? 'white' : '#666666';
                        lineNum.style.background = activeSection ? 'black' : '#151515';
                        lineCmd.style.background = activeSection ? 'black' : '#151515';
                    }
                    if (DebugData.selection && DebugData.selection[`${type}Line`] === i + 1) {
                        const tgt = i + 1;
                        const ll = Math.max(i - 1, 0);
                        ln[ll].scrollIntoView({block: 'center'});
                        this.scrollElem = ln[ll];
                        lineCmd.style.background = '#7d6b37';
                        setTimeout(() => {
                            if (DebugData.selection && tgt === DebugData.selection[`${type}Line`]) {
                                delete DebugData.selection[`${type}Line`];
                            }
                        }, 500);
                    }
                }
            }
        }
    }

    toggleBreakpoint(type, line) {
        const sceneActiveCommands = DebugData.script[type];
        const sceneBreakpoints = DebugData.breakpoints[type];
        if (!(this.actor.index in sceneBreakpoints)) {
            sceneBreakpoints[this.actor.index] = {};
        }
        if (sceneBreakpoints[this.actor.index][line]) {
            delete sceneBreakpoints[this.actor.index][line];
            if (this.actor.index in sceneActiveCommands && DebugData.scope.game.isPaused()) {
                DebugData.scope.game.pause();
            }
        } else {
            sceneBreakpoints[this.actor.index][line] = true;
        }
    }

    onRef(ref) {
        if (ref !== this.rootRef) {
            this.rootRef = ref;
            if (this.rootRef) {
                this.rootRef.addEventListener('click', () => {
                    this.props.hideVariablesPanel();
                });
            }
        }
    }

    render() {
        const splitAt = this.props.sharedState.splitAt
            || this.state.splitAt
            || defaultSplitDistance;

        const separator = {
            position: 'absolute' as const,
            top: 24,
            bottom: 0,
            left: `${splitAt}%`,
            width: 6,
            transform: 'translate(-3px, 0)',
            background: 'rgba(0,0,0,0)',
            cursor: 'col-resize' as const,
        };

        const sepInnerLine = {
            position: 'absolute' as const,
            top: 0,
            bottom: 0,
            left: 2,
            width: 1,
            background: 'rgb(0,122,204)',
            opacity: 1,
        };

        const contentStyle = extend({}, fullscreen, {
            top: 22
        });

        return <React.Fragment>
            <div style={contentStyle} ref={this.onRef}>
                {this.renderListing('life', splitAt)}
                {this.renderListing('move', splitAt)}
            </div>
            <div ref={(ref) => { this.separatorRef = ref; }} style={separator}>
                <div style={sepInnerLine}/>
            </div>
            {this.props.renderToolbar({})}
        </React.Fragment>;
    }

    renderListing(type, splitAt) {
        let lineNumbers = null;
        let commands = null;
        let nDigits = 0;
        if (this.state.listing && this.state.listing[type]) {
            const listing = this.state.listing[type];
            nDigits = listing.commands.length.toString().length;
            lineNumbers = map(
                listing.commands,
                (cmd, line) => <LineNumber
                    key={line}
                    toggleBreakpoint={this.toggleBreakpoint.bind(this, type, line)}
                    nDigits={nDigits}
                    line={line}
                    command={cmd}
                />
            );
            const data = {
                editor: this.props.editor,
                actorIndex: this.state.actorIndex
            };
            commands = map(
                listing.commands,
                (cmd, line) =>
                    <Command key={line} command={cmd} data={data}/>
            );
        }
        const lineNumberStyle = {
            position: 'absolute' as const,
            left: 0,
            width: `${nDigits}ch`,
            top: 0,
            background: 'rbg(51,51,51)',
            color: 'rbg(37,37,38)',
            cursor: 'pointer' as const,
            userSelect: 'none' as const,
            fontSize: 16
        };
        const commandsStyle = {
            position: 'absolute' as const,
            overflowY: 'hidden' as const,
            left: `${nDigits}ch`,
            minWidth: '90%',
            top: 0
        };
        return <div style={scriptStyle[type](splitAt)}>
            <div ref={(ref) => { this.lineCmds[type] = ref; }} style={commandsStyle}>
                {commands}
            </div>
            <div ref={(ref) => { this.lineNumbers[type] = ref; }} style={lineNumberStyle}>
                {lineNumbers}
            </div>
        </div>;
    }
}

const lineNumBaseStyle = {
    display: 'inline-block' as const,
    textAlign: 'right' as const,
    fontWeight: 'bold' as const
};

function LineNumber({line, command, nDigits, toggleBreakpoint}) {
    const lineNumStyle = extend({
        width: `${nDigits}ch`
    }, lineNumBaseStyle);

    return <div onClick={toggleBreakpoint} style={getLineStyle(command, false)}>
        <span style={lineNumStyle}>{line + 1}</span>
    </div>;
}

const cmdColors = {
    structural: '#03A9F4',
    structural_assignment: '#03A9F4',
    track: '#54d115',
    track_fct: '#54d115',
    track_assignment: '#54d115',
    control: '#13d1b8',
    control_no_parens: '#13d1b8',
    fct: '#c9c9c9',
    cond_prop: '#d94616',
    cond_var: '#d94616',
    cond_fct: '#d94616',
    assignment: '#c9c9c9',
    increment: '#c9c9c9',
    decrement: '#c9c9c9',
    var_assignment: '#c9c9c9',
    var_increment: '#c9c9c9',
    var_decrement: '#c9c9c9',
};

const cmdScopes = {
    SET_VAR_GAME: 'game',
    ADD_VAR_GAME: 'game',
    SUB_VAR_GAME: 'game',
    SET_VAR_CUBE: 'scene',
    ADD_VAR_CUBE: 'scene',
    SUB_VAR_CUBE: 'scene',
    VAR_GAME: 'game',
    VAR_CUBE: 'scene'
};

function getScope(cmd) {
    const baseScope = cmdScopes[cmd.name];
    if (!baseScope) {
        return null;
    }
    if (baseScope === 'game') {
        if (cmd.name === 'VAR_GAME' || cmd.name === 'VAR_CUBE') {
            if (cmd.param.realValue < GetInventorySize()) {
                return 'inventory';
            }
        } else if (cmd.args[0].realValue < GetInventorySize()) {
            return 'inventory';
        }
    }
    return baseScope;
}

function Scope({cmd, children}) {
    const scope = getScope(cmd);
    if (scope) {
        const scopeStyle = {
            background: scopeColors[scope],
            boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.3)',
            borderRadius: 3
        };
        return <span style={{color: 'white'}}>
            <span style={scopeStyle}>
                {scope}
            </span>
            .
            {children}
        </span>;
    }
    return children;
}

function getWrappers(cmd) {
    // wlm = wrapper-left-most
    // wl = wrapper-left
    // wr = wrapper-right
    switch (cmd.type) {
        case 'structural':
        case 'track':
            return { wl: ' ' };
        case 'control':
            return { wlm: ' (', wr: ')' };
        case 'fct':
        case 'track_fct':
            return cmd.args && cmd.args.length > 0
                ? { wl: '(', wr: ')' }
                : {};
        case 'assignment':
        case 'var_assignment':
        case 'structural_assignment':
        case 'track_assignment':
            return { wl: ' = ' };
        case 'increment':
        case 'var_increment':
            return { wl: ' += ' };
        case 'decrement':
        case 'var_decrement':
            return { wl: ' -= ' };
    }
    return {};
}

function Command({command, data}) {
    const cmdIndentStyle = {
        paddingLeft: `${(command.indent * 3) + 1}ch`
    };

    let prefix = null;
    let postfix = null;
    let name = command.name.toLowerCase();
    let args = command.args;
    const objCmd = name.match(/^(.*)_obj$/);
    if (objCmd) {
        name = objCmd[1];
        prefix = <span style={{color: 'white'}}><Arg arg={first(args)} data={data}/>.</span>;
        args = tail(args);
    }

    const ifCmd = name.match(/^(.*)_if$/);
    if (ifCmd) {
        name = 'if';
        postfix = <span style={{color: cmdColors.control}}>&nbsp;{ifCmd[1]}</span>;
    }

    if (command.type.substring(0, 4) === 'var_') {
        name = (first(args) as any).value;
        args = tail(args);
    }

    const {wlm, wl, wr} = getWrappers(command);
    return <div style={getLineStyle(command, true)}>
        <span style={cmdIndentStyle}>
            <Scope cmd={command}>
                {prefix}
                <span style={{color: cmdColors[command.type]}}>
                    {command.prop || name}
                </span>
            </Scope>
        </span>
        {wlm}
        <Condition condition={command.condition} data={data}/>
        <Operator operator={command.operator} data={data}/>
        {wl}<Args args={args} data={data}/>{wr}
        {postfix}
    </div>;
}

const defaultArgStyle = { fontWeight: 'bold', color: '#ffffff' };
const argStyle = {
    actor: { fontWeight: 'bold', background: '#ad0000', color: '#ffffff' },
    zone: { fontWeight: 'bold', background: '#476bad', color: '#ffffff' },
    text: { color: '#ffb200' },
};

const argDoubleClick = {
    actor: (actor) => {
        DebugData.selection = {type: 'actor', index: actor.realValue};
    },
    zone: (zone) => {
        DebugData.selection = {type: 'zone', index: zone.realValue};
    },
    point: (point) => {
        DebugData.selection = {type: 'point', index: point.realValue};
    },
    body: (body, {actorIndex, editor}) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            const actor = scene.actors[actorIndex];
            editor.switchEditor('model', {
                rootState: {
                    entity: actor.props.entityIndex,
                    body: body.realValue,
                    anim: actor.props.animIndex
                }
            });
        }
    },
    anim: (anim, {actorIndex, editor}) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            const actor = scene.actors[actorIndex];
            editor.switchEditor('model', {
                rootState: {
                    entity: actor.props.entityIndex,
                    body: actor.props.bodyIndex,
                    anim: anim.realValue
                }
            });
        }
    }
};

/**
 * @return {null}
 */
function Condition({condition, data}) {
    if (condition) {
        let param = null;
        if (condition.param) {
            param = <span>
                <Arg arg={condition.param} data={data}/>
            </span>;
        }

        let prefix = null;
        let name = condition.name.toLowerCase();
        const objCmd = name.match(/^(.*)_obj$/);
        if (objCmd) {
            name = objCmd[1];
            prefix = <span style={{color: 'white'}}>
                <Arg arg={condition.param} data={data}/>.
            </span>;
            param = null;
        }

        if (condition.type === 'cond_var') {
            name = condition.param.value;
            param = null;
        }

        const wl = condition.type === 'cond_fct' && '(';
        const wr = condition.type === 'cond_fct' && ')';
        const style = {
            color: cmdColors[condition.type],
            textDecoration: condition.unimplemented ? 'line-through' : 'none'
        };

        return <span>
            <Scope cmd={condition}>
                {prefix}
                <span style={style}>
                    {condition.prop || name}
                </span>
            </Scope>
            {wl}{param}{wr}
        </span>;
    }
    return null;
}

/**
 * @return {null}
 */
function Operator({operator, data}) {
    if (operator) {
        return <span>
            &nbsp;{operator.name}
            &nbsp;<Arg arg={operator.operand} data={data}/>
        </span>;
    }
    return null;
}

function intersperse(arr, sep) {
    if (arr.length === 0) {
        return [];
    }

    return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]]);
}

/**
 * @return {null}
 */
function Args({args, data}) {
    if (args) {
        return <span>
            {
                intersperse(map(
                    filter(args, arg => !arg.hide),
                    (arg, i) => <Arg key={i} arg={arg} data={data}/>
                ), ', ')
            }
        </span>;
    }
    return null;
}

function Arg({arg, data}) {
    if (!arg) {
        return <span>{'<undefined>'}</span>;
    }
    let style = argStyle[arg.type] || defaultArgStyle;
    const onDoubleClick = arg.type in argDoubleClick
        ? argDoubleClick[arg.type].bind(null, arg, data)
        : null;
    if (onDoubleClick) {
        style = extend({}, style, {cursor: 'pointer'});
    }
    return <span style={style} onDoubleClick={onDoubleClick}>
        {arg.value}
    </span>;
}

const lineBaseStyle = {
    whiteSpace: 'nowrap' as const,
    lineHeight: '20px',
    fontWeight: 'normal' as const,
    fontSize: 14
};

function getLineStyle(command, content) {
    const isLast = command.name === 'END_BEHAVIOUR' || command.name === 'STOP';

    const dashLine = '1px dashed rgb(51,51,51)';

    return extend({
        marginBottom: isLast ? '1em' : 0,
        paddingTop: 0,
        borderBottom: isLast ? dashLine : 0,
        textDecoration: command.unimplemented ? 'line-through' : 'none',
        color: content && '#c9c9c9'
    }, lineBaseStyle);
}
