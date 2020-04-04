import Blockly from 'blockly';
import { generateVar, generateAnims, generateActors } from '../optionsGenerators';
import { makeIcon } from '../utils';

export const lba_set_varscene = varSetter('varscene');
export const lba_set_vargame = varSetter('vargame');
export const lba_set_anim = setter('anim', 'anim.svg', generateAnims);
export const lba_set_anim_obj = setter('anim', 'anim.svg', generateAnims, true);

function setter(type, icon, generator, otherActor = false) {
    return {
        init() {
            const input = this.appendDummyInput();
            if (otherActor) {
                input.appendField('set');
                input.appendField(makeIcon('actor.svg'));
                input.appendField(new Blockly.FieldDropdown(generateActors.bind(this)), 'actor');
                input.appendField(`'s ${type} to`);
            } else {
                input.appendField(`set ${type} to`);
            }
            if (icon) {
                input.appendField(makeIcon(icon));
            }
            input.appendField(new Blockly.FieldDropdown(generator.bind(this)), type);
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour(43);
        }
    };
}

function varSetter(type) {
    return {
        init() {
            this.appendDummyInput()
                .appendField('set')
                .appendField(makeIcon('var.svg'))
                .appendField(`${type.substring(3)}:`)
                .appendField(new Blockly.FieldDropdown(generateVar[type].bind(this)), type)
                .appendField('to')
                .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'value');
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour(100);
        }
    };
}
