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
                || value.props.isSprite !== actor.isSprite
                || value.props.isVisible !== actor.isVisible
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
                props: {
                    isSprite: actor.isSprite,
                    isVisible: actor.isVisible
                },
                selected: DebugData.selection.actor === idx,
                onClick: () => {DebugData.selection.actor = idx},
                children: []
            };
        }
    }
};