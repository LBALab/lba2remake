import {each} from 'lodash';
import {updateHero} from './hero';
import {updateActor} from './actors';
import {processPhysicsFrame} from './physics';
import {processCameraMovement} from './cameras';
import {updateDebugger, hasStep, endStep} from '../../scripting/debug';
import {getRandom} from '../../utils/lba'
import {
    debugHUDFrame,
} from "../debugHUD";

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
        each(controls, ctrl => { ctrl.update && ctrl.update(); });
        if (!game.isPaused()) {
            scene.scenery.update(time);
            const step = hasStep();
            updateScene(game, scene, time, step);
            endStep();
            processPhysicsFrame(game, scene, time);
            each(scene.sideScenes, sideScene => {
                updateScene(game, sideScene, time);
                processPhysicsFrame(game, sideScene, time);
            });
            processCameraMovement(game.controlsState, renderer, scene, time);
            updateDebugger(scene, renderer);
            renderer.render(scene);
        }
        if (scene.actors && scene.actors.length > 0) {
            debugScope.hero = scene.actors[0];
        }
        debugScope.camera = renderer.getMainCamera(scene);
    }
    renderer.stats.end();

    debugHUDFrame(debugScope);
}



function updateScene(game, scene, time, step) {
    //playAmbience(game, scene, time);
    each(scene.actors, actor => {
        if (actor.isKilled)
            return;
        updateActor(scene, actor, time, step);
        if (scene.isActive) {
            if (actor.index === 0) {
                updateHero(game, actor, time);
            }
        }
    });
}

function playAmbience(game, scene, time) {
    const soundFxSource = game.getAudioManager().getSoundFxSource();
    let samplePlayed = 0;

    if (time.elapsed >= scene.data.ambience.sampleElapsedTime) {
        let currentAmb = getRandom(1, 4);
        currentAmb &= 3;
        for(let s = 0; s < 4; s++) {
            if(!(samplePlayed & (1 << currentAmb))) {
                samplePlayed |= (1 << currentAmb);
                if(samplePlayed == 15) {
                    samplePlayed = 0;
                }
                const sample = scene.data.ambience.samples[currentAmb];
                if(sample.ambience != -1 && sample.repeat != 0) {
                    soundFxSource.load(sample.ambience, () => {
                        soundFxSource.play(sample.frequency);
                    });

                    break;
                }
            }
            currentAmb++;
            currentAmb &= 3;
        }
        scene.data.ambience.sampleElapsedTime = time.elapsed + getRandom(scene.data.ambience.sampleMinDelay, scene.data.ambience.sampleMinDelayRnd) * 1000;
    }
    if (scene.data.ambience.sampleMinDelay < 0) {
        scene.data.ambience.sampleElapsedTime = time.elapsed + 200000;
    }
}
