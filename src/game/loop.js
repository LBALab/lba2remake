import {each} from 'lodash';
import {processMovements} from './movements';
import {processPhysicsFrame} from './physics';
import {processCameraMovement} from '../cameras';
import {updateDebugger} from '../scripting/debug';

export function mainGameLoop(game, clock, renderer, scene, controls) {
    const time = {
        delta: Math.min(clock.getDelta(), 0.05),
        elapsed: clock.getElapsedTime()
    };

    renderer.stats.begin();

    if (scene) {
        each(controls, ctrl => { ctrl.update && ctrl.update(); });
        if (!game.isPaused()) {
            processMovements(game, scene, time);
            scene.update(time);
            each(scene.sideScenes, scene => { scene.update(time); });
            if (scene.scenery) {
                processCameraMovement(game.controlsState, renderer, scene, time);
                scene.scenery.update(time);
            }
            processPhysicsFrame(game, scene, time);
            updateDebugger(scene, renderer);
            renderer.render(scene);
        }
    }
    renderer.stats.end();
}
