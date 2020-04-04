import { map } from 'lodash';
import DebugData, { getVarName, getObjectName } from '../../../../DebugData';

export function generateBehaviours() {
    const actor = this.actor || this.workspace.actor;
    if (!actor) {
        return [['<behaviour>', '<behaviour>']];
    }
    const behaviours = map(actor.scripts.life.comportementMap).sort();
    if (behaviours.length === 0) {
        return [['<behaviour>', '<behaviour>']];
    }
    return behaviours.map(b => [
        b === 0
            ? '<start>'
            : (b === 1 ? 'NORMAL' : `BEHAVIOUR ${b as number + 1}`),
        `${b}`
    ]);
}

export function generateActors() {
    return generateObjects.call(this, 'actor');
}

export function generateZones() {
    return generateObjects.call(this, 'zone');
}

export function generateObjects(type) {
    const scene = this.workspace.scene;
    if (!scene) {
        const value = `<${type}>`;
        return [[value, value]];
    }
    return map(
        scene[`${type}s`],
        (obj) => {
            const name = getObjectName(type, scene.index, obj.index);
            return [name, `${obj.index}`];
        }
    );
}

export function generateAnims() {
    const actor = this.workspace.actor;
    if (!actor || !actor.model || !actor.model.entity) {
        return [['<anim>', '<anim>']];
    }
    return map(
        actor.model.entity.anims,
        (anim) => {
            const name = DebugData.metadata.anims[anim.index] || `anim_${anim.index}`;
            return [name, `${anim.index}`];
        }
    );
}

export const generateVar = {
    vargame: function generateVarGame() {
        const {game} = DebugData.scope;
        const scene = this.workspace.scene;
        if (!game || !scene) {
            return [['<vargame>', '<vargame>']];
        }
        return map(
            game.getState().flags.quest,
            (_value, idx) => {
                const name = getVarName({
                    type: 'vargame',
                    idx
                });
                return [name, `${idx}`];
            }
        );
    },
    varscene: function generateVarScene() {
        const scene = this.workspace.scene;
        if (!scene) {
            return [['<varscene>', '<varscene>']];
        }
        return map(
            scene.variables,
            (_value, idx) => {
                const name = getVarName({
                    type: 'varcube',
                    idx
                });
                return [name, `${idx}`];
            }
        );
    }
};
