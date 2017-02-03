import {parseScript} from './parse';

const scripts_cache = {};
let selectedActor = -1;

export function initDebugForScene(scene) {
    window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
        detail: {
            type: 'setScene',
            index: scene.index, actors: scene.actors.length + 1
        }
    }));
    window.addEventListener('lba_ext_event_in', function(event) {
        const message = event.detail;
        if (message.type == 'selectActor') {
            selectedActor = message.index;
            const actor = message.index == 0 ? {index: 0, props: scene.data.hero} : scene.data.actors[message.index - 1];
            const scripts = parseActorScripts(scene, actor);
            window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
                detail: {
                    type: 'setActorScripts',
                    life: {
                        commands: scripts.life.commands,
                        activeLine: scripts.life.activeLine
                    },
                    move: {
                        commands: scripts.move.commands,
                        activeLine: scripts.move.activeLine
                    }
                }
            }));
        }
    });
}

export function setCursorPosition(scene, actor, scriptType, offset) {
    const scripts = parseActorScripts(scene, actor);
    const line = scripts[scriptType].opMap[offset];
    if (line === undefined)
        return;
    if (scripts[scriptType].activeLine != line && selectedActor == actor.index) {
        window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
            detail: {
                type: 'setCurrentLine',
                scene: scene.index,
                actor: actor.index,
                scriptType: scriptType,
                line: line
            }
        }));
    }
    scripts[scriptType].activeLine = line;
}

function parseActorScripts(scene, actor) {
    const key = scene.index + '_' + actor.index;
    if (key in scripts_cache) {
        return scripts_cache[key];
    } else {
        const scripts = {
            life: parseScript(actor.index, 'life', actor.props.lifeScript),
            move: parseScript(actor.index, 'move', actor.props.moveScript)
        };
        scripts_cache[key] = scripts;
        return scripts;
    }
}


