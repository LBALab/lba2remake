import * as THREE from 'three';
import {
    map,
    filter,
    each
} from 'lodash';

import islandSceneMapping from '../island/data/sceneMapping';
import { loadActor, DirMode } from './actors';
import { loadPoint } from './points';
import { loadZone } from './zones';
import { loadScripts } from '../scripting';
import { killActor } from './scripting';
import { createFPSCounter } from '../ui/vr/vrFPS';
import { createVRGUI } from '../ui/vr/vrGUI';
import { angleToRad, WORLD_SIZE } from '../utils/lba';
import { getScene, getSceneMap } from '../resources';
import { getParams } from '../params';
import DebugData, { loadSceneMetaData } from '../ui/editor/DebugData';
import { Game } from './Game';
import Renderer from '../renderer';
import { selectCamera } from './scene/camera';
import { loadScenery } from './scene/scenery';
import { SceneManager } from './SceneManager';

interface Entities {
    readonly actors: any[];
    readonly zones: any[];
    readonly points: any[];
}

export class Scene {
    readonly index: number;
    readonly data: any;
    readonly game: Game;
    readonly renderer: Renderer;
    readonly camera: any;
    readonly actors: any[];
    readonly zones: any[];
    readonly points: any[];
    readonly sceneNode: THREE.Object3D;
    vrGUI?: THREE.Object3D;
    readonly threeScene: THREE.Scene;
    private savedState: string;
    private sceneManager: SceneManager;
    firstFrame: boolean;
    variables: number[];
    usedVarGames: number[];
    readonly scenery: any;
    sideScenes: Map<number, Scene>;
    extras: any[];
    isActive: boolean;
    zoneState: {
        listener?: Function;
        ended: boolean;
    };
    vr: boolean;
    is3DCam: boolean;

    static async load(
        game: Game,
        renderer: Renderer,
        sceneManager: SceneManager,
        index: number,
        parent: Scene = null
    ): Promise<Scene> {
        const data = await getScene(index);
        const params = getParams();
        const modelReplacements = await loadModelReplacements();
        if (params.editor) {
            await loadSceneMetaData(index);
        }
        const scenery = parent
            ? parent.scenery
            : await loadScenery(game, renderer, data);
        const is3DCam = data.isIsland || renderer.vr || params.iso3d;
        const entities = {
            actors: await Promise.all(map(
                data.actors,
                actor => loadActor(
                    game,
                    is3DCam,
                    scenery,
                    data.ambience,
                    actor,
                    !!parent,
                    modelReplacements
                )
            )),
            zones: map(data.zones, props => loadZone(props, is3DCam, params.editor)),
            points: map(data.points, props => loadPoint(props)),
        };

        const scene = new Scene(game, renderer, sceneManager, data, scenery, entities, parent);

        if (data.isIsland && !parent) {
            scene.sideScenes = await Scene.loadSideScenes(
                game,
                renderer,
                sceneManager,
                index,
                scene
            );
        }
        return scene;
    }

    private static async loadSideScenes(
        game: Game,
        renderer: Renderer,
        sceneManager: SceneManager,
        index: number,
        parent: Scene
    ) {
        const sceneMap = await getSceneMap();
        const sideIndices = filter(
            map(sceneMap, (indexInfo, sideIndex: number) => {
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
            async sideIndex => Scene.load(game, renderer, sceneManager, sideIndex, parent)
        ));
        const sideScenesMap = new Map<number, Scene>();
        each(sideScenes, (sideScene: Scene) => {
            sideScenesMap[sideScene.index] = sideScene;
        });
        return sideScenesMap;
    }

    private constructor(
        game: Game,
        renderer: Renderer,
        sceneManager: SceneManager,
        data,
        scenery: any,
        entities: Entities,
        parent: Scene
    ) {
        const params = getParams();
        this.index = data.index;
        this.game = game;
        this.renderer = renderer;
        this.data = data;
        this.actors = entities.actors;
        this.zones = entities.zones;
        this.points = entities.points;
        this.isActive = false;

        loadScripts(game, this);

        this.variables = createSceneVariables(entities.actors);
        this.usedVarGames = findUsedVarGames(this);
        this.firstFrame = false;
        this.zoneState = { listener: null, ended: false };
        this.vr = renderer.vr;
        this.is3DCam = data.isIsland || renderer.vr || params.iso3d;
        this.savedState = null;
        this.sceneManager = sceneManager;
        this.extras = [];

        if (parent) {
            this.threeScene = parent.threeScene;
            this.camera = parent.camera;
            this.scenery = parent.scenery;
            killActor(this.actors[0]);
        } else {
            this.threeScene = new THREE.Scene();
            this.threeScene.matrixAutoUpdate = false;
            this.threeScene.add(scenery.threeObject);
            this.threeScene.name = data.isIsland ? 'scene_island' : 'scene_iso';
            this.camera = selectCamera(game, renderer, data.isIsland);
            if (this.camera.controlNode) {
                this.threeScene.add(this.camera.controlNode);
                if (renderer.vr) {
                    this.addVRGUI();
                }
            }
            this.addLight();
            this.scenery = scenery;
        }

        this.sceneNode = this.loadSceneNode();
        this.sceneManager = sceneManager;
    }

    private addVRGUI() {
        const fps = createFPSCounter(this.renderer);
        fps.visible = false;
        this.camera.controlNode.add(fps);
        this.vrGUI = createVRGUI();
        this.camera.controlNode.add(this.vrGUI);
    }

    private addLight() {
        const { ambience } = this.data;
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
        this.threeScene.add(light);
        const ambient = new THREE.AmbientLight(0xFFFFFF, 0.08);
        ambient.name = 'AmbientLight';
        this.threeScene.add(ambient);
    }

    private loadSceneNode() {
        const { editor } = getParams();
        const sceneNode = this.data.isIsland ? new THREE.Object3D() : new THREE.Scene();
        sceneNode.name = `scene_${this.data.index}`;
        sceneNode.matrixAutoUpdate = false;
        if (this.data.isIsland) {
            const sectionIdx = islandSceneMapping[this.data.index].section;
            const section = this.scenery.sections[sectionIdx];
            sceneNode.position.x = section.x * WORLD_SIZE * 2;
            sceneNode.position.z = section.z * WORLD_SIZE * 2;
            sceneNode.updateMatrix();
        }
        const addToSceneNode = (obj) => {
            if (obj.threeObject !== null) { // because of the sprite actors
                sceneNode.add(obj.threeObject);
            }
        };

        each(this.actors, addToSceneNode);
        if (editor) {
            each(this.zones, addToSceneNode);
            each(this.points, addToSceneNode);
        }
        this.threeScene.add(sceneNode);
        return sceneNode;
    }

    async goto(index, force = false, wasPaused = false, teleport = true) {
        return this.sceneManager.goto(index, force, wasPaused, teleport);
    }

    reset() {
        const params = getParams();
        if (params.editor) {
            this.game.getState().load(this.savedState, this.actors[0]);
            this.game.setUiState({ text: null, cinema: false });
            this.variables = createSceneVariables(this.actors);
            each(this.actors, (actor) => {
                actor.reset(this);
            });
            this.firstFrame = true;
            if (this.game.isPaused()) {
                DebugData.step = true;
            }
        }
    }

    removeMesh(threeObject) {
        this.sceneNode.remove(threeObject);
    }

    addMesh(threeObject) {
        this.sceneNode.add(threeObject);
    }
}

function createSceneVariables(actors) {
    let maxVarCubeIndex = -1;
    each(actors, (actor) => {
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
