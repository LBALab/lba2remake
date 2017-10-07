import THREE from 'three';
import {each, map, cloneDeep} from 'lodash';
import {getRotation} from '../utils/lba';
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
        toggle: toggleActors
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

export function selectLabel(scene, type, index) {
    if (type === 'actor') {
        selectActor(scene, index);
    } else if (type === 'zone') {
        selectZone(scene, index);
    }
}

export function isSelected(scene, type, index) {
    if (type === 'actor') {
        return index === selectedActor;
    } else if (type === 'zone') {
        const zone = scene.zones[index];
        return zone === selectedZone;
    } else {
        return false;
    }
}

export function initSceneDebug(game, scene) {
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
                    if (settings[key].enabled !== enabled) {
                        settings[key].enabled = enabled;
                        settings[key].toggle(game, scene, enabled);
                    }
                });
                break;
        }
    };
    window.addEventListener('lba_ext_event_in', lbaExtListener);
}

export function resetSceneDebug(game, scene) {
    if (lbaExtListener) {
        window.removeEventListener('lba_ext_event_in', lbaExtListener);
    }
    settings.labels.toggle(game, scene, false);
    settings.points.toggle(game, scene, false);
    settings.zones.toggle(game, scene, false);
    settings.labels.enabled = false;
    settings.points.enabled = false;
    settings.zones.enabled = false;
}

export function setCursorPosition(scene, actor, type, line, scrollView = false, value = null) {
    if (selectedScene === scene.index && selectedActor === actor.index) {
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

function toggleZones(game, scene, enabled) {
    if (scene) {
        each(scene.zones, zone => {
            zone.threeObject.visible = enabled;
            if (enabled) {
                zone.threeObject.updateMatrix();
            }
        });
    }
    toggleLabels(game, enabled, 'zone');
}

function togglePoints(game, scene, enabled) {
    if (scene) {
        each(scene.points, point => {
            point.threeObject.visible = enabled;
            if (enabled) {
                point.threeObject.updateMatrix();
            }
        });
    }
    toggleLabels(game, enabled, 'point');
}

function toggleActors(game, scene, enabled) {
    toggleLabels(game, enabled, 'actor');
}

function toggleLabels(game, enabled, type) {
    const labels = game.ui.state.labels;
    labels[type] = enabled;
    game.ui.setState({ labels: labels })
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

function selectZone(scene, index) {
    const zone = scene.getZone(index);
    if (selectedZone) {
        selectedZone.threeObject.material.color = selectedZone.color;
    }
    if (selectedZone !== zone) {
        zone.threeObject.material.color = new THREE.Color(0xFFFFFF);
        selectedZone = zone;
    } else {
        selectedZone = null;
    }
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
        case 'ANGLE':
        case 'BETA':
            args[0].value = getRotation(args[0].value, 0, 1) - 90;
            break;
        case 'MESSAGE':
            args[0].text = scene.data.texts[args[0].value].value;
            break;
        case 'MESSAGE_OBJ':
            args[1].text = scene.data.texts[args[1].value].value;
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
    if (prevCmd && prevCmd.name !== 'BREAK' && prevCmd.name !== 'SWITCH' && prevCmd.name !== 'OR_CASE' && (op.command === 'CASE' || op.command === 'OR_CASE' || op.command === 'DEFAULT')) {
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
