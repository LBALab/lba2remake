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
    each(scene.actors, actor => {
        updateActor(actor, time, step);
        if (actor.index == 0 && scene.isActive) {
            updateHero(game, actor, time);
        }
    });

    const soundFxSource = game.getAudioManager().getMusicSource();
    musicSource.load(sceneData.ambience.musicIndex, () => {
        musicSource.play();
    });
}