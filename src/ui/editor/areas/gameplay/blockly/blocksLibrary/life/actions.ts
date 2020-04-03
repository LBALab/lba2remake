import Blockly from 'blockly';
import { typeIcons } from './utils';

export const lba_set_varscene = varSetter('varscene');
export const lba_set_vargame = varSetter('vargame');
export const lba_set_anim = setter('anim', 'animation');
export const lba_set_anim_obj = setter('anim', 'animation', true);

function setter(type, name = type, otherActor = false) {
    return {
        init() {
            const input = this.appendDummyInput();
            if (otherActor) {
                input.appendField('set');
                input.appendField(new Blockly.FieldImage(typeIcons.actor, 15, 15, 'actor'));
                input.appendField(new Blockly.FieldDropdown([
                    ['ACTOR', 'ACTOR']
                ]), 'actor');
                input.appendField(`'s ${name} to`);
            } else {
                input.appendField(`set ${name} to`);
            }
            if (type in typeIcons) {
                input.appendField(new Blockly.FieldImage(typeIcons[type], 15, 15, type));
            }
            input.appendField(new Blockly.FieldDropdown([
                [type.toUpperCase(), type.toUpperCase()]
            ]), type);
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
                .appendField(new Blockly.FieldImage(typeIcons[type], 15, 15, type))
                .appendField(new Blockly.FieldDropdown([
                    [type.toUpperCase(), type.toUpperCase()]
                ]), type)
                .appendField('to')
                .appendField(new Blockly.FieldNumber(0, 0, 255, 0, Math.round), 'value');
            this.setPreviousStatement(true, 'LIFE');
            this.setNextStatement(true, 'LIFE');
            this.setColour(43);
        }
    };
}
