import Blockly from 'blockly';

export const lba_move_set_anim = moveAction('anim', 'editor/icons/anim.svg');

export const lba_move_wait_sec = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(new Blockly.FieldImage(
                'editor/icons/watch.svg',
                16,
                16,
                'wait'
            ))
            .appendField(new Blockly.FieldNumber(
                0,
                0,
                255,
                0,
                num => Number(num.toFixed(1)
            ), 'num_sec'))
            .appendField('s');
        this.setOutput(true, 'MOVE');
        this.setColour(43);
    }
};

export const lba_move_wait_anim = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(new Blockly.FieldImage(
                'editor/icons/wait_anim.svg',
                16,
                16,
                'wait_anim'
            ));
        this.setOutput(true, 'MOVE');
        this.setColour(43);
    }
};

export const lba_move_goto_point = {
    init() {
        this.appendValueInput('next')
            .setCheck('MOVE')
            .appendField(new Blockly.FieldImage(
                'editor/icons/point.svg',
                16,
                16,
                'goto'
            ))
            .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'point');
        this.setOutput(true, 'MOVE');
        this.setColour(43);
    }
};

function moveAction(name, icon) {
    return {
        init() {
            this.appendValueInput('next')
                .setCheck('MOVE')
                .appendField(new Blockly.FieldImage(icon, 16, 16, name))
                .appendField(new Blockly.FieldDropdown([
                    [name.toUpperCase(), name.toUpperCase()]
                ]), name);
            this.setOutput(true, 'MOVE');
            this.setColour(43);
        }
    };
}
