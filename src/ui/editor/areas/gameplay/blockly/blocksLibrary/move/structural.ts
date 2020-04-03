import Blockly from 'blockly';

export const lba_move_start = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(new Blockly.FieldImage(
                'editor/icons/start_flag.svg',
                16,
                16,
                'start'
            ));
        this.setColour(198);
    }
};

export const lba_move_track_start = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(new Blockly.FieldImage(
                'editor/icons/track.svg',
                8,
                16,
                'start'
            ))
            .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'num_track');
        this.setColour(198);
    }
};

export const lba_move_track = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(new Blockly.FieldImage(
                'editor/icons/track.svg',
                8,
                16,
                'start'
            ))
            .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'num_track');
        this.setOutput(true, 'MOVE');
        this.setColour(198);
    }
};

export const lba_move_stop = {
    init() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage(
                'editor/icons/stop.svg',
                16,
                16,
                'stop'
            ));
        this.setOutput(true, 'MOVE');
        this.setColour(198);
    }
};
