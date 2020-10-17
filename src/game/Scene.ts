import * as THREE from 'three';
import {
    map,
    filter,
    each
} from 'lodash';

import islandSceneMapping from '../island/data/sceneMapping';
import { loadIslandScenery, getEnvInfo } from '../island';
import { loadIsometricScenery } from '../iso';
import { loadActor, DirMode } from './actors';
import { loadPoint } from './points';
import { loadZone } from './zones';
import { loadScripts } from '../scripting';
import { killActor } from './scripting';
import { sBind } from '../utils';
import { get3DCamera } from '../cameras/3d';
import { getIsometricCamera } from '../cameras/iso';
import { getIso3DCamera } from '../cameras/iso3d';
import { getVR3DCamera } from '../cameras/vr/vr3d';
import { getVRIsoCamera } from '../cameras/vr/vrIso';
import { createFPSCounter } from '../ui/vr/vrFPS';
import { createVRGUI } from '../ui/vr/vrGUI';
import { angleToRad, WORLD_SIZE } from '../utils/lba';
import { getVrFirstPersonCamera } from '../cameras/vr/vrFirstPerson';
import { getScene } from '../resources';
import { getParams } from '../params';
import DebugData, { loadSceneMetaData } from '../ui/editor/DebugData';

export async function loadScene(sceneManager, game, renderer, sceneMap, index, parent) {
    const sceneData = await getScene(index);
    const params = getParams();
    const modelReplacements = await loadModelReplacements();
    if (params.editor) {
        await loadSceneMetaData(index);
    }
    const indexInfo = sceneMap[index];
    let islandName;
    if (indexInfo.isIsland) {
        islandName = islandSceneMapping[index].island;
        if (game.getState().flags.quest[152] && islandName === 'CITABAU') {
            islandName = 'CITADEL';
        }
    }
    const envInfo = indexInfo.isIsland ? getEnvInfo(islandName) : {
        skyColor: [0, 0, 0],
        fogDensity: 0,
    };
    const is3DCam = indexInfo.isIsland || renderer.vr || params.iso3d;
    const actors = await Promise.all(map(
        sceneData.actors,
        actor => loadActor(
            game,
            is3DCam,
            envInfo,
            sceneData.ambience,
            actor,
            parent,
            modelReplacements
        )
    ));
    const points = map(sceneData.points, props => loadPoint(props));
    const zones = map(sceneData.zones, props => loadZone(props, is3DCam, params.editor));

    let scenery = null;
    let threeScene = null;
    let camera = null;
    let vrGUI = null;
    if (!parent) {
        threeScene = new THREE.Scene();
        threeScene.matrixAutoUpdate = false;
        makeLight(threeScene, sceneData.ambience);
        if (indexInfo.isIsland) {
            scenery = await loadIslandScenery(params, islandName, sceneData.ambience);
            threeScene.name = '3D_scene';
            if (renderer.vr) {
                if (game.controlsState.firstPerson) {
                    camera = getVrFirstPersonCamera(renderer);
                } else {
                    camera = getVR3DCamera(renderer);
                }
            } else {
                camera = get3DCamera();
            }
        } else {
            const useReplacements = renderer.vr || params.iso3d || params.isoCam3d;
            scenery = await loadIsometricScenery(
                indexInfo.index,
                sceneData.ambience,
                useReplacements,
                actors.length
            );
            threeScene.name = 'iso_scene';
            if (renderer.vr) {
                if (game.controlsState.firstPerson) {
                    camera = getVrFirstPersonCamera(renderer);
                } else {
                    camera = getVRIsoCamera(renderer);
                }
            } else if (params.iso3d || params.isoCam3d) {
                camera = params.isoCam3d
                    ? get3DCamera()
                    : getIso3DCamera();
            } else {
                camera = getIsometricCamera();
            }
        }
        if (camera.controlNode) {
            threeScene.add(camera.controlNode);
            if (renderer.vr) {
                const fps = createFPSCounter(renderer);
                fps.visible = false;
                camera.controlNode.add(fps);
                vrGUI = createVRGUI();
                camera.controlNode.add(vrGUI);
            }
        }
        threeScene.add(scenery.threeObject);
    } else {
        scenery = parent.scenery;
        threeScene = parent.threeScene;
        camera = parent.camera;
    }

    const sceneNode = loadSceneNode(
        index,
        indexInfo,
        scenery,
        actors,
        zones,
        points,
        params.editor
    );
    threeScene.add(sceneNode);
    const scene = {
        index,
        data: sceneData,
        sceneMap,
        isIsland: indexInfo.isIsland,
        camera,
        threeScene,
        sceneNode,
        scenery,
        parentScene: parent,
        sideScenes: null,
        actors,
        points,
        zones,
        extras: [],
        isActive: false,
        firstFrame: false,
        variables: null,
        section: null,
        usedVarGames: null,
        zoneState: { listener: null, ended: false },
        goto: sBind(sceneManager.goto, sceneManager),
        vr: renderer.vr,
        vrGUI,
        is3DCam,
        savedState: null,
        envInfo,

        reset() {
            if (params.editor) {
                game.getState().load(scene.savedState, scene.actors[0]);
                game.setUiState({ text: null, cinema: false });
                scene.variables = createSceneVariables(scene);
                each(this.actors, (actor) => {
                    actor.reset(this);
                });
                scene.firstFrame = true;
                if (game.isPaused()) {
                    DebugData.step = true;
                }
            }
        },

        resetCamera(newParams) {
            if (!scene.isIsland) {
                if (!renderer.vr) {
                    if (newParams.iso3d) {
                        scene.camera = getIso3DCamera();
                    } else {
                        scene.camera = getIsometricCamera();
                    }
                }
                scene.camera.init(scene, game.controlsState);
            }
        },

        removeMesh(threeObject) {
            sceneNode.remove(threeObject);
        },

        addMesh(threeObject) {
            sceneNode.add(threeObject);
        }
    };
    if (scene.isIsland) {
        scene.section = islandSceneMapping[index].section;
        if (!parent) {
            scene.sideScenes = await loadSideScenes(
                sceneManager,
                game,
                renderer,
                sceneMap,
                index,
                scene
            );
        }
    }
    loadScripts(game, scene);
    scene.variables = createSceneVariables(scene);
    scene.usedVarGames = findUsedVarGames(scene);
    // Kill twinsen if side scene
    if (parent) {
        killActor(scene.actors[0]);
    }
    return scene;
}

function loadSceneNode(index, indexInfo, scenery, actors, zones, points, editor) {
    const sceneNode = indexInfo.isIsland ? new THREE.Object3D() : new THREE.Scene();
    sceneNode.name = `scene_${index}`;
    sceneNode.matrixAutoUpdate = false;
    if (indexInfo.isIsland) {
        const sectionIdx = islandSceneMapping[index].section;
        const section = scenery.sections[sectionIdx];
        sceneNode.position.x = section.x * WORLD_SIZE * 2;
        sceneNode.position.z = section.z * WORLD_SIZE * 2;
        sceneNode.updateMatrix();
    }
    const addToSceneNode = (obj) => {
        if (obj.threeObject !== null) { // because of the sprite actors
            sceneNode.add(obj.threeObject);
        }
    };

    each(actors, addToSceneNode);
    if (editor) {
        each(zones, addToSceneNode);
        each(points, addToSceneNode);
    }
    return sceneNode;
}

async function loadSideScenes(sceneManager,
                                game,
                                renderer,
                                sceneMap,
                                index,
                                parent) {
    const sideIndices = filter(
        map(sceneMap, (indexInfo, sideIndex) => {
            if (sideIndex !== index
                && indexInfo.isIsland
                && sideIndex in islandSceneMapping) {
                const sideMapping = islandSceneMapping[sideIndex];
                const mainMapping = islandSceneMapping[index];
                if (sideMapping.island === mainMapping.island
                    && sideMapping.variant === mainMapping.variant) {
                    return sideIndex;
                }
            }
            return null;
        }),
        id => id !== null
    );

    const sideScenes = await Promise.all(map(
        sideIndices,
        async sideIndex => loadScene(
            sceneManager,
            game,
            renderer,
            sceneMap,
            sideIndex,
            parent
        )
    ));
    const sideScenesMap = {};
    each(sideScenes, (sideScene: any) => {
        sideScenesMap[sideScene.index] = sideScene;
    });
    return sideScenesMap;
}

function createSceneVariables(scene) {
    let maxVarCubeIndex = -1;
    each(scene.actors, (actor) => {
        const commands = actor.scripts.life.commands;
        each(commands, (cmd) => {
            if (cmd.op.command === 'SET_VAR_CUBE') {
                maxVarCubeIndex = Math.max(cmd.args[0].value, maxVarCubeIndex);
            }
            if (cmd.condition && cmd.condition.op.command === 'VAR_CUBE') {
                maxVarCubeIndex = Math.max(cmd.condition.param.value, maxVarCubeIndex);
            }
        });
    });
    const variables = [];
    for (let i = 0; i <= maxVarCubeIndex; i += 1) {
        variables.push(0);
    }
    return variables;
}

let modelReplacementsCache = null;

async function loadModelReplacements() {
    if (!modelReplacementsCache) {
        const file = await fetch('metadata/model_replacements.json');
        modelReplacementsCache = file.json();
    }
    return modelReplacementsCache;
}

function findUsedVarGames(scene) {
    const usedVars = [];
    each(scene.actors, (actor) => {
        const commands = actor.scripts.life.commands;
        each(commands, (cmd) => {
            let value = null;
            if (cmd.op.command === 'SET_VAR_GAME') {
                value = cmd.args[0].value;
            } else if (cmd.condition && cmd.condition.op.command === 'VAR_GAME') {
                value = cmd.condition.param.value;
            }
            if (value !== null && usedVars.indexOf(value) === -1) {
                usedVars.push(value);
            }
        });
    });
    usedVars.sort((a, b) => a - b);
    return usedVars;
}

export function addExtraToScene(scene, extra) {
    scene.extras.push(extra);
    if (extra.threeObject !== null) { // because of the sprite actors
        scene.sceneNode.add(extra.threeObject);
    }
}

export function removeExtraFromScene(scene, extra) {
    const idx = scene.extras.indexOf(extra);
    if (idx !== -1) {
        scene.extras.splice(idx, 1);
    }
    if (extra.threeObject !== null) { // because of the sprite actors
        scene.sceneNode.remove(extra.threeObject);
    }
}

export function relocateHero(hero, newHero, newScene, teleport) {
    const globalPos = new THREE.Vector3();
    globalPos.applyMatrix4(hero.threeObject.matrixWorld);
    newScene.sceneNode.remove(newHero.threeObject);
    newHero.threeObject = hero.threeObject;
    newHero.threeObject.position.copy(globalPos);
    newHero.threeObject.position.sub(newScene.sceneNode.position);
    newHero.model = hero.model;
    newHero.label = hero.label;
    newHero.refreshLabel = hero.refreshLabel;
    newScene.sceneNode.add(newHero.threeObject);

    newHero.props.dirMode = hero.props.dirMode;
    newHero.props.entityIndex = hero.props.entityIndex;
    newHero.props.bodyIndex = hero.props.bodyIndex;
    newHero.props.animIndex = hero.props.animIndex;

    if (teleport) {
        newHero.props.dirMode = DirMode.MANUAL;

        const {pos, angle} = newHero.props;
        const position = new THREE.Vector3(pos[0], pos[1], pos[2]);
        const angleRad = angleToRad(angle);
        const euler = new THREE.Euler(0, angleRad, 0, 'XZY');

        newHero.physics.position.copy(position);
        newHero.physics.orientation.setFromEuler(euler);
        newHero.physics.temp.destination.copy(position);
        newHero.physics.temp.position.copy(position);
        newHero.physics.temp.angle = angleRad;
        newHero.physics.temp.destAngle = angleRad;

        newHero.threeObject.position.set(pos[0], pos[1], pos[2]);
        newHero.threeObject.quaternion.copy(newHero.physics.orientation);
    } else {
        newHero.physics.position.copy(newHero.threeObject.position);
        newHero.physics.orientation.copy(hero.physics.orientation);
        newHero.physics.temp.angle = hero.physics.temp.angle;
        newHero.physics.temp.position.copy(hero.physics.temp.position);
        newHero.physics.temp.destination.copy(hero.physics.temp.destination);
    }

    newHero.animState = hero.animState;
    Object.keys(hero.props.runtimeFlags).forEach((k) => {
        newHero.props.runtimeFlags[k] = hero.props.runtimeFlags[k];
    });
    hero.animState = null;
    hero.model = null;
    hero.threeObject = null;
}

function makeLight(threeScene, ambience) {
    const light = new THREE.DirectionalLight();
    light.name = 'DirectionalLight';
    light.position.set(-1000, 0, 0);
    light.position.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        -(ambience.lightingAlpha * 2 * Math.PI) / 0x1000
    );
    light.position.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -(ambience.lightingBeta * 2 * Math.PI) / 0x1000
    );
    light.updateMatrix();
    light.matrixAutoUpdate = false;
    threeScene.add(light);
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.08);
    ambient.name = 'AmbientLight';
    threeScene.add(ambient);
}
