import { makeIcon, FieldUint8, setterBlock } from '../utils';

function genericMoveCmd(setupInput) {
    return {
        init() {
            const input = this.appendDummyInput();
            setupInput((field, name) => input.appendField(field, name));
            this.setPreviousStatement(true, 'MOVE');
            this.setNextStatement(true, 'MOVE');
            this.setColour('#555555');
        }
    };
}

export const lba_unknown_move_cmd = genericMoveCmd((field) => {
    field('?unknown?', 'label');
});

export const lba_wait_sec = genericMoveCmd((field) => {
    field(makeIcon('watch.svg'));
    field('wait');
    field(new FieldUint8(), 'arg_0');
    field('sec');
});

export const lba_wait_dsec = genericMoveCmd((field) => {
    field(makeIcon('watch.svg'));
    field('wait');
    field(new FieldUint8(), 'arg_0');
    field('dsec');
});

export const lba_wait_sec_rnd = genericMoveCmd((field) => {
    field(makeIcon('watch.svg'));
    field('wait 0 to');
    field(new FieldUint8(), 'arg_0');
    field('sec at random');
});

export const lba_wait_dsec_rnd = genericMoveCmd((field) => {
    field(makeIcon('watch.svg'));
    field('wait 0 to');
    field(new FieldUint8(), 'arg_0');
    field('dsec at random');
});

export const lba_wait_anim = genericMoveCmd((field) => {
    field(makeIcon('wait_anim.svg'));
    field('wait end of anim');
});

export const lba_goto_point = genericMoveCmd((field) => {
    field('goto point');
    field(makeIcon('point.svg'));
    field(new FieldUint8(), 'arg_0');
});

export const lba_move_set_anim = setterBlock({scriptType: 'MOVE', type: 'anim'});
export const lba_move_set_body = setterBlock({scriptType: 'MOVE', type: 'body'});

export const lba_move_no_body = genericMoveCmd((field) => {
    field('remove body');
    field(makeIcon('body.svg'));
});
