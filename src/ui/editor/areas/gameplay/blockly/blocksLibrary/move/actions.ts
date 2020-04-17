import { makeIcon, FieldUint8, setterBlock } from '../utils';

function genericMoveCmd(setupInput) {
    return {
        init() {
            const input = this.appendDummyInput();
            this.setPreviousStatement(true, 'MOVE');
            this.setNextStatement(true, 'MOVE');
            this.setColour('#393939');
            setupInput(this, (field, name) => input.appendField(field, name));
        }
    };
}

export const lba_unknown_move_cmd = genericMoveCmd((block, field) => {
    field('?unknown?', 'label');
    block.setColour('#111111');
});

export const lba_wait_sec = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait');
    field(new FieldUint8(), 'arg_0');
    field('sec');
});

export const lba_wait_dsec = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait');
    field(new FieldUint8(), 'arg_0');
    field('dsec');
});

export const lba_wait_sec_rnd = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait 0 to');
    field(new FieldUint8(), 'arg_0');
    field('sec at random');
});

export const lba_wait_dsec_rnd = genericMoveCmd((_block, field) => {
    field(makeIcon('watch.svg'));
    field('wait 0 to');
    field(new FieldUint8(), 'arg_0');
    field('dsec at random');
});

export const lba_wait_anim = genericMoveCmd((_block, field) => {
    field(makeIcon('wait_anim.svg'));
    field('wait end of anim');
});

export const lba_goto_point = genericMoveCmd((_block, field) => {
    field('goto point');
    field(makeIcon('point.svg'));
    field(new FieldUint8(), 'arg_0');
});

export const lba_move_set_anim = setterBlock({scriptType: 'MOVE', type: 'anim'});
export const lba_move_set_body = setterBlock({scriptType: 'MOVE', type: 'body'});

export const lba_move_no_body = genericMoveCmd((_block, field) => {
    field('remove body');
    field(makeIcon('body.svg'));
});
