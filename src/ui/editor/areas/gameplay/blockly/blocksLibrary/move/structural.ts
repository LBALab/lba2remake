import { makeIcon, FieldUint8 } from '../utils';

export const lba_move_start = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(makeIcon('start_flag.svg'));
        this.setColour(198);
    }
};

export const lba_move_track_start = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(makeIcon('track.svg'))
            .appendField(new FieldUint8(), 'arg_0');
        this.setColour(198);
    }
};

export const lba_move_track = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(makeIcon('track.svg'))
            .appendField(new FieldUint8(), 'arg_0');
        this.setOutput(true, 'MOVE');
        this.setColour(198);
    }
};

export const lba_move_stop = {
    init() {
        this.appendDummyInput()
            .appendField(makeIcon('stop.svg'));
        this.setOutput(true, 'MOVE');
        this.setColour(198);
    }
};
