
import Blockly from 'blockly';
import { each, map, isEqual } from 'lodash';
import { addOperand } from './conditions';
import { debuggerContextMenu } from '../utils';

export const lba_if = ifBlock('if');
export const lba_swif = ifBlock('if (on change)');
export const lba_oneif = ifBlock('if (once)');

function ifBlock(type) {
    return {
        init() {
            this.appendValueInput('condition')
                .setCheck(['COND', 'LOGIC'])
                .appendField(type);

            const checks = ['SWITCH', 'LIFE'];
            this.appendStatementInput('then_statements').setCheck(checks);
            this.disableElseBlock();
            this.setInputsInline(true);
            this.setPreviousStatement(true, checks);
            this.setNextStatement(true, checks);
            this.setColour(180);
            this.scriptType = 'life';
        },
        enableElseBlock() {
            if (!this.getInput('else_block')) {
                this.appendDummyInput('else_block')
                    .appendField('else');
            }
            if (!this.getInput('else_statements')) {
                this.appendStatementInput('else_statements')
                    .setCheck(['SWITCH', 'LIFE']);
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
            debuggerContextMenu(this, options);
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

        // Switch blocks can contain if statements (and, theoretically, anything else!).
        const checks = ['SWITCH', 'LIFE'];
        this.appendStatementInput('statements').setCheck(checks);
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
        this.scriptType = 'life';
    },
    getCases() {
        const search = (connection) => {
            const cases = [];
            while (connection && connection.targetBlock()) {
                const type = connection.targetBlock().type;
                if (type === 'lba_case' || type === 'lba_or_case') {
                    cases.push(connection.targetBlock());
                } else if (type === 'lba_if' || type === 'lba_swif' || type === 'lba_oneif') {
                    cases.push(...search(
                        connection.targetBlock().getInput('then_statements').connection
                    ));
                    if (connection.targetBlock().getInput('else_statements')) {
                        cases.push(...search(
                            connection.targetBlock().getInput('else_statements').connection
                        ));
                    }
                }

                connection = connection.targetBlock().nextConnection;
            }

            return cases;
        };

        return search(this.getInput('statements').connection);
    },
    customContextMenu(options) {
        debuggerContextMenu(this, options);
    }
};

const allowedOperandTypes = map(
    [
        'number',
        'actor',
        'sceneric_zone',
        'ladder_zone',
        'rail_zone',
        'anim',
        'body',
        'track',
        'var_value',
        'angle',
        'choice_value',
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
                    .setCheck('LIFE');
            }

            // We have to accept adjacent life script in order to support 'if'
            // blocks around cases.
            this.setInputsInline(true);
            this.setPreviousStatement(true, ['SWITCH', 'LIFE']);
            this.setNextStatement(true, ['SWITCH', 'LIFE']);
            this.setColour(180);
            this.setOnChange((event) => {
                if (event instanceof Blockly.Events.Move) {
                    const e = event as any;
                    if (e.blockId === this.id && e.newParentId) {
                        const input = this.getInput('operand');
                        if (!input.connection.targetBlock()) {
                            let upperBlock = this.getSurroundParent();
                            while (upperBlock && upperBlock.type !== 'lba_switch') {
                                upperBlock = upperBlock.getSurroundParent();
                            }
                            if (upperBlock) {
                                const condBlock = upperBlock.getInput('condition')
                                                            .connection
                                                            .targetBlock();
                                if (condBlock) {
                                    const operandType = condBlock.data;
                                    this.setOperandType(operandType);
                                }
                            } else {
                                this.previousConnection.disconnect();
                            }
                        }
                    }
                }
            });
            this.scriptType = 'life';
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
            debuggerContextMenu(this, options);
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

        this.setPreviousStatement(true, ['SWITCH', 'LIFE']);
        this.setColour(180);
        this.scriptType = 'life';
    },
    customContextMenu(options) {
        debuggerContextMenu(this, options);
    }
};

export const lba_break = {
    init() {
        this.appendDummyInput().appendField('break');
        this.setPreviousStatement(true, 'LIFE');
        this.setColour(180);
        this.scriptType = 'life';
    },
    customContextMenu(options) {
        debuggerContextMenu(this, options);
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
            this.scriptType = 'life';
        },
        customContextMenu(options) {
            debuggerContextMenu(this, options);
        }
    };
}

export const lba_operand_number = makeOperand('number');
export const lba_operand_actor = makeOperand('actor');
export const lba_operand_sceneric_zone = makeOperand('sceneric_zone');
export const lba_operand_ladder_zone = makeOperand('ladder_zone');
export const lba_operand_rail_zone = makeOperand('rail_zone');
export const lba_operand_anim = makeOperand('anim');
export const lba_operand_body = makeOperand('body');
export const lba_operand_track = makeOperand('track');
export const lba_operand_var_value = makeOperand('var_value');
export const lba_operand_angle = makeOperand('angle');
export const lba_operand_choice_value = makeOperand('choice_value');

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
            this.scriptType = 'life';
        },
        customContextMenu(options) {
            debuggerContextMenu(this, options);
        }
    };
}
