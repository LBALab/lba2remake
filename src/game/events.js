import {each} from 'lodash';

export const GameEvents = {
    scene: {
        nextIsland: new GameEventTarget(),
        previousIsland: new GameEventTarget(),
        gotoIsland: new GameEventTarget(),
        sceneLoaded: new GameEventTarget(),
        gotoScene: new GameEventTarget()
    }
};

window.GameEvents = GameEvents;

function GameEventTarget() {
    const listeners = [];
    const eventTarget = function() {
        const args = arguments;
        each(listeners, callback => {
            callback.apply(null, args);
        })
    };
    eventTarget.addListener = (callback) => {
        listeners.push(callback);
    };
    eventTarget.removeListener = (callback) => {
        const idx = listeners.indexOf(callback);
        if (idx != -1) {
            listeners.splice(idx, 1);
        }
    };
    return eventTarget;
}
