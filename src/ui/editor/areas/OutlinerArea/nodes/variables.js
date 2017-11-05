import React from 'react';
import async from 'async';
import {times, map, each, filter} from 'lodash';
import {getVarInfo, getVarName, renameVar} from '../../../DebugData';
import {loadSceneData} from "../../../../../scene";
import {parseScript} from "../../../../../scripting/parser";
import DebugData from "../../../DebugData";

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

function findAllReferences(varDef) {
    let sceneList;
    if (varDef.type === 'vargame') {
        sceneList = times(222);
    } else {
        const scene = DebugData.scope.scene;
        sceneList = [scene.index];
    }
    findAllRefsInSceneList(varDef, sceneList, (results) => {

    });
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
                    actorResults.push(cmdIdx);
                }
            });
            if (cmd.condition
                && cmd.condition.param
                && cmd.condition.param.type === varDef.type
                && cmd.condition.param.value === varDef.idx) {
                actorResults.push(cmdIdx);
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