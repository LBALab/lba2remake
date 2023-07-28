import { map, filter, take, drop, each, sortBy } from 'lodash';
import DebugData, { getVarName, getObjectName, getVarInfo } from '../../../../../../DebugData';
import LocationsNode from '../../../../locator/LocationsNode';
import { ActorDirMode } from '../../../../../../../../game/Actor';
import { GetInventorySize } from '../../../../../../../../game/data/inventory';
import Zone, {
    CameraZone,
    ConveyorZone,
    FragmentZone,
    LadderZone,
    RailZone,
    ScenericZone,
    SpikeZone,
    TeleportZone,
} from '../../../../../../../../game/Zone';

function getActor(field) {
    const block = field.getSourceBlock();
    if (!block) {
        return null;
    }

    const actorField = block.getField('actor');
    const actorIdx = actorField
        ? Number(actorField.getValue())
        : block.data && block.data.actor ? block.data.actor : null;

    if (actorIdx !== null) {
        if (actorIdx !== -1) {
            return block.workspace.scene.actors[actorIdx];
        }
    }
    return block.workspace.actor;
}

export function generateBehaviours() {
    const block = this.getSourceBlock();
    if (!block) {
        return [['<behaviour>', '-1']];
    }
    const actorField = block.getField('actor');
    if (actorField) {
        const actorIdx = Number(actorField.getValue());
        if (actorIdx === -1) {
            return [['<behaviour>', '-1']];
        }
        const actor = block.workspace.scene.actors[actorIdx];
        const behaviours = map(actor.scripts.life.comportementMap);
        if (behaviours.length === 0) {
            return [['<behaviour>', '-1']];
        }
        return behaviours.map((idx) => {
            if (idx === 0) {
                return ['<start>', '0'];
            }
            return [`BEHAVIOUR ${idx}`, `${idx}`];
        });
    }
    const list = [];
    const behaviourInitBlocks = block.workspace.getBlocksByType('lba_behaviour_init');
    if (behaviourInitBlocks.length > 0) {
        list.push(['<start>', '0']);
    }
    const behaviourBlocks = block.workspace.getBlocksByType('lba_behaviour');
    each(
        sortBy(behaviourBlocks, ['data']),
        b => list.push([`${b.getFieldValue('arg_0')}`, `${b.data}`])
    );
    if (list.length === 0) {
        return [['<behaviour>', '-1']];
    }
    return list;
}

export function generateTracks() {
    const block = this.getSourceBlock();
    if (!block) {
        return [['<track>', '-1']];
    }

    const actorField = block.getField('actor');
    const actorIdx = actorField
        ? Number(actorField.getValue())
        : block.data && block.data.actor ? block.data.actor : null;

    if (actorIdx !== null) {
        if (actorIdx === -1) {
            return [['<track>', '-1']];
        }
        const actor = block.workspace.scene.actors[actorIdx];
        const tracks = map(actor.scripts.move.tracksMap);
        if (tracks.length === 0) {
            return [['<track>', '-1']];
        }
        return tracks.map(t => [`${t}`, `${t}`]);
    }
    const trackBlocks = block.workspace.getBlocksByType('lba_move_track');
    if (trackBlocks.length === 0) {
        return [['<track>', '-1']];
    }
    return map(
        sortBy(trackBlocks, ['index']),
        (t) => {
            const value = `${t.getFieldValue('arg_0')}`;
            return [value, value];
        }
    );
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

function generateZones(block, zonetype) {
    const scene = block && block.workspace.scene;
    if (!scene) {
        return [['<zone>', '-1']];
    }
    const zones = filter(scene.zones, zone => zone instanceof zonetype) as any;
    return map(
        zones,
        (zone: Zone) => {
            const name = getObjectName('zone', scene.index, zone.props.index);
            if (zone instanceof TeleportZone
                || zone instanceof CameraZone
                || zone instanceof ScenericZone
                || zone instanceof FragmentZone
                || zone instanceof LadderZone
                || zone instanceof ConveyorZone
                || zone instanceof SpikeZone
                || zone instanceof RailZone) {
                return [name, `${zone.id}`];
            }

            // Shouldn't happen.
            return [];
        }
    );
}

export function generateTeleportZones() {
    return generateZones(this.getSourceBlock(), TeleportZone);
}

export function generateCameraZones() {
    return generateZones(this.getSourceBlock(), CameraZone);
}

export function generateScenericZones() {
    return generateZones(this.getSourceBlock(), ScenericZone);
}

export function generateFragmentZones() {
    return generateZones(this.getSourceBlock(), FragmentZone);
}

export function generateLadderZones() {
    return generateZones(this.getSourceBlock(), LadderZone);
}

export function generateConveyorZones() {
    return generateZones(this.getSourceBlock(), ConveyorZone);
}

export function generateSpikeZones() {
    return generateZones(this.getSourceBlock(), SpikeZone);
}

export function generateRailZones() {
    return generateZones(this.getSourceBlock(), RailZone);
}

export function generatePoints() {
    const block = this.getSourceBlock();
    const scene = block && block.workspace.scene;
    if (!scene) {
        return [['<point>', '-1']];
    }
    return map(
        scene.points,
        (point) => {
            return [`${point.props.index}`, `${point.props.index}`];
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

function generateVarGame(inventory) {
    const {game} = DebugData.scope;
    if (!game) {
        return [['<vargame>', '-1']];
    }
    const inventorySize = GetInventorySize();
    const vars = inventory
        ? take(game.getState().flags.quest, inventorySize)
        : drop(game.getState().flags.quest, inventorySize);
    const offset = inventory ? 0 : inventorySize;
    return map(
        vars,
        (_value, idx) => {
            const name = getVarName({
                type: 'vargame',
                idx: idx + offset
            });
            return [name, `${idx + offset}`];
        }
    );
}

function generateVarScene(workspace) {
    const scene = workspace.scene;
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

export function generateVars() {
    const block = this.getSourceBlock();
    if (!block || !block.workspace) {
        return [['<var>', '-1']];
    }
    const scope = block.getFieldValue('scope');
    switch (scope) {
        case 'inventory': return generateVarGame(true);
        case 'game': return generateVarGame(false);
        case 'scene': return generateVarScene(block.workspace);
    }
    return [['<var>', '-1']];
}

export function generateVarValues() {
    const block = this.getSourceBlock();
    if (block && block.workspace) {
        let scope = block.getFieldValue('scope');
        let which = block.getFieldValue('param');

        if (block.data && block.data.scope) {
            scope = block.data.scope;
            which = block.data.param;
        }

        switch (scope)
        {
            case 'inventory':
            case 'game':
                scope = 'vargame';
                break;

            case 'scene':
                scope = 'varcube';
                break;
        }

        const info = getVarInfo({type: scope, idx: which});
        if (info) {
            if (info.type === 'boolean') {
                return [['FALSE', '0'], ['TRUE', '1']];
            }

            if (info.type === 'enum') {
                return map(info.enumValues, (v, k) => [v, k]);
            }
        }
    }

    return map([...Array(255).keys()], v => [`${v}`, `${v}`]);
}

export function generateItems() {
    return generateVarGame(true);
}

export function generateTexts() {
    const block = this.getSourceBlock();
    const scene = block && block.workspace.scene;
    if (!scene) {
        return [['<text>', '-1']];
    }
    return map(
        scene.props.texts,
        ({value}, idx) => {
            const text = value.replace(/@/g, '\\n');
            const ellipsis = text.length > 25 ? '(...)' : '';
            return [`${text.substring(0, 25)}${ellipsis}`, `${idx}`];
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

const dirModes = map(
    ActorDirMode,
    (idx, name) => ([name, `${idx}`])
);

export function generateDirModes() {
    return dirModes;
}

export function generateHeroBehaviours() {
    return [
        ['NORMAL', '0'],
        ['ATHLETIC', '1'],
        ['AGGRESSIVE', '2'],
        ['DISCREET', '3'],
        ['PROTOPACK', '4'],
        ['WITH_ZOE', '5'],
        ['HORN', '6'],
        ['SPACESUIT_INDOORS_NORMAL', '7'],
        ['JETPACK', '8'],
        ['SPACESUIT_INDOORS_ATHLETIC', '9'],
        ['SPACESUIT_OUTDOORS_NORMAL', '10'],
        ['SPACESUIT_OUTDOORS_ATHLETIC', '11'],
        ['CAR', '12'],
        ['ELECTROCUTED', '13']
    ];
}

export function generateFallTypes() {
    return [
        ['NO FALLING', '0'],
        ['CAN FALL', '1'],
        ['NO FALLING; STOP CURRENT FALL', '2'],
    ];
}

export function generateCollisionTypes() {
    return [
        ['MOVE THROUGH TERRAIN', '0'],
        ['BLOCKED BY TERRAIN', '1'],
        ['BLOCKED BY TERRAIN; CRAWLING', '2'],
    ];
}

export function generateBuggyInitTypes() {
    return [
        ['NO INIT', '0'],
        ['INIT IF NEEDED', '1'],
        ['INIT ALWAYS', '2'],
    ];
}

export function generatePcxEffectTypes() {
    return [
        ['NO EFFECT', '0'],
        ['BLINDS', '1'],
    ];
}

export function generateEnabledTypes() {
    return [
        ['DISABLED', '0'],
        ['ENABLED', '1'],
    ];
}
