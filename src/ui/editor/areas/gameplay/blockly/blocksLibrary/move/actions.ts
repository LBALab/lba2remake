import Blockly from 'blockly';
import { makeIcon, FieldUint8 } from '../utils';
import { generateAnims } from '../optionsGenerators';

export const lba_move_set_anim = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(makeIcon('anim.svg'))
            .appendField(new Blockly.FieldDropdown(generateAnims.bind(this)), 'arg_0');
        this.setOutput(true, 'MOVE');
        this.setColour(43);
    }
};

export const lba_move_wait_sec = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(makeIcon('watch.svg'))
            .appendField(new FieldUint8(), 'arg_0')
            .appendField('s');
        this.setOutput(true, 'MOVE');
        this.setColour(43);
    }
};

export const lba_move_wait_anim = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(makeIcon('wait_anim.svg'));
        this.setOutput(true, 'MOVE');
        this.setColour(43);
    }
};

export const lba_move_goto_point = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(makeIcon('point.svg'))
            .appendField(new FieldUint8(), 'arg_0');
        this.setOutput(true, 'MOVE');
        this.setColour(43);
    }
};
