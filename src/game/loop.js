import {each} from 'lodash';
import {processPhysicsFrame} from './physics';
import {updateDebugger} from '../scripting/debug';

export function mainGameLoop(game, clock, clockGame, renderer, scene, hero, controls) {
    const time = {
        delta: clock.getDelta(),
        elapsed: clock.getElapsedTime()
    };
    const timeGame = {
        delta: Math.min(clockGame.getDelta(), 0.05),
        elapsed: clockGame.getElapsedTime()
    };

    renderer.stats.begin();

    if (scene) {
        const scenery = scene.scenery;
        if (scenery) {
            each(controls, ctrl => { ctrl.update && ctrl.update(); });
            if (!game.isPause) {
                scenery.update(timeGame);
            }
            processPhysicsFrame(time, scenery.physics, renderer.cameras, hero.physics);
        }
        if (!game.isPause) {
            scene.update(timeGame);
            each(scene.sideScenes, scene => { scene.update(timeGame); });
            updateDebugger(scene, renderer);
            renderer.render(scene);
        }
    }
    renderer.stats.end();
}
