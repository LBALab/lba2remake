import React from 'react';
import DebugData from '../../../DebugData';

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

function getTarget(actor) {
    const moveScript = actor.scripts.move;
    const offset = moveScript.context.state.lastOffset;
    if (offset) {
        const cmd = moveScript.commands[offset];
        if (cmd.op.command === 'GOTO_POINT') {
            return cmd.args[0].value;
        }
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
                || value.props[3].value !== getTarget(actor)
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
                    {id: 'target', value: getTarget(actor)}
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
                    else if (id === 'target') {
                        return value ? <span>=&gt; point_{value}</span> : '';
                    }
                },
                selected: DebugData.selection.actor === idx,
                onClick: () => {DebugData.selection.actor = idx},
                children: []
            };
        }
    }
};