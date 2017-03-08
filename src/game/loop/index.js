import {each} from 'lodash';
import {updateHero} from './hero';
import {updateActor} from './actors';
import {processPhysicsFrame} from './physics';
import {processCameraMovement} from './cameras';
import {updateDebugger, hasStep, endStep} from '../../scripting/debug';

export function mainGameLoop(game, clock, renderer, scene, controls) {
    const time = {
        delta: Math.min(clock.getDelta(), 0.05),
        elapsed: clock.getElapsedTime()
    };

    renderer.stats.begin();
    if (scene) {
        each(controls, ctrl => { ctrl.update && ctrl.update(); });
        if (!game.isPaused()) {
            scene.scenery.update(time);
            const step = hasStep();
            updateScene(game, scene, time, step);
            endStep();
            processPhysicsFrame(game, scene);
            each(scene.sideScenes, sideScene => {
                updateScene(game, sideScene, time);
                processPhysicsFrame(game, sideScene);
            });
            processCameraMovement(game.controlsState, renderer, scene, time);
            updateDebugger(scene, renderer);
            renderer.render(scene);
        }
    }
    renderer.stats.end();
}

function updateScene(game, scene, time, step) {
    playAmbience(game, scene, time);
    each(scene.actors, actor => {
        updateActor(actor, time, step);
        if (actor.index == 0 && scene.isActive) {
            updateHero(game, actor, time);
        }
    });
}

function playAmbience(game, scene, time) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    let samplePlayed = 0;

    if (time.elapsed >= scene.data.ambience.sampleElapsedTime) {
        let currentAmb = Math.random() * 4 + 1;
        currentAmb &= 3;

        for(let s = 0; s < 4; s++) {
            if(!(samplePlayed & (1 << currentAmb))) {
                samplePlayed |= (1 << currentAmb);

                if(samplePlayed == 15) {
                    samplePlayed = 0;
                }

                const sample = scene.data.ambience.samples[currentAmb];
                const sampleIdx = sample.ambience;

                if(sampleIdx != -1) {
                    const freq = (0x1000+(Math.random() * sample.round + 1)-(sample.round/2));
                    const x = 110;
                    const z = 110;
                    const y = -1;

                    //playSample(sampleIdx, freq, sample.repeat, 110, -1, 110, -1);

                    soundFxSource.load(sampleIdx, () => {
                        soundFxSource.play();
                    });

                    break;
                }
            }

            currentAmb++;
            currentAmb &= 3;
        }

        scene.data.ambience.sampleElapsedTime = time.elapsed + (Math.random() * scene.data.ambience.sampleMinDelayRnd + 1 + scene.data.ambience.sampleMinDelay) * 50;
    }
}
