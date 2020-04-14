
import Blockly from 'blockly';
import { each } from 'lodash';
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
        this.condBlock = null;
        this.operand = null;
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
                    this.condBlock = this.getInput('condition').connection.targetBlock();
                    if (this.condBlock.getInput('operand')) {
                        this.condBlock.removeInput('operand');
                    }
                    const operand = this.condBlock.data;
                    each(this.getCases(), ({operandBlock}) => {
                        operandBlock.setOperand(operand);
                    });
                } else if (e.oldParentId === this.id && e.oldInputName === 'condition') {
                    if (!this.condBlock.isDisposed()) {
                        this.condBlock.addOperand();
                    }
                    each(this.getCases(), ({operandBlock}) => {
                        operandBlock.setOperand();
                    });
                    this.condBlock = null;
                }
            }
        });
    },
    getCases() {
        const cases = [];
        let connection = this.getInput('statements').connection;
        while (connection && connection.targetBlock()) {
            if (connection.targetBlock().type === 'lba_case') {
                cases.push(connection.targetBlock());
            }
            connection = connection.targetBlock().nextConnection;
        }
        return cases;
    }
};

export const lba_case = {
    init() {
        const input = this.appendValueInput('operand');
        input.setCheck('OPERAND');
        input.appendField('case:');

        this.operandBlock = this.workspace.newBlock('lba_dummy_operand');
        this.operandBlock.initSvg();
        this.operandBlock.render();
        this.operandBlock.outputConnection.connect(input.connection);

        this.appendStatementInput('statements')
            .setCheck(['SWITCH', 'LIFE']);

        this.setInputsInline(true);
        this.setPreviousStatement(true, 'SWITCH');
        this.setNextStatement(true, 'SWITCH');
        this.setColour(180);
    }
};

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

export const lba_dummy_operand = {
    init() {
        this.setInputsInline(true);
        this.setOutput(true, 'OPERAND');
        this.setMovable(false);
        this.setDeletable(false);
        this.setColour(15);
    },
    setOperand(operand = null) {
        if (this.getInput('operand')) {
            this.removeInput('operand');
        }
        if (operand) {
            const operandInput = this.appendDummyInput('operand');
            addOperand(this, operandInput, operand);
        }
    }
};

export const lba_and = logicOperator('and');
export const lba_or = logicOperator('or');

function logicOperator(type) {
    return {
      init() {
        this.appendValueInput('left')
            .setCheck(['COND', 'LOGIC']);
        this.appendValueInput('right')
            .appendField(type)
            .setCheck(['COND', 'LOGIC']);
        this.setInputsInline(false);
        this.setOutput(true, 'LOGIC');
        this.setColour(180);
      }
    };
}
