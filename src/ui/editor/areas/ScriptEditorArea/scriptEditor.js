import React from 'react';
import {extend, map, filter} from 'lodash';
import {fullscreen} from '../../../styles';
import FrameListener from '../../../utils/FrameListener';
import {getDebugListing} from './listing';
import DebugData from '../../DebugData';

const sepDistance = 60;

const scriptBaseStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    overflow: 'auto',
    boxShadow: 'inset 0px 0px 0px 1px gray',
    background: 'black',
    fontWeight: 'normal',
    fontSize: 16
};

const scriptStyle = {
    life: extend({left: 0, width: `${sepDistance}%`}, scriptBaseStyle),
    move: extend({left: `${sepDistance}%`, right: 0}, scriptBaseStyle)
};

export default class ScriptEditor extends FrameListener {
    constructor(props) {
        super(props);
        this.state = {};
        this.lineNumbers = {
            life: null,
            move: null
        };
        this.lineCmds = {
            life: null,
            move: null
        };
    }

    frame() {
        const scene = DebugData.scope.scene;
        const actor = scene ? scene.actors[DebugData.selection.actor] : null;
        if (this.scene !== scene || this.actor !== actor) {
            this.setState({
                listing: {
                    life: getDebugListing('life', scene, actor),
                    move: getDebugListing('move', scene, actor)
                }
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
            const activeCommands = DebugData.script[type][this.actor.index] || {};
            const breakpoints = DebugData.breakpoints[type][this.actor.index] || {};
            for (let i = 0; i < ln.length; ++i) {
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
                    lineNum.style.background = active ? '#009700' : 'transparent';
                    lineNum.style.color = 'inherit';
                    lineCmd.style.background = active ? '#555555' : 'transparent';
                }

                if (result) {
                    result.style.display = active ? 'inline-block' : 'none';
                    if (active && 'condValue' in activeCommands[i]) {
                        result.innerText = `: ${activeCommands[i].condValue}`;
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
        return <div style={{fullscreen}}>
            {this.renderListing('life')}
            {this.renderListing('move')}
        </div>;
    }

    renderListing(type) {
        let lineNumbers = null;
        let commands = null;
        let nDigits = 0;
        if (this.state.listing && this.state.listing[type]) {
            const listing = this.state.listing[type];
            nDigits = listing.commands.length.toString().length;
            lineNumbers = map(
                listing.commands,
                (cmd, line) => <LineNumber key={line}
                                           toggleBreakpoint={this.toggleBreakpoint.bind(this, type, line)}
                                           nDigits={nDigits}
                                           line={line}
                                           command={cmd}/>
            );
            commands = map(
                listing.commands,
                (cmd, line) => <Command key={line} line={line} command={cmd}/>
            );
        }
        const lineNumberStyle = {
            position: 'sticky',
            left: 0,
            width: `${nDigits}ch`,
            top: 0,
            background: 'lightgray',
            color: 'black',
            cursor: 'pointer',
            userSelect: 'none'
        };
        const commandsStyle = {
            position: 'absolute',
            left: `${nDigits}ch`,
            top: 0
        };
        return <div style={scriptStyle[type]}>
            <div ref={ref => this.lineCmds[type] = ref} style={commandsStyle}>{commands}</div>
            <div ref={ref => this.lineNumbers[type] = ref} style={lineNumberStyle}>{lineNumbers}</div>
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
    } else {
        return null;
    }
}

/**
 * @return {null}
 */
function Operator({operator}) {
    if (operator) {
        return <span>
            &nbsp;{operator.name}
            &nbsp;<span style={argStyle}>{operator.operand}</span>
        </span>;
    } else {
        return null;
    }
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
    } else {
        return null;
    }
}

const lineBaseStyle = {
    whiteSpace: 'nowrap',
    lineHeight: '16px',
    fontWeight: 'normal',
    fontSize: 16
};

function getLineStyle(line, command, dash) {
    const isFirst = line > 0 &&
        (command.name === 'COMPORTEMENT'
            || command.name === 'TRACK'
            || command.name === 'END');

    const dashLine = dash ? '1px dashed gray' : '1px solid transparent';

    return extend({
        marginTop: isFirst ? '1em' : 0,
        borderTop: isFirst ? dashLine : 0
    }, lineBaseStyle);
}