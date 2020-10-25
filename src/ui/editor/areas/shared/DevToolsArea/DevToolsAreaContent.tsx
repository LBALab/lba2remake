import * as React from 'react';
import { map } from 'lodash';
import { TickerProps } from '../../../../utils/Ticker';
import { editor, fullscreen } from '../../../../styles';
import {
    findCommand,
    findCondition,
    findLogicSequence,
    findMixedLogicSequence,
    findStuff
} from './tools/scene_iterators';
import { getLifeOpcodeTable, getMoveOpcodeTable, getConditionOpcodeTable } from '../../../../../scripting/parser';

const mainStyle = Object.assign({}, fullscreen, {
    padding: 4,
    margin: 2,
    overflow: 'auto'
});

const buttonStyle = Object.assign({}, editor.button, {
    padding: 4,
    margin: 2
});

interface Props extends TickerProps {
    stateHandler: any;
    sharedState: any;
}

interface State {
    lifeCommand: string;
    moveCommand: string;
    cond: string;
}

const LIFE_CMDS = map(getLifeOpcodeTable, op => op.command).sort();
const MOVE_CMDS = map(getMoveOpcodeTable, op => op.command).sort();
const CONDS = map(getConditionOpcodeTable, op => op.command).sort();

export class DevToolsAreaContent extends React.Component<Props, State> {
    content: any;
    browseContent: any;

    constructor(props) {
        super(props);
        this.findLifeCommand = this.findLifeCommand.bind(this);
        this.findMoveCommand = this.findMoveCommand.bind(this);
        this.findCondition = this.findCondition.bind(this);
        this.findLogicSeq = this.findLogicSeq.bind(this);
        this.findMixedLogicSeq = this.findMixedLogicSeq.bind(this);
        this.state = {
            lifeCommand: LIFE_CMDS[0],
            moveCommand: MOVE_CMDS[0],
            cond: CONDS[0]
        };
    }

    render() {
        const onLifeCommandChange = e => this.setState({ lifeCommand: e.target.value });
        const onMoveCommandChange = e => this.setState({ moveCommand: e.target.value });
        const onCondChange = e => this.setState({ cond: e.target.value });
        return <div style={mainStyle}>
            <div style={{color: '#BBBBBB'}}>
                Following is a collection of search tools meant
                to help developping the remake engine. Results are
                displayed in your browser's JavaScript console.
            </div>
            <br/>
            <div><u>Life script</u></div>
            <div style={{paddingLeft: 8}}>
                <div>
                    Command:&nbsp;
                    <select value={this.state.lifeCommand} onChange={onLifeCommandChange}>
                        {
                            map(LIFE_CMDS, cmd =>
                                <option key={cmd} value={cmd}>
                                    {cmd}
                                </option>)
                        }
                    </select>
                    &nbsp;
                    <button style={buttonStyle} onClick={this.findLifeCommand}>
                        Search
                    </button>
                </div>
                <div>
                    Condition:&nbsp;
                    <select value={this.state.cond} onChange={onCondChange}>
                        {
                            map(CONDS, c =>
                                <option key={c} value={c}>
                                    {c}
                                </option>)
                        }
                    </select>
                    &nbsp;
                    <button style={buttonStyle} onClick={this.findCondition}>
                        Search
                    </button>
                </div>
                <div>
                    AND|OR sequence:&nbsp;
                    <button style={buttonStyle} onClick={this.findLogicSeq}>
                        Search
                    </button>
                </div>
                <div>
                    Mixed AND|OR sequence:&nbsp;
                    <button style={buttonStyle} onClick={this.findMixedLogicSeq}>
                        Search
                    </button>
                </div>
            </div>
            <br/>
            <div><u>Move script</u></div>
            <div style={{paddingLeft: 8}}>
                <div>
                    Command:&nbsp;
                    <select value={this.state.moveCommand} onChange={onMoveCommandChange}>
                        {
                            map(MOVE_CMDS, cmd =>
                                <option key={cmd} value={cmd}>
                                    {cmd}
                                </option>)
                        }
                    </select>
                    &nbsp;
                    <button style={buttonStyle} onClick={this.findMoveCommand}>
                        Search
                    </button>
                </div>
            </div>
            <br/>
            <div><u>Misc</u></div>
            <div style={{paddingLeft: 8}}>
                <div>
                    Multipurpose search tool:&nbsp;
                    <button style={buttonStyle} onClick={findStuff}>
                        Search
                    </button>
                </div>
            </div>
        </div>;
    }

    findLifeCommand() {
        findCommand(this.state.lifeCommand, 'life');
    }

    findMoveCommand() {
        findCommand(this.state.moveCommand, 'move');
    }

    findCondition() {
        findCondition(this.state.cond);
    }

    findLogicSeq() {
        findLogicSequence();
    }

    findMixedLogicSeq() {
        findMixedLogicSequence();
    }
}
