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
        if (scene.island && scene.island.data) {
            each(controls, ctrl => { ctrl.update && ctrl.update(); });
            scene.island.data.update(time);
            processPhysicsFrame(time, scene.island.data.physics, renderer.camera, hero.physics);
            renderer.render(scene.island.data.threeScene);
        }
    }
    renderer.stats.end();
}
