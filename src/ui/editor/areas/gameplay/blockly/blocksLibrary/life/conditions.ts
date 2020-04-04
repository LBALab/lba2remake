import Blockly from 'blockly';
import { makeIcon } from '../utils';
import { generateActors, generateAnims, generateZones } from '../optionsGenerators';

export const lba_distance = condition('distance to', 'actor', 'number');
export const lba_collision = condition('collides with', null, 'actor');
export const lba_collision_obj = condition('collides with', 'actor', 'actor', true);
export const lba_zone = condition('in zone', null, 'zone');
export const lba_zone_obj = condition('in zone', 'actor', 'zone', true);

function condition(label, param, operand, leftParam = false) {
    return {
        init() {
            const input = this.appendDummyInput('param');
            if (param && leftParam) {
                addConditionParam(this, input, param);
            }
            input.appendField(label);
            if (param && !leftParam) {
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

const skipOperator = ['actor', 'zone'];
const typeIcons = {
    actor: 'actor.svg',
    zone: 'zone.svg'
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
