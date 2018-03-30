import React from 'react';
import {map} from 'lodash';
import DebugData, {
    renameObject,
    getObjectName,
    locateObject
} from '../../../DebugData';
import {SceneGraphNode} from './sceneGraph';
import {mapComportementArg} from '../../ScriptEditorArea/listing';

const compStyle = {
    border: '1px solid black',
    background: '#20a2ff',
    color: 'black',
    padding: '0 2px'
};

const Actor = {
    dynamic: true,
    needsData: true,
    allowRenaming: actor => actor.index > 1,
    rename: (actor, newName) => {
        renameObject('actor', actor.props.sceneIndex, actor.index, newName);
    },
    ctxMenu: [
        {
            name: 'Locate',
            onClick: (component, actor) => locateObject(actor)
        }
    ],
    name: actor => getObjectName('actor', actor.props.sceneIndex, actor.index),
    icon: actor => `editor/icons/${actor.isSprite ? 'sprite' : 'model'}.png`,
    props: actor => [
        {
            id: 'index',
            value: actor.index,
            render: value => <span>#{value}</span>
        },
        {
            id: 'visible',
            value: actor.isVisible,
            render: (value) => {
                const onClick = () => {
                    actor.isVisible = !actor.isVisible;
                    if (actor.threeObject) {
                        actor.threeObject.visible = actor.isVisible;
                    }
                };
                return <img
                    src={`editor/icons/${value ? 'visible' : 'hidden'}.png`}
                    onClick={onClick}
                    style={{cursor: 'pointer'}}
                />;
            }
        },
        {
            id: 'comportement',
            value: getComportement(actor),
            render: (value) => {
                if (value === 'terminated') {
                    return null;
                }
                return <span style={compStyle}>{mapComportementArg(value)}</span>;
            }
        },
        {
            id: 'moveAction',
            value: getMoveAction(actor),
            render: value => (value
                ? <span>&nbsp;{value.cmdName}
                    {value.args ? <span>{'('}<i style={{color: '#ca0000'}}>{value.args}</i>{')'}</span> : ''}
                    {value.extra ? <span style={{color: '#1a78c0'}}>&nbsp;{value.extra}</span> : null}
                </span>
                : '')
        }
    ],
    numChildren: actor => (actor.threeObject ? 1 : 0),
    child: () => SceneGraphNode,
    childData: actor => actor.threeObject,
    selected: actor => DebugData.selection.actor === actor.index,
    onClick: (actor) => { DebugData.selection.actor = actor.index; },
    onDoubleClick: locateObject
};

export const ActorsNode = {
    dynamic: true,
    needsData: true,
    name: () => 'Actors',
    icon: () => 'editor/icons/actor.png',
    numChildren: scene => scene.actors.length,
    child: () => Actor,
    childData: (scene, idx) => scene.actors[idx],
    hasChanged: scene => scene.index !== DebugData.scope.scene,
    onClick: (scene, setRoot) => {
        if (scene.isActive) {
            setRoot();
        }
    }
};


function getComportement(actor) {
    const lifeScript = actor.scripts.life;
    if (lifeScript.context.state.terminated)
        return 'terminated';
    const offset = lifeScript.context.state.lastOffset;
    if (offset) {
        const cmd = lifeScript.commands[offset];
        return cmd.section;
    }
    return null;
}

function getMoveAction(actor) {
    const moveScript = actor.scripts.move;
    const offset = moveScript.context.state.lastOffset;
    if (offset) {
        const cmd = moveScript.commands[offset];
        const cmdName = cmd.op.command;
        if (cmdName !== 'STOP') {
            const args = map(cmd.args, arg => arg.value).join(', ');
            let key = `${cmdName}_${args}`;
            let extra;
            switch (cmdName) {
                case 'WAIT_NUM_SECONDS':
                case 'WAIT_NUM_DSEC':
                case 'WAIT_NUM_SECOND_RND':
                case 'WAIT_NUM_DECIMAL_RND':
                    const timeLeft = Math.ceil(
                        moveScript.context.state.waitUntil - DebugData.scope.clock.elapsedTime
                    );
                    extra = `[${timeLeft}″ left]`;
                    key += timeLeft;
                    break;
                default:
                    break;
            }
            return {key, cmdName, args, extra};
        }
    }
    return null;
}
