import Blockly from 'blockly';

export const lba_move_start = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(new Blockly.FieldImage(
                'editor/icons/start_flag.svg',
                20,
                20,
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
                10,
                20,
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
                10,
                20,
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
                20,
                20,
                'stop'
            ));
        this.setOutput(true, 'MOVE');
        this.setColour(198);
    }
};
