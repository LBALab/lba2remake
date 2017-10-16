import React from 'react';
import DebugData from '../../../DebugData';

const actorName = (idx) => idx === 0 ? 'hero' : `actor_${idx}`;

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
                    {id: 'sprite', value: actor.isSprite}
                ],
                renderProp: (id, value) => {
                    if (id === 'visible')
                        return <img src={`editor/icons/${value ? 'visible' : 'hidden'}.png`}/>;
                    else
                        return <img title={value ? 'SPRITE' : 'MODEL'} src={`editor/icons/${value ? 'sprite' : 'model'}.png`}/>;
                },
                selected: DebugData.selection.actor === idx,
                onClick: () => {DebugData.selection.actor = idx},
                children: []
            };
        }
    }
};