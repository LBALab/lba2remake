import React from 'react';
import DebugData, {
    renameActor,
    getActorName
} from '../../../DebugData';
import {map} from 'lodash';
import {SceneGraphNode} from './sceneGraph';

const Actor = {
    dynamic: true,
    needsData: true,
    allowRenaming: (actor) => {
        return actor.index > 1;
    },
    rename: (actor, newName) => {
        renameActor(actor.props.sceneIndex, actor.index, newName);
    },
    name: (actor) => getActorName(actor.props.sceneIndex, actor.index),
    props: (actor) => [
        {
            id: 'visible',
            value: actor.isVisible,
            render: (value) => <img src={`editor/icons/${value ? 'visible' : 'hidden'}.png`}/>
        },
        {
            id: 'sprite',
            value: actor.isSprite,
            render: (value) => <img title={value ? 'SPRITE' : 'MODEL'}
                                    src={`editor/icons/${value ? 'sprite' : 'model'}.png`}/>
        },
        {
            id: 'comportement',
            value: getComportement(actor),
            render: (value) => {
                const style = {
                    border: '1px solid black',
                    background: '#20a2ff',
                    color: 'black',
                    padding: '0 2px'
                };
                if (value === 'terminated') {
                    style.background = '#680000';
                    return <span style={style}>&nbsp;</span>;
                } else {
                    return <span style={style}>{value}</span>;
                }
            }
        },
        {
            id: 'moveAction',
            value: getMoveAction(actor),
            render: (value) => value
                ? <span>&nbsp;{value.cmdName}
                    {value.args ? <span>{'('}<i style={{color: '#ca0000'}}>{value.args}</i>{')'}</span> : ''}
                    {value.extra ? <span style={{color: '#1a78c0'}}>&nbsp;{value.extra}</span> : null}
                </span>
                : ''
        }
    ],
    numChildren: (actor) => actor.threeObject ? 1 : 0,
    child: () => SceneGraphNode,
    childData: (actor) => actor.threeObject,
    selected: (actor) => DebugData.selection.actor === actor.index,
    onClick: (actor) => {DebugData.selection.actor = actor.index},
};

export const ActorsNode = {
    dynamic: true,
    needsData: true,
    name: () => 'Actors',
    numChildren: (scene) => scene.actors.length,
    child: () => Actor,
    childData: (scene, idx) => scene.actors[idx],
    hasChanged: (scene) => scene.index !== DebugData.scope.scene,
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
                    const timeLeft = Math.ceil(moveScript.context.state.waitUntil - DebugData.scope.clock.elapsedTime);
                    extra = `[${timeLeft}″ left]`;
                    key += timeLeft;
                    break;
                default:
                    break;
            }
            return {key, cmdName, args, extra};
        }
    }
}
