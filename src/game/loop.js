import {each} from 'lodash';
import {processPhysicsFrame} from './physics';

export function mainGameLoop(clock, renderer, scene, hero, controls) {
    const time = {
        delta: clock.getDelta(),
        elapsed: clock.getElapsedTime()
    };

    renderer.stats.begin();

    if (scene && scene.data) {
        each(controls, ctrl => { ctrl.update && ctrl.update(); });
        scene.data.update(time);
        processPhysicsFrame(time, scene.data.physics, renderer.camera, hero.physics);
        renderer.render(scene.data.threeScene);
    }
    renderer.stats.end();
}
