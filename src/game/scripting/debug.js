import THREE from 'three';
import {each} from 'lodash';
import {parseScript} from './parse';

const scripts_cache = {};
let selectedActor = -1;
let selectedZone = null;

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
    settings.points.toggle(null, false);
    settings.zones.toggle(null, false);
    settings.labels.enabled = false;
    settings.points.enabled = false;
    settings.zones.enabled = false;
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
        updateLabels(scene, renderer, 'actor');
    }
    if (settings.points.enabled) {
        updateLabels(scene, renderer, 'point');
    }
    if (settings.zones.enabled) {
        updateLabels(scene, renderer, 'zone');
    }
}

function toggleZones(scene, enabled) {
    if (scene) {
        each(scene.zones, zone => {
            zone.threeObject.visible = enabled;
        });
    }
    toggleLabels(scene, enabled, 'zone');
}

function togglePoints(scene, enabled) {
    if (scene) {
        each(scene.points, point => {
            point.threeObject.visible = enabled;
        });
    }
    toggleLabels(scene, enabled, 'point');
}

function toggleLabels(scene, enabled, type = 'actor') {
    const main = document.querySelector('#main');
    if (enabled) {
        const labels = document.createElement('div');
        labels.id = `${type}_labels`;
        each(scene[`${type}s`], obj => {
            const label = document.createElement('div');
            label.id = `${type}_label_${obj.index}`;
            label.classList.add('label');
            label.classList.add(type);
            label.innerText = obj.index;
            if (type == 'actor') {
                label.addEventListener('click', function() {
                    selectActor(scene, obj.index);
                });
            }
            if (type == 'zone') {
                const {r, g, b} = obj.color;
                label.style.background = `rgba(${Math.floor(r * 256)},${Math.floor(g * 256)},${Math.floor(b * 256)},0.6)`;
                label.addEventListener('click', function() {
                    if (selectedZone) {
                        selectedZone.threeObject.material.color = selectedZone.color;
                    }
                    if (selectedZone != obj) {
                        obj.threeObject.material.color = new THREE.Color(0xFFFFFF);
                        selectedZone = obj;
                    } else {
                        selectedZone = null;
                    }
                });
            }
            labels.appendChild(label);
        });
        main.appendChild(labels);
    } else {
        const labels = document.querySelector(`#${type}_labels`);
        if (labels) {
            main.removeChild(labels);
        }
    }
}

function updateLabels(scene, renderer, type) {
    const pos = new THREE.Vector3();
    each(scene[`${type}s`], obj => {
        const label = document.querySelector(`#${type}_label_${obj.index}`);

        if (!label)
            return;

        if (!obj.threeObject) {
            label.style.display = 'none';
            return;
        }

        const widthHalf = 0.5 * renderer.domElement.width;
        const heightHalf = 0.5 * renderer.domElement.height;

        obj.threeObject.updateMatrixWorld();
        pos.setFromMatrixPosition(obj.threeObject.matrixWorld);
        pos.project(renderer.getMainCamera(scene));

        pos.x = ( pos.x * widthHalf ) + widthHalf;
        pos.y = - ( pos.y * heightHalf ) + heightHalf;

        if (pos.z < 1) {
            label.style.left = pos.x + 'px';
            label.style.top = pos.y + 'px';
            label.style.display = 'block';
        } else {
            label.style.display = 'none';
        }
        if (type == 'actor') {
            if (selectedActor == obj.index) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
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
