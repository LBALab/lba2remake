import {each} from 'lodash';
import {updateHero} from './hero';
import {updateActor} from './actors';
import {processPhysicsFrame} from './physics';
import {processCameraMovement} from './cameras';
import {getRandom} from '../../utils/lba';
import DebugData from '../../ui/editor/DebugData';

export function mainGameLoop(params, game, clock, renderer, scene, controls) {
    const time = {
        delta: Math.min(clock.getDelta(), 0.05),
        elapsed: clock.getElapsedTime()
    };

    const debugScope = {
        params,
        game,
        clock,
        renderer,
        scene
    };

    renderer.stats.begin();
    if (scene) {
        each(controls, ctrl => ctrl.update && ctrl.update());
        const step = game.isPaused() && DebugData.step;
        if (!game.isPaused() || step) {
            if (step) {
                time.delta = 0.05;
                time.elapsed += 0.05;
                clock.elapsedTime += 0.05;
            }
            scene.scenery.update(game, scene, time);
            updateScene(game, scene, time);
            processPhysicsFrame(game, scene, time);
            each(scene.sideScenes, (sideScene) => {
                updateScene(game, sideScene, time);
                processPhysicsFrame(game, sideScene, time);
            });
            processCameraMovement(game.controlsState, renderer, scene, time);
            renderer.render(scene);
            DebugData.step = false;
        }
        if (scene.actors && scene.actors.length > 0) {
            debugScope.hero = scene.actors[0];
        }
        debugScope.camera = renderer.getMainCamera(scene);
    }
    renderer.stats.end();
}


function updateScene(game, scene, time, step) {
    // playAmbience(game, scene, time);
    each(scene.actors, (actor) => {
        if (actor.isKilled)
            return;
        updateActor(game, scene, actor, time, step);
        if (scene.isActive) {
            if (actor.index === 0) {
                updateHero(game, actor, time);
            }
        }
    });
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

