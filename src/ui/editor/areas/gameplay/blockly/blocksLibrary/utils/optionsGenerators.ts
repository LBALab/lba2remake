import { map, filter } from 'lodash';
import DebugData, { getVarName, getObjectName } from '../../../../../DebugData';

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
    const scene = this.workspace.scene;
    if (!scene) {
        const value = '<actor>';
        return [[value, value]];
    }
    return map(
        scene.actors,
        (actor) => {
            const name = getObjectName('actor', scene.index, actor.index);
            return [name, `${actor.index}`];
        }
    );
}

export function generateZones() {
    const scene = this.workspace.scene;
    if (!scene) {
        const value = '<zone>';
        return [[value, value]];
    }
    const zones = filter(scene.zones, zone => zone.props.type === 2) as any;
    return map(
        zones,
        (zone) => {
            const name = getObjectName('zone', scene.index, zone.index);
            return [name, `${zone.index}`];
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

export function generateBodies() {
    const actor = this.workspace.actor;
    if (!actor || !actor.model || !actor.model.entity) {
        return [['<body>', '<body>']];
    }
    return map(
        actor.model.entity.bodies,
        (body) => {
            const name = DebugData.metadata.bodies[body.index] || `body_${body.index}`;
            return [name, `${body.index}`];
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
