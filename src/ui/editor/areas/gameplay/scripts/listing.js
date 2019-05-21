import React from 'react';
import {cloneDeep, map, each, find, isFinite, isInteger, extend, findKey} from 'lodash';
import Indent from '../../../../../game/scripting/indent';
import {getRotation, getDistance} from '../../../../../utils/lba';
import DebugData, {getObjectName, getVarName} from '../../../DebugData';
import {formatVar} from './format';
import { DirMode } from '../../../../../game/actors.ts';
import { findSceneData } from '../scene/SceneNode';

export function getDebugListing(type, scene, actor) {
    if (scene && actor) {
        const script = actor.scripts[type];
        const activeLine = script.context
            && script.context.state
            && script.context.state.lastOffset;
        return {commands: mapCommands(scene, actor, script.commands), activeLine};
    }
    return null;
}

function mapCommands(scene, actor, commands) {
    let indent = 0;
    let prevCommand = null;
    const state = {};
    return map(commands, (cmd) => {
        const newCmd = {
            name: cmd.op.command,
            args: mapArguments(scene, actor, cmd),
            condition: mapCondition(scene, cmd.condition, state),
            operator: mapOperator(scene, cmd.operator, state),
            section: cmd.section,
            unimplemented: cmd.op.handler.unimplemented,
            type: cmd.op.type,
            prop: cmd.op.prop,
            scope: cmd.op.scope
        };
        indent = processIndent(newCmd, prevCommand, cmd.op, indent);
        prevCommand = newCmd;
        return newCmd;
    });
}

export function mapComportementArg(comportement) {
    switch (comportement) {
        case 1: return 'INIT';
        case 2: return 'NORMAL';
        default: return `CMP_${comportement}`;
    }
}

function mapArguments(scene, actor, cmd) {
    const args = cloneDeep(cmd.args);

    const mapComportementSetterArg =
        (obj, index) => mapComportementArg(obj.scripts.life.comportementMap[index] + 1);

    switch (cmd.op.command) {
        case 'TRACK':
            args[0].value = args[0].value;
            break;
        case 'COMPORTEMENT':
            args[0].value = mapComportementArg(args[0].value);
            break;
        case 'SET_COMPORTEMENT':
            args[0].value = mapComportementSetterArg(actor, args[0].value);
            break;
        case 'SET_COMPORTEMENT_OBJ': {
            const obj = scene ? scene.actors[args[0].value] : null;
            if (obj) {
                args[1].value = mapComportementSetterArg(obj, args[1].value);
            } else {
                args[1].value = '<?>';
            }
            break;
        }
        case 'SET_TRACK':
            args[0].value = actor.scripts.move.tracksMap[args[0].value];
            break;
        case 'SET_TRACK_OBJ': {
            const tgt2 = scene.actors[args[0].value];
            if (tgt2) {
                args[1].value = tgt2.scripts.move.tracksMap[args[1].value];
            }
            break;
        }
        case 'GOTO':
            args[0].value = actor.scripts.move.tracksMap[args[0].value];
            break;
        case 'ANGLE':
        case 'ADD_CHOICE':
        case 'ASK_CHOICE':
        case 'MESSAGE_ZOE':
        case 'MESSAGE':
        case 'ADD_MESSAGE':
            if (scene.data.texts[args[0].value]) {
                args[0].text = scene.data.texts[args[0].value].value;
            }
            break;
        case 'ASK_CHOICE_OBJ':
        case 'MESSAGE_OBJ':
            if (scene.data.texts[args[1].value]) {
                args[1].text = scene.data.texts[args[1].value].value;
            }
            break;
        case 'SET_VAR_CUBE':
        case 'SET_VAR_GAME':
            args[1].idx = args[0].value;
            break;
    }
    each(args, (arg) => {
        arg.realValue = arg.value;
        arg.value = mapDataName(scene, arg);
    });
    return args;
}

function mapCondition(scene, condition, state) {
    if (condition) {
        if (condition.param) {
            if (condition.param.type === 'vargame' || condition.param.type === 'varcube')
                state.condition = condition;
        }
        return {
            name: condition.op.command,
            type: condition.op.type,
            scope: condition.op.scope,
            prop: condition.op.prop,
            unimplemented: condition.op.handler.unimplemented,
            param: condition.param && {
                type: condition.param.type,
                realValue: condition.param.value,
                value: mapDataName(scene, condition.param)
            }
        };
    }
    return null;
}

function mapOperator(scene, operator, state) {
    if (operator) {
        let text = null;
        if (operator.operand.type === 'vargame_value' || operator.operand.type === 'varcube_value') {
            return {
                name: operator.op.command,
                operand: {
                    type: operator.operand.type,
                    realValue: operator.operand.value,
                    value: mapDataName(
                        scene,
                        extend({idx: state.condition.param.value}, operator.operand)
                    )
                }
            };
        } else if (operator.operand.type === 'choice_value') {
            if (scene.data.texts[operator.operand.value]) {
                text = scene.data.texts[operator.operand.value].value;
            }
        }
        return {
            name: operator.op.command,
            operand: {
                type: operator.operand.type,
                realValue: operator.operand.value,
                value: mapDataName(scene, operator.operand)
            },
            value: text
        };
    }
    return null;
}

function processIndent(cmd, prevCmd, op, indent) {
    if (prevCmd && prevCmd.name !== 'BREAK' && prevCmd.name !== 'SWITCH' && prevCmd.name !== 'OR_CASE' && (op.command === 'CASE' || op.command === 'OR_CASE' || op.command === 'DEFAULT')) {
        indent = Math.max(indent - 1, 0);
    }
    switch (op.indent) {
        case Indent.ZERO:
            cmd.indent = 0;
            return 0;
        case Indent.ONE:
            cmd.indent = 1;
            return 1;
        case Indent.ADD:
            cmd.indent = indent;
            return indent + 1;
        case Indent.SUB:
            cmd.indent = Math.max(indent - 1, 0);
            return Math.max(indent - 1, 0);
        case Indent.POST_SUB:
            cmd.indent = indent;
            return Math.max(indent - 1, 0);
        case Indent.SUB_ADD:
            cmd.indent = Math.max(indent - 1, 0);
            return indent;
        case Indent.KEEP:
            cmd.indent = indent;
            return indent;
    }
    throw new Error('Missing indent op');
}

const BehaviourMap = {
    0: 'NORMAL',
    1: 'ATHLETIC',
    2: 'AGGRESSIVE',
    3: 'DISCREET',
    4: 'PROTOPACK',
    5: 'WITH_ZOE',
    6: 'HORN',
    7: 'SPACESUIT_INDOORS_NORMAL',
    8: 'JETPACK',
    9: 'SPACESUIT_INDOORS_ATHLETIC',
    10: 'SPACESUIT_OUTDOORS_NORMAL',
    11: 'SPACESUIT_OUTDOORS_ATHLETIC',
    12: 'CAR',
    13: 'ELECTROCUTED'
};

export function mapDataName(scene, data) {
    if (!data) {
        return null;
    } else if (data.type === 'text') {
        const ellipsis = data.text.length > 50 ? '_[...]' : '';
        return ['`', data.text.substring(0, 50), ellipsis, '`'].join('');
    } else if (data.type === 'actor') {
        if (data.value === -1)
            return 'none';
        return getObjectName(data.type, scene.index, data.value);
    } else if (data.type === 'zone') {
        if (data.value === -1)
            return 'none';
        const foundZone = find(scene.zones, zone =>
            zone.props.type === 2 && zone.props.snap === data.value);
        if (foundZone) {
            return getObjectName('zone', scene.index, foundZone.index);
        }
        return 'none';
    } else if (data.type === 'vargame' || data.type === 'varcube') {
        return getVarName({
            type: data.type,
            idx: data.value
        });
    } else if (data.type === 'vargame_value' || data.type === 'varcube_value') {
        return formatVar({
            type: data.type.substr(0, 7),
            idx: data.idx
        }, data.value);
    } else if (data.type === 'anim') {
        return DebugData.metadata.anims[data.value] || `anim_${data.value}`;
    } else if (data.type === 'body') {
        return DebugData.metadata.bodies[data.value] || `body_${data.value}`;
    } else if (data.type === 'dirmode') {
        return findKey(DirMode, m => m === data.value);
    } else if (data.type === 'distance') {
        return `${getDistance(data.value).toFixed(1)}m`;
    } else if (data.type === 'behaviour') {
        return BehaviourMap[data.value] || data.value;
    } else if (data.type === 'angle') {
        return `${Math.round(getRotation(data.value, 0, 1) - 90)}°`;
    } else if (data.type === 'boolean') {
        return `${data.value !== 0}`;
    } else if (data.type === 'scene') {
        const node = findSceneData(data.value);
        if (node) {
            const style = {
                paddingLeft: '2ch',
                background: `url("${node.icon}") no-repeat`,
                backgroundSize: '14px 14px',
                backgroundPosition: '1px 1px'
            };
            return <span style={style}>{node.name}&nbsp;<span style={{color: 'grey'}}>#{data.value}</span></span>;
        }
        return `#${data.value}`;
    }
    if (isFinite(data.value) && !isInteger(data.value)) {
        return data.value.toFixed(2);
    }
    return data.value;
}
