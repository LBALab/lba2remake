import Blockly from 'blockly';
import {
    generateActors,
    generateZones,
    generateAnims,
    generateBodies,
    generateVar,
    generateItems
} from './optionsGenerators';

export const makeIcon = file => new Blockly.FieldImage(`editor/icons/${file}`, 15, 15);

export class FieldUint8 extends Blockly.FieldNumber {
    constructor() {
        super(0, 0, 255, 0, Math.round);
    }
}

export const typeIcons = {
    actor: 'actor.svg',
    body: 'body.svg',
    anim: 'anim.svg',
    zone: 'zone_scn.svg',
    track: 'track.svg'
};

export const typeGenerator = {
    actor: generateActors,
    zone: generateZones,
    anim: generateAnims,
    body: generateBodies,
    vargame: generateVar.vargame,
    varscene: generateVar.varscene,
    item: generateItems
};

export function setterBlock({scriptType, type, objMode = false}) {
    return {
        init() {
            const icon = typeIcons[type];
            const generator = typeGenerator[type];
            const input = this.appendDummyInput();
            if (objMode) {
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
            input.appendField(new Blockly.FieldDropdown(generator.bind(this)), 'arg_0');
            this.setPreviousStatement(true, scriptType);
            this.setNextStatement(true, scriptType);
            if (scriptType === 'LIFE') {
                this.setColour('#666666');
            } else {
                this.setColour('#555555');
            }
        }
    };
}
