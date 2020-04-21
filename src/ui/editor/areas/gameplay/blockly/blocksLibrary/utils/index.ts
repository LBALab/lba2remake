import Blockly from 'blockly';
import {
    generateActors,
    generateZones,
    generateAnims,
    generateBodies,
    generateVarGame,
    generateVarScene,
    generateItems,
    generateTracks,
    generateBehaviours,
    generateTexts,
    generateScenes,
    generateDirModes,
    generateHeroBehaviours
} from './optionsGenerators';

export const makeIcon = file => new Blockly.FieldImage(`editor/icons/${file}`, 15, 15);

export class FieldUint8 extends Blockly.FieldNumber {
    constructor() {
        super(0, 0, 255, 0, Math.round);
    }
}

export class FieldUint16 extends Blockly.FieldNumber {
    constructor() {
        super(0, 0, 65535, 0, Math.round);
    }
}

export class FieldInt16 extends Blockly.FieldNumber {
    constructor() {
        super(0, -32768, 32767, 0, Math.round);
    }
}

export const typeIcons = {
    actor: 'actor.svg',
    body: 'body.svg',
    anim: 'anim.svg',
    zone: 'zone_scn.svg',
    track: 'track.svg'
};

export class FieldActor extends Blockly.FieldDropdown {
    argsToUpdate: string[];

    constructor(argsToUpdate: string[] = []) {
        super(generateActors);
        this.argsToUpdate = argsToUpdate;
    }

    setValue(value) {
        this.getOptions();
        super.setValue(value);
        const block = this.getSourceBlock();
        if (block) {
            for (let i = 0; i < this.argsToUpdate.length; i += 1) {
                const arg = this.argsToUpdate[i];
                const field = block.getField(arg);
                if (field && field instanceof Blockly.FieldDropdown) {
                    field.getOptions();
                }
            }
        }
    }
}

const typeGenerator = {
    actor: generateActors,
    zone: generateZones,
    anim: generateAnims,
    body: generateBodies,
    vargame: generateVarGame,
    varscene: generateVarScene,
    item: generateItems,
    track: generateTracks,
    behaviour: generateBehaviours,
    text: generateTexts,
    scene: generateScenes,
    dirmode: generateDirModes,
    hero_behaviour: generateHeroBehaviours
};

export class FieldDropdownLBA extends Blockly.FieldDropdown {
    static supports(type) {
        return type in typeGenerator;
    }

    constructor(type) {
        if (!FieldDropdownLBA.supports(type)) {
            throw new Error(`Unsupported type: ${type}`);
        }
        super(typeGenerator[type]);
    }

    setValue(value) {
        this.getOptions();
        super.setValue(value);
    }
}

export function setterBlock({scriptType, type, objMode = false}) {
    return {
        init() {
            const icon = typeIcons[type];
            const input = this.appendDummyInput();
            if (objMode) {
                input.appendField('set');
                input.appendField(makeIcon('actor.svg'));
                input.appendField(new FieldActor(['arg_0']), 'actor');
                input.appendField(`'s ${type} to`);
            } else {
                input.appendField(`set ${type} to`);
            }
            if (icon) {
                input.appendField(makeIcon(icon));
            }
            input.appendField(new FieldDropdownLBA(type), 'arg_0');
            this.setPreviousStatement(true, scriptType);
            this.setNextStatement(true, scriptType);
            if (scriptType === 'LIFE') {
                this.setColour('#444444');
            } else {
                this.setColour('#393939');
            }
        }
    };
}
