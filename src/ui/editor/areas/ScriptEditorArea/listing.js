import Indent from '../../../../scripting/indent';
import {cloneDeep, map, each, find} from 'lodash';
import {getRotation} from '../../../../utils/lba';
import {getObjectName} from '../../DebugData';

export function getDebugListing(type, scene, actor) {
    if (scene && actor) {
        const script = actor.scripts[type];
        const activeLine = script.context && script.context.state && script.context.state.lastOffset;
        return {commands: mapCommands(scene, actor, script.commands), activeLine};
    } else {
        return null;
    }
}

function mapCommands(scene, actor, commands) {
    let indent = 0;
    let prevCommand = null;
    return map(commands, cmd => {
        const newCmd = {
            name: cmd.op.command,
            args: mapArguments(scene, actor, cmd),
            condition: mapCondition(scene, cmd.condition),
            operator: mapOperator(scene, cmd.operator),
            section: cmd.section
        };
        indent = processIndent(newCmd, prevCommand, cmd.op, indent);
        prevCommand = newCmd;
        return newCmd;
    })
}

function mapArguments(scene, actor, cmd) {
    const args = cloneDeep(cmd.args);
    switch (cmd.op.command) {
        case 'SET_COMPORTEMENT':
            args[0].value = actor.scripts.life.comportementMap[args[0].value];
            break;
        case 'SET_COMPORTEMENT_OBJ':
            const tgt = scene.getActor(args[0].value);
            if (tgt) {
                args[1].value = tgt.scripts.life.comportementMap[args[1].value];
            }
            break;
        case 'SET_TRACK':
            args[0].value = actor.scripts.move.tracksMap[args[0].value];
            break;
        case 'SET_TRACK_OBJ':
            const tgt2 = scene.getActor(args[0].value);
            if (tgt2) {
                args[1].value = tgt2.scripts.move.tracksMap[args[1].value];
            }
            break;
        case 'GOTO':
            args[0].value = actor.scripts.move.tracksMap[args[0].value];
            break;
        case 'ANGLE':
        case 'BETA':
            args[0].value = getRotation(args[0].value, 0, 1) - 90;
            break;
        case 'MESSAGE_ZOE':
        case 'MESSAGE':
            args[0].text = scene.data.texts[args[0].value].value;
            break;
        case 'MESSAGE_OBJ':
            args[1].text = scene.data.texts[args[1].value].value;
            break;
    }
    each(args, arg => {
        arg.value = mapDataName(scene, arg);
    });
    return args;
}

function mapCondition(scene, condition) {
    if (condition) {
        return {
            name: condition.op.command,
            param: mapDataName(scene, condition.param)
        };
    }
}

function mapOperator(scene, operator) {
    if (operator) {
        return {
            name: operator.op.command,
            operand: mapDataName(scene, operator.operand)
        };
    }
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
}

export function mapDataName(scene, data) {
    if (!data) {
        return null;
    } else if (data.type === 'actor' || data.type === 'point') {
        if (data.value === -1)
            return `<no-${data.type}>`;
        return getObjectName(data.type, scene.index, data.value);
    } else if (data.type === 'zone') {
        if (data.value === -1)
            return '<no-zone>';
        const zone = find(scene.zones, zone => zone.props.type === 2 && zone.props.snap === data.value);
        if (zone) {
            return getObjectName('zone', scene.index, zone.index);
        } else {
            return '<no-zone>';
        }
    } else {
        return data.value;
    }
}
