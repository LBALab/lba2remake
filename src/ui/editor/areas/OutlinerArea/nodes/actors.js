import React from 'react';
import DebugData from '../../../DebugData';
import {map} from 'lodash';

const actorName = (idx) => idx === 0 ? 'hero' : `actor_${idx}`;

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
        switch (cmd.op.command) {
            case 'STOP':
                return;
            case 'WAIT_NUM_SECONDS':
            case 'WAIT_NUM_DSEC':
            case 'WAIT_NUM_SECOND_RND':
            case 'WAIT_NUM_DECIMAL_RND':
                const timeLeft = Math.ceil(moveScript.context.state.waitUntil - DebugData.scope.clock.elapsedTime);
                return {
                    cmd: cmd.op.command,
                    args: map(cmd.args, arg => arg.value).join(', '),
                    extra: `[${timeLeft}″ left]`
                };
            default:
                return {
                    cmd: cmd.op.command,
                    args: map(cmd.args, arg => arg.value).join(', ')
                };
        }
    }
}

function moveActionAreEqual(a1, a2) {
    if (a1 !== undefined && a2 !== undefined) {
        return a1.cmd === a2.cmd && a1.args === a2.args && a1.extra === a2.extra;
    } else {
        return a1 === a2;
    }
}

export const ActorsNode = {
    name: 'Actors',
    dynamic: true,
    getNumChildren: () => {
        const scene = DebugData.scope.scene;
        return scene ? scene.actors.length : 0;
    },
    childNeedsUpdate: (idx, value) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            const actor = scene.actors[idx];
            return value.name !== actorName(idx)
                || value.props[0].value !== actor.isVisible
                || value.props[1].value !== actor.isSprite
                || value.props[2].value !== getComportement(actor)
                || !moveActionAreEqual(value.props[3].value, getMoveAction(actor))
                || value.selected !== (DebugData.selection.actor === idx);
        }
        return true;
    },
    getChild: (idx) => {
        const scene = DebugData.scope.scene;
        if (scene) {
            const actor = scene.actors[idx];
            return {
                name: actorName(idx),
                props: [
                    {id: 'visible', value: actor.isVisible},
                    {id: 'sprite', value: actor.isSprite},
                    {id: 'comportement', value: getComportement(actor)},
                    {id: 'moveAction', value: getMoveAction(actor)}
                ],
                renderProp: (id, value) => {
                    if (id === 'visible') {
                        return <img src={`editor/icons/${value ? 'visible' : 'hidden'}.png`}/>;
                    }
                    else if (id === 'sprite') {
                        return <img title={value ? 'SPRITE' : 'MODEL'}
                                    src={`editor/icons/${value ? 'sprite' : 'model'}.png`}/>;
                    }
                    else if (id === 'comportement') {
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
                    else if (id === 'moveAction') {
                        return value
                            ? <span>&nbsp;{value.cmd}
                                {value.args ? <span>(<i style={{color: '#ca0000'}}>{value.args}</i>)</span> : ''}
                                {value.extra ? <span style={{color: '#1a78c0'}}>&nbsp;{value.extra}</span> : null}
                            </span>
                            : '';
                    }
                },
                selected: DebugData.selection.actor === idx,
                onClick: () => {DebugData.selection.actor = idx},
                children: []
            };
        }
    }
};