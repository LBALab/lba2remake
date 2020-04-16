
import Blockly from 'blockly';
import { each, map, isEqual } from 'lodash';
import { addOperand } from './conditions';

export const lba_if = ifBlock('if');
export const lba_swif = ifBlock('if (on change)');
export const lba_oneif = ifBlock('if (once)');

function ifBlock(type) {
    return {
        init() {
            this.appendValueInput('condition')
                .setCheck(['COND', 'LOGIC'])
                .appendField(type);

            this.appendStatementInput('then_statements')
                .setCheck('LIFE');
            this.disableElseBlock();
            this.setInputsInline(true);
            const checks = type === 'if' ? ['LIFE', 'SWITCH'] : 'LIFE';
            this.setPreviousStatement(true, checks);
            this.setNextStatement(true, checks);
            this.setColour(180);
        },
        enableElseBlock() {
            if (!this.getInput('else_block')) {
                this.appendDummyInput('else_block')
                    .appendField('else');
            }
            if (!this.getInput('else_statements')) {
                this.appendStatementInput('else_statements')
                    .setCheck('LIFE');
            }
        },
        disableElseBlock() {
            if (this.getInput('else_block')) {
                this.removeInput('else_block');
            }
            if (this.getInput('else_statements')) {
                this.removeInput('else_statements');
            }
        },
        customContextMenu(options) {
            if (this.getInput('else_block')) {
                options.unshift({
                    text: "Remove 'else' branch",
                    enabled: true,
                    callback: () => {
                        this.disableElseBlock();
                    },
                });
            } else {
                options.unshift({
                    text: "Add 'else' branch",
                    enabled: true,
                    callback: () => {
                        this.enableElseBlock();
                    },
                });
            }
        }
    };
}

export const lba_switch = {
    init() {
        this.appendValueInput('condition')
            .setCheck('COND')
            .appendField('switch');

        this.appendStatementInput('statements')
            .setCheck('SWITCH');

        this.setInputsInline(true);
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour(180);

        this.setOnChange((event) => {
            if (event instanceof Blockly.Events.Move) {
                const e = event as any;
                if (e.newParentId === this.id && e.newInputName === 'condition') {
                    const condBlock = this.getInput('condition').connection.targetBlock();
                    if (condBlock.getInput('operand')) {
                        condBlock.removeInput('operand');
                    }
                    const operandType = condBlock.data;
                    each(this.getCases(), (caseBlock) => {
                        caseBlock.setOperandType(operandType);
                    });
                } else if (e.oldParentId === this.id && e.oldInputName === 'condition') {
                    const condBlock = this.workspace.getBlockById(e.blockId);
                    if (condBlock && !condBlock.isDisposed()) {
                        condBlock.addOperand();
                    }
                    each(this.getCases(), (caseBlock) => {
                        caseBlock.setOperandType(null);
                    });
                }
            }
        });
    },
    getCases() {
        const cases = [];
        let connection = this.getInput('statements').connection;
        while (connection && connection.targetBlock()) {
            const type = connection.targetBlock().type;
            if (type === 'lba_case' || type === 'lba_or_case') {
                cases.push(connection.targetBlock());
            }
            connection = connection.targetBlock().nextConnection;
        }
        return cases;
    }
};

const allowedOperandTypes = map(
    [
        'number',
        'actor',
        'zone',
        'anim',
        'body',
        'track',
        'vargame_value',
        'varcube_value',
        'angle'
    ],
    type => `operand_${type}`
);

function makeCase(orCase) {
    return {
        init() {
            this.appendValueInput('operand')
                .setCheck(allowedOperandTypes)
                .appendField('case:');

            if (orCase) {
                this.appendDummyInput()
                    .appendField('or');
            } else {
                this.appendStatementInput('statements')
                    .setCheck(['SWITCH', 'LIFE']);
            }

            this.setInputsInline(true);
            this.setPreviousStatement(true, 'SWITCH');
            this.setNextStatement(true, 'SWITCH');
            this.setColour(180);
        },
        setOperandType(operandType) {
            const input = this.getInput('operand');
            const check = operandType
                ? [`operand_${operandType}`]
                : allowedOperandTypes;
            if (!isEqual(check, input.connection.getCheck())) {
                if (operandType
                    && input.connection.targetBlock()
                    && !isEqual(
                            input.connection.targetBlock().outputConnection.getCheck(),
                            check
                        )) {
                    input.connection.targetBlock().dispose();
                }
                input.setCheck(check);
                if (operandType && !input.connection.targetBlock()) {
                    const block = this.workspace.newBlock(`lba_operand_${operandType}`);
                    block.initSvg();
                    block.render();
                    input.connection.connect(block.outputConnection);
                }
            }
        },
        customContextMenu(options) {
            const input = this.getInput('operand');
            if (!input.connection.targetBlock() && input.connection.getCheck().length === 1) {
                const check = input.connection.getCheck()[0];
                options.unshift({
                    text: 'Generate operand',
                    enabled: true,
                    callback: () => {
                        const block = this.workspace.newBlock(`lba_${check}`);
                        block.initSvg();
                        block.render();
                        input.connection.connect(block.outputConnection);
                    },
                });
            }
        }
    };
}

export const lba_case = makeCase(false);
export const lba_or_case = makeCase(true);

export const lba_default = {
    init() {
        this.appendDummyInput()
            .appendField('default:');

        this.appendStatementInput('statements')
            .setCheck('LIFE');

        this.setPreviousStatement(true, 'SWITCH');
        this.setColour(180);
    }
};

export const lba_break = {
    init() {
        this.appendDummyInput().appendField('break');
        this.setPreviousStatement(true, 'LIFE');
        this.setColour(180);
    }
};

function makeOperand(type) {
    return {
        init() {
            this.setInputsInline(true);
            this.setOutput(true, `operand_${type}`);
            this.setColour(15);
            const operandInput = this.appendDummyInput('operand');
            addOperand(operandInput, type);
        }
    };
}

export const lba_operand_number = makeOperand('number');
export const lba_operand_actor = makeOperand('actor');
export const lba_operand_zone = makeOperand('zone');
export const lba_operand_anim = makeOperand('anim');
export const lba_operand_body = makeOperand('body');
export const lba_operand_track = makeOperand('track');
export const lba_operand_vargame_value = makeOperand('vargame_value');
export const lba_operand_varcube_value = makeOperand('varcube_value');
export const lba_operand_angle = makeOperand('angle');

export const lba_and = logicOperator('and');
export const lba_or = logicOperator('or');

function logicOperator(type) {
    return {
        init() {
            this.appendValueInput('arg_0')
                .setCheck(['COND', 'LOGIC']);
            this.appendValueInput('arg_1')
                .appendField(type)
                .setCheck(['COND', 'LOGIC']);
            this.setInputsInline(false);
            this.setOutput(true, 'LOGIC');
            this.setColour(180);
        }
    };
}
