import * as React from 'react';
import {
    times,
    map,
    each,
    filter,
    find,
    clone,
    concat
} from 'lodash';
import DebugData, * as DBG from '../../../../DebugData';
import {loadSceneData} from '../../../../../../scene';
import {parseScript} from '../../../../../../scripting/parser';
import {Orientation} from '../../../../layout';
import {makeOutlinerArea} from '../../../utils/outliner';
import LocationsNode from '../../locator/LocationsNode';
import {formatVar} from '../../scripts/format';
import {editor as editorStyle} from '../../../../../styles';
import {getLanguageConfig} from '../../../../../../lang';

const {
    getObjectName,
    getVarInfo,
    getVarName,
    loadSceneMetaData,
    renameVar
} = DBG;

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
                    const close = () => {
                        delete varEdits[varDef.key];
                    };
                    if (info && info.type === 'enum') {
                        const onChange = (e) => {
                            delete varEdits[varDef.key];
                            varDef.edit(Number(e.target.value));
                        };
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
                    const onKeyDown = (event) => {
                        event.stopPropagation();
                        const key = event.code || event.which || event.keyCode;
                        if (key === 'Enter' || key === 13) {
                            event.preventDefault();
                            delete varEdits[varDef.key];
                            const v = Number(event.target.value);
                            if (!Number.isNaN(v))
                                varDef.edit(v);
                        }
                    };

                    return <input
                        type="number"
                        ref={(ref) => {
                            if (ref) {
                                ref.value = varDef.value();
                            }
                        }}
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
        icon: () => 'editor/icons/var.svg',
        numChildren: data => getVars(data).length,
        child: () => Var,
        childData: (data, idx) => makeVarDef(data, type, idx, getVars, getCtx)
    };
}

export function makeVarDef(data, type, idx, getVars, getCtx) {
    return {
        type,
        key: `${type}_${idx}`,
        ctx: getCtx && getCtx(data),
        value: () => getVars(data)[idx],
        edit: (value) => {
            getVars(data)[idx] = value;
        },
        idx
    };
}

export async function findAllReferences(varDef) {
    let sceneList;
    const isVarGames = varDef.type === 'vargame';
    if (isVarGames) {
        sceneList = times(222);
    } else {
        sceneList = [varDef.ctx.scene];
    }
    const refs = await findAllRefsInSceneList(varDef, sceneList);
    const varname = getVarName(varDef);
    return makeOutlinerArea(
        `references_to_${varname}`,
        `References to ${varname}`,
        {
            name: `References to ${varname}${!isVarGames ? ` (Scene #${varDef.ctx.scene})` : ''}`,
            children: isVarGames ? mapLocations(refs) : mapActors(refs[0])
        },
        {
            icon: 'ref.png'
        }
    );
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
            }
        },
        children: map(actor.lines, line => ({
            name: `Line ${line}`,
            onClick: () => {
                if (DebugData.scope.scene) {
                    if (DebugData.scope.scene.index !== ref.scene) {
                        DebugData.sceneManager.goto(ref.scene).then(() => {
                            DebugData.selection = {
                                type: 'actor',
                                index: actor.actor,
                                lifeLine: line
                            };
                        });
                    } else {
                        DebugData.selection = {
                            type: 'actor',
                            index: actor.actor,
                            lifeLine: line
                        };
                    }
                }
            },
            children: []
        }))
    }));
}

async function findAllRefsInSceneList(varDef, sceneList) {
    const game = DebugData.scope.game;
    if (!game)
        return null;

    const {language} = getLanguageConfig();
    const results = await Promise.all(
        map(sceneList, async (idx) => {
            const [sceneData] = await Promise.all([
                loadSceneData(language, idx),
                loadSceneMetaData(idx)
            ]);
            const foundResults = findAllRefsInScene(varDef, sceneData);
            if (foundResults.length > 0) {
                return {
                    scene: idx,
                    actors: foundResults
                };
            }
            return null;
        })
    );
    return filter(results);
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
