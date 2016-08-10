import THREE from 'three';
import {GameEvents} from '../game/events';

const PI_4 = Math.PI / 4;

export function makeGamepadControls(heroPhysics) {
    const onDpadValueChanged = dpadValueChangeHandler.bind(null, heroPhysics);
    const onButtonPressed = buttonPressedHandler.bind(null, heroPhysics);
    window.addEventListener('dpadvaluechanged', onDpadValueChanged, false);
    window.addEventListener('gamepadbuttonpressed', onButtonPressed, false);
    return {
        dispose: () => {
            window.removeEventListener('dpadvaluechanged', onDpadValueChanged);
            window.removeEventListener('gamepadbuttonpressed', onButtonPressed);
        }
    }
}

function dpadValueChangeHandler(heroPhysics, {detail: {y}}) {
    heroPhysics.speed.z = -y * 0.45;
}

function buttonPressedHandler(heroPhysics, {detail: {name, isPressed}}) {
    if (isPressed) {
        switch (name) {
            case 'leftShoulder':
                rotateArroundY(heroPhysics.orientation, PI_4);
                break;
            case 'rightShoulder':
                rotateArroundY(heroPhysics.orientation, -PI_4);
                break;
            case 'buttonB':
                GameEvents.scene.nextIsland();
                break;
            case 'buttonX':
                GameEvents.scene.previousIsland();
                break;
            case 'buttonY':
                GameEvents.mode.switchMode();
                break;
            case 'leftTrigger':
                GameEvents.debug.switchStats();
                break;
        }
    }
}

const euler = new THREE.Euler();

function rotateArroundY(q, angle) {
    euler.setFromQuaternion(q, 'YXZ');
    euler.y = euler.y + angle;
    q.setFromEuler(euler);
}
