import Blockly from 'blockly';
import {
    generateActors,
    generateZones,
    generatePoints,
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
import DebugData from '../../../../../DebugData';

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
    point: generatePoints,
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

const scopeColor = {
    game: '#291563',
    scene: '#15635d'
};

export class FieldScope extends Blockly.FieldLabel {
    scope: string;

    constructor(scope) {
        super(scope);
        this.scope = scope;
    }

    initView() {
        this.createBorderRect_();
        this.borderRect_.setAttribute(
            'style',
            `fill:${scopeColor[this.scope]};stroke:white;`
        );
        super.initView();
        this.textElement_.setAttribute('style', 'fill:white');
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
            this.scriptType = scriptType.toLowerCase();
        },
        customContextMenu(options) {
            debuggerContextMenu(this, options);
        }
    };
}

function toggleBreakpoint(block) {
    const actor = block.workspace.actor;
    const sceneActiveCommands = DebugData.script[block.scriptType];
    const sceneBreakpoints = DebugData.breakpoints[block.scriptType];
    if (!(actor.index in sceneBreakpoints)) {
        sceneBreakpoints[actor.index] = {};
    }
    if (sceneBreakpoints[actor.index][block.index]) {
        delete sceneBreakpoints[actor.index][block.index];
        if (actor.index in sceneActiveCommands && DebugData.scope.game.isPaused()) {
            DebugData.scope.game.pause();
        }
    } else {
        sceneBreakpoints[actor.index][block.index] = true;
    }
}

function isBreakpointEnabled(block) {
    const actor = block.workspace.actor;
    const sceneBreakpoints = DebugData.breakpoints[block.scriptType];
    return actor.index in sceneBreakpoints
        && block.index in sceneBreakpoints[actor.index];
}

export function debuggerContextMenu(block, options) {
    const actor = block.workspace.actor;
    if (!actor) {
        return;
    }

    options.unshift({
        text: isBreakpointEnabled(block)
            ? 'Remove breakpoint'
            : 'Add breakpoint',
        enabled: true,
        callback: () => {
            toggleBreakpoint(block);
        },
    });
}
