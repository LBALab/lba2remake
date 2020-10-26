import {cloneDeep, map, filter, each, find, isFinite, isInteger, extend, findKey} from 'lodash';
import {lbaToDegrees, getDistance} from '../../../../../../utils/lba';
import DebugData, {getObjectName, getVarName} from '../../../../DebugData';
import { DirMode } from '../../../../../../game/Actor';
import Indent from './data/indent';
import LifeProps from './data/life';
import MoveProps from './data/move';
import ConditionProps from './data/condition';
import {formatVar} from './format';

export function getDebugListing(type, scene, actor) {
    if (scene && actor) {
        const script = actor.scripts[type];
        const activeLine = script.context
            && script.context.state
            && script.context.state.lastOffset;
        return {commands: mapCommands(type, scene, actor, script.commands), activeLine};
    }
    return null;
}

function mapCommands(type, scene, actor, commands) {
    let indent = 0;
    let prevCommand = null;
    let section = -1;
    const state = {
        condition: null
    };
    const ExtraProps = type === 'life' ? LifeProps : MoveProps;
    const filteredCommands = filter(commands, c => c.op.command !== 'END');
    return map(filteredCommands, (cmd) => {
        if (cmd.op.command === 'BEHAVIOUR' || cmd.op.command === 'TRACK') {
            section = cmd.args[0].value;
        }
        const newCmd = {
            ...ExtraProps[cmd.op.command],
            name: cmd.op.command,
            args: mapArguments(scene, actor, cmd),
            condition: mapCondition(scene, cmd.condition, state),
            operator: mapOperator(scene, cmd.condition || state.condition, cmd.operator, state),
            section,
            unimplemented: cmd.op.handler.unimplemented,
        };
        if (type === 'life') {
            indent = processIndent(newCmd, prevCommand, cmd.op, indent);
        } else {
            newCmd.indent = 0;
        }
        prevCommand = newCmd;
        return newCmd;
    });
}

export function mapComportementArg(comportement) {
    switch (comportement) {
        case 0: return 'start';
        default: return `BEHAVIOUR_${comportement}`;
    }
}

function mapArguments(scene, actor, cmd) {
    const args = cloneDeep(cmd.args);

    const mapComportementSetterArg =
        (obj, index) => mapComportementArg(obj.scripts.life.comportementMap[index]);

    switch (cmd.op.command) {
        case 'TRACK':
            args[0].value = args[0].value;
            break;
        case 'BEHAVIOUR':
            args[0].value = mapComportementArg(args[0].value);
            break;
        case 'SET_BEHAVIOUR':
            args[0].value = mapComportementSetterArg(actor, args[0].value);
            break;
        case 'SET_BEHAVIOUR_OBJ': {
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
            if (scene.props.texts[args[0].value]) {
                args[0].text = scene.props.texts[args[0].value].value;
            }
            break;
        case 'ASK_CHOICE_OBJ':
        case 'MESSAGE_OBJ':
            if (scene.props.texts[args[1].value]) {
                args[1].text = scene.props.texts[args[1].value].value;
            }
            break;
        case 'SET_VAR_CUBE':
        case 'SET_VAR_GAME':
            args[1].idx = args[0].value;
            break;
    }
    each(args, (arg) => {
        if (arg.type === 'var_value') {
            arg.subType = args[0].type;
        }
        arg.realValue = arg.value;
        arg.value = mapDataName(scene, arg);
    });
    return args;
}

function mapCondition(scene, condition, state) {
    if (condition) {
        if (condition.param) {
            if (condition.param.type === 'vargame' || condition.param.type === 'varcube') {
                state.condition = condition;
            }
        }
        return {
            ...ConditionProps[condition.op.command],
            name: condition.op.command,
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

function mapOperator(scene, condition, operator, state) {
    if (operator) {
        let text = null;
        if (operator.operand.type === 'var_value') {
            return {
                name: operator.op.command,
                operand: {
                    type: operator.operand.type,
                    realValue: operator.operand.value,
                    value: mapDataName(
                        scene,
                        extend({
                            subType: condition.param.type,
                            idx: state.condition.param.value
                        }, operator.operand)
                    )
                }
            };
        }
        if (operator.operand.type === 'choice_value') {
            if (scene.props.texts[operator.operand.value]) {
                text = scene.props.texts[operator.operand.value].value;
            }
        }
        return {
            name: operator.op.command,
            operand: {
                type: operator.operand.type,
                subType: operator.operand.type,
                realValue: operator.operand.value,
                value: mapDataName(scene, operator.operand)
            },
            value: text
        };
    }
    return null;
}

function processIndent(cmd, prevCmd, op, indent) {
    if (prevCmd && prevCmd.name !== 'BREAK' &&
            prevCmd.name !== 'SWITCH' &&
            prevCmd.name !== 'OR_CASE' &&
            (op.command === 'CASE' || op.command === 'OR_CASE' || op.command === 'DEFAULT')) {
        indent = Math.max(indent - 1, 0);
    }
    const { indent: indentChange } = LifeProps[op.command];
    switch (indentChange) {
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
    }
    if (data.type === 'text' && data.text) {
        const ellipsis = data.text.length > 50 ? '_[...]' : '';
        return ['`', data.text.substring(0, 50), ellipsis, '`'].join('');
    }
    if (data.type === 'actor') {
        if (data.value === -1)
            return 'none';
        return getObjectName(data.type, scene.index, data.value);
    }
    if (data.type === 'zone') {
        if (data.value === -1)
            return 'none';
        const foundZone = find(scene.zones, zone =>
            zone.props.type === 2 && zone.props.snap === data.value);
        if (foundZone) {
            return getObjectName('zone', scene.index, foundZone.index);
        }
        return 'none';
    }
    if (data.type === 'vargame' || data.type === 'varcube') {
        return getVarName({
            type: data.type,
            idx: data.value
        });
    }
    if (data.type === 'var_value') {
        return formatVar({
            type: data.subType,
            idx: data.idx
        }, data.value);
    }
    if (data.type === 'anim') {
        return DebugData.metadata.anims[data.value] || `anim_${data.value}`;
    }
    if (data.type === 'body') {
        return DebugData.metadata.bodies[data.value] || `body_${data.value}`;
    }
    if (data.type === 'dirmode') {
        return findKey(DirMode, m => m === data.value);
    }
    if (data.type === 'distance') {
        return `${getDistance(data.value).toFixed(1)}m`;
    }
    if (data.type === 'behaviour') {
        return BehaviourMap[data.value] || data.value;
    }
    if (data.type === 'angle') {
        return `${lbaToDegrees(data.value)}°`;
    }
    if (data.type === 'boolean') {
        return `${data.value !== 0}`;
    }
    if (isFinite(data.value) && !isInteger(data.value)) {
        return data.value.toFixed(2);
    }
    return data.value;
}
