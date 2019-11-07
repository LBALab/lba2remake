const gamepadState = {};

export const getButtonState = (gamepad, button) => gamepadState[gamepad.id].buttons[button];

export function updateState(gamepad) {
    if (gamepad.id in gamepadState) {
        const state = gamepadState[gamepad.id];
        gamepad.buttons.forEach((button, idx) => {
            const bState = state.buttons[idx];
            bState.touched = button.touched;
            bState.tapped = false;
            bState.longPressed = false;
            if (button.pressed) {
                if (bState.pressed === false) {
                    bState.pressed = true;
                    bState._pressStart = Date.now();
                }
            } else if (bState.pressed) {
                if (Date.now() - bState._pressStart < 300) {
                    bState.tapped = true;
                } else {
                    bState.longPressed = true;
                }
                bState.pressed = false;
            }
        });
    } else {
        gamepadState[gamepad.id] = {
            buttons: gamepad.buttons.map(button => ({
                pressed: button.pressed,
                touched: button.touched,
                tapped: false,
                longPressed: false,
                _pressStart: button.pressed ? Date.now() : 0
            }))
        };
    }
}

export function getGamepadIndex(gamepad, idx) {
    if (!gamepad.hand)
        return idx;
    return gamepad.hand === 'right' ? 0 : 1;
}
