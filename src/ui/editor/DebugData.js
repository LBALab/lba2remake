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
    metadata: {
        scenes: {}
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

export function renameActor(sceneIndex, actor, name) {
    const scenes = DebugData.metadata.scenes;
    if (!(sceneIndex in scenes)) {
        scenes[sceneIndex] = {};
    }
    if (!('actorNames' in scenes[sceneIndex])) {
        scenes[sceneIndex].actorNames = [];
    }
    scenes[sceneIndex].actorNames[actor] = name;
}

export function getActorName(sceneIndex, actor) {
    if (actor === 0) {
        return 'Twinsen';
    }
    if (sceneIndex in DebugData.metadata.scenes) {
        const sceneMetaData = DebugData.metadata.scenes[sceneIndex];
        if (sceneMetaData.actorNames && sceneMetaData.actorNames[actor]) {
            return sceneMetaData.actorNames[actor];
        }
    }
    return `Actor${actor}`;
}