import { each } from 'lodash';
import Blockly from 'blockly';

const typeIcons = {
  actor: 'editor/icons/actor.svg',
  zone: 'editor/icons/zone.svg',
  anim: 'editor/icons/anim.svg',
  vargame: 'editor/icons/var.svg',
  varscene: 'editor/icons/var.svg'
};

function setter(type, name = type, otherActor = false) {
  return {
    init() {
      const input = this.appendDummyInput();
      if (otherActor) {
        input.appendField('set');
        input.appendField(new Blockly.FieldImage(typeIcons.actor, 15, 15, 'actor'));
        input.appendField(new Blockly.FieldDropdown([
          ['ACTOR', 'ACTOR']
        ]), 'actor');
        input.appendField(`'s ${name} to`);
      } else {
        input.appendField(`set ${name} to`);
      }
      if (type in typeIcons) {
        input.appendField(new Blockly.FieldImage(typeIcons[type], 15, 15, type));
      }
      input.appendField(new Blockly.FieldDropdown([
            [type.toUpperCase(), type.toUpperCase()]
          ]), type);
      this.setPreviousStatement(true, 'LIFE');
      this.setNextStatement(true, 'LIFE');
      this.setColour(43);
    }
  };
}

function varSetter(type) {
  return {
    init() {
      this.appendDummyInput()
        .appendField('set')
        .appendField(new Blockly.FieldImage(typeIcons[type], 15, 15, type))
        .appendField(new Blockly.FieldDropdown([
              [type.toUpperCase(), type.toUpperCase()]
            ]), type)
        .appendField('to')
        .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'value');
      this.setPreviousStatement(true, 'LIFE');
      this.setNextStatement(true, 'LIFE');
      this.setColour(43);
    }
  };
}

function moveAction(name, icon) {
  return {
    init() {
      this.appendValueInput('next')
          .setCheck('MOVE')
          .appendField(new Blockly.FieldImage(icon, 20, 20, name))
          .appendField(new Blockly.FieldDropdown([
            [name.toUpperCase(), name.toUpperCase()]
          ]), name);
      this.setOutput(true, 'MOVE');
      this.setColour(43);
    }
  };
}

const skipOperator = ['actor', 'zone'];

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

const operators = [
  ['=', '='],
  ['≠', '!='],
  ['>', '>'],
  ['≥', '>='],
  ['<', '<'],
  ['≤', '<=']
];

function addOperand(input, operand) {
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

function ifBlock(type) {
  return {
    init() {
      let withElse = false;
      this.appendValueInput('cond')
        .setCheck(['COND', 'LOGIC'])
        .appendField(type);

      this.appendStatementInput('then').setCheck('LIFE');
      const toggleElseBlock = () => {
        if (withElse) {
          this.appendDummyInput('else_block')
            .appendField('else')
            .appendField(new Blockly.FieldImage(
              'editor/icons/toggle_up.svg',
              40,
              10,
              name,
              () => {
                this.removeInput('else_block');
                this.removeInput('else_statements');
                withElse = false;
                toggleElseBlock();
              }
            ));
          this.appendStatementInput('else_statements').setCheck('LIFE');
        } else {
          this.appendDummyInput('toggle_wrapper')
            .appendField(new Blockly.FieldImage(
              'editor/icons/toggle_down.svg',
              40,
              10,
              name,
              () => {
                this.removeInput('toggle_wrapper');
                withElse = true;
                toggleElseBlock();
              }
            ));
        }
      };
      toggleElseBlock();
      this.setInputsInline(true);
      this.setPreviousStatement(true, 'LIFE');
      this.setNextStatement(true, 'LIFE');
      this.setColour(180);
    }
  };
}

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

export default {
  // BEHAVIOURS
  lba_behaviour: {
    init() {
      this.appendDummyInput()
          .appendField('behaviour')
          .appendField(new Blockly.FieldImage(
            'editor/icons/behaviour.svg',
            15,
            15
          ))
          .appendField(new Blockly.FieldTextInput('BEHAVIOUR'), 'bhv');
      this.appendStatementInput('statements')
          .setCheck('LIFE');
      this.setColour(198);
    },
  },
  lba_behaviour_init: {
    init() {
      this.appendDummyInput()
          .appendField('behaviour')
          .appendField(new Blockly.FieldImage(
            'editor/icons/start_flag.svg',
            15,
            15
          ))
          .appendField('START');
      this.appendStatementInput('statements')
          .setCheck('LIFE');
      this.setColour(198);
    },
  },
  lba_set_behaviour: {
    init() {
      this.appendDummyInput()
        .appendField('next behaviour:')
        .appendField(new Blockly.FieldImage(
          'editor/icons/behaviour.svg',
          15,
          15
        ))
        .appendField(new Blockly.FieldDropdown([['BEHAVIOUR', 'BEHAVIOUR']]), 'bhv');
      this.setPreviousStatement(true, 'LIFE');
      this.setNextStatement(true, 'LIFE');
      this.setColour(198);
    }
  },
  lba_set_behaviour_obj: {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(typeIcons.actor, 15, 15, 'actor'))
        .appendField(new Blockly.FieldDropdown([
          ['ACTOR', 'ACTOR']
        ]), 'actor')
        .appendField('\'s next behaviour:')
        .appendField(new Blockly.FieldImage(
          'editor/icons/behaviour.svg',
          15,
          15
        ))
        .appendField(new Blockly.FieldDropdown([['BEHAVIOUR', 'BEHAVIOUR']]), 'bhv');
      this.setPreviousStatement(true, 'LIFE');
      this.setNextStatement(true, 'LIFE');
      this.setColour(198);
    }
  },
  // CONTROL
  lba_if: ifBlock('if'),
  lba_swif: ifBlock('if (switch)'),
  lba_oneif: ifBlock('if (once)'),
  lba_switch: {
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
  },
  lba_dummy_operand: {
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
  },
  // LOGIC
  lba_and: logicOperator('and'),
  lba_or: logicOperator('or'),
  // CONDITIONS
  lba_distance: condition('distance to', 'actor', 'number'),
  lba_collision: condition('collides with', null, 'actor'),
  lba_collision_obj: condition('collides with', 'actor', 'actor', true),
  lba_zone: condition('in zone', null, 'zone'),
  lba_zone_obj: condition('in zone', 'actor', 'zone', true),
  // LIFE ACTIONS
  lba_set_varscene: varSetter('varscene'),
  lba_set_vargame: varSetter('vargame'),
  lba_set_anim: setter('anim', 'animation'),
  lba_set_anim_obj: setter('anim', 'animation', true),
  lba_move_start: {
    init() {
      this.appendValueInput('next')
          .setCheck('MOVE')
          .appendField(new Blockly.FieldImage(
            'http://localhost:8080/editor/icons/start_flag.svg',
            20,
            20,
            'start'
          ));
      this.setColour(198);
    }
  },
  // TRACKS
  lba_move_track_start: {
    init() {
      this.appendValueInput('next')
          .setCheck('MOVE')
          .appendField(new Blockly.FieldImage(
            'http://localhost:8080/editor/icons/track.svg',
            10,
            20,
            'start'
          ))
          .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'num_track');
      this.setColour(198);
    }
  },
  lba_move_track: {
    init() {
      this.appendValueInput('next')
          .setCheck('MOVE')
          .appendField(new Blockly.FieldImage(
            'http://localhost:8080/editor/icons/track.svg',
            10,
            20,
            'start'
          ))
          .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'num_track');
      this.setOutput(true, 'MOVE');
      this.setColour(198);
    }
  },
  lba_move_stop: {
    init() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(
          'http://localhost:8080/editor/icons/stop.svg',
          20,
          20,
          'stop'
        ));
      this.setOutput(true, 'MOVE');
      this.setColour(198);
    }
  },
  // MOVE ACTIONS
  lba_move_set_anim: moveAction('anim', 'editor/icons/anim.svg'),
  lba_move_wait_sec: {
    init() {
      this.appendValueInput('next')
        .setCheck('MOVE')
        .appendField(new Blockly.FieldImage(
          'http://localhost:8080/editor/icons/watch.svg',
          20,
          20,
          'wait'
        ))
        .appendField(new Blockly.FieldNumber(
          0,
          0,
          255,
          0,
          num => Number(num.toFixed(1)
        ), 'num_sec'))
        .appendField('s');
      this.setOutput(true, 'MOVE');
      this.setColour(43);
    }
  },
  lba_move_wait_anim: {
    init() {
      this.appendValueInput('next')
          .setCheck('MOVE')
          .appendField(new Blockly.FieldImage(
            'http://localhost:8080/editor/icons/wait_anim.svg',
            20,
            20,
            'wait_anim'
          ));
      this.setOutput(true, 'MOVE');
      this.setColour(43);
    }
  },
  lba_move_goto_point: {
    init() {
      this.appendValueInput('next')
          .setCheck('MOVE')
          .appendField(new Blockly.FieldImage(
            'http://localhost:8080/editor/icons/point.svg',
            20,
            20,
            'goto'
          ))
          .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'point');
      this.setOutput(true, 'MOVE');
      this.setColour(43);
    }
  }
};
