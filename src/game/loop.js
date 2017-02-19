import {each} from 'lodash';
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
        if (!game.isPause) {
            scene.update(time);
            each(scene.sideScenes, scene => { scene.update(time); });
            if (scene.scenery) {
                processPhysicsFrame(game, scene, time);
                processCameraMovement(game.controlsState, renderer.cameras, scene, time);
                scene.scenery.update(time);
            }
            updateDebugger(scene, renderer);
            renderer.render(scene);
        }
    }
    renderer.stats.end();
}
