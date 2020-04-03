import Blockly from 'blockly';
import {typeIcons} from './utils';

export const lba_behaviour = {
    init() {
        this.appendDummyInput()
            .appendField('behaviour')
            .appendField(new Blockly.FieldImage(
                'editor/icons/behaviour.svg',
                15,
                15
            ))
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
            .appendField(new Blockly.FieldImage(
                'editor/icons/start_flag.svg',
                15,
                15
            ));
        this.appendStatementInput('statements')
            .setCheck('LIFE');
        this.setColour(198);
      }
};

export const lba_set_behaviour = {
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
};

export const lba_set_behaviour_obj = {
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
};
