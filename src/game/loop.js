import {each} from 'lodash';
import {processPhysicsFrame} from './physics';

export function mainGameLoop(game, clock, clockGame, renderer, scene, hero, controls) {
    const time = {
        delta: clock.getDelta(),
        elapsed: clock.getElapsedTime()
    };
    const timeGame = {
        delta: clockGame.getDelta(),
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
            renderer.render(scene);
        }
    }
    renderer.stats.end();
}
