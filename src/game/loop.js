import {each} from 'lodash';
import {processPhysicsFrame} from './physics';

export function mainGameLoop(clock, renderer, scene, hero, controls) {
    const time = {
        delta: clock.getDelta(),
        elapsed: clock.getElapsedTime()
    };

    renderer.stats.begin();

    if (scene) {
        if (scene.hasLoaded) {
            scene.update(time);
        }
        const scenery = scene.scenery;
        if (scenery) {
            each(controls, ctrl => { ctrl.update && ctrl.update(); });
            scenery.update(time);
            processPhysicsFrame(time, scenery.physics, renderer.cameras, hero.physics);
        }
        renderer.render(scene.threeScene);
    }
    renderer.stats.end();
}
