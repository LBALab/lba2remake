window.Gamepad = function() {
    
}

function __onvaluechanged(value) {
    window.dispatchEvent(new CustomEvent('dpadvaluechanged', {detail: value}));
}

function __ongamepadbutton(value) {
    window.dispatchEvent(new CustomEvent('gamepadbuttonpressed', {detail: value}));
}

function __ongamepadconnected(gamepad) {
    window.dispatchEvent(new CustomEvent('gamepadconnected', {detail: gamepad}));
}
