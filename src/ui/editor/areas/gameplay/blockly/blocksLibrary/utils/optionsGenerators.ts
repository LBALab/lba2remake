import { map, filter, take } from 'lodash';
import DebugData, { getVarName, getObjectName } from '../../../../../DebugData';
import LocationsNode from '../../../locator/LocationsNode';

function getActor(field) {
    const block = field.getSourceBlock();
    if (!block) {
        return null;
    }
    const actorField = block.getField('actor');
    if (actorField) {
        const idx = Number(actorField.getValue());
        if (idx !== -1) {
            return block.workspace.scene.actors[idx];
        }
    }
    return block.workspace.actor;
}

export function generateBehaviours() {
    const actor = getActor(this);
    if (!actor) {
        return [['<behaviour>', '-1']];
    }
    const behaviours = map(actor.scripts.life.comportementMap).sort();
    if (behaviours.length === 0) {
        return [['<behaviour>', '-1']];
    }
    return behaviours.map(b => [
        b === 0
            ? '<start>'
            : (b === 1 ? 'NORMAL' : `BEHAVIOUR ${b as number + 1}`),
        `${b}`
    ]);
}

export function generateTracks() {
    const actor = getActor(this);
    if (!actor) {
        return [['<track>', '-1']];
    }
    const tracks = map(actor.scripts.move.tracksMap);
    if (tracks.length === 0) {
        return [['<track>', '-1']];
    }
    return tracks.map(t => [`${t}`, `${t}`]);
}

export function generateActors() {
    const block = this.getSourceBlock();
    const scene = block && block.workspace.scene;
    if (!scene) {
        return [['<actor>', '-1']];
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
    const block = this.getSourceBlock();
    const scene = block && block.workspace.scene;
    if (!scene) {
        return [['<zone>', '-1']];
    }
    const zones = filter(scene.zones, zone => zone.props.type === 2) as any;
    return map(
        zones,
        (zone) => {
            const name = getObjectName('zone', scene.index, zone.index);
            return [name, `${zone.props.snap}`];
        }
    );
}

export function generateAnims() {
    const actor = getActor(this);
    if (!actor || !actor.model || !actor.model.entity) {
        return [['<anim>', '-1']];
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
    const actor = getActor(this);
    if (!actor || !actor.model || !actor.model.entity) {
        return [['<body>', '-1']];
    }
    return map(
        actor.model.entity.bodies,
        (body) => {
            const name = DebugData.metadata.bodies[body.index] || `body_${body.index}`;
            return [name, `${body.index}`];
        }
    );
}

export function generateVarGame() {
    const {game} = DebugData.scope;
    const block = this.getSourceBlock();
    const scene = block && block.workspace.scene;
    if (!game || !scene) {
        return [['<vargame>', '-1']];
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
}

export function generateVarScene() {
    const block = this.getSourceBlock();
    const scene = block && block.workspace.scene;
    if (!scene) {
        return [['<varscene>', '-1']];
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

export function generateItems() {
    return take(generateVarGame.call(this), 40);
}

export function generateTexts() {
    const block = this.getSourceBlock();
    const scene = block && block.workspace.scene;
    if (!scene) {
        return [['<text>', '-1']];
    }
    return map(
        scene.data.texts,
        ({value}, idx) => {
            const text = value.replace(/@/g, '\\n');
            const ellipsis = text.length > 50 ? '_[...]' : '';
            return [`${text.substring(0, 50)}${ellipsis}`, `${idx}`];
        }
    );
}

const sceneList = [];

function fillSceneList(node = LocationsNode, path = []) {
    if (node.props && node.props[0]) {
        sceneList.push([`${path.join('/')}/${node.name}`, `${node.props[0].value}`]);
    }
    if (node.children) {
        for (let i = 0; i < node.children.length; i += 1) {
            if (node === LocationsNode) {
                fillSceneList(node.children[i], []);
            } else {
                fillSceneList(node.children[i], [...path, node.name]);
            }
        }
    }
    return null;
}

fillSceneList();

export function generateScenes() {
    const block = this.getSourceBlock();
    const scene = block && block.workspace.scene;
    if (!scene) {
        return [['<scene>', '-1']];
    }
    return sceneList;
}
