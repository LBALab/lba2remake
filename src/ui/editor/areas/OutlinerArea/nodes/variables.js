import React from 'react';
import async from 'async';
import {
    times,
    map,
    each,
    filter,
    find,
    clone,
    concat
} from 'lodash';
import {
    getObjectName,
    getVarInfo,
    getVarName,
    loadSceneMetaData,
    renameVar
} from '../../../DebugData';
import {loadSceneData} from '../../../../../scene';
import {parseScript} from '../../../../../scripting/parser';
import DebugData from '../../../DebugData';
import {Orientation} from '../../../layout';
import {makeOutlinerArea} from '../factory';
import {LocationsNode} from './locations';
import {editor as editorStyle} from '../../../../styles';

export function formatVar(varDef, value) {
    const info = getVarInfo(varDef);
    if (info) {
        if (info.type === 'boolean') {
            return <span style={{color: value === 1 ? '#00ff00' : '#e16a42'}}>{value === 1 ? 'true' : 'false'}</span>;
        } else if (info.type === 'enum') {
            if (value in info.enumValues) {
                const allValues = map(info.enumValues, (v, k) => `${k}:${v}`).join('\n');
                return <span style={{color: '#b9a0b3'}}>
                    {value}:
                    <u title={allValues}>{info.enumValues[value].toUpperCase()}</u>
                </span>;
            }
            return <span style={{color: '#b9a0b3'}}>{value}:&lt;?&gt;</span>;
        }
    }
    return value;
}

const varEdits = {};

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
            onClick: (component, varDef) => {
                findAllReferences(varDef).then((area) => {
                    component.props.split(Orientation.VERTICAL, area);
                });
            }
        }
    ],
    name: varDef => getVarName(varDef),
    props: varDef => [
        {
            id: 'value',
            value: varDef.key in varEdits ? 'editing' : varDef.value(),
            render: (value) => {
                if (varDef.key in varEdits) {
                    const info = getVarInfo(varDef);
                    const actualValue = varDef.value();
                    if (info && info.type === 'enum') {
                        function onChange(e) {
                            delete varEdits[varDef.key];
                            varDef.edit(parseInt(e.target.value));
                        }
                        return <select
                            autoFocus
                            value={varDef.value()}
                            onChange={onChange}
                            style={editorStyle.select}
                            onBlur={close}
                        >
                            {!(actualValue in info.enumValues) ?
                                <option value={actualValue}>{actualValue}:&lt;?&gt;</option>
                                : null}
                            {map(info.enumValues, (v, k) =>
                                <option key={k} value={k}>
                                    {k}:{v}
                                </option>)}
                        </select>;
                    }
                    function onKeyDown(event) {
                        event.stopPropagation();
                        const key = event.code || event.which || event.keyCode;
                        if (key === 'Enter' || key === 13) {
                            event.preventDefault();
                            delete varEdits[varDef.key];
                            const v = parseInt(event.target.value);
                            if (!Number.isNaN(v))
                                varDef.edit(v);
                        }
                    }
                    function close() {
                        delete varEdits[varDef.key];
                    }
                    return <input
                        type="number"
                        ref={ref => (ref ? ref.value = varDef.value() : null)}
                        min={0}
                        max={255}
                        step={1}
                        onKeyDown={onKeyDown}
                        onBlur={close}
                    />;
                }
                function onClick() {
                    const info = getVarInfo(varDef);
                    if (info && info.type === 'boolean') {
                        if (varDef.value() > 0)
                            varDef.edit(0);
                        else
                            varDef.edit(1);
                    } else {
                        varEdits[varDef.key] = true;
                    }
                }
                return <i onClick={onClick} style={{color: '#98ee92', cursor: 'pointer'}}>
                    {formatVar(varDef, value)}
                </i>;
            }
        }
    ],
    onClick: () => {}
};

export function makeVariables(type, name, getVars, getCtx) {
    return {
        dynamic: true,
        name: () => name,
        icon: () => 'editor/icons/var.png',
        numChildren: () => getVars().length,
        child: () => Var,
        childData: (data, idx) => makeVarDef(type, idx, getVars, getCtx)
    };
}

export function makeVarDef(type, idx, getVars, getCtx) {
    return {
        type,
        key: `${type}_${idx}`,
        ctx: getCtx && getCtx(),
        value: () => getVars()[idx],
        edit: (value) => {
            getVars()[idx] = value;
        },
        idx
    };
}

export function findAllReferences(varDef) {
    return new Promise((resolve) => {
        let sceneList;
        const isVarGames = varDef.type === 'vargame';
        if (isVarGames) {
            sceneList = times(222);
        } else {
            sceneList = [varDef.ctx.scene];
        }
        findAllRefsInSceneList(varDef, sceneList, (refs) => {
            const varname = getVarName(varDef);
            const area = makeOutlinerArea(
                `references_to_${varname}`,
                `References to ${varname}`,
                {
                    name: `References to ${varname}${!isVarGames ? ` (Scene #${varDef.ctx.scene})` : ''}`,
                    children: isVarGames ? mapLocations(refs) : mapActors(refs[0])
                }
            );
            area.generator = {
                func: 'findAllReferences',
                data: varDef
            };
            resolve(area);
        });
    });
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

function findAllRefsInSceneList(varDef, sceneList, mainCallback) {
    const game = DebugData.scope.game;
    if (!game)
        return;
    const language = game.getState().config.language;
    async.map(
        sceneList,
        (idx, callback) => {
            async.parallel([
                innerCallback => loadSceneData(language, idx, scene => innerCallback(null, scene)),
                innerCallback => loadSceneMetaData(idx, innerCallback)
            ], (err, [scene]) => {
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
            mainCallback(filter(results));
        }
    );
}

function findAllRefsInScene(varDef, scene) {
    const foundResults = [];
    map(scene.actors, (actor, idx) => {
        const script = parseScript(idx, 'life', actor.lifeScript);
        const actorResults = [];
        each(script.commands, (cmd, cmdIdx) => {
            each(cmd.args, (arg) => {
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
