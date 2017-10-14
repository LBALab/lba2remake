const DebugData = {
    scope: {},
    selection: {
        actor: 0,
        point: -1,
        zone: -1
    },
    script: {
        life: {},
        move: {}
    },
    breakpoints: {
        life: {},
        move: {}
    },
    step: false
};

export default DebugData;

export function initSceneDebugData() {
    DebugData.selection = {
        actor: 0,
        point: -1,
        zone: -1
    };
    DebugData.script = {
        life: {},
        move: {}
    };
    DebugData.breakpoints = {
        life: {},
        move: {}
    };
}