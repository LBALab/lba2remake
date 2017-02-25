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
            const step = hasStep();
            updateScene(scene, time, step);
            endStep();
            each(scene.sideScenes, sideScene => {
                updateScene(sideScene, time);
            });
            if (scene.scenery) {
                processCameraMovement(game.controlsState, renderer, scene, time);
                scene.scenery.update(time);
            }
            processPhysicsFrame(game, scene);
            updateDebugger(scene, renderer);
            renderer.render(scene);
        }
    }
    renderer.stats.end();
}

function updateScene(scene, time, step) {
    each(scene.actors, actor => {
        updateActor(actor, time, step);
        if (actor.index == 0) {
            updateHero(game, scene, time);
        }
    });
}