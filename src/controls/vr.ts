export function makeVRControls(game: any) {
    let pressed = false;
    let pressTS = null;
    return {
        type: 'vr',
        dispose: () => {},
        update: () => {
            const gamepads = navigator.getGamepads();
            let gamepad = null;
            for (let i = 0; i < gamepads.length; i += 1) {
                gamepad = gamepads[i];
                // The array may contain undefined gamepads, so check for that as
                // well as a non-null pose. VR clicker devices such as the Carboard
                // touch handler for Daydream have a displayId but no pose.
                if (gamepad && (gamepad.pose || gamepad.displayId)) {
                    break;
                } else {
                    gamepad = null;
                }
            }
            if (gamepad) {
                //
                // Using following code as documentation:
                // https://github.com/stewdio/THREE.VRController/blob/master/VRController.js
                //
                if (gamepad.id === 'Oculus Go Controller') {
                    game.controlsState.action = 0;
                    if (gamepad.buttons[0].pressed) {
                        if (pressed === false) {
                            pressed = true;
                            pressTS = Date.now();
                        }
                        game.controlsState.controlVector.set(0, 0);
                    } else {
                        game.controlsState.controlVector.set(gamepad.axes[0], -gamepad.axes[1]);
                        if (pressed) {
                            if (game.controlsState.skipListener) {
                                game.controlsState.skipListener();
                            } else {
                                if (Date.now() - pressTS > 300) {
                                    game.getState().hero.behaviour =
                                        (game.getState().hero.behaviour + 1) % 4;
                                } else {
                                    game.controlsState.action = 1;
                                }
                            }
                            pressed = false;
                        }
                    }
                    game.controlsState.relativeToCam = true;
                }
            }
        }
    };
}
