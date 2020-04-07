import { makeIcon, FieldUint8 } from '../utils';

export const lba_wait_sec = {
    init() {
        this.appendDummyInput()
            .appendField('wait')
            .appendField(new FieldUint8(), 'arg_0')
            .appendField('s')
            .appendField(makeIcon('watch.svg'));
        this.setPreviousStatement(true, 'MOVE');
        this.setNextStatement(true, 'MOVE');
        this.setColour(43);
    }
};

export const lba_wait_anim = {
    init() {
        this.appendDummyInput()
            .appendField('wait anim')
            .appendField(makeIcon('wait_anim.svg'));
        this.setPreviousStatement(true, 'MOVE');
        this.setNextStatement(true, 'MOVE');
        this.setColour(43);
    }
};

export const lba_goto_point = {
    init() {
        this.appendDummyInput()
            .appendField('goto point')
            .appendField(makeIcon('point.svg'))
            .appendField(new FieldUint8(), 'arg_0');
        this.setPreviousStatement(true, 'MOVE');
        this.setNextStatement(true, 'MOVE');
        this.setColour(43);
    }
};
