import {updateState} from './vr/utils';
import OculusTouch from './vr/OculusTouch';
import OculusGo from './vr/OculusGo';

const handlers = [
    new OculusTouch(),
    new OculusGo()
];

//
// Using following code as documentation for VR gamepad button mappings:
// https://github.com/stewdio/THREE.VRController/blob/master/VRController.js
//
export function makeVRControls(sceneManager: any, game: any) {
    const ctx = {sceneManager, game};
    return {
        type: 'vr',
        dispose: () => {},
        update: () => {
            const gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; i += 1) {
                const gamepad = gamepads[i];
                if (gamepad) {
                    updateState(gamepad);
                    for (let j = 0; j < handlers.length; j += 1) {
                        const handler = handlers[j];
                        if (handler.supports(gamepad.id)) {
                            handler.handleGamepad(gamepad, i, ctx);
                        }
                    }
                }
            }
            for (let j = 0; j < handlers.length; j += 1) {
                handlers[j].update(ctx);
            }
        }
    };
}
