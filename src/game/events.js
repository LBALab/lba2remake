import {each} from 'lodash';

export const GameEvents = {
    Scene: {
        NextIsland: makeEventTarget(),
        PreviousIsland: makeEventTarget(),
        GotoIsland: makeEventTarget(),
        SceneLoaded: makeEventTarget()
    },
    Debug: {
        SwitchStats: makeEventTarget()
    }
};

function makeEventTarget() {
    const listeners = [];
    return {
        addListener: (callback) => {
            listeners.push(callback);
        },
        removeListener: (callback) => {
            const idx = listeners.indexOf(callback);
            if (idx != -1) {
                listeners.splice(idx, 1);
            }
        },
        trigger: function() {
            const args = arguments;
            each(listeners, callback => {
                callback.apply(null, args);
            })
        }
    }
}
