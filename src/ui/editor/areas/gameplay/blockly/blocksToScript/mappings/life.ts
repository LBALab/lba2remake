import { keyBy, last, each } from 'lodash';
import { LifeOpcode } from '../../../../../../../game/scripting/data/life';
import { OperatorOpcode } from '../../../../../../../game/scripting/data/operator';
import condMappings from './conditions';
import { ConditionOpcode } from '../../../../../../../game/scripting/data/condition';
import { mapValue } from './utils';

const operatorsByName = keyBy(OperatorOpcode, 'command');

function statementsWrapper(block, emit) {
    const conn = block.getInput('statements').connection;
    let childBlock = conn.targetBlock();
    while (childBlock) {
        emit(childBlock);
        childBlock = childBlock.nextConnection && childBlock.nextConnection.targetBlock();
    }
}

function getTypeInfo(spec) {
    const [t, type] = spec.split(':');
    return {
        type,
        hide: t[0] === '_'
    };
}

function handleLogicGate(logicBlock, cmd, ctx) {
    const left = logicBlock.getInput('arg_0').connection.targetBlock();
    const right = logicBlock.getInput('arg_1').connection.targetBlock();
    if (!left && !right) {
        return false;
    }
    if (!left) {
        return handleCondition(right, cmd, ctx);
    }
    if (!right) {
        return handleCondition(left, cmd, ctx);
    }
    const gateCmd = {
        op: logicBlock.type === 'lba_or'
            ? LifeOpcode[0x37]
            : LifeOpcode[0x70],
        args: [{
            type: 'offset',
            value: null,
            hide: true
        }]
    };
    const leftRes = handleCondition(left, gateCmd, ctx);
    const rightRes = handleCondition(right, cmd, ctx);
    if (leftRes && rightRes) {
        ctx.commands.push(gateCmd);
        if (logicBlock.type === 'lba_or') {
            ctx.orCmds.push(gateCmd);
        } else {
            ctx.andCmds.push(gateCmd);
        }
        return true;
    }
    return false;
}

function handleOperand(condBlock, cmd, operand) {
    const { type, hide } = getTypeInfo(operand);
    const operatorValue = condBlock.getFieldValue('operator');
    const operandValue = condBlock.getFieldValue('operand');
    cmd.operator = {
        op: operatorsByName[operatorValue],
        operand: {
            type,
            value: mapValue(operandValue, type),
            hide
        }
    };
}

function handleCondition(condBlock, cmd, ctx, usesOperand = true) {
    if (condBlock.type === 'lba_or' || condBlock.type === 'lba_and') {
        return handleLogicGate(condBlock, cmd, ctx);
    }
    const code = condMappings[condBlock.type];
    const op = ConditionOpcode[code];
    if (!op) {
        return false;
    }

    cmd.condition = {
        op,
        operandType: getTypeInfo(op.operand).type
    };
    if (usesOperand) {
        handleOperand(condBlock, cmd, op.operand);
    }
    if (op.param) {
        const { type: paramType, hide: hideParam } = getTypeInfo(op.param);
        const actorField = condBlock.getField('actor');
        const value = actorField ? actorField.getValue() : condBlock.getFieldValue('param');
        cmd.condition.param = {
            type: paramType,
            value: mapValue(value, paramType),
            hide: hideParam
        };
    }
    return true;
}

function ifDetailsHandler(block, cmd, ctx) {
    const conn = block.getInput('condition').connection;
    if (conn.targetBlock()) {
        const condBlock = conn.targetBlock();
        return handleCondition(condBlock, cmd, ctx);
    }
    return false;
}

function ifContentHandler(block, emit, ctx, cmd) {
    const conn = block.getInput('then_statements').connection;
    each(ctx.orCmds, (orCmd) => {
        orCmd.args[0].value = ctx.commands.length;
    });
    ctx.orCmds = [];
    let childBlock = conn.targetBlock();
    while (childBlock) {
        emit(childBlock);
        childBlock = childBlock.nextConnection.targetBlock();
    }
    const elseStatements = block.getInput('else_statements');
    if (elseStatements) {
        const elseCmd = {
            op: LifeOpcode[0x0F],
            args: [{
                type: 'offset',
                value: null,
                hide: true
            }]
        };
        ctx.commands.push(elseCmd);
        cmd.args[0].value = ctx.commands.length;
        each(ctx.andCmds, (andCmd) => {
            andCmd.args[0].value = ctx.commands.length;
        });
        ctx.andCmds = [];
        childBlock = elseStatements.connection.targetBlock();
        while (childBlock) {
            emit(childBlock);
            childBlock = childBlock.nextConnection.targetBlock();
        }
        elseCmd.args[0].value = ctx.commands.length + 1;
    } else {
        cmd.args[0].value = ctx.commands.length + 1;
        each(ctx.andCmds, (andCmd) => {
            andCmd.args[0].value = ctx.commands.length + 1;
        });
        ctx.andCmds = [];
    }
}

function switchDetailsHandler(block, cmd, ctx) {
    const conn = block.getInput('condition').connection;
    if (conn.targetBlock()) {
        const condBlock = conn.targetBlock();
        return handleCondition(condBlock, cmd, ctx, false);
    }
    return false;
}

function switchContentHandler(block, emit, ctx) {
    const conn = block.getInput('condition').connection;
    if (!conn.targetBlock()) {
        return;
    }
    const condBlock = conn.targetBlock();
    const code = condMappings[condBlock.type];
    const op = ConditionOpcode[code];
    if (!op) {
        return;
    }
    ctx.switchOperandDefs.push(op.operand);
    statementsWrapper(block, emit);
    ctx.switchOperandDefs.pop();
    each(ctx.breakCmds, (brk) => {
        brk.args[0].value = ctx.commands.length + 1;
    });
    ctx.breakCmds = [];
    if (ctx.lastCase) {
        ctx.lastCase.args[0].value = ctx.commands.length;
        ctx.lastCase = null;
    }
}

function caseDetailsHandler(block, cmd, ctx) {
    const conn = block.getInput('operand').connection;
    if (conn.targetBlock()) {
        const operandBlock = conn.targetBlock();
        const operand = last(ctx.switchOperandDefs);
        handleOperand(operandBlock, cmd, operand);
        if (ctx.lastCase) {
            ctx.lastCase.args[0].value = ctx.commands.length;
            ctx.lastCase = null;
        }
        if (block.type === 'lba_case') {
            ctx.lastCase = cmd;
        }
        return true;
    }
    return false;
}

function behaviourDetailsHandler(_block, cmd, ctx) {
    ctx.comportementMap[ctx.commands.length] = cmd.args[0].value;
    return true;
}

function breakDetailsHandler(_block, cmd, ctx) {
    ctx.breakCmds.push(cmd);
    return true;
}

export default {
    lba_behaviour_init: {
        code: 0x20,
        args: { 0: 0 },
        details: behaviourDetailsHandler,
        content: statementsWrapper,
        closeCode: 0x23
    },
    lba_behaviour: {
        code: 0x20,
        details: behaviourDetailsHandler,
        content: statementsWrapper,
        args: { 0: block => block.data },
        closeCode: 0x23
    },
    lba_if: {
        code: 0x0C,
        details: ifDetailsHandler,
        content: ifContentHandler,
        closeCode: 0x10
    },
    lba_swif: {
        code: 0x0D,
        details: ifDetailsHandler,
        content: ifContentHandler,
        closeCode: 0x10
    },
    lba_oneif: {
        code: 0x0E,
        details: ifDetailsHandler,
        content: ifContentHandler,
        closeCode: 0x10
    },
    lba_switch: {
        code: 0x71,
        details: switchDetailsHandler,
        content: switchContentHandler,
        closeCode: 0x76
    },
    lba_case: {
        code: 0x73,
        details: caseDetailsHandler,
        content: statementsWrapper
    },
    lba_default: {
        code: 0x74,
        content: statementsWrapper
    },
    lba_or_case: {
        code: 0x72,
        details: caseDetailsHandler
    },
    lba_break: {
        code: 0x75,
        details: breakDetailsHandler
    },
    lba_return: { code: 0x0B },
    lba_set_behaviour: { code: 0x21 },
    lba_set_behaviour_obj: { code: 0x22 },
    lba_save_behaviour: { code: 0x78 },
    lba_save_behaviour_obj: { code: 0x8B },
    lba_restore_behaviour: { code: 0x79 },
    lba_restore_behaviour_obj: { code: 0x8C },
    lba_set_track: { code: 0x17 },
    lba_set_track_obj: { code: 0x18 },
    lba_save_current_track: { code: 0x2A },
    lba_save_current_track_obj: { code: 0x89 },
    lba_track_to_vargame: { code: 0x65 },
    lba_restore_last_track: { code: 0x2B },
    lba_restore_last_track_obj: { code: 0x8A },
    lba_vargame_to_track: { code: 0x66 },
    lba_end_life: { code: 0x29 },
    lba_suicide: { code: 0x26 },
    lba_kill_obj: { code: 0x25 },
    lba_change_scene: { code: 0x34 },
    lba_the_end: { code: 0x62 },
    lba_game_over: { code: 0x61 },
    lba_set_vargame: { code: 0x24 },
    lba_add_vargame: { code: 0x80 },
    lba_sub_vargame: { code: 0x81 },
    lba_set_varscene: { code: 0x1F },
    lba_add_varscene: { code: 0x82 },
    lba_sub_varscene: { code: 0x83 },
    lba_set_anim: { code: 0x13 },
    lba_set_anim_obj: { code: 0x14 },
    lba_set_body: { code: 0x11 },
    lba_set_body_obj: { code: 0x12 },
    lba_no_body: { code: 0x87 },
    lba_message: { code: 0x19 },
    lba_message_obj: { code: 0x2C },
    lba_message_zoe: { code: 0x4E },
    lba_add_message: { code: 0x58 },
    lba_end_message: { code: 0x95 },
    lba_add_choice: { code: 0x44 },
    lba_ask_choice: { code: 0x45 },
    lba_ask_choice_obj: { code: 0x5B },
    lba_set_position: { code: 0x3A },
    lba_set_orientation: { code: 0x50 },
    lba_set_inverse_orientation: { code: 0x86 },
    lba_set_dirmode: { code: 0x1B },
    lba_set_dirmode_obj: { code: 0x1C },
    lba_set_hero_behaviour: { code: 0x1E },
    lba_save_hero: { code: 0x5D },
    lba_restore_hero: { code: 0x5E },
    lba_set_magic_level: { code: 0x3B },
    lba_cinema_mode: { code: 0x5C },
    lba_set_camera: { code: 0x15 },
    lba_camera_center: { code: 0x16 },
    lba_cam_follow: { code: 0x1D },
    lba_set_door_left: { code: 0x2F },
    lba_set_door_right: { code: 0x30 },
    lba_set_door_up: { code: 0x31 },
    lba_set_door_down: { code: 0x32 },
    lba_set_life_point_obj: { code: 0x3D },
    lba_add_life_point_obj: { code: 0x6E },
    lba_sub_life_point_obj: { code: 0x3E },
    lba_full_point: { code: 0x4F },
    lba_set_armor: { code: 0x6C },
    lba_set_armor_obj: { code: 0x6D },
    lba_add_money: { code: 0x88 },
    lba_sub_money: { code: 0x28 },
    lba_use_one_little_key: { code: 0x27 },
    lba_give_bonus: { code: 0x33 },
    lba_inc_clover_box: { code: 0x42 },
    lba_found_object: { code: 0x2E },
    lba_state_inventory: { code: 0x6F },
    lba_set_used_inventory: { code: 0x43 },
    lba_set_holo_pos: { code: 0x48 },
    lba_clr_holo_pos: { code: 0x49 },
    lba_memo_slate: { code: 0x47 },
    lba_sample: { code: 0x7A },
    lba_new_sample: { code: 0x98 },
    lba_repeat_sample: { code: 0x7E },
    lba_sample_always: { code: 0x7C },
    lba_sample_stop: { code: 0x7D },
    lba_parm_sample: { code: 0x97 },
    lba_play_music: { code: 0x64 },
    lba_play_video: { code: 0x40 },
    lba_hit: { code: 0x3F },
    lba_set_hit_zone: { code: 0x77 },
    lba_set_sprite: { code: 0x54 },
    lba_anim_texture: { code: 0x67 },
    lba_set_invisible: { code: 0x38 },
    lba_set_rail: { code: 0x85 },
    lba_escalator: { code: 0x63 },
    lba_init_buggy: { code: 0x46 },
    lba_rain: { code: 0x60 },
    lba_lightning: { code: 0x41 },
    lba_set_anim_dial: { code: 0x93 },
    lba_impact_point: { code: 0x57 },
    lba_balloon: { code: 0x59 },
    lba_background: { code: 0x7F },
    lba_set_can_fall: { code: 0x1A },
    lba_brick_col: { code: 0x36 },
    lba_obj_col: { code: 0x35 },
    lba_no_shock: { code: 0x5A },
    lba_pcx: { code: 0x94 },
    lba_set_grm: { code: 0x4C },
    lba_set_change_cube: { code: 0x4D },
    lba_fade_to_pal: { code: 0x51 },
    lba_palette: { code: 0xA },
    lba_flow_point: { code: 0x91 },
    lba_shadow_obj: { code: 0x39 },
    lba_anim_set: { code: 0x5F },
    lba_pcx_mess_obj: { code: 0x9A },
    lba_set_frame: { code: 0x53 },
    lba_flow_obj: { code: 0x92 },
    lba_impact_obj: { code: 0x56 },
    lba_pos_obj_around: { code: 0x99 },
    lba_scale: { code: 0x6B },
    lba_popcorn: { code: 0x90 },
    lba_set_frame_3ds: { code: 0x55 },
    lba_set_action: { code: 0x52 }
};
