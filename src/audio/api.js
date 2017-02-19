
export function createAudioContext() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext; // needed for Safari
    context = new AudioContext();
}

