import React from 'react';
import {map} from 'lodash';
import DebugData, {
    renameObject,
    getObjectName,
    locateObject
} from '../../../../DebugData';
import {SceneGraphNode} from '../../sceneGraph/SceneGraphNode';
import {mapComportementArg} from '../../scripts/listing';
import {makeObjectsNode} from '../node_factories/objects';

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
        }
    ],
    childProps: [
        {
            id: 'entity',
            name: 'Entity',
            value: (actor) => {
                if (actor.props.entityIndex === -1) {
                    return '<no-entity>';
                } else if (DebugData.metadata.entities[actor.props.entityIndex]) {
                    const name = DebugData.metadata.entities[actor.props.entityIndex];
                    return `${name} (${actor.props.entityIndex})`;
                }
                return `entity_${actor.props.entityIndex}`;
            },
            onClick: (entity, component) => {
                const actor = component.props.data.context;
                component.props.editor.switchEditor('model', {
                    rootState: {
                        entity: actor.props.entityIndex,
                        body: 0,
                        anim: 0
                    }
                });
            },
            icon: actor => localStorage.getItem(`icon_model_entity_${actor.props.entityIndex}`)
        },
        {
            id: 'body',
            name: 'Body',
            value: (actor) => {
                if (actor.props.bodyIndex === -1) {
                    return '<no-body>';
                } else if (DebugData.metadata.bodies[actor.props.bodyIndex]) {
                    return DebugData.metadata.bodies[actor.props.bodyIndex];
                }
                return `body_${actor.props.bodyIndex}`;
            },
            onClick: (entity, component) => {
                const actor = component.props.data.context;
                component.props.editor.switchEditor('model', {
                    rootState: {
                        entity: actor.props.entityIndex,
                        body: actor.props.bodyIndex,
                        anim: 0
                    }
                });
            },
            icon: () => 'editor/icons/body.png'
        },
        {
            id: 'anim',
            name: 'Anim',
            value: (actor) => {
                if (actor.props.animIndex === -1) {
                    return '<no-anim>';
                } else if (DebugData.metadata.anims[actor.props.animIndex]) {
                    return DebugData.metadata.anims[actor.props.animIndex];
                }
                return `anim_${actor.props.animIndex}`;
            },
            onClick: (entity, component) => {
                const actor = component.props.data.context;
                component.props.editor.switchEditor('model', {
                    rootState: {
                        entity: actor.props.entityIndex,
                        body: 0,
                        anim: actor.props.animIndex
                    }
                });
            },
            icon: () => 'editor/icons/anim.png'
        },
        {
            id: 'life',
            name: 'Life',
            value: actor => getComportement(actor),
            icon: () => 'editor/icons/areas/script.png',
            render: (value) => {
                if (value === 'terminated') {
                    return <i>[OFF]</i>;
                }
                return <span>{mapComportementArg(value)}</span>;
            }
        },
        {
            id: 'move',
            name: 'Move',
            value: actor => getMoveAction(actor),
            icon: () => 'editor/icons/areas/script.png',
            render: (value) => {
                if (!value)
                    return <i>[OFF]</i>;

                return <span>{value.cmdName}
                    {value.args
                        ? <span>{'('}<i style={{color: '#ca0000'}}>{value.args}</i>{')'}</span>
                        : ''}
                    {value.extra ? <span style={{color: '#1a78c0'}}>&nbsp;{value.extra}</span> : null}
                </span>;
            }
        }
    ],
    numChildren: actor => (actor.threeObject ? 1 : 0),
    child: () => SceneGraphNode,
    childData: actor => actor.threeObject,
    selected: (actor) => {
        const selection = DebugData.selection;
        return selection && selection.type === 'actor' && selection.index === actor.index;
    },
    onClick: (actor) => { DebugData.selection = {type: 'actor', index: actor.index}; },
    onDoubleClick: (actor, component, setRoot) => {
        locateObject(actor);
        setRoot();
    }
};

export const ActorsNode = makeObjectsNode('actor', {
    dynamic: true,
    needsData: true,
    name: () => 'Actors',
    icon: () => 'editor/icons/actor.svg',
    numChildren: scene => scene.actors.length,
    child: () => Actor,
    childData: (scene, idx) => scene.actors[idx],
    hasChanged: scene => scene.index !== DebugData.scope.scene
});

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
                case 'WAIT_NUM_SECOND':
                case 'WAIT_NUM_DSEC':
                case 'WAIT_NUM_SECOND_RND':
                case 'WAIT_NUM_DECIMAL_RND': {
                    const timeLeft = Math.ceil(
                        moveScript.context.state.waitUntil - DebugData.scope.clock.elapsedTime
                    );
                    extra = `[${timeLeft}″ left]`;
                    key += timeLeft;
                    break;
                }
                default:
                    break;
            }
            return {key, cmdName, args, extra};
        }
    }
    return null;
}
