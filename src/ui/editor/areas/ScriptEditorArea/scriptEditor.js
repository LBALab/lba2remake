import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {extend, map, filter, isObject} from 'lodash';
import {fullscreen} from '../../../styles';
import FrameListener from '../../../utils/FrameListener';
import {getDebugListing} from './listing';
import DebugData from '../../DebugData';

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

let selection = null;

export default class ScriptEditor extends FrameListener {
    constructor(props) {
        super(props);

        this.state = {
            separator: null
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
        if (newProps.sharedState.actor !== this.state.actorIndex) {
            this.setState({ actorIndex: newProps.sharedState.actor });
        }
    }

    frame() {
        const scene = DebugData.scope.scene;
        if (selection !== DebugData.selection.actor) {
            selection = DebugData.selection.actor;
            this.props.stateHandler.setActor(selection);
        }
        const actor = scene ? scene.actors[this.state.actorIndex] : null;
        if (DebugData.selection.lifeLine) {
            this.props.stateHandler.setAutoScroll(false);
        }
        if (this.scene !== scene || this.actor !== actor) {
            this.setState({
                listing: {
                    life: getDebugListing('life', scene, actor),
                    move: getDebugListing('move', scene, actor)
                },
                lifeLine: undefined
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
                                lineNum.scrollIntoView();
                                this.scrollElem = lineNum;
                            }
                            firstBreakpoint = false;
                        }
                        lineNum.style.background = '#580000';
                        lineNum.style.color = '#ffffff';
                        lineCmd.style.background = '#200000';
                    } else {
                        lineNum.style.background = '#ff0000';
                        lineNum.style.color = 'inherit';
                        lineCmd.style.background = 'transparent';
                    }
                } else {
                    lineNum.style.color = 'inherit';
                    if (active) {
                        if (autoScroll && firstActive && firstBreakpoint) {
                            if (this.scrollElem !== lineNum) {
                                lineNum.scrollIntoView();
                                this.scrollElem = lineNum;
                            }
                            firstActive = false;
                        }
                        lineNum.style.background = '#009700';
                        lineCmd.style.background = 'rgb(51,51,52)';
                    } else {
                        const activeSection = commands[i].section === activeCommands.section;
                        lineNum.style.background = activeSection ? '#232323' : 'transparent';
                        lineCmd.style.background = activeSection ? '#232323' : 'transparent';
                    }
                    if (type === 'life' && DebugData.selection.lifeLine === i + 1) {
                        const tgt = i + 1;
                        const ll = Math.max(i - 1, 0);
                        ln[ll].scrollIntoView();
                        this.scrollElem = ln[ll];
                        lineCmd.style.background = '#7d6b37';
                        setTimeout(() => {
                            if (tgt === DebugData.selection.lifeLine) {
                                delete DebugData.selection.lifeLine;
                            }
                        }, 500);
                    }
                }

                if (result) {
                    result.style.display = active ? 'inline-block' : 'none';
                    if (active && 'condValue' in activeCommands[i]) {
                        const condValue = activeCommands[i].condValue;
                        if (isObject(condValue)) {
                            const elem = <span>: {condValue}</span>;
                            result.innerHTML = ReactDOMServer.renderToStaticMarkup(elem, result);
                        } else {
                            result.innerText = `: ${condValue}`;
                        }
                    } else {
                        result.innerText = '?';
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
            top: 0,
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

        return <div ref={ref => this.rootRef = ref} style={{fullscreen}}>
            {this.renderListing('life', splitAt)}
            {this.renderListing('move', splitAt)}
            <div ref={ref => this.separatorRef = ref} style={separator}>
                <div style={sepInnerLine}/>
            </div>
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
            commands = map(
                listing.commands,
                (cmd, line) => <Command key={line} line={line} command={cmd}/>
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
            <div ref={ref => this.lineCmds[type] = ref} style={commandsStyle}>
                {commands}
            </div>
            <div ref={ref => this.lineNumbers[type] = ref} style={lineNumberStyle}>
                {lineNumbers}
            </div>
        </div>;
    }
}

const cmdStyleTypes = {
    conditional: {
        color: '#03A9F4',
    },
    structural: {
        color: '#9356ff',
    }
};

const cmdStyles = {
    IF: cmdStyleTypes.conditional,
    ELSE: cmdStyleTypes.conditional,
    SNIF: cmdStyleTypes.conditional,
    NEVERIF: cmdStyleTypes.conditional,
    SWIF: cmdStyleTypes.conditional,
    ONEIF: cmdStyleTypes.conditional,
    OR_IF: cmdStyleTypes.conditional,
    AND_IF: cmdStyleTypes.conditional,
    SWITCH: cmdStyleTypes.conditional,
    END_SWITCH: cmdStyleTypes.conditional,
    CASE: cmdStyleTypes.conditional,
    OR_CASE: cmdStyleTypes.conditional,
    DEFAULT: cmdStyleTypes.conditional,
    BREAK: cmdStyleTypes.conditional,
    ENDIF: cmdStyleTypes.conditional,

    COMPORTEMENT: cmdStyleTypes.structural,
    END_COMPORTEMENT: cmdStyleTypes.structural,
    SET_COMPORTEMENT: cmdStyleTypes.structural,
    SET_COMPORTEMENT_OBJ: cmdStyleTypes.structural,
    SAVE_COMPORTEMENT: cmdStyleTypes.structural,
    RESTORE_COMPORTEMENT: cmdStyleTypes.structural,
    END: cmdStyleTypes.structural,
    TRACK: cmdStyleTypes.structural,
    SET_TRACK: cmdStyleTypes.structural,
    SET_TRACK_OBJ: cmdStyleTypes.structural,
    STOP_CURRENT_TRACK: cmdStyleTypes.structural,
    RESTORE_LAST_TRACK: cmdStyleTypes.structural,
    GOTO: cmdStyleTypes.structural,
    STOP: cmdStyleTypes.structural,
    REPLACE: cmdStyleTypes.structural,
    SUICIDE: cmdStyleTypes.structural
};

const lineNumBaseStyle = {
    display: 'inline-block',
    textAlign: 'right',
    fontWeight: 'bold',
};

function LineNumber({line, command, nDigits, toggleBreakpoint}) {
    const lineNumStyle = extend({
        width: `${nDigits}ch`
    }, lineNumBaseStyle);

    return <div onClick={toggleBreakpoint} style={getLineStyle(line, command, false)}>
        <span style={lineNumStyle}>{line + 1}</span>
    </div>;
}

function Command({line, command}) {
    const cmdStyle = extend({
        paddingLeft: `${command.indent * 2 + 1}ch`
    }, cmdStyles[command.name]);

    return <div style={getLineStyle(line, command, true)}>
        <span style={cmdStyle}>{command.name}</span>
        <Condition condition={command.condition}/>
        <Operator operator={command.operator}/>
        <Args args={command.args}/>
    </div>;
}

const condStyle = { color: '#00a900' };
const argStyle = { color: '#ca0000' };

/**
 * @return {null}
 */
function Condition({condition}) {
    if (condition) {
        let param = null;
        if ('param' in condition) {
            param = <span>
                {'('}<span style={argStyle}>{condition.param}</span>{')'}
            </span>;
        }
        const rStyle = extend({
            display: 'none',
            boxShadow: 'inset 0px 0px 0px 1px white',
        }, argStyle);
        return <span>
            &nbsp;<span style={condStyle}>{condition.name}</span>
            {param}
            <span className="result" style={rStyle}/>
        </span>;
    }
    return null;
}

/**
 * @return {null}
 */
function Operator({operator}) {
    if (operator) {
        const text = operator.value ? <span>&nbsp;&lt;<i>{operator.value}</i>&gt;</span> : null;
        return <span>
            &nbsp;{operator.name}
            &nbsp;<span style={argStyle}>{operator.operand}{text}</span>
        </span>;
    }
    return null;
}

/**
 * @return {null}
 */
function Args({args}) {
    if (args) {
        return <span>
            {
                map(
                    filter(args, arg => !arg.hide),
                    (arg, i) => {
                        const text = arg.text ? <span>&nbsp;&lt;<i>{arg.text}</i>&gt;</span> : null;
                        return <span key={i} style={argStyle}>&nbsp;{arg.value}{text}</span>;
                    }
                )
            }
        </span>;
    }
    return null;
}

const lineBaseStyle = {
    whiteSpace: 'nowrap',
    lineHeight: '16px',
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
        marginTop: isFirst ? '0.5em' : 0,
        paddingTop: isFirst ? '0.5em' : 0,
        borderTop: isFirst ? dashLine : 0
    }, lineBaseStyle);
}
