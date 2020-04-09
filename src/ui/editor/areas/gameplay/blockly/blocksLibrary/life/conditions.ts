import Blockly from 'blockly';
import { makeIcon } from '../utils';
import { generateActors, generateAnims, generateZones } from '../optionsGenerators';

export const lba_distance = condition({
    label: 'distance to',
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
    label: 'in zone',
    operand: 'zone',
});

export const lba_zone_obj = condition({
    label: 'in zone',
    operand: 'zone',
    objMode: true
});

export const lba_anim = condition({
    label: 'anim',
    operand: 'anim',
});

export const lba_anim_obj = condition({
    label: 'anim',
    operand: 'anim',
    objMode: true
});

export const lba_body = condition({
    label: 'body',
    operand: 'body',
});

export const lba_body_obj = condition({
    label: 'body',
    operand: 'body',
    objMode: true
});

function condition({
    label,
    param = null,
    operand,
    objMode = false
}) {
    return {
        init() {
            const input = this.appendDummyInput('param');
            if (objMode) {
                addConditionParam(this, input, 'actor');
            }
            input.appendField(label);
            if (param && !objMode) {
                addConditionParam(this, input, param);
            }
            this.addOperand();
            this.setInputsInline(true);
            this.setOutput(true, 'COND');
            this.setColour(15);
            this.data = operand;
        },
        addOperand() {
            const operandInput = this.appendDummyInput('operand');
            addOperand(this, operandInput, operand);
        }
    };
}

const operators = [
    ['=', '='],
    ['≠', '!='],
    ['>', '>'],
    ['≥', '>='],
    ['<', '<'],
    ['≤', '<=']
];

const skipOperator = ['actor', 'zone', 'anim', 'body'];
const typeIcons = {
    actor: 'actor.svg',
    body: 'body.svg',
    anim: 'anim.svg',
    zone: 'zone_scn.svg'
};
const typeGenerator = {
    actor: generateActors,
    zone: generateZones,
    anim: generateAnims
};

export function addOperand(block, input, operand) {
    if (!skipOperator.includes(operand)) {
        input.appendField(new Blockly.FieldDropdown(operators), 'operator');
    }
    if (operand in typeIcons) {
        input.appendField(makeIcon(typeIcons[operand]));
    }
    if (operand === 'number') {
        input.appendField(new Blockly.FieldNumber(), 'operand');
    } else if (operand in typeGenerator) {
        input.appendField(new Blockly.FieldDropdown(typeGenerator[operand].bind(block)), 'operand');
    } else {
        input.appendField(`${operand}?`);
    }
}

function addConditionParam(block, input, param) {
    if (param in typeIcons) {
        input.appendField(makeIcon(typeIcons[param]));
    }
    if (param === 'number') {
        input.appendField(new Blockly.FieldNumber(), 'param');
    } else if (param in typeGenerator) {
        input.appendField(new Blockly.FieldDropdown(typeGenerator[param].bind(block)), 'param');
    } else {
        input.appendField(`${param}?`);
    }
}

export const lba_unknown_cond = {
    init() {
        this.appendDummyInput()
            .appendField('unknown', 'label');
        this.addOperand();
        this.setInputsInline(true);
        this.setOutput(true, 'COND');
        this.setColour(15);
    },
    addOperand() {}
};
