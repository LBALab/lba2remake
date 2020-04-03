
import Blockly from 'blockly';
import { each } from 'lodash';
import { addOperand } from './conditions';

export const lba_if = ifBlock('if');
export const lba_swif = ifBlock('if');
export const lba_oneif = ifBlock('if');

function ifBlock(type) {
    return {
        init() {
            this.appendValueInput('cond')
                .setCheck(['COND', 'LOGIC'])
                .appendField(type);

            this.appendStatementInput('then_statements').setCheck('LIFE');
            this.disableElseBlock();
            this.setInputsInline(true);
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour(180);
        },
        enableElseBlock() {
            if (this.getInput('toggle_wrapper')) {
                this.removeInput('toggle_wrapper');
            }

            if (!this.getInput('else_block')) {
                this.appendDummyInput('else_block')
                    .appendField('else')
                    .appendField(new Blockly.FieldImage(
                        'editor/icons/toggle_up.svg',
                        40,
                        10,
                        name,
                        () => {
                            this.disableElseBlock();
                        }
                    ));
            }
            if (!this.getInput('else_statements')) {
                this.appendStatementInput('else_statements').setCheck('LIFE');
            }
        },
        disableElseBlock() {
            if (this.getInput('else_block')) {
                this.removeInput('else_block');
            }
            if (this.getInput('else_statements')) {
                this.removeInput('else_statements');
            }
            if (!this.getInput('toggle_wrapper')) {
                this.appendDummyInput('toggle_wrapper')
                    .appendField(new Blockly.FieldImage(
                        'editor/icons/toggle_down.svg',
                        40,
                        10,
                        name,
                        () => {
                            this.enableElseBlock();
                        }
                    ));
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
        this.appendValueInput('cond')
            .setCheck('COND')
            .appendField(new Blockly.FieldImage(
                'editor/icons/add_row.svg',
                16,
                16,
                'add_row',
                () => this.addCase()
            ))
            .appendField('switch');
        this.appendDummyInput('default_cond')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(new Blockly.FieldLabel('default'));
        this.appendStatementInput('default_statement')
            .setCheck('LIFE');
        this.setInputsInline(false);
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour(180);

        this.setOnChange((event) => {
            if (event instanceof Blockly.Events.Move) {
                const e = event as any;
                if (e.newParentId === this.id && e.newInputName === 'cond') {
                    this.condBlock = this.getInput('cond').connection.targetBlock();
                    this.condBlock.removeInput('operand');
                    const operand = this.condBlock.data;
                    each(this.cases, ({operandBlock}) => {
                        operandBlock.setOperand(operand);
                    });
                } else if (e.oldParentId === this.id && e.oldInputName === 'cond') {
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

        this.appendStatementInput(`case_${index}_statement`)
            .setCheck('LIFE');

        this.moveInputBefore(`case_${index}_statement`, 'default_cond');
        this.moveInputBefore(`case_${index}_cond`, `case_${index}_statement`);
        if (this.condBlock) {
            operandBlock.setOperand(this.condBlock.data);
        }
        operandBlock.outputConnection.connect(input.connection);
        this.cases[index] = {
            operandBlock
        };
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
            addOperand(operandInput, operand);
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
