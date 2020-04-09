
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
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
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
        this.caseId = 0;
        this.condBlock = null;
        this.operand = null;
        this.cases = {};
        this.appendValueInput('condition')
            .setCheck('COND')
            .appendField('switch');

        this.setInputsInline(false);
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
                    each(this.cases, ({operandBlock}) => {
                        operandBlock.setOperand(operand);
                    });
                } else if (e.oldParentId === this.id && e.oldInputName === 'condition') {
                    if (!this.condBlock.isDisposed()) {
                        this.condBlock.addOperand();
                    }
                    each(this.cases, ({operandBlock}) => {
                        operandBlock.setOperand();
                    });
                    this.condBlock = null;
                }
            }
        });
    },
    addCase() {
        const index = this.caseId;
        this.caseId += 1;

        const operandBlock = this.workspace.newBlock('lba_dummy_operand');
        operandBlock.initSvg();
        operandBlock.render();

        const input = this.appendValueInput(`case_${index}_cond`)
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(new Blockly.FieldImage(
                'editor/icons/close.svg',
                12,
                12,
                'close',
                () => {
                    this.removeInput(`case_${index}_cond`);
                    this.removeInput(`case_${index}_statement`);
                    operandBlock.dispose();
                    delete this.cases[index];
                }
            ))
            .appendField('case')
            .setCheck('OPERAND');

        const statementsInput = this.appendStatementInput(`case_${index}_statement`);
        statementsInput.setCheck('LIFE');

        if (this.getInput('default_cond')) {
            this.moveInputBefore(`case_${index}_statement`, 'default_cond');
        }
        this.moveInputBefore(`case_${index}_cond`, `case_${index}_statement`);
        if (this.condBlock) {
            operandBlock.setOperand(this.condBlock.data);
        }
        operandBlock.outputConnection.connect(input.connection);
        this.cases[index] = {
            operandBlock
        };
        return { statementsInput };
    },
    enableDefaultCase() {
        this.appendDummyInput('default_cond')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField('default');
        this.appendStatementInput('default_statement')
            .setCheck('LIFE');
    },
    disableDefaultCase() {
        this.removeInput('default_cond');
        this.removeInput('default_statement');
    },
    customContextMenu(options) {
        if (this.getInput('default_cond')) {
            options.unshift({
                text: 'Disable default case',
                enabled: true,
                callback: () => {
                    this.disableDefaultCase();
                },
            });
        } else {
            options.unshift({
                text: 'Enable default case',
                enabled: true,
                callback: () => {
                    this.enableDefaultCase();
                },
            });
        }
        options.unshift({
            text: 'Add case',
            enabled: true,
            callback: () => {
                this.addCase();
            },
        });
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
