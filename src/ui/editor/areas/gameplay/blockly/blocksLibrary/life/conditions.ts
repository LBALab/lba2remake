import Blockly from 'blockly';
import { typeIcons } from './utils';

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
                addConditionParam(input, param);
            }
            input.appendField(label);
            if (param && !leftParam) {
                addConditionParam(input, param);
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
    ['=', '='],
    ['≠', '!='],
    ['>', '>'],
    ['≥', '>='],
    ['<', '<'],
    ['≤', '<=']
];

const skipOperator = ['actor', 'zone'];

export function addOperand(input, operand) {
    if (!skipOperator.includes(operand)) {
        input.appendField(new Blockly.FieldDropdown(operators), 'operator');
    }
    if (operand in typeIcons) {
        input.appendField(new Blockly.FieldImage(
            typeIcons[operand],
            15,
            15,
            operand,
        ));
    }
    input.appendField(new Blockly.FieldDropdown([
        [operand.toUpperCase(), operand.toUpperCase()]
    ]), 'operand');
}

function addConditionParam(input, param) {
    if (param in typeIcons) {
        input.appendField(new Blockly.FieldImage(
            typeIcons[param],
            15,
            15,
            param,
        ));
    }
    input.appendField(new Blockly.FieldDropdown([
        [param.toUpperCase(), param.toUpperCase()]
    ]), 'param');
}
