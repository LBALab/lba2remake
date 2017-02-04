import THREE from 'three';
import {each} from 'lodash';
import {parseScript} from './parse';

const scripts_cache = {};
let selectedActor = -1;

let settings = {
    zones: {
        enabled: false,
        toggle: toggleZones
    },
    points: {
        enabled: false,
        toggle: togglePoints
    },
    labels: {
        enabled: false,
        toggle: toggleLabels
    }
};

let lbaExtListener = null;

export function initSceneDebug(scene) {
    window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
        detail: {
            type: 'setScene',
            index: scene.index, actors: scene.actors.length + 1
        }
    }));
    lbaExtListener = function(event) {
        const message = event.detail;
        switch (message.type) {
            case 'selectActor':
                selectActor(scene, message.index);
                break;
            case 'updateSettings':
                each(message.settings, (enabled, key) => {
                    if (settings[key].enabled != enabled) {
                        settings[key].enabled = enabled;
                        settings[key].toggle(scene, enabled);
                    }
                });
                break;
        }
    };
    window.addEventListener('lba_ext_event_in', lbaExtListener);
}

export function resetSceneDebug() {
    if (lbaExtListener) {
        window.removeEventListener('lba_ext_event_in', lbaExtListener);
    }
    settings.labels.toggle(null, false);
    settings.labels.enabled = false;
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

export function updateDebugger(scene, renderer) {
    if (settings.labels.enabled) {
        updateLabels(scene, renderer);
    }
}

function toggleZones(scene, enabled) {

}

function togglePoints(scene, enabled) {

}

function toggleLabels(scene, enabled) {
    const main = document.querySelector('#main');
    if (enabled) {
        const labels = document.createElement('div');
        labels.id = 'labels';
        each(scene.actors, actor => {
            console.log('add', actor.index);
            const label = document.createElement('div');
            label.id = `actor_label_${actor.index}`;
            label.classList.add('label');
            label.innerHTML = `<span class="text">${actor.index}</span>`;
            label.addEventListener('click', function() {
                selectActor(scene, actor.index);
            });
            labels.appendChild(label);
        });
        main.appendChild(labels);
    } else {
        console.log('remove');
        const labels = document.querySelector('#labels');
        if (labels) {
            main.removeChild(labels);
        }
    }
}

function updateLabels(scene, renderer) {
    const spritePos = new THREE.Vector3();
    each(scene.actors, actor => {
        const label = document.querySelector(`#actor_label_${actor.index}`);

        if (!label)
            return;

        if (!actor.threeObject) {
            label.style.display = 'none';
            return;
        }

        const widthHalf = 0.5 * renderer.domElement.width;
        const heightHalf = 0.5 * renderer.domElement.height;

        actor.threeObject.updateMatrixWorld();
        spritePos.setFromMatrixPosition(actor.threeObject.matrixWorld);
        spritePos.project(renderer.getMainCamera(scene));

        spritePos.x = ( spritePos.x * widthHalf ) + widthHalf;
        spritePos.y = - ( spritePos.y * heightHalf ) + heightHalf;

        if (spritePos.z < 1) {
            label.style.left = spritePos.x + 'px';
            label.style.top = spritePos.y + 'px';
            label.style.display = 'block';
        } else {
            label.style.display = 'none';
        }
    });
}

function selectActor(scene, index) {
    const actor = index == 0 ? {index: 0, props: scene.data.hero} : scene.data.actors[index - 1];
    selectedActor = index;
    const scripts = parseActorScripts(scene, actor);
    window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
        detail: {
            type: 'setActorScripts',
            index: index,
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
