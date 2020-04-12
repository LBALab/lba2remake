import Blockly from 'blockly';
import { makeIcon } from '../utils';
import { generateActors, generateBehaviours, generateVar } from '../utils/optionsGenerators';

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
            .appendField(new Blockly.FieldDropdown(generateBehaviours.bind(this, false)), 'arg_0');
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
            .appendField("'s next behaviour:")
            .appendField(makeIcon('behaviour.svg'))
            .appendField(new Blockly.FieldDropdown(generateBehaviours.bind(this, true)), 'arg_0');
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour(198);
    },
    postInit() {
        this.getField('arg_0').getOptions();
    }
};

export const lba_set_track = {
    init() {
        this.appendDummyInput()
            .appendField('next track:')
            .appendField(makeIcon('track.svg'))
            .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'arg_0');
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour('#666666');
    }
};

export const lba_set_track_obj = {
    init() {
        this.appendDummyInput()
            .appendField(makeIcon('actor.svg'))
            .appendField(new Blockly.FieldDropdown(generateActors.bind(this)), 'actor')
            .appendField("'s next track:")
            .appendField(makeIcon('track.svg'))
            .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'arg_0');
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour('#666666');
    }
};

export const lba_save_current_track = {
    init() {
        this.appendDummyInput()
            .appendField('save current track')
            .appendField(makeIcon('track.svg'));
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour('#666666');
    }
};

export const lba_save_current_track_obj = {
    init() {
        this.appendDummyInput()
            .appendField('save')
            .appendField(makeIcon('actor.svg'))
            .appendField(new Blockly.FieldDropdown(generateActors.bind(this)), 'actor')
            .appendField("'s current track")
            .appendField(makeIcon('track.svg'));
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour('#666666');
    }
};

export const lba_restore_last_track = {
    init() {
        this.appendDummyInput()
            .appendField('restore saved track')
            .appendField(makeIcon('track.svg'));
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour('#666666');
    }
};

export const lba_restore_last_track_obj = {
    init() {
        this.appendDummyInput()
            .appendField('restore')
            .appendField(makeIcon('actor.svg'))
            .appendField(new Blockly.FieldDropdown(generateActors.bind(this)), 'actor')
            .appendField("'s saved track")
            .appendField(makeIcon('track.svg'));
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour('#666666');
    }
};

export const lba_vargame_to_track = {
    init() {
        this.appendDummyInput()
            .appendField('retore saved track')
            .appendField(makeIcon('track.svg'))
            .appendField('from [game]')
            .appendField(new Blockly.FieldDropdown(generateVar.vargame.bind(this)), 'arg_0');
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour('#666666');
    }
};

export const lba_track_to_vargame = {
    init() {
        this.appendDummyInput()
            .appendField('save current track')
            .appendField(makeIcon('track.svg'))
            .appendField('to [game]')
            .appendField(new Blockly.FieldDropdown(generateVar.vargame.bind(this)), 'arg_0');
        this.setPreviousStatement(true, 'LIFE');
        this.setNextStatement(true, 'LIFE');
        this.setColour('#666666');
    }
};
