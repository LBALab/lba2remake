export function makeVRControls(game: any) {
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
                game.controlsState.controlVector.set(gamepad.axes[0], -gamepad.axes[1]);
                game.controlsState.relativeToCam = true;
                game.controlsState.action = gamepad.buttons[0].pressed ? 1 : 0;
            }
        }
    };
}
