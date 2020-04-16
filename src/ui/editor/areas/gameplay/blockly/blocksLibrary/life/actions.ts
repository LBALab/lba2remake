import Blockly from 'blockly';
import { makeIcon, setterBlock, FieldActor, FieldDropdownLBA } from '../utils';

export const lba_set_varscene = varSetterBlock('varscene');
export const lba_set_vargame = varSetterBlock('vargame');
export const lba_set_anim = setterBlock({scriptType: 'LIFE', type: 'anim'});
export const lba_set_anim_obj = setterBlock({scriptType: 'LIFE', type: 'anim', objMode: true});
export const lba_set_body = setterBlock({scriptType: 'LIFE', type: 'body'});
export const lba_set_body_obj = setterBlock({scriptType: 'LIFE', type: 'body', objMode: true});

function action(setupInput) {
    return {
        init() {
            const input = this.appendDummyInput();
            this.setColour('#666666');
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            setupInput(this, (field, name) => input.appendField(field, name));
        }
    };
}

export const lba_no_body = action((_block, field) => {
    field('remove body');
    field(makeIcon('body.svg'));
});

export const lba_unknown_life_cmd = action((block, field) => {
    field('?unknown?', 'label');
    block.setColour('#333333');
});

export const lba_unknown_life_cmd_obj = action((block, field) => {
    field(makeIcon('actor.svg'));
    field(new FieldActor(), 'actor');
    field('?unknown?', 'label');
    block.setColour('#333333');
});

function varSetterBlock(type) {
    return {
        init() {
            this.appendDummyInput()
                .appendField(makeIcon('var.svg'))
                .appendField('set')
                .appendField(`[${type.substring(3)}]`)
                .appendField(new FieldDropdownLBA(type), 'arg_0')
                .appendField('to')
                .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'arg_1');
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour('#666666');
        }
    };
}
