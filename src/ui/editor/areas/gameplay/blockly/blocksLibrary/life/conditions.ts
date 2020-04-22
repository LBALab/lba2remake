import Blockly from 'blockly';
import { makeIcon, typeIcons, FieldDropdownLBA, FieldActor } from '../utils';

export const lba_distance = condition({
    label: 'distance to',
    param: 'actor',
    operand: 'number'
});

export const lba_distance_3D = condition({
    label: '3D distance to',
    param: 'actor',
    operand: 'number'
});

export const lba_distance_msg = condition({
    label: 'distance (msg) to',
    param: 'actor',
    operand: 'number'
});

export const lba_collision = condition({
    label: 'collides with',
    operand: 'actor'
});

export const lba_collision_obj = condition({
    label: 'collides with',
    operand: 'actor',
    objMode: true
});

export const lba_zone = condition({
    label: 'current zone',
    operand: 'zone'
});

export const lba_zone_obj = condition({
    label: "'s current zone",
    operand: 'zone',
    objMode: true
});

export const lba_anim = condition({
    label: 'anim',
    operand: 'anim'
});

export const lba_anim_obj = condition({
    label: "'s anim",
    operand: 'anim',
    objMode: true
});

export const lba_body = condition({
    label: 'body',
    operand: 'body'
});

export const lba_body_obj = condition({
    label: "'s body",
    operand: 'body',
    objMode: true
});

export const lba_cur_track = condition({
    label: 'current track',
    operand: 'track'
});

export const lba_cur_track_obj = condition({
    label: "'s current track",
    operand: 'track',
    objMode: true
});

export const lba_vargame_value = condition({
    label: '[game]',
    param: 'vargame',
    operand: 'vargame_value'
});

export const lba_varscene_value = condition({
    label: '[scene]',
    param: 'varscene',
    operand: 'varcube_value'
});

export const lba_cone_view = condition({
    label: 'cone view',
    operand: 'number'
});

export const lba_hit_by = condition({
    label: 'hit by',
    operand: 'actor'
});

export const lba_hit_by_obj = condition({
    label: 'hit by',
    operand: 'actor',
    objMode: true
});

export const lba_action = condition({
    label: 'action',
    operand: 'number'
});

export const lba_life_points = condition({
    label: 'life points',
    operand: 'number'
});

export const lba_life_points_obj = condition({
    label: "'s life points",
    operand: 'number',
    objMode: true
});

export const lba_magic_points = condition({
    label: 'magic points',
    operand: 'number'
});

export const lba_keys = condition({
    label: 'keys',
    operand: 'number'
});

export const lba_money = condition({
    label: 'money',
    operand: 'number'
});

export const lba_hero_behaviour = condition({
    label: 'hero behaviour',
    operand: 'number'
});

export const lba_chapter = condition({
    label: 'chapter',
    operand: 'number'
});

export const lba_magic_level = condition({
    label: 'magic level',
    operand: 'number'
});

export const lba_using_inventory = condition({
    label: 'using inventory item',
    param: 'item',
    operand: 'number'
});

export const lba_choice = condition({
    label: 'choice',
    operand: 'number'
});

export const lba_fuel = condition({
    label: 'fuel',
    operand: 'number'
});

export const lba_carried_by = condition({
    label: 'carried by',
    operand: 'actor'
});

export const lba_carried_by_obj = condition({
    label: 'carried by',
    operand: 'actor',
    objMode: true
});

export const lba_cdrom = condition({
    label: 'cdrom',
    operand: 'number'
});

export const lba_ladder = condition({
    label: 'ladder',
    operand: 'number'
});

export const lba_random = condition({
    label: 'random number from 0 to',
    param: 'number',
    operand: 'number'
});

export const lba_rail = condition({
    label: 'rail',
    operand: 'number'
});

export const lba_angle = condition({
    label: 'angle to',
    param: 'actor',
    operand: 'number'
});

export const lba_angle_obj = condition({
    label: "'s relative angle",
    operand: 'number',
    objMode: true
});

export const lba_real_angle = condition({
    label: 'real angle to',
    param: 'actor',
    operand: 'number'
});

export const lba_orientation = condition({
    label: 'orientation',
    operand: 'angle'
});

export const lba_orientation_obj = condition({
    label: "'s orientation",
    operand: 'angle',
    objMode: true
});

export const lba_is_demo = condition({
    label: 'is demo',
    operand: 'number'
});

export const lba_col_decors = condition({
    label: 'collides with background',
    operand: 'number'
});

export const lba_col_decors_obj = condition({
    label: 'collides with background',
    operand: 'number',
    objMode: true
});

export const lba_processor = condition({
    label: 'CPU',
    operand: 'number'
});

export const lba_object_displayed = condition({
    label: 'object displayed',
    operand: 'number'
});

function condition({
    label,
    param = null,
    operand,
    objMode = false
}) {
    return {
        init() {
            const input = this.appendDummyInput();
            if (objMode) {
                addConditionParam(input, 'actor', true);
            }
            input.appendField(label);
            if (param && !objMode) {
                addConditionParam(input, param, false);
            }
            this.addOperand();
            this.setInputsInline(true);
            this.setOutput(true, 'COND');
            this.setColour(15);
            this.data = operand;
        },
        addOperand() {
            const operandInput = this.appendDummyInput('operand');
            addOperand(operandInput, operand);
        }
    };
}

const operators = [
    ['=', '=='],
    ['≠', '!='],
    ['>', '>'],
    ['≥', '>='],
    ['<', '<'],
    ['≤', '<=']
];

const numberTypes = ['number', 'label', 'varcube_value', 'vargame_value'];

export function addOperand(input, operandType) {
    input.appendField(new Blockly.FieldDropdown(operators), 'operator');
    if (operandType in typeIcons) {
        input.appendField(makeIcon(typeIcons[operandType]));
    }
    if (numberTypes.includes(operandType)) {
        input.appendField(new Blockly.FieldNumber(), 'operand');
    } else if (operandType === 'angle') {
        input.appendField(new Blockly.FieldAngle(), 'operand');
    } else if (FieldDropdownLBA.supports(operandType)) {
        input.appendField(new FieldDropdownLBA(operandType), 'operand');
    } else {
        input.appendField(`${operandType}?`);
    }
}

function addConditionParam(input, paramType, objMode) {
    if (paramType in typeIcons) {
        input.appendField(makeIcon(typeIcons[paramType]));
    }
    if (paramType === 'actor' || objMode) {
        if (objMode) {
            input.appendField(new FieldActor(['operand']), 'actor');
        } else {
            input.appendField(new FieldActor(), 'param');
        }
    } else if (numberTypes.includes(paramType)) {
        input.appendField(new Blockly.FieldNumber(), 'param');
    } else if (FieldDropdownLBA.supports(paramType)) {
        input.appendField(new FieldDropdownLBA(paramType), 'param');
    } else {
        input.appendField(`${paramType}?`);
    }
}
