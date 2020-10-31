import {each, first} from 'lodash';
import * as THREE from 'three';
import {updateHero} from './hero';
import {updateActor} from './actors';
import {processPhysicsFrame} from './physics';
import DebugData from '../../ui/editor/DebugData';
import { updateExtra } from '../extras';
import { updateVRGUI } from '../../ui/vr/vrGUI';
import { getRandom } from '../../utils/lba';
import { getParams, Params } from '../../params';
import Game from '../Game';
import Renderer from '../../renderer';
import Scene from '../Scene';
import { Time } from '../../datatypes';

const dbgClock = new THREE.Clock(false);
dbgClock.start();

const emptyVRScene = {
    threeScene: new THREE.Scene(),
    camera: {
        resize: () => {},
        threeCamera: new THREE.PerspectiveCamera()
    }
};

export function mainGameLoop(
    game: Game,
    renderer: Renderer,
    scene: Scene,
    controls: any[],
    vrScene = null
) {
    const params = getParams();
    const time = game.getTime();
    const uiState = game.getUiState();

    renderer.stats.begin();
    each(controls, ctrl => ctrl.update && ctrl.update());
    if (scene && !uiState.showMenu && !uiState.video) {
        const step = game.isPaused() && DebugData.step;
        if (!game.isPaused() || step) {
            if (step) {
                time.delta = 0.05;
                time.elapsed += 0.05;
                game.clock.elapsedTime += 0.05;
            }
            game.executePreloopFunctions();

            scene.scenery.update(game, scene, time);
            playAmbience(game, scene, time);
            updateScene(params, game, scene, time);
            processPhysicsFrame(game, scene, time);
            if (scene.sideScenes) {
                for (const sideScene of scene.sideScenes.values()) {
                    sideScene.firstFrame = scene.firstFrame;
                    updateScene(params, game, sideScene, time);
                    processPhysicsFrame(game, sideScene, time);
                }
            }
            if (scene.firstFrame) {
                scene.camera.init(scene, game.controlsState);
            }
            scene.camera.update(scene, game.controlsState, time);
            renderer.render(scene);
            DebugData.step = false;

            game.executePostloopFunctions();
        } else if (game.controlsState.freeCamera || DebugData.firstFrame) {
            const dbgTime = {
                delta: Math.min(dbgClock.getDelta(), 0.05),
                elapsed: dbgClock.getElapsedTime()
            };
            if (scene.firstFrame) {
                scene.camera.init(scene, game.controlsState);
            }
            scene.camera.update(scene, game.controlsState, dbgTime);
            renderer.render(scene);
        } else if (renderer.vr) {
            renderer.render(emptyVRScene);
        }
        scene.firstFrame = false;
        delete DebugData.firstFrame;
    } else if (vrScene) {
        renderer.render(vrScene);
    }
    renderer.stats.end();
}

function updateScene(params: Params, game: Game, scene: Scene, time: Time) {
    if (scene.firstFrame) {
        scene.sceneNode.updateMatrixWorld();
    }
    for (const actor of scene.actors) {
        if (actor.state.wasHitBy === -1) {
            continue;
        }
        // We allow wasHitBy to persist a second frame update because it is set
        // asynchronously (potentially outside of the game loop). This ensures
        // it's correctly read by the life scripts.
        if (actor.state.hasSeenHit) {
            actor.state.wasHitBy = -1;
            actor.state.hasSeenHit = false;
        } else {
            actor.state.hasSeenHit = true;
        }
    }
    for (const actor of scene.actors) {
        if (actor.state.isDead)
            continue;
        updateActor(params, game, scene, actor, time);
        if (scene.isActive) {
            if (actor.index === 0) {
                updateHero(game, scene, actor, time);
            }
        }
    }
    if (scene.extras) {
        for (const extra of scene.extras) {
            updateExtra(game, scene, extra, time);
        }
    }
    if (scene.isActive && params.editor) {
        for (const point of scene.points) {
            point.update(scene.camera);
        }
    }
    if (scene.vrGUI) {
        updateVRGUI(game, scene, scene.vrGUI);
    }
    if (scene.isActive && game.controlsState.firstPerson) {
        const hero = first(scene.actors) as any;
        if (hero && hero.threeObject) {
            hero.threeObject.visible = false;
        }
    }
}

function playAmbience(game: Game, scene: Scene, time: Time) {
    let samplePlayed = 0;
    const audio = game.getAudioManager();

    if (time.elapsed >= scene.props.ambience.sampleElapsedTime) {
        let currentAmb = getRandom(1, 4);
        currentAmb &= 3;
        for (let s = 0; s < 4; s += 1) {
            if (!(samplePlayed & (1 << currentAmb))) {
                samplePlayed |= (1 << currentAmb);
                if (samplePlayed === 15) {
                    samplePlayed = 0;
                }
                const sample = scene.props.ambience.samples[currentAmb];
                if (sample.ambience !== -1 && sample.repeat !== 0) {
                    if (!audio.isPlayingSample(sample.ambience)) {
                        audio.playSample(sample.ambience, sample.frequency);
                    }
                    break;
                }
            }
            currentAmb += 1;
            currentAmb &= 3;
        }
        const { sampleMinDelay, sampleMinDelayRnd } = scene.props.ambience;
        scene.props.ambience.sampleElapsedTime =
            time.elapsed + (getRandom(0, sampleMinDelayRnd) + sampleMinDelay);
    }
    if (scene.props.ambience.sampleMinDelay < 0) {
        scene.props.ambience.sampleElapsedTime = time.elapsed + 200000;
    }
}
