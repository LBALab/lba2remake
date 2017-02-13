import THREE from 'three';
import {each, map, cloneDeep} from 'lodash';
import Indent from './indent';

let selectedScene = null;
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
let paused = false;
let step = false;

window.addEventListener('lba_ext_event_in', function() {
    const message = event.detail;
    switch (message.type) {
        case 'setPaused':
            paused = message.paused;
            break;
        case 'step':
            step = true;
            break;
    }
});

export function hasStep() {
    return step;
}

export function endStep() {
    step = false;
}

export function isPaused() {
    return paused;
}

export function initSceneDebug(scene) {
    selectedScene = scene.index;
    window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
        detail: {
            type: 'setScene',
            index: scene.index, actors: scene.actors.length
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

export function resetSceneDebug(scene) {
    if (lbaExtListener) {
        window.removeEventListener('lba_ext_event_in', lbaExtListener);
    }
    settings.labels.toggle(scene, false);
    settings.points.toggle(scene, false);
    settings.zones.toggle(scene, false);
    settings.labels.enabled = false;
    settings.points.enabled = false;
    settings.zones.enabled = false;
}

export function setCursorPosition(scene, actor, type, line, scrollView = false, value = null) {
    if (selectedScene == scene.index && selectedActor == actor.index) {
        window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
            detail: {
                type: 'setCurrentLine',
                scene: scene.index,
                actor: actor.index,
                scriptType: type,
                line: line,
                scrollView: scrollView,
                value: value
            }
        }));
    }
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
            label.style.left = (pos.x / renderer.pixelRatio()) + 'px';
            label.style.top = (pos.y / renderer.pixelRatio()) + 'px';
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
    selectedActor = index;
    const actor = scene.getActor(index);
    window.dispatchEvent(new CustomEvent('lba_ext_event_out', {
        detail: {
            type: 'setActorScripts',
            index: index,
            life: getDebugListing('life', scene, actor),
            move: getDebugListing('move', scene, actor)
        }
    }));
}

function getDebugListing(type, scene, actor) {
    const script = actor.scripts[type];
    const activeLine = script.context && script.context.state && script.context.state.lastOffset;
    return { commands: mapCommands(scene, actor, script.commands), activeLine: activeLine };
}

function mapCommands(scene, actor, commands) {
    let indent = 0;
    let prevCommand = null;
    return map(commands, cmd => {
        const newCmd = {
            name: cmd.op.command,
            args: mapArguments(scene, actor, cmd),
            condition: mapCondition(cmd.condition),
            operator: mapOperator(cmd.operator)
        };
        indent = processIndent(newCmd, prevCommand, cmd.op, indent);
        prevCommand = newCmd;
        return newCmd;
    })
}

function mapArguments(scene, actor, cmd) {
    const args = cloneDeep(cmd.args);
    switch (cmd.op.command) {
        case 'SET_COMPORTEMENT':
            args[0].value = actor.scripts.life.comportementMap[args[0].value];
            break;
        case 'SET_COMPORTEMENT_OBJ':
            const tgt = scene.getActor(args[0].value);
            if (tgt) {
                args[1].value = tgt.scripts.life.comportementMap[args[1].value];
            }
            break;
        case 'SET_TRACK':
            args[0].value = actor.scripts.move.tracksMap[args[0].value];
            break;
        case 'SET_TRACK_OBJ':
            const tgt2 = scene.getActor(args[0].value);
            if (tgt2) {
                args[1].value = tgt2.scripts.move.tracksMap[args[1].value];
            }
            break;
        case 'GOTO':
            args[0].value = actor.scripts.move.tracksMap[args[0].value];
            break;
    }
    return args;
}

function mapCondition(condition) {
    if (condition) {
        return {
            name: condition.op.command,
            param: condition.param && condition.param.value
        };
    }
}

function mapOperator(operator) {
    if (operator) {
        return {
            name: operator.op.command,
            operand: operator.operand
        };
    }
}

function processIndent(cmd, prevCmd, op, indent) {
    if (prevCmd && prevCmd.name != 'BREAK' && prevCmd.name != 'SWITCH' && (op.command == 'CASE' || op.command == 'OR_CASE' || op.command == 'DEFAULT')) {
        indent = Math.max(indent - 1, 0);
    }
    switch (op.indent) {
        case Indent.ZERO:
            cmd.indent = 0;
            return 0;
        case Indent.ONE:
            cmd.indent = 1;
            return 1;
        case Indent.ADD:
            cmd.indent = indent;
            return indent + 1;
        case Indent.SUB:
            cmd.indent = Math.max(indent - 1, 0);
            return Math.max(indent - 1, 0);
        case Indent.POST_SUB:
            cmd.indent = indent;
            return Math.max(indent - 1, 0);
        case Indent.SUB_ADD:
            cmd.indent = Math.max(indent - 1, 0);
            return indent;
        case Indent.KEEP:
            cmd.indent = indent;
            return indent;
    }
}
