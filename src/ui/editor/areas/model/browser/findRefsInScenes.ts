import { map, each, filter, times, clone, concat, find } from 'lodash';

import DebugData, {
    loadSceneMetaData,
    getObjectName
} from '../../../DebugData';
import LocationsNode from '../../gameplay/locator/LocationsNode';
import {makeOutlinerArea} from '../../utils/outliner';
import {parseScript} from '../../../../../scripting/parser';
import { getScene } from '../../../../../resources';

export async function findRefsInScenes(type, value) {
    const sceneList = times(222);
    const results = await Promise.all(
        map(sceneList, async (idx) => {
            const [sceneData] = await Promise.all([
                getScene(idx),
                loadSceneMetaData(idx)
            ]);
            const foundResults = findRefsInScene(sceneData, type, value);
            if (foundResults.length > 0) {
                return {
                    scene: idx,
                    actors: foundResults
                };
            }
            return null;
        })
    );
    const refs = filter(results);
    const metadataType = type === 'anim' ? 'anims' : 'bodies';
    const name = DebugData.metadata[metadataType][value.index] || `${type}_${value.index}`;
    return makeOutlinerArea(
        `references_to_${name}`,
        `References to ${name}`,
        {
            name: `References to ${name}`,
            children: mapLocations(refs),
            icon: `editor/icons/${type}.svg`
        },
        {
            icon: 'ref.png'
        }
    );
}

function findRefsInScene(scene, type, value) {
    const results = [];
    map(scene.actors, (actor, idx) => {
        const lifeResults = findInScript('life', actor, idx, type, value);
        const moveResults = findInScript('move', actor, idx, type, value);
        if (lifeResults.length > 0 || moveResults.length > 0) {
            results.push({
                actor: idx,
                life: lifeResults,
                move: moveResults
            });
        }
    });
    return results;
}

function findInScript(scriptType, actor, idx, type, value) {
    const results = [];
    const script = parseScript(idx, scriptType, actor[`${scriptType}Script`]);
    each(script.commands, (cmd, cmdIdx) => {
        each(cmd.args, (arg) => {
            if (arg.type === type && arg.value === value.index) {
                results.push(cmdIdx + 1);
            }
        });
        if (cmd.condition
            && cmd.condition.param
            && cmd.condition.param.type === type
            && cmd.condition.param.value === value.index) {
            results.push(cmdIdx + 1);
        }
    });
    return results;
}

function mapLocations(refs, locations = LocationsNode.children) {
    return filter(
        map(locations, (loc) => {
            let node = null;
            if (loc.props) {
                const indexProp = find(loc.props, p => p.id === 'index');
                if (indexProp) {
                    const foundRef = find(refs, ref => ref.scene === indexProp.value);
                    if (foundRef) {
                        node = clone(loc);
                        node.children = mapActors(foundRef);
                    }
                }
            }
            const children = mapLocations(refs, loc.children);
            if (children.length > 0) {
                if (node) {
                    node.children = concat(node.children, children);
                } else {
                    node = clone(loc);
                    node.children = children;
                }
            }
            if (node) {
                node.onClick = () => {};
            }
            return node;
        })
    );
}

function mapActors(ref) {
    if (!ref)
        return [];
    return map(ref.actors, actor => ({
        name: getObjectName('actor', ref.scene, actor.actor),
        icon: 'editor/icons/model.svg',
        onClick: () => {
            if (DebugData.scope.scene) {
                if (DebugData.scope.scene.index !== ref.scene) {
                    DebugData.sceneManager.goto(ref.scene).then(() => {
                        DebugData.selection = {type: 'actor', index: actor.actor};
                    });
                } else {
                    DebugData.selection = {type: 'actor', index: actor.actor};
                }
            } else {
                DebugData.sceneManager.hideMenuAndGoto(ref.scene).then(() => {
                    DebugData.selection = {type: 'actor', index: actor.actor};
                });
            }
        },
        children: [
            {
                name: 'Life script',
                icon: 'editor/icons/areas/script.png',
                onClick: () => {},
                children: map(actor.life, line => ({
                    name: `Line ${line}`,
                    onClick: () => onScriptLineClick(ref, actor, line, 'life'),
                    children: []
                }))
            },
            {
                name: 'Move script',
                icon: 'editor/icons/areas/script.png',
                onClick: () => {},
                children: map(actor.move, line => ({
                    name: `Line ${line}`,
                    onClick: () => onScriptLineClick(ref, actor, line, 'move'),
                    children: []
                }))
            }
        ]
    }));
}

function onScriptLineClick(ref, actor, line, type) {
    if (DebugData.scope.scene) {
        if (DebugData.scope.scene.index !== ref.scene) {
            DebugData.sceneManager.goto(ref.scene).then(() => {
                DebugData.selection = {type: 'actor', index: actor.actor, [`${type}Line`]: line};
            });
        } else {
            DebugData.selection = {type: 'actor', index: actor.actor, [`${type}Line`]: line};
        }
    } else {
        DebugData.sceneManager.hideMenuAndGoto(ref.scene).then(() => {
            DebugData.selection = {type: 'actor', index: actor.actor, [`${type}Line`]: line};
        });
    }
}
