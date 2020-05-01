import { makeIcon, debuggerContextMenu, FieldUint8, FieldDropdownLBA } from '../utils';

export const lba_move_track = {
    init() {
        this.appendDummyInput()
            .appendField('track')
            .appendField(makeIcon('track.svg'))
            .appendField(new FieldUint8(), 'arg_0');
        this.setPreviousStatement(true, 'MOVE');
        this.setNextStatement(true, 'MOVE');
        this.setColour(100);
        this.scriptType = 'move';
    },
    customContextMenu(options) {
        debuggerContextMenu(this, options);
    }
};

export const lba_move_goto = {
    init() {
        this.appendDummyInput()
            .appendField('goto track')
            .appendField(makeIcon('track.svg'))
            .appendField(new FieldDropdownLBA('track'), 'arg_0');
        this.setPreviousStatement(true, 'MOVE');
        this.setNextStatement(true, 'MOVE');
        this.setColour(100);
        this.scriptType = 'move';
    },
    customContextMenu(options) {
        debuggerContextMenu(this, options);
    }
};
