import Blockly from 'blockly';
import { makeIcon, debuggerContextMenu, FieldActor, FieldDropdownLBA, FieldScope } from '../utils';

/*
** Behaviours
*/

const BEHAVIOUR_COLOR = 198;

export const lba_behaviour = {
    init() {
        this.appendDummyInput()
            .appendField('behaviour')
            .appendField(makeIcon('behaviour.svg'))
            .appendField(new Blockly.FieldTextInput('BEHAVIOUR'), 'arg_0');
        this.appendStatementInput('statements')
            .setCheck('LIFE');
        this.setColour(BEHAVIOUR_COLOR);
        this.data = -1;
        this.scriptType = 'life';
    },
    customContextMenu(options) {
        debuggerContextMenu(this, options);
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
        this.data = 0;
        this.scriptType = 'life';
    },
    customContextMenu(options) {
        debuggerContextMenu(this, options);
    }
};

function behaviourAction(setupInput) {
    return {
        init() {
            const input = this.appendDummyInput();
            setupInput((field, name) => input.appendField(field, name));
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour(BEHAVIOUR_COLOR);
            this.scriptType = 'life';
        },
        customContextMenu(options) {
            debuggerContextMenu(this, options);
        }
    };
}

export const lba_set_behaviour = behaviourAction((field) => {
    field('set behaviour to');
    field(makeIcon('behaviour.svg'));
    field(new FieldDropdownLBA('behaviour'), 'arg_0');
});

export const lba_set_behaviour_obj = behaviourAction((field) => {
    field('set');
    field(makeIcon('actor.svg'));
    field(new FieldActor(['arg_0']), 'actor');
    field("'s behaviour to");
    field(makeIcon('behaviour.svg'));
    field(new FieldDropdownLBA('behaviour'), 'arg_0');
});

export const lba_save_behaviour = behaviourAction((field) => {
    field('save current behaviour');
});

export const lba_save_behaviour_obj = behaviourAction((field) => {
    field('save');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field("'s current behaviour");
});

export const lba_restore_behaviour = behaviourAction((field) => {
    field('restore saved behaviour');
});

export const lba_restore_behaviour_obj = behaviourAction((field) => {
    field('restore');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field("'s saved behaviour");
});

/*
** Tracks
*/

function trackAction(setupInput) {
    return {
        init() {
            const input = this.appendDummyInput();
            setupInput((field, name) => input.appendField(field, name));
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour(100);
            this.scriptType = 'life';
        },
        customContextMenu(options) {
            debuggerContextMenu(this, options);
        }
    };
}

export const lba_set_track = trackAction((field) => {
    field('set track to');
    field(makeIcon('track.svg'));
    field(new FieldDropdownLBA('track'), 'arg_0');
});

export const lba_set_track_obj = trackAction((field) => {
    field('set');
    field(makeIcon('actor.svg'));
    field(new FieldActor(['arg_0']), 'actor');
    field("'s track to");
    field(makeIcon('track.svg'));
    field(new FieldDropdownLBA('track'), 'arg_0');
});

export const lba_save_current_track = trackAction((field) => {
    field('save current track');
});

export const lba_save_current_track_obj = trackAction((field) => {
    field('save');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field("'s current track");
});

export const lba_restore_last_track = trackAction((field) => {
    field('restore saved track');
});

export const lba_restore_last_track_obj = trackAction((field) => {
    field('restore');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field("'s saved track");
});

export const lba_vargame_to_track = trackAction((field) => {
    field('restore saved track from');
    field(new FieldScope('game'));
    field(new FieldDropdownLBA('vargame'), 'arg_0');
});

export const lba_track_to_vargame = trackAction((field) => {
    field('save current track to');
    field(new FieldScope('game'));
    field(new FieldDropdownLBA('vargame'), 'arg_0');
});

export const lba_end_life = behaviourAction((field) => {
    field('stop activity');
});

export const lba_suicide = behaviourAction((field) => {
    field('suicide');
});

export const lba_kill_obj = behaviourAction((field) => {
    field('kill');
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'arg_0');
});

export const lba_return = behaviourAction((field) => {
    field('return');
});

export const lba_change_scene = behaviourAction((field) => {
    field('change scene to');
    field(new FieldDropdownLBA('scene'), 'arg_0');
});

export const lba_the_end = behaviourAction((field) => {
    field('trigger end of game');
});

export const lba_game_over = behaviourAction((field) => {
    field('trigger game over');
});
