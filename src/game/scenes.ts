import * as THREE from 'three';
import {
    map,
    filter,
    each
} from 'lodash';

import islandSceneMapping from '../island/data/sceneMapping';
import { loadIslandScenery, getEnvInfo } from '../island';
import { loadIsometricScenery } from '../iso';
import { loadSceneData } from '../scene';
import { loadSceneMapData } from '../scene/map';
import { loadActor, DirMode } from './actors';
import { loadPoint } from './points';
import { loadZone } from './zones';
import { loadScripts } from '../scripting';
import { killActor, reviveActor } from './scripting';
import DebugData, * as DBG from '../ui/editor/DebugData';
import { sBind } from '../utils';
import { get3DCamera } from '../cameras/3d';
import { getIsometricCamera } from '../cameras/iso';
import { getIso3DCamera } from '../cameras/iso3d';
import { getVR3DCamera } from '../cameras/vr/vr3d';
import { getVRIsoCamera } from '../cameras/vr/vrIso';
import { createFPSCounter } from '../ui/vr/vrFPS';
import { createVRGUI } from '../ui/vr/vrGUI';
import { angleToRad, WORLD_SIZE } from '../utils/lba';
import { getLanguageConfig } from '../lang';
import { makePure } from '../utils/debug';
import { getVrFirstPersonCamera } from '../cameras/vr/vrFirstPerson';

declare global {
    var ga: Function;
}

const {initSceneDebugData, loadSceneMetaData} = DBG;

export async function createSceneManager(params, game, renderer, hideMenu: Function) {
    let scene = null;
    const sceneManager = {
        sceneMap: null,

        getScene() {
            return scene;
        },

        hideMenuAndGoto(index, wasPaused = false) {
            hideMenu(wasPaused);
            return this.goto(index, false, wasPaused);
        },

        async goto(index, force = false, wasPaused = false, teleport = true) {
            if ((!force && scene && index === scene.index) || game.isLoading())
                return scene;

            ga('set', 'page', `/scene/${index}`);
            ga('send', 'pageview');

            if (scene)
                scene.isActive = false;

            game.setUiState({ text: null, cinema: false });
            game.controlsState.skipListener = null;

            const hash = window.location.hash;
            if (hash.match(/scene=\d+/)) {
                window.location.hash = hash.replace(/scene=\d+/, `scene=${index}`);
            }

            const musicSource = game.getAudioManager().getMusicSource();
            const menuMusicSource = game.getAudioMenuManager().getMusicSource();
            if (scene && scene.sideScenes && index in scene.sideScenes) {
                killActor(scene.actors[0]);
                const sideScene = scene.sideScenes[index];
                sideScene.sideScenes = scene.sideScenes;
                delete sideScene.sideScenes[index];
                delete scene.sideScenes;
                sideScene.sideScenes[scene.index] = scene;
                relocateHero(scene.actors[0], sideScene.actors[0], sideScene, teleport);
                scene = sideScene;
                reviveActor(scene.actors[0], game); // Awake twinsen
                scene.isActive = true;
                if (!musicSource.isPlaying) {
                    musicSource.load(scene.data.ambience.musicIndex, () => {
                        menuMusicSource.stop(); // if menu music is start playing during load
                        musicSource.play();
                    });
                }
                initSceneDebugData();
                return scene;
            }
            game.loading(index);
            renderer.setClearColor(0x000000);
            if (!this.sceneMap) {
                this.sceneMap = await loadSceneMapData();
            }
            scene = await loadScene(
                this,
                params,
                game,
                renderer,
                this.sceneMap,
                index,
                null
            );
            renderer.applySceneryProps(scene.scenery.props);
            scene.isActive = true;
            if (!musicSource.isPlaying) {
                musicSource.load(scene.data.ambience.musicIndex, () => {
                    // if menu music has started playing during load
                    menuMusicSource.stop();
                    musicSource.play();
                });
            }
            initSceneDebugData();
            scene.firstFrame = true;
            if (params.editor) {
                scene.savedState = game.getState().save();
            }
            game.loaded(`scene #${index}`, wasPaused);
            return scene;
        },

        async next() {
            if (scene) {
                const nextIdx = (scene.index + 1) % this.sceneMap.length;
                return this.goto(nextIdx);
            }
        },

        async previous() {
            if (scene) {
                const previousIdx = scene.index > 0 ? scene.index - 1 : this.sceneMap.length - 1;
                return this.goto(previousIdx);
            }
        },

        unloadScene() {
            scene = null;
        }
    };

    makePure(sceneManager.getScene);

    // sceneMap = await loadSceneMapData();

    return sceneManager;
}

async function loadScene(sceneManager, params, game, renderer, sceneMap, index, parent) {
    const sceneData = await loadSceneData(getLanguageConfig().language, index);
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
        actor => loadActor(game, params, is3DCam, envInfo, sceneData.ambience, actor, parent)
    ));
    const points = map(sceneData.points, props => loadPoint(props));
    const zones = map(sceneData.zones, props => loadZone(props, is3DCam));

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
                useReplacements
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

        reset() {
            if (params.editor) {
                game.getState().load(scene.savedState);
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
                params,
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
                                params,
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
            params,
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

function relocateHero(hero, newHero, newScene, teleport) {
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
