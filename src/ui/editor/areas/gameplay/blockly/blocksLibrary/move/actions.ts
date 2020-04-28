import Blockly from 'blockly';
import {
    makeIcon,
    setterBlock,
    debuggerContextMenu,
    FieldUint8,
    FieldInt16,
    FieldUint16,
    FieldDropdownLBA
} from '../utils';

function genericMoveCmd(setupInput) {
    return {
        init() {
            const input = this.appendDummyInput();
            this.setPreviousStatement(true, 'MOVE');
            this.setNextStatement(true, 'MOVE');
            this.setColour('#393939');
            setupInput(this, (field, name) => input.appendField(field, name));
            this.scriptType = 'move';
        },
        customContextMenu(options) {
            debuggerContextMenu(this, options);
        }
    };
}

export const lba_move_wait_sec = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait');
    field(new FieldUint8(), 'arg_0');
    field('sec');
});

export const lba_move_wait_dsec = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait');
    field(new FieldUint8(), 'arg_0');
    field('dsec');
});

export const lba_move_wait_sec_rnd = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait 0 to');
    field(new FieldUint8(), 'arg_0');
    field('sec at random');
});

export const lba_move_wait_dsec_rnd = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait 0 to');
    field(new FieldUint8(), 'arg_0');
    field('dsec at random');
});

export const lba_move_wait_anim = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait end of anim');
});

export const lba_move_wait_door = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait door');
});

export const lba_move_goto_point = genericMoveCmd((_block, field) => {
    field('goto point');
    field(makeIcon('point.svg'));
    field(new FieldDropdownLBA('point'), 'arg_0');
});

export const lba_move_goto_point_3d = genericMoveCmd((_block, field) => {
    field('goto point (3D)');
    field(makeIcon('point.svg'));
    field(new FieldDropdownLBA('point'), 'arg_0');
});

export const lba_move_goto_sym_point = genericMoveCmd((_block, field) => {
    field('goto sym point');
    field(makeIcon('point.svg'));
    field(new FieldDropdownLBA('point'), 'arg_0');
});

export const lba_move_set_anim = setterBlock({scriptType: 'MOVE', type: 'anim'});
export const lba_move_set_body = setterBlock({scriptType: 'MOVE', type: 'body'});

export const lba_move_no_body = genericMoveCmd((_block, field) => {
    field('remove body');
    field(makeIcon('body.svg'));
});

export const lba_move_set_angle = genericMoveCmd((_block, field) => {
    field('set angle');
    field(new Blockly.FieldAngle(), 'arg_0');
});

export const lba_move_set_angle_rnd = genericMoveCmd((_block, field) => {
    field('set random angle');
    field(new Blockly.FieldAngle(), 'arg_0');
    field(new Blockly.FieldAngle(), 'arg_1');
});

export const lba_move_set_orientation = genericMoveCmd((_block, field) => {
    field('set orientation');
    field(new Blockly.FieldAngle(), 'arg_0');
});

export const lba_move_replace = genericMoveCmd((_block, field) => {
    field('replace');
});

export const lba_move_sample = genericMoveCmd((_block, field) => {
    field('sample');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_move_open_left = genericMoveCmd((_block, field) => {
    field('open_left');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_move_open_right = genericMoveCmd((_block, field) => {
    field('open_right');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_move_open_up = genericMoveCmd((_block, field) => {
    field('open_up');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_move_open_down = genericMoveCmd((_block, field) => {
    field('open_down');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_move_close = genericMoveCmd((_block, field) => {
    field('close');
});

export const lba_move_background = genericMoveCmd((_block, field) => {
    field('background');
    field(new FieldUint8(), 'arg_0');
});

export const lba_move_set_sprite = genericMoveCmd((_block, field) => {
    field('set sprite');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_move_face_hero = genericMoveCmd((_block, field) => {
    field('face hero');
    field(new Blockly.FieldNumber(), 'arg_0');
});

export const lba_move_wait_num_anim = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait num anim');
    field(new FieldUint8(), 'arg_0');
    field(new FieldUint8(), 'arg_1');
});

export const lba_move_sample_always = genericMoveCmd((_block, field) => {
    field('set sample always');
    field(new FieldInt16(), 'arg_0');
});

export const lba_move_speed = genericMoveCmd((_block, field) => {
    field('set speed');
    field(new FieldUint16(), 'arg_0');
});

export const lba_move_sample_stop = genericMoveCmd((_block, field) => {
    field('sample stop');
    field(new FieldInt16(), 'arg_0');
});

export const lba_move_volume = genericMoveCmd((_block, field) => {
    field('volume');
    field(new FieldUint8(), 'arg_0');
});

export const lba_move_frequency = genericMoveCmd((_block, field) => {
    field('frequency');
    field(new FieldUint16(), 'arg_0');
});

export const lba_move_interval = genericMoveCmd((_block, field) => {
    field('interval');
    field(new FieldUint16(), 'arg_0');
});

export const lba_move_repeat_sample = genericMoveCmd((_block, field) => {
    field('repeat sample');
    field(new FieldInt16(), 'arg_0');
});

export const lba_move_simple_sample = genericMoveCmd((_block, field) => {
    field('simple sample');
    field(new FieldInt16(), 'arg_0');
});

export const lba_move_pos_point = genericMoveCmd((_block, field) => {
    field('set position to');
    field(makeIcon('point.svg'));
    field(new FieldDropdownLBA('point'), 'arg_0');
});

export const lba_move_wait_anim_3ds = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait anim (3DS)');
});

export const lba_move_wait_frame_3ds = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait frame (3DS)');
});

export const lba_move_start_anim_3ds = genericMoveCmd((_block, field) => {
    field('start anim (3DS)');
    field(new FieldUint8(), 'arg_0');
});

export const lba_move_stop_anim_3ds = genericMoveCmd((_block, field) => {
    field('stop anim (3DS)');
});

export const lba_move_set_start_3ds = genericMoveCmd((_block, field) => {
    field('set start (3DS)');
    field(new FieldUint8(), 'arg_0');
});

export const lba_move_set_end_3ds = genericMoveCmd((_block, field) => {
    field('set end (3DS)');
    field(new FieldUint8(), 'arg_0');
});

export const lba_move_set_frame = genericMoveCmd((_block, field) => {
    field('set frame');
    field(new FieldUint8(), 'arg_0');
});

export const lba_move_set_frame_3ds = genericMoveCmd((_block, field) => {
    field('set frame (3DS)');
    field(new FieldUint8(), 'arg_0');
});
