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
    saveSceneMetaData(sceneIndex);
}

export function getActorName(sceneIndex, actor) {
    if (actor === 0) {
        return 'Twinsen';
    } else if (actor === 1) {
        return 'MecaPinguin';
    } else if (sceneIndex in DebugData.metadata.scenes) {
        const sceneMetaData = DebugData.metadata.scenes[sceneIndex];
        if (sceneMetaData.actorNames && sceneMetaData.actorNames[actor]) {
            return sceneMetaData.actorNames[actor];
        }
    }
    return `Actor${actor}`;
}

export function loadSceneMetaData(sceneIndex, callback) {
    const request = new XMLHttpRequest();
    request.open('GET', `metadata/scene_${sceneIndex}.json`, true);

    request.onload = function() {
        if (this.status === 200) {
            try {
                DebugData.metadata.scenes[sceneIndex] = JSON.parse(request.response);
            } catch(e) {}
        }
        callback();
    };

    request.send(null);
}

function saveSceneMetaData(sceneIndex) {
    const request = new XMLHttpRequest();
    request.open('POST', `metadata/scene/${sceneIndex}`, true);
    request.onload = function() {
        console.log(`Saved scene ${sceneIndex} metadata`);
    };
    request.send(JSON.stringify(DebugData.metadata.scenes[sceneIndex]));
}