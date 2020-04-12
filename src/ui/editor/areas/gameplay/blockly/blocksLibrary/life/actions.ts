import Blockly from 'blockly';
import { generateVar, generateActors } from '../utils/optionsGenerators';
import { makeIcon, setterBlock } from '../utils';

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
            setupInput(this, (field, name) => input.appendField(field, name));
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour('#666666');
        }
    };
}

export const lba_no_body = action((_block, field) => {
    field('remove body');
    field(makeIcon('body.svg'));
});

export const lba_unknown_life_cmd = action((_block, field) => {
    field('?unknown?', 'label');
});

export const lba_unknown_life_cmd_obj = action((block, field) => {
    field(makeIcon('actor.svg'));
    field(new Blockly.FieldDropdown(generateActors.bind(block)), 'actor');
    field('?unknown?', 'label');
});

function varSetterBlock(type) {
    return {
        init() {
            this.appendDummyInput()
                .appendField(makeIcon('var.svg'))
                .appendField('set')
                .appendField(`[${type.substring(3)}]`)
                .appendField(new Blockly.FieldDropdown(generateVar[type].bind(this)), 'arg_0')
                .appendField('to')
                .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'arg_1');
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour('#666666');
        }
    };
}
