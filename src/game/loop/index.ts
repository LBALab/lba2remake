import {each} from 'lodash';
import * as THREE from 'three';
import {updateHero} from './hero';
import {updateActor} from './actors';
import {processPhysicsFrame} from './physics';
import {getRandom} from '../../utils/lba';
import DebugData from '../../ui/editor/DebugData';
import { updateExtra } from '../extras';
import { updateVRGUI } from '../../ui/vr/vrGUI';

const dbgClock = new THREE.Clock(false);
dbgClock.start();

export function mainGameLoop(params, game, clock, renderer, scene, controls, vrScene) {
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
                clock.elapsedTime += 0.05;
            }
            scene.scenery.update(game, scene, time);
            updateScene(params, game, scene, time);
            processPhysicsFrame(game, scene, time);
            each(scene.sideScenes, (sideScene) => {
                sideScene.firstFrame = scene.firstFrame;
                updateScene(params, game, sideScene, time);
                processPhysicsFrame(game, sideScene, time);
            });
            if (scene.firstFrame) {
                scene.camera.init(scene, game.controlsState);
            }
            scene.camera.update(scene, game.controlsState, time);
            renderer.render(scene);
            DebugData.step = false;
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
        }
        scene.firstFrame = false;
        delete DebugData.firstFrame;
    } else if (vrScene) {
        renderer.render(vrScene);
    }
    renderer.stats.end();
}

function updateScene(params, game, scene, time) {
    // playAmbience(game, scene, time);
    if (scene.firstFrame) {
        scene.sceneNode.updateMatrixWorld();
    }
    each(scene.actors, (actor) => {
        actor.wasHitBy = -1;
    });
    each(scene.actors, (actor) => {
        if (actor.isKilled)
            return;
        updateActor(params, game, scene, actor, time);
        if (scene.isActive) {
            if (actor.index === 0) {
                updateHero(game, scene, actor, time);
            }
        }
    });
    each(scene.extras, (extra) => {
        updateExtra(game, scene, extra, time);
    });
    if (scene.isActive && params.editor) {
        each(scene.points, (point) => {
            point.update(scene.camera);
        });
    }
    if (scene.vrGUI) {
        updateVRGUI(game, scene, scene.vrGUI);
    }
}

// eslint-disable-next-line no-unused-vars
function playAmbience(game, scene, time) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    let samplePlayed = 0;

    if (time.elapsed >= scene.data.ambience.sampleElapsedTime) {
        let currentAmb = getRandom(1, 4);
        currentAmb &= 3;
        for (let s = 0; s < 4; s += 1) {
            if (!(samplePlayed & (1 << currentAmb))) {
                samplePlayed |= (1 << currentAmb);
                if (samplePlayed === 15) {
                    samplePlayed = 0;
                }
                const sample = scene.data.ambience.samples[currentAmb];
                if (sample.ambience !== -1 && sample.repeat !== 0) {
                    soundFxSource.load(sample.ambience, () => {
                        soundFxSource.play(sample.frequency);
                    });

                    break;
                }
            }
            currentAmb += 1;
            currentAmb &= 3;
        }
        const {sampleMinDelay, sampleMinDelayRnd} = scene.data.ambience;
        scene.data.ambience.sampleElapsedTime =
            time.elapsed + (getRandom(sampleMinDelay, sampleMinDelayRnd) * 1000);
    }
    if (scene.data.ambience.sampleMinDelay < 0) {
        scene.data.ambience.sampleElapsedTime = time.elapsed + 200000;
    }
}
