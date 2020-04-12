import Blockly from 'blockly';
import { makeIcon, FieldUint8 } from '../utils';
import { generateActors, generateBehaviours, generateVar } from '../utils/optionsGenerators';

/*
** Behaviours
*/

const BEHAVIOUR_COLOR = 198;

export const lba_behaviour = {
    init() {
        this.appendDummyInput()
            .appendField('behaviour')
            .appendField(makeIcon('behaviour.svg'))
            .appendField(new Blockly.FieldTextInput('BEHAVIOUR'), 'name');
        this.appendStatementInput('statements')
            .setCheck('LIFE');
        this.setColour(BEHAVIOUR_COLOR);
    }
};

export const lba_behaviour_init = {
    init() {
        this.appendDummyInput()
            .appendField('start behaviour')
            .appendField(makeIcon('start_flag.svg'));
        this.appendStatementInput('statements')
            .setCheck('LIFE');
        this.setColour(BEHAVIOUR_COLOR);
      }
};

function behaviourAction(setupInput) {
    return {
        init() {
            const input = this.appendDummyInput();
            setupInput(this, (field, name) => input.appendField(field, name));
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour(BEHAVIOUR_COLOR);
        }
    };
}

export const lba_set_behaviour = behaviourAction((block, field) => {
    field('set behaviour to');
    field(makeIcon('behaviour.svg'));
    field(new Blockly.FieldDropdown(generateBehaviours.bind(block, false)), 'arg_0');
});

export const lba_set_behaviour_obj = behaviourAction((block, field) => {
    field('set');
    field(makeIcon('actor.svg'));
    field(new Blockly.FieldDropdown(generateActors.bind(block)), 'actor');
    field("'s behaviour to");
    field(makeIcon('behaviour.svg'));
    field(new Blockly.FieldDropdown(generateBehaviours.bind(block, true)), 'arg_0');
    block.postInit = function postInit() {
        this.getField('arg_0').getOptions();
    };
});

export const lba_save_behaviour = behaviourAction((_block, field) => {
    field('save current behaviour');
});

export const lba_save_behaviour_obj = behaviourAction((block, field) => {
    field('save');
    field(makeIcon('actor.svg'));
    field(new Blockly.FieldDropdown(generateActors.bind(block)), 'actor');
    field("'s current behaviour");
});

export const lba_restore_behaviour = behaviourAction((_block, field) => {
    field('restore saved behaviour');
});

export const lba_restore_behaviour_obj = behaviourAction((block, field) => {
    field('restore');
    field(makeIcon('actor.svg'));
    field(new Blockly.FieldDropdown(generateActors.bind(block)), 'actor');
    field("'s saved behaviour");
});

/*
** Tracks
*/

function trackAction(setupInput) {
    return {
        init() {
            const input = this.appendDummyInput();
            setupInput(this, (field, name) => input.appendField(field, name));
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour(100);
        }
    };
}

export const lba_set_track = trackAction((_block, field) => {
    field('set track to');
    field(makeIcon('track.svg'));
    field(new FieldUint8(), 'arg_0');
});

export const lba_set_track_obj = trackAction((block, field) => {
    field('set');
    field(makeIcon('actor.svg'));
    field(new Blockly.FieldDropdown(generateActors.bind(block)), 'actor');
    field("'s track to");
    field(makeIcon('track.svg'));
    field(new FieldUint8(), 'arg_0');
});

export const lba_save_current_track = trackAction((_block, field) => {
    field('save current track');
});

export const lba_save_current_track_obj = trackAction((block, field) => {
    field('save');
    field(makeIcon('actor.svg'));
    field(new Blockly.FieldDropdown(generateActors.bind(block)), 'actor');
    field("'s current track");
});

export const lba_restore_last_track = trackAction((_block, field) => {
    field('restore saved track');
});

export const lba_restore_last_track_obj = trackAction((block, field) => {
    field('restore');
    field(makeIcon('actor.svg'));
    field(new Blockly.FieldDropdown(generateActors.bind(block)), 'actor');
    field("'s saved track");
});

export const lba_vargame_to_track = trackAction((block, field) => {
    field('restore saved track from [game]');
    field(new Blockly.FieldDropdown(generateVar.vargame.bind(block)), 'arg_0');
});

export const lba_track_to_vargame = trackAction((block, field) => {
    field('save current track to [game]');
    field(new Blockly.FieldDropdown(generateVar.vargame.bind(block)), 'arg_0');
});
