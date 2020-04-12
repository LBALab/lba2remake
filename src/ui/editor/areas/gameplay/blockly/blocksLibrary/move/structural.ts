import { makeIcon, FieldUint8 } from '../utils';

export const lba_track = {
    init() {
        this.appendDummyInput()
            .appendField('track')
            .appendField(makeIcon('track.svg'))
            .appendField(new FieldUint8(), 'arg_0');
        this.setPreviousStatement(true, 'MOVE');
        this.setNextStatement(true, 'MOVE');
        this.setColour(100);
    }
};
