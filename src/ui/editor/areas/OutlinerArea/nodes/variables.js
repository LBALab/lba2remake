import React from 'react';
import async from 'async';
import {times, map, each, filter, find, clone} from 'lodash';
import {getObjectName, getVarInfo, getVarName, renameVar} from '../../../DebugData';
import {loadSceneData} from "../../../../../scene";
import {parseScript} from "../../../../../scripting/parser";
import DebugData from "../../../DebugData";
import {Orientation} from '../../../layout';
import {makeOutlinerArea} from '../factory';
import {LocationsNode} from './locations';

export function formatVar(varDef, value) {
    const info = getVarInfo(varDef);
    if (info) {
        if (info.type === 'boolean') {
            return <span style={{color: value === 1 ? '#00ff00' : '#ff0000'}}>{value === 1 ? 'true' : 'false'}</span>;
        } else if (info.type === 'enum') {
            if (value in info.enumValues) {
                return <span style={{color: '#b9a0b3'}}>{info.enumValues[value].toUpperCase()}</span>;
            } else {
                return <span style={{color: '#b9a0b3'}}>undefined(#{value})</span>;
            }
        }
    }
    return value;
}

export const Var = {
    dynamic: true,
    needsData: true,
    allowRenaming: () => true,
    rename: (varDef, newName) => {
        renameVar(varDef, newName);
    },
    ctxMenu: [
        {
            name: 'Find all references',
            onClick: findAllReferences
        }
    ],
    name: (varDef) => getVarName(varDef),
    props: (varDef) => [
        {
            id: 'value',
            value: varDef.value(),
            render: (value) => <i style={{color: '#98ee92'}}>{formatVar(varDef, value)}</i>
        }
    ],
    onClick: () => {}
};

export function makeVariables(type, name, getVars) {
    return {
        dynamic: true,
        name: () => name,
        icon: () => 'editor/icons/var.png',
        numChildren: () => getVars().length,
        child: () => Var,
        childData: (data, idx) => {
            return {
                type: type,
                value: () => getVars()[idx],
                idx
            };
        }
    }
}

function findAllReferences(component, varDef) {
    let sceneList;
    const isVarGames = varDef.type === 'vargame';
    if (isVarGames) {
        sceneList = times(222);
    } else {
        const scene = DebugData.scope.scene;
        sceneList = [scene.index];
    }
    findAllRefsInSceneList(varDef, sceneList, (refs) => {
        const varname = getVarName(varDef);
        component.props.split(
            Orientation.VERTICAL,
            makeOutlinerArea(
                `references_to_${varname}`,
                `References to ${varname}`,
                {
                    name: `References to ${varname}`,
                    children: isVarGames ? mapLocations(refs) : mapActors(refs[0])
                }
            )
        );
    });
}

function mapLocations(refs, locations = LocationsNode.children) {
    return filter(
        map(locations, loc => {
            if (loc.props) {
                const indexProp = find(loc.props, p => p.id === 'index');
                if (indexProp) {
                    const ref = find(refs, ref => ref.scene === indexProp.value);
                    if (ref) {
                        const node = clone(loc);
                        node.children = mapActors(ref);
                        node.onClick = () => {};
                        return node;
                    }
                }
            }
            const children = mapLocations(refs, loc.children);
            if (children.length > 0) {
                const node = clone(loc);
                node.children = children;
                node.onClick = () => {};
                return node;
            }
        })
    )
}

function mapActors(ref) {
    return map(ref.actors, actor => ({
        name: getObjectName('actor', ref.scene, actor.actor),
        icon: 'editor/icons/model.png',
        onClick: () => {
            if (DebugData.scope.scene) {
                if (DebugData.scope.scene.index !== ref.scene) {
                    DebugData.sceneManager.goto(ref.scene, () => {
                        DebugData.selection.actor = actor.actor;
                    });
                } else {
                    DebugData.selection.actor = actor.actor;
                }
            }
        },
        children: map(actor.lines, line => ({
            name: `Line ${line}`,
            onClick: () => {
                if (DebugData.scope.scene) {
                    if (DebugData.scope.scene.index !== ref.scene) {
                        DebugData.sceneManager.goto(ref.scene, () => {
                            DebugData.selection.actor = actor.actor;
                            DebugData.selection.lifeLine = line;
                        });
                    } else {
                        DebugData.selection.actor = actor.actor;
                        DebugData.selection.lifeLine = line;
                    }
                }
            },
            children: []
        }))
    }));
}

function findAllRefsInSceneList(varDef, sceneList, callback) {
    async.map(
        sceneList,
        (idx, callback) => {
            loadSceneData(idx, (scene) => {
                const foundResults = findAllRefsInScene(varDef, scene);
                if (foundResults.length > 0) {
                    callback(null, {
                        scene: idx,
                        actors: foundResults
                    });
                } else {
                    callback();
                }
            });
        },
        (err, results) => {
            callback(filter(results));
        }
    );
}

function findAllRefsInScene(varDef, scene) {
    let foundResults = [];
    map(scene.actors, (actor, idx) => {
        const script = parseScript(idx, 'life', actor.lifeScript);
        const actorResults = [];
        each(script.commands, (cmd, cmdIdx) => {
            each(cmd.args, arg => {
                if (arg.type === varDef.type && arg.value === varDef.idx) {
                    actorResults.push(cmdIdx + 1);
                }
            });
            if (cmd.condition
                && cmd.condition.param
                && cmd.condition.param.type === varDef.type
                && cmd.condition.param.value === varDef.idx) {
                actorResults.push(cmdIdx + 1);
            }
        });
        if (actorResults.length > 0) {
            foundResults.push({
                actor: idx,
                lines: actorResults
            });
        }
    });
    return foundResults;
}