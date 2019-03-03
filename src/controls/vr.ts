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
                const x = -gamepad.axes[0];
                const y = -gamepad.axes[1];
                if (Math.abs(x) < 0.8) {
                    game.controlsState.heroSpeed = Math.sign(y);
                } else {
                    game.controlsState.heroSpeed = 0;
                }
                game.controlsState.heroRotationSpeed = x;
                game.controlsState.action = gamepad.buttons[0].pressed ? 1 : 0;
            }
        }
    };
}
