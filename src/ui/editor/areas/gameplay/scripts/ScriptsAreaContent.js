import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {extend, map, filter, tail, first} from 'lodash';
import {fullscreen} from '../../../../styles';
import FrameListener from '../../../../utils/FrameListener';
import {getDebugListing} from './listing';
import DebugData from '../../../DebugData';
import ScriptsAreaToolbar from './ScriptsAreaToolbar';

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

export default class ScriptEditor extends FrameListener {
    constructor(props) {
        super(props);

        this.state = {
            separator: null,
            actorIndex: props.sharedState.actorIndex
        };

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
                (DebugData.selection.lifeLine || DebugData.selection.moveLine)) {
            this.props.stateHandler.setAutoScroll(false);
        }
        if (this.scene !== scene || this.actor !== actor) {
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
        let firstActive = true;
        const autoScroll = this.props.sharedState.autoScroll;
        if (this.lineNumbers[type] && this.lineCmds[type]) {
            const ln = this.lineNumbers[type].children;
            const lc = this.lineCmds[type].children;
            const commands = this.state.listing[type].commands;
            const activeCommands = DebugData.script[type][this.actor.index] || {};
            const breakpoints = DebugData.breakpoints[type][this.actor.index] || {};
            for (let i = 0; i < ln.length; i += 1) {
                const lineNum = ln[i];
                const lineCmd = lc[i];
                const result = lineCmd.querySelector('.result');
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
                    lineNum.style.color = 'inherit';
                    if (active) {
                        if (autoScroll && firstActive && firstBreakpoint) {
                            if (this.scrollElem !== lineNum) {
                                lineNum.scrollIntoView({block: 'center'});
                                this.scrollElem = lineNum;
                            }
                            firstActive = false;
                        }
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

                if (result) {
                    result.style.display = active ? 'inline-block' : 'none';
                    if (active && 'condValue' in activeCommands[i]) {
                        const condValue = activeCommands[i].condValue;
                        const elem = <span style={{opacity: '0.8', background: 'black', padding: '0 4px', border: '1px solid grey'}}>
                            {condValue}
                        </span>;
                        result.innerHTML = ReactDOMServer.renderToStaticMarkup(elem, result);
                    } else {
                        result.innerText = '';
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

    render() {
        const splitAt = this.props.sharedState.splitAt
            || this.state.splitAt
            || defaultSplitDistance;

        const separator = {
            position: 'absolute',
            top: 24,
            bottom: 0,
            left: `${splitAt}%`,
            width: 6,
            transform: 'translate(-3px, 0)',
            background: 'rgba(0,0,0,0)',
            cursor: 'col-resize',
        };

        const sepInnerLine = {
            position: 'absolute',
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

        return <div style={{fullscreen}}>
            <div style={contentStyle} ref={(ref) => { this.rootRef = ref; }}>
                {this.renderListing('life', splitAt)}
                {this.renderListing('move', splitAt)}
            </div>
            <div ref={(ref) => { this.separatorRef = ref; }} style={separator}>
                <div style={sepInnerLine}/>
            </div>
            <ScriptsAreaToolbar
                ticker={this.props.ticker}
                sharedState={this.props.sharedState}
                stateHandler={this.props.stateHandler}
            />
        </div>;
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
                    <Command key={line} line={line} command={cmd} data={data}/>
            );
        }
        const lineNumberStyle = {
            position: 'absolute',
            left: 0,
            width: `${nDigits}ch`,
            top: 0,
            background: 'rbg(51,51,51)',
            color: 'rbg(37,37,38)',
            cursor: 'pointer',
            userSelect: 'none',
            fontSize: 16
        };
        const commandsStyle = {
            position: 'absolute',
            overflowY: 'hidden',
            left: `${nDigits}ch`,
            right: 0,
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
    display: 'inline-block',
    textAlign: 'right',
    fontWeight: 'bold'
};

function LineNumber({line, command, nDigits, toggleBreakpoint}) {
    const lineNumStyle = extend({
        width: `${nDigits}ch`
    }, lineNumBaseStyle);

    return <div onClick={toggleBreakpoint} style={getLineStyle(line, command, false)}>
        <span style={lineNumStyle}>{line + 1}</span>
    </div>;
}

const cmdColors = {
    keyword: '#03A9F4',
    cond: '#03A9F4',
    fct: '#ffc42c',
    read_prop: '#72ccf4',
    assignment: '#72ccf4',
    increment: '#72ccf4',
    decrement: '#72ccf4',
    read_var: '#10ee00',
    var_assignment: '#10ee00',
    var_increment: '#10ee00',
    var_decrement: '#10ee00',
};

function Scope({scope, children}) {
    if (scope !== undefined) {
        return <span style={{color: 'white'}}>
            <span style={{color: cmdColors.keyword}}>
                {scope}
            </span>
            .
            {children}
        </span>;
    }
    return children;
}

function getWrappers(type) {
    // wlm = wrapper-left-most
    // wl = wrapper-left
    // wr = wrapper-right
    switch (type) {
        case 'keyword':
            return { wl: ' ' };
        case 'cond':
            return { wlm: ' (', wr: ')' };
        case 'fct':
            return { wl: '(', wr: ')' };
        case 'assignment':
        case 'var_assignment':
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

function Command({line, command, data}) {
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
        postfix = <span style={{color: cmdColors.keyword}}>&nbsp;{ifCmd[1]}</span>;
    }

    if (command.type.substring(0, 4) === 'var_') {
        name = first(args).value;
        args = tail(args);
    }

    const {wlm, wl, wr} = getWrappers(command.type);
    return <div style={getLineStyle(line, command, true)}>
        <span style={cmdIndentStyle}>
            <Scope scope={command.scope}>
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

const argIcon = (path, color) => ({
    color,
    paddingLeft: '2ch',
    background: `url("${path}") no-repeat`,
    backgroundSize: '14px 14px',
    backgroundPosition: '1px 1px'
});

const defaultArgStyle = { color: '#98ee92', fontStyle: 'italic' };
const argStyle = {
    actor: argIcon('editor/icons/actor.svg', '#ff0000'),
    zone: argIcon('editor/icons/zones/SCENERIC.svg', '#6495ed'),
    point: argIcon('editor/icons/point.svg', '#0084ff'),
    body: argIcon('editor/icons/body.svg', '#ffffff'),
    anim: argIcon('editor/icons/anim.svg', '#ffffff'),
    dirmode: { color: 'white' },
    text: { color: '#ff7448' },
    offset: { color: 'white' },
    label: { color: 'white' },
    behaviour: { color: 'white' },
    boolean: { color: cmdColors.keyword }
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
            prefix = <span style={{color: 'white'}}><Arg arg={condition.param} data={data}/>.</span>;
            param = null;
        }

        if (condition.type === 'read_var') {
            name = condition.param.value;
            param = null;
        }

        const wl = condition.type === 'fct' && '(';
        const wr = condition.type === 'fct' && ')';
        const style = {
            color: cmdColors[condition.type],
            textDecoration: condition.unimplemented ? 'line-through' : 'none'
        };

        return <span>
            <Scope scope={condition.scope}>
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
        const operand = operator.operand;
        const rStyle = extend({
            display: 'none',
            position: 'absolute',
            right: 0
        }, argStyle[operand && operand.type] || defaultArgStyle);
        return <span>
            &nbsp;{operator.name}
            &nbsp;<Arg arg={operator.operand} data={data}/>
            <span className="result" style={rStyle}/>
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
        return '<undefined>';
    }
    const style = argStyle[arg.type] || defaultArgStyle;
    const onDoubleClick = arg.type in argDoubleClick
        ? argDoubleClick[arg.type].bind(null, arg, data)
        : null;
    return <span style={style} onDoubleClick={onDoubleClick}>
        {arg.value}
    </span>;
}

const lineBaseStyle = {
    whiteSpace: 'nowrap',
    lineHeight: '20px',
    fontWeight: 'normal',
    fontSize: 14
};

function getLineStyle(line, command, dash) {
    const isFirst = line > 0 &&
        (command.name === 'COMPORTEMENT'
            || command.name === 'TRACK'
            || command.name === 'END');

    const dashLine = dash ? '1px dashed rgb(51,51,51)' : '1px solid transparent';

    return extend({
        marginTop: isFirst ? '1em' : 0,
        paddingTop: 0,
        borderTop: isFirst ? dashLine : 0,
        textDecoration: command.unimplemented ? 'line-through' : 'none'
    }, lineBaseStyle);
}
