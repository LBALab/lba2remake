import Blockly from 'blockly';
import { makeIcon } from '../utils';
import { generateActors, generateBehaviours } from '../optionsGenerators';

export const lba_behaviour = {
    init() {
        this.appendDummyInput()
            .appendField('behaviour')
            .appendField(makeIcon('behaviour.svg'))
            .appendField(new Blockly.FieldTextInput('BEHAVIOUR'), 'name');
        this.appendStatementInput('statements')
            .setCheck('LIFE');
        this.setColour(198);
    }
};

export const lba_behaviour_init = {
    init() {
        this.appendDummyInput()
            .appendField('start behaviour')
            .appendField(makeIcon('start_flag.svg'));
        this.appendStatementInput('statements')
            .setCheck('LIFE');
        this.setColour(198);
      }
};

export const lba_set_behaviour = {
    init() {
        this.appendDummyInput()
            .appendField('next behaviour:')
            .appendField(makeIcon('behaviour.svg'))
            .appendField(new Blockly.FieldDropdown(generateBehaviours.bind(this)), 'arg_0');
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour(198);
    }
};

export const lba_set_behaviour_obj = {
    init() {
        this.appendDummyInput()
            .appendField(makeIcon('actor.svg'))
            .appendField(new Blockly.FieldDropdown(generateActors.bind(this)), 'actor')
            .appendField('\'s next behaviour:')
            .appendField(makeIcon('behaviour.svg'))
            .appendField(new Blockly.FieldDropdown(generateBehaviours.bind(this)), 'arg_0');
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour(198);
    }
};
